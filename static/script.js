document.addEventListener('DOMContentLoaded', () => {
    // Chatbot Logic
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text })
            });
            const data = await response.json();
            appendMessage('bot', data.answer);
        } catch (error) {
            appendMessage('bot', 'Error: Unable to connect to the assistant server.');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initial greeting
    setTimeout(() => {
        appendMessage('bot', 'Hello! I am your Election Process Education AI Assistant. Ask me anything about elections, voting rules, or the democratic process!');
    }, 500);

    // Predictor Logic
    const candidatesContainer = document.getElementById('candidates-container');
    const addCandidateBtn = document.getElementById('add-candidate-btn');
    const predictBtn = document.getElementById('predict-btn');
    const resultsContainer = document.getElementById('results-container');

    let candidateCount = 2;

    function createCandidateForm(index) {
        return `
            <div class="candidate-form" id="candidate-${index}">
                <div class="form-group">
                    <label>Candidate / Party Name</label>
                    <input type="text" class="c-name" placeholder="e.g., Party A" required>
                </div>
                <div class="grid-2-col">
                    <div class="form-group">
                        <label>Current Vote Estimate (e.g. 45000 or 45.5%)</label>
                        <input type="number" class="c-current" step="0.01" value="0" required>
                    </div>
                    <div class="form-group">
                        <label>Previous Election Share (%)</label>
                        <input type="number" class="c-prev" step="0.01" value="0">
                    </div>
                </div>
                <div class="grid-4-col">
                    <div class="form-group">
                        <label>Campaign Score (0-100)</label>
                        <input type="number" class="c-camp" step="1" value="50">
                    </div>
                    <div class="form-group">
                        <label>Youth Support (%)</label>
                        <input type="number" class="c-youth" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label>Women Support (%)</label>
                        <input type="number" class="c-women" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label>Urban Support (%)</label>
                        <input type="number" class="c-urban" step="0.01" value="0">
                    </div>
                     <div class="form-group">
                        <label>Rural Support (%)</label>
                        <input type="number" class="c-rural" step="0.01" value="0">
                    </div>
                </div>
            </div>
        `;
    }

    addCandidateBtn.addEventListener('click', () => {
        candidateCount++;
        const div = document.createElement('div');
        div.innerHTML = createCandidateForm(candidateCount);
        candidatesContainer.appendChild(div.firstElementChild);
    });

    predictBtn.addEventListener('click', async () => {
        const forms = document.querySelectorAll('.candidate-form');
        const candidatesData = [];
        
        let isValid = true;

        forms.forEach(form => {
            const name = form.querySelector('.c-name').value;
            const current = form.querySelector('.c-current').value;
            
            if(!name || current === '') {
                 isValid = false;
                 return;
            }

            candidatesData.push({
                name: name,
                current_vote: current,
                prev_share: form.querySelector('.c-prev').value,
                campaign_score: form.querySelector('.c-camp').value,
                youth_support: form.querySelector('.c-youth').value,
                women_support: form.querySelector('.c-women').value,
                urban_support: form.querySelector('.c-urban').value,
                rural_support: form.querySelector('.c-rural').value
            });
        });

        if (!isValid) {
             alert('Please fill in at least the Name and Current Vote Estimate for all candidates.');
             return;
        }

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidates: candidatesData })
            });
            
            const data = await response.json();
            
            if (data.error) {
                 alert(data.error);
                 return;
            }

            displayResults(data);

        } catch (error) {
             alert('Error calculating prediction.');
             console.error(error);
        }
    });

    function displayResults(data) {
        resultsContainer.style.display = 'block';
        
        const winnerSpan = document.getElementById('predicted-winner');
        const confSpan = document.getElementById('confidence-level');
        const explanationP = document.getElementById('explanation');
        const tableBody = document.querySelector('#results-table tbody');

        winnerSpan.textContent = data.predicted_winner;
        confSpan.textContent = data.confidence_level;
        confSpan.className = `confidence-badge confidence-${data.confidence_level}`;
        
        explanationP.textContent = data.explanation;

        tableBody.innerHTML = '';
        data.vote_share_table.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.name}</td>
                <td>${row.current_vote}</td>
                <td><strong>${row.predicted_share}%</strong></td>
                <td>${row.score.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
});
