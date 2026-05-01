document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // Chatbot Logic
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // Quiz Logic
    // ---------------------------------------------------------
    const quizQuestions = [
        {
            question: "What is the minimum voting age in India?",
            options: ["16 Years", "18 Years", "21 Years", "25 Years"],
            answer: 1
        },
        {
            question: "What does VVPAT stand for?",
            options: ["Voter Verified Paper Audit Trail", "Voting Verification Panel And Tool", "Voter Validation Process And Technology", "Verified Voting Paper Account Tracker"],
            answer: 0
        },
        {
            question: "Who appoints the Chief Election Commissioner of India?",
            options: ["The Prime Minister", "The Chief Justice of India", "The President of India", "The Parliament"],
            answer: 2
        },
        {
            question: "What does NOTA stand for on the EVM?",
            options: ["None Of The Above", "Not Open To All", "No Other True Alternative", "National Option To Abstain"],
            answer: 0
        },
        {
            question: "Which document is primarily issued by the ECI for identity proof during voting?",
            options: ["Aadhaar Card", "PAN Card", "EPIC (Voter ID)", "Passport"],
            answer: 2
        }
    ];

    let currentQuestionIndex = 0;
    let quizScore = 0;

    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizContent = document.getElementById('quiz-content');
    const quizResults = document.getElementById('quiz-results');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const quizProgress = document.getElementById('quiz-progress');
    const quizIntro = document.getElementById('quiz-intro');

    startQuizBtn.addEventListener('click', () => {
        startQuizBtn.style.display = 'none';
        quizIntro.style.display = 'none';
        quizContent.style.display = 'block';
        loadQuestion();
    });

    function loadQuestion() {
        const q = quizQuestions[currentQuestionIndex];
        questionText.textContent = `${currentQuestionIndex + 1}. ${q.question}`;
        optionsContainer.innerHTML = '';
        nextQuestionBtn.style.display = 'none';
        quizProgress.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

        q.options.forEach((opt, index) => {
            const btn = document.createElement('div');
            btn.classList.add('quiz-option');
            btn.textContent = opt;
            btn.addEventListener('click', () => selectOption(index, btn));
            optionsContainer.appendChild(btn);
        });
    }

    function selectOption(selectedIndex, btnElement) {
        // Prevent multiple clicks
        if (optionsContainer.classList.contains('answered')) return;
        optionsContainer.classList.add('answered');

        const q = quizQuestions[currentQuestionIndex];
        const options = optionsContainer.querySelectorAll('.quiz-option');

        if (selectedIndex === q.answer) {
            btnElement.classList.add('correct');
            quizScore++;
        } else {
            btnElement.classList.add('incorrect');
            options[q.answer].classList.add('correct');
        }

        nextQuestionBtn.style.display = 'block';
    }

    nextQuestionBtn.addEventListener('click', () => {
        optionsContainer.classList.remove('answered');
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            loadQuestion();
        } else {
            showQuizResults();
        }
    });

    function showQuizResults() {
        quizContent.style.display = 'none';
        quizResults.style.display = 'block';
        document.getElementById('final-score').textContent = quizScore;
        
        let msg = "";
        if (quizScore === 5) msg = "Perfect! You are an informed citizen!";
        else if (quizScore >= 3) msg = "Good job! You have a solid understanding of the process.";
        else msg = "You might want to ask the Assistant some questions to learn more!";
        
        document.getElementById('score-message').textContent = msg;
    }

    document.getElementById('restart-quiz-btn').addEventListener('click', () => {
        currentQuestionIndex = 0;
        quizScore = 0;
        quizResults.style.display = 'none';
        loadQuestion();
        quizContent.style.display = 'block';
    });


    // ---------------------------------------------------------
    // Predictor Logic
    // ---------------------------------------------------------
    const candidatesContainer = document.getElementById('candidates-container');
    const addCandidateBtn = document.getElementById('add-candidate-btn');
    const predictBtn = document.getElementById('predict-btn');
    const resultsContainer = document.getElementById('results-container');
    const toggleExplanationBtn = document.getElementById('toggle-explanation-btn');
    const explanationBox = document.getElementById('prediction-explanation');
    const downloadReportBtn = document.getElementById('download-report-btn');

    let candidateCount = 2;
    let resultsChartInstance = null;
    let latestPredictionData = null;

    toggleExplanationBtn.addEventListener('click', () => {
        if (explanationBox.style.display === 'none') {
            explanationBox.style.display = 'block';
            toggleExplanationBtn.classList.add('active');
        } else {
            explanationBox.style.display = 'none';
            toggleExplanationBtn.classList.remove('active');
        }
    });

    function createCandidateForm(index) {
        return `
            <div class="candidate-form" id="candidate-${index}">
                <div class="form-group">
                    <label for="c-name-${index}">Candidate / Party Name</label>
                    <input type="text" id="c-name-${index}" class="c-name" placeholder="e.g., Party A" required aria-required="true">
                </div>
                <div class="grid-2-col">
                    <div class="form-group">
                        <label for="c-current-${index}">Current Vote Estimate</label>
                        <input type="number" id="c-current-${index}" class="c-current" step="0.01" value="0" required aria-required="true">
                    </div>
                    <div class="form-group">
                        <label for="c-prev-${index}">Previous Election Share (%)</label>
                        <input type="number" id="c-prev-${index}" class="c-prev" step="0.01" value="0">
                    </div>
                </div>
                <div class="grid-4-col">
                    <div class="form-group">
                        <label for="c-camp-${index}">Campaign Score (0-100)</label>
                        <input type="number" id="c-camp-${index}" class="c-camp" step="1" value="50">
                    </div>
                    <div class="form-group">
                        <label for="c-youth-${index}">Youth Support (%)</label>
                        <input type="number" id="c-youth-${index}" class="c-youth" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label for="c-women-${index}">Women Support (%)</label>
                        <input type="number" id="c-women-${index}" class="c-women" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label for="c-urban-${index}">Urban Support (%)</label>
                        <input type="number" id="c-urban-${index}" class="c-urban" step="0.01" value="0">
                    </div>
                     <div class="form-group">
                        <label for="c-rural-${index}">Rural Support (%)</label>
                        <input type="number" id="c-rural-${index}" class="c-rural" step="0.01" value="0">
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

        predictBtn.textContent = 'Calculating...';
        predictBtn.disabled = true;

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidates: candidatesData })
            });
            
            const data = await response.json();
            
            if (data.error) {
                 alert(data.error);
            } else {
                 latestPredictionData = data;
                 displayResults(data);
            }
        } catch (error) {
             alert('Error calculating prediction.');
             console.error(error);
        } finally {
            predictBtn.textContent = 'Calculate Prediction';
            predictBtn.disabled = false;
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
        const chartLabels = [];
        const chartData = [];
        const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

        data.vote_share_table.forEach((row, index) => {
            chartLabels.push(row.name);
            chartData.push(row.predicted_share);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.name}</strong></td>
                <td>${row.current_vote}</td>
                <td style="color: var(--primary-color); font-weight: bold;">${row.predicted_share}%</td>
                <td>${row.score.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });
        
        renderChart(chartLabels, chartData, chartColors);

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function renderChart(labels, data, colors) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        if (resultsChartInstance) {
            resultsChartInstance.destroy();
        }

        resultsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted Vote Share (%)',
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Percentage (%)' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // Download Report Logic
    // ---------------------------------------------------------
    downloadReportBtn.addEventListener('click', () => {
        if (!latestPredictionData) return;

        const d = latestPredictionData;
        let reportText = `=======================================\n`;
        reportText += `ELECTION PREDICTION REPORT\n`;
        reportText += `Generated by Election AI Assistant\n`;
        reportText += `=======================================\n\n`;

        reportText += `PREDICTION SUMMARY:\n`;
        reportText += `- Predicted Winner: ${d.predicted_winner}\n`;
        reportText += `- Confidence Level: ${d.confidence_level}\n`;
        reportText += `- Winning Margin: ${d.margin}%\n\n`;

        reportText += `ANALYSIS:\n`;
        reportText += `${d.explanation}\n\n`;

        reportText += `CANDIDATE BREAKDOWN:\n`;
        reportText += `---------------------------------------\n`;
        d.vote_share_table.forEach(c => {
            reportText += `Name: ${c.name}\n`;
            reportText += `Base Estimate Input: ${c.current_vote}\n`;
            reportText += `Weighted Score: ${c.score.toFixed(2)}\n`;
            reportText += `Predicted Share: ${c.predicted_share}%\n`;
            reportText += `---------------------------------------\n`;
        });

        reportText += `\nDISCLAIMER:\n`;
        reportText += `This prediction is only an estimate based on user-entered data and is not an official election result.\n`;

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Election_Prediction_Report_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

});
