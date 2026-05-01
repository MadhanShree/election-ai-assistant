import os
from flask import Flask, render_template, request, jsonify
from thefuzz import fuzz
from thefuzz import process
from election_knowledge import KNOWLEDGE_BASE

app = Flask(__name__)

def get_chatbot_response(user_query):
    query = user_query.lower().strip()
    
    # 1. Exact Question Match
    for item in KNOWLEDGE_BASE:
        if query == item["question"].lower().strip():
            return f"Answer: {item['answer']}\n\nDetails: {item['details']}"

    # 2. Keyword Match
    for item in KNOWLEDGE_BASE:
        for keyword in item["keywords"]:
            if keyword in query:
                return f"Answer: {item['answer']}\n\nDetails: {item['details']}"

    # 3. Fuzzy Matching
    best_match_score = 0
    best_match_item = None
    
    # Extract all questions for fuzzy matching
    all_questions = [item["question"] for item in KNOWLEDGE_BASE]
    
    if all_questions:
        best_match_tuple = process.extractOne(query, all_questions, scorer=fuzz.token_sort_ratio)
        if best_match_tuple:
            match_str, score = best_match_tuple
            if score > 60: # Threshold for similarity
                # Find the corresponding item
                for item in KNOWLEDGE_BASE:
                    if item["question"] == match_str:
                         return f"Answer: {item['answer']}\n\nDetails: {item['details']}"

    # 4. Election-related fallback check (don't match just "election" as a keyword too early)
    election_related_words = ["election", "vote", "evm", "eci", "lok sabha", "vvpat", "nota", "poll", "democracy", "parliament"]
    is_election_related = any(word in query for word in election_related_words)

    if is_election_related:
        return "It seems you're asking about an election topic, but I don't have the specific answer. The Election Commission of India oversees general elections, typically held every 5 years using EVMs. Please try asking about specific topics like 'EVM', 'Voter ID', 'Lok Sabha term', or 'Voting age'."
    else:
        return "I can help mainly with election-related questions. Please ask me about voting, EVM, VVPAT, NOTA, Lok Sabha, Election Commission, voter ID, or election process."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question', '')
    if not question:
        return jsonify({"answer": "Please ask a valid question."})
    
    answer = get_chatbot_response(question)
    return jsonify({"answer": answer})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    candidates_data = data.get('candidates', [])
    
    if not candidates_data or len(candidates_data) < 2:
         return jsonify({"error": "Please provide data for at least two candidates to make a prediction."})

    results = []
    total_votes_input = 0
    
    for candidate in candidates_data:
        try:
            current_vote = float(candidate.get('current_vote', 0))
            prev_share = float(candidate.get('prev_share', 0))
            campaign_score = float(candidate.get('campaign_score', 0))
            youth_support = float(candidate.get('youth_support', 0))
            women_support = float(candidate.get('women_support', 0))
            urban_support = float(candidate.get('urban_support', 0))
            rural_support = float(candidate.get('rural_support', 0))
            
            total_votes_input += current_vote

            # Weight calculation
            weighted_score = (
                (current_vote * 0.50) +
                (prev_share * 0.20) +
                (campaign_score * 0.10) +
                (youth_support * 0.05) +
                (women_support * 0.05) +
                (urban_support * 0.05) +
                (rural_support * 0.05)
            )
            
            results.append({
                "name": candidate.get('name', 'Unknown'),
                "score": weighted_score,
                "current_vote": current_vote
            })
        except ValueError:
             return jsonify({"error": "Invalid numerical data provided."})

    # Sort candidates by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    
    # Calculate percentage based on score for relative vote share prediction
    total_score = sum(c['score'] for c in results)
    
    if total_score == 0:
        return jsonify({"error": "Total calculated score is zero. Cannot predict."})

    for r in results:
        r['predicted_share'] = round((r['score'] / total_score) * 100, 2)

    winner = results[0]
    runner_up = results[1]
    margin = round(winner['predicted_share'] - runner_up['predicted_share'], 2)
    
    # Confidence Logic
    if margin > 15:
        confidence = "High"
    elif margin > 5:
        confidence = "Medium"
    else:
        confidence = "Low"

    explanation = f"{winner['name']} is predicted to win with a margin of {margin}%. "
    if confidence == "Low":
         explanation += "The margin is very tight, indicating a closely contested election where small factors could sway the final result."
    elif confidence == "Medium":
         explanation += "The candidate has a comfortable lead based on the weighted metrics."
    else:
         explanation += "The candidate shows strong dominance across multiple metrics."

    response_data = {
        "predicted_winner": winner['name'],
        "confidence_level": confidence,
        "margin": margin,
        "vote_share_table": results,
        "explanation": explanation,
        "disclaimer": "This prediction is only an estimate based on the entered data and should not be treated as an actual election result."
    }

    return jsonify(response_data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host="0.0.0.0", port=port)
