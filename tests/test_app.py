import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page_loads(client):
    """Test 1: Home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"Election Process AI Assistant" in response.data

def test_ask_route_specific_question(client):
    """Test 2: /ask route returns an answer for 'What is the maximum term of the Lok Sabha?'"""
    response = client.post('/ask', json={"question": "What is the maximum term of the Lok Sabha?"})
    assert response.status_code == 200
    json_data = response.get_json()
    assert "Answer: The maximum term of the Lok Sabha is 5 years." in json_data['answer']

def test_ask_route_fallback(client):
    """Test 3: /ask route returns an election-related fallback for unknown election questions."""
    response = client.post('/ask', json={"question": "can you explain the election process in australia?"})
    assert response.status_code == 200
    json_data = response.get_json()
    assert "It seems you're asking about an election topic, but I don't have the specific answer." in json_data['answer']

def test_predict_route(client):
    """Test 4: /predict route returns predicted winner, confidence, and score data."""
    payload = {
        "candidates": [
            {
                "name": "Party A",
                "current_vote": 45000,
                "prev_share": 40,
                "campaign_score": 80,
                "youth_support": 50,
                "women_support": 45,
                "urban_support": 60,
                "rural_support": 30
            },
            {
                "name": "Party B",
                "current_vote": 42000,
                "prev_share": 38,
                "campaign_score": 75,
                "youth_support": 45,
                "women_support": 50,
                "urban_support": 40,
                "rural_support": 55
            }
        ]
    }
    response = client.post('/predict', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    
    # Verify required keys are present
    assert "predicted_winner" in json_data
    assert "confidence_level" in json_data
    assert "vote_share_table" in json_data
    
    # Verify data format
    assert len(json_data["vote_share_table"]) == 2
    assert "score" in json_data["vote_share_table"][0]
