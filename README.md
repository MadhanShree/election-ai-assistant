# Election Process Education AI Assistant with Outcome Predictor

An educational web application built for **Hack2skill Challenge 2** to answer queries about the democratic process and provide basic election outcome estimations based on user-provided data.

## Problem Statement

Understanding election processes, voting rights, and democratic terminology can be complex for the general public. Additionally, visualizing how various factors (like youth support, campaign popularity, and historical data) might impact an election outcome is often limited to news analysts.

This application provides a simple, interactive, and offline-capable solution to:
1. Educate users on over 30+ election-related topics using an intelligent chatbot.
2. Educate first-time voters on the step-by-step voting process.
3. Test users' knowledge with an interactive Election Quiz.
4. Raise awareness on how to spot and verify fake election news.
5. Allow users to simulate election scenarios using a transparent, weighted prediction model with chart visualizations.

## Features

* **Election Education Chatbot**: Answers questions on topics like EVM, VVPAT, NOTA, Model Code of Conduct, Voter IDs, and more using keyword matching and fuzzy logic.
* **First-Time Voter Guide**: A clear 5-step guide outlining how to register and cast a vote in India.
* **Election & Democracy Quiz**: A built-in 5-question quiz to test civic knowledge.
* **Fake Election News Awareness**: Tips and guidelines on how to verify information during election seasons.
* **Election Outcome Predictor**:
  * Calculates a weighted score based on multiple user inputs (Current estimate, Previous share, Campaign score, Youth/Women/Urban/Rural support).
  * Visualizes the predicted vote share using **Chart.js**.
  * Explains the calculation methodology clearly via an info toggle.
  * Allows downloading the prediction report as a `.txt` file locally.
* **Modern UI/UX**: Professional glassmorphism-inspired design with responsive grids and interactive elements.
* **100% Offline/Rule-Based**: Requires no external AI API keys (like OpenAI or Gemini) and no databases, ensuring zero running costs for inference and high privacy.

## Tech Stack

* **Backend**: Python, Flask, `thefuzz` (for string similarity)
* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js (via CDN)
* **Deployment Ready**: Docker, Gunicorn (Optimized for Render / Google Cloud Run)

## How It Works

### The Chatbot
The chatbot relies on a predefined `KNOWLEDGE_BASE` dictionary in `app.py`. When a user asks a question, it checks for keyword matches or uses Levenshtein Distance (via `thefuzz`) to find the closest match.

### The Predictor
The predictor takes numerical inputs from the frontend and applies a hardcoded weighted formula to calculate an overall "score" for each candidate. The scores are normalized into a percentage. Chart.js is used to render the bar chart, and JavaScript generates the text file blob for the downloadable report directly in the browser.

⚠️ **Disclaimer:** *This prediction is only an estimate based on user-entered data and should not be treated as an actual election result.*

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

## How to Deploy on Render

This project includes a `Dockerfile` and `requirements.txt` making it extremely easy to deploy on Render's free tier.

1. Create a [Render](https://render.com/) account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing this code.
4. Render will automatically detect the Python environment.
5. Set the **Build Command** to: `pip install -r requirements.txt`
6. Set the **Start Command** to: `gunicorn app:app`
7. Click **Create Web Service**. 

Alternatively, if you prefer Docker, Render will automatically use the provided `Dockerfile`.

## Screenshots

*(Placeholder for Screenshots)*
- `dashboard_view.png`
- `predictor_chart.png`
