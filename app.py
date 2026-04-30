import os
from flask import Flask, render_template, request, jsonify
from thefuzz import fuzz
from thefuzz import process

app = Flask(__name__)

# Election Knowledge Base
KNOWLEDGE_BASE = {
    "election": "An election is a formal group decision-making process by which a population chooses an individual or multiple individuals to hold public office.",
    "democracy": "Democracy is a system of government by the whole population or all the eligible members of a state, typically through elected representatives.",
    "voting": "Voting is a method for a group, such as a meeting or an electorate, in order to make a collective decision or express an opinion usually following discussions, debates or election campaigns.",
    "who can vote in india": "In India, any citizen who is 18 years of age or older on the qualifying date (usually 1st January of the year) and is enrolled in the electoral roll can vote, provided they are not disqualified by law.",
    "voter id": "A Voter ID, also known as an EPIC (Electors Photo Identity Card), is a photo identity card issued by the Election Commission of India to adult citizens to serve as an identity proof for casting votes.",
    "register as voter": "You can register as a voter in India by filling out Form 6 online on the National Voters' Services Portal (NVSP) or offline by submitting it to the Electoral Registration Officer (ERO) of your assembly constituency.",
    "evm": "EVM stands for Electronic Voting Machine. It is an electronic device used to record votes. It consists of a Control Unit and a Balloting Unit.",
    "vvpat": "VVPAT stands for Voter Verifiable Paper Audit Trail. It is an independent verification system attached to EVMs that allows voters to verify that their votes are cast as intended.",
    "nota": "NOTA stands for 'None of the Above'. It is an option on the voting machine that allows a voter to reject all candidates in an election.",
    "election commission": "The Election Commission of India is an autonomous constitutional authority responsible for administering election processes in India at national, state, and district levels.",
    "constituency": "A constituency is a specific geographic area that elects a representative to a legislative body.",
    "candidate": "A candidate is a person who applies for a job or is nominated for election to a political office.",
    "political party": "A political party is an organized group of people who have the same ideology, or who otherwise have the same political positions, and who field candidates for elections.",
    "manifesto": "A manifesto is a published declaration of the intentions, motives, or views of the issuer, be it an individual, group, political party or government.",
    "campaigning": "Campaigning is an organized effort which seeks to influence the decision making process within a specific group. In elections, it's how candidates persuade people to vote for them.",
    "polling booth": "A polling booth, or polling station, is a place where voters go to cast their votes during an election.",
    "what happens on election day": "On election day, voters go to their designated polling booths, their identity is verified, their finger is marked with indelible ink, and they cast their vote secretly using an EVM or ballot paper.",
    "vote counting": "After polling, EVMs are sealed and taken to strong rooms. On counting day, they are opened in the presence of candidates/agents, and votes for each candidate are tallied to declare the winner.",
    "majority": "In elections, a majority means receiving more than 50% of the total votes cast. Sometimes it refers to having the most votes even if not over 50% (plurality).",
    "coalition government": "A coalition government is a cabinet of a parliamentary government in which multiple political parties cooperate, reducing the dominance of any one party within that coalition.",
    "first past the post": "First-past-the-post (FPTP) is an electoral system in which voters cast their vote for a candidate of their choice, and the candidate who receives the most votes wins, even if they don't get an absolute majority.",
    "lok sabha": "Lok Sabha is the lower house of India's bicameral Parliament. Elections to the Lok Sabha determine the Prime Minister and the central government.",
    "assembly election": "Assembly elections, or Vidhan Sabha elections, are held to elect representatives to the state legislative assembly. These determine the Chief Minister and state government.",
    "panchayat election": "Panchayat elections are local government elections in rural areas of India, determining village-level administration (Gram Panchayat).",
    "rajya sabha": "Rajya Sabha is the upper house of India's Parliament. Members are elected indirectly by the elected members of State Legislative Assemblies.",
    "model code of conduct": "The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India to regulate the conduct of political parties and candidates during elections to ensure free and fair polling.",
    "importance of ethical voting": "Ethical voting is important because it ensures leaders are chosen based on merit, policies, and integrity, rather than money, muscle power, or false promises. It strengthens democracy.",
    "why is voting important": "Voting is important because it allows citizens to have a say in who governs them and how their society is run. It is a fundamental democratic right and responsibility.",
    "vote responsibly": "To vote responsibly, one should research the candidates, understand their manifestos, avoid being influenced by fake news or bribes, and vote based on what is best for the community/country.",
    "fake news": "To identify fake news during elections, check the source, look for verified reporting from reputed news outlets, verify images/videos using reverse search, and be skeptical of highly emotional or sensational claims.",
    "exit poll": "An exit poll is a poll of voters taken immediately after they have exited the polling stations. It asks them who they actually voted for and is used to predict the outcome before official counting.",
    "opinion poll": "An opinion poll is a survey of public opinion from a particular sample. In elections, it's taken before voting day to gauge which candidate or party is currently favored.",
    "difference exit poll opinion poll": "An opinion poll is conducted BEFORE the election to gauge public mood. An exit poll is conducted ON election day after people have voted to ask who they actually voted for."
}

CATEGORIES = {
    "voting_general": ["voting", "importance", "responsibly", "how to"],
    "registration": ["register", "voter id", "epic"],
    "machines": ["evm", "vvpat", "nota"],
    "institutions": ["election commission", "eci"],
    "process": ["polling booth", "election day", "vote counting"],
    "entities": ["constituency", "candidate", "political party"],
    "campaign": ["manifesto", "campaigning", "model code of conduct", "mcc"],
    "election_types": ["lok sabha", "assembly", "panchayat", "rajya sabha"],
    "results": ["majority", "coalition", "first past the post", "exit poll", "opinion poll"],
    "integrity": ["fake news", "ethical"]
}

def get_chatbot_response(user_query):
    query = user_query.lower().strip()
    
    # 1. Exact or Keyword Matching
    if query in KNOWLEDGE_BASE:
        return KNOWLEDGE_BASE[query]
        
    for key, answer in KNOWLEDGE_BASE.items():
        if key in query:
             return answer

    # 2. Fuzzy Matching
    best_match, score = process.extractOne(query, KNOWLEDGE_BASE.keys(), scorer=fuzz.token_sort_ratio)
    if score > 60: # Threshold for similarity
        return KNOWLEDGE_BASE[best_match]

    # 3. Category-based fallback
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword in query:
                return "It seems you're asking about topics related to " + category.replace("_", " ") + ". While I don't have the exact specific answer, I recommend checking the official Election Commission guidelines or rephrasing your question to be more specific. For example, you can ask 'What is an EVM?' or 'How to register to vote?'"

    # General Fallback
    return "That's an interesting question! While I am trained to answer general questions about the election process, democracy, voting rules, and electoral systems, I couldn't find a specific match for your query. Try asking about EVMs, Voter IDs, or how the voting process works."

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
    app.run(debug=True, host='0.0.0.0', port=port)
