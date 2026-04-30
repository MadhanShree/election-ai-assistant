# Election Process Education AI Assistant with Outcome Predictor

An educational web application built for **Hack2skill Challenge 2** to answer queries about the democratic process and provide basic election outcome estimations based on user-provided data.

## Problem Statement

Understanding election processes, voting rights, and democratic terminology can be complex for the general public. Additionally, visualizing how various factors (like youth support, campaign popularity, and historical data) might impact an election outcome is often limited to news analysts.

This application provides a simple, interactive, and offline-capable solution to:
1. Educate users on over 30+ election-related topics using an intelligent chatbot.
2. Allow users to simulate election scenarios using a transparent, weighted prediction model.

## Features

* **Election Education Chatbot**: 
  * Answers questions on topics like EVM, VVPAT, NOTA, Model Code of Conduct, Voter IDs, and more.
  * Uses keyword matching, fuzzy logic (via `thefuzz`), and category-based fallback mechanisms to ensure users always receive helpful responses, rather than a generic "I don't know."
* **Election Outcome Predictor**:
  * Calculates a weighted score based on multiple user inputs: Current estimate (50%), Previous share (20%), Campaign score (10%), Youth support (5%), Women support (5%), Urban support (5%), and Rural support (5%).
  * Calculates predicted vote share, winning margins, and provides a dynamic confidence level (Low/Medium/High).
* **Modern UI/UX**: Clean, responsive, glassmorphism-inspired design using vanilla CSS.
* **100% Offline/Rule-Based**: Requires no external AI API keys (like OpenAI or Gemini), ensuring zero running costs for inference and high privacy.

## Tech Stack

* **Backend**: Python, Flask, `thefuzz` (for string similarity)
* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Deployment Ready**: Docker, Gunicorn (optimized for Google Cloud Run)

## How It Works

### The Chatbot
The chatbot relies on a predefined `KNOWLEDGE_BASE` dictionary in `app.py`. When a user asks a question:
1. It first checks for an exact keyword match.
2. If no exact match is found, it uses Levenshtein Distance (via `thefuzz`) to find the closest matching question in the knowledge base.
3. If the confidence score is too low, it checks a `CATEGORIES` dictionary to see if the user mentioned a broad topic (e.g., "machines" for EVM) and gives a guided fallback answer.

### The Predictor
The predictor takes numerical inputs from the frontend and applies a hardcoded weighted formula to calculate an overall "score" for each candidate. The scores are then normalized into a percentage to estimate the final vote share.

⚠️ **Disclaimer:** *This prediction is only an estimate based on the entered data and should not be treated as an actual election result.*

## How to Run Locally

### Prerequisites
- Python 3.9+ installed.

### Steps
1. Clone this repository or navigate to the project folder.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   python app.py
   ```
5. Open your browser and navigate to `http://localhost:8080`.

## How to Deploy on Google Cloud Run

This project includes a `Dockerfile` and is ready for containerized deployment.

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Authenticate and set your project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Deploy directly using Cloud Run:
   ```bash
   gcloud run deploy election-assistant --source . --region us-central1 --allow-unauthenticated
   ```
4. Once deployed, the CLI will provide a public URL to access your application.

## Screenshots

*(Placeholder for Screenshots)*
- `chatbot_demo.png`
- `predictor_results.png`
