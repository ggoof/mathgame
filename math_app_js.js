// Math Learning App - JavaScript
class MathApp {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.selectedOption = null;
        this.isAnswered = false;
        this.gameHistory = [];
        this.fireworks = [];
        
        // Level configurations
        this.levelConfigs = {
            1: { operations: ['+'], minNum: 1, maxNum: 9, showCubes: true, showOptions: true },
            2: { operations: ['+', '-'], minNum: 1, maxNum: 9, showCubes: true, showOptions: true },
            3: { operations: ['+', '-'], minNum: 10, maxNum: 99, showCubes: true, showOptions: true },
            4: { operations: ['+', '-', '*'], minNum: 1, maxNum: 99, showCubes: false, showOptions: true },
            5: { operations: ['+', '-', '*', '/'], minNum: 1, maxNum: 99, showCubes: false, showOptions: true },
            6: { operations: ['+', '-', '*', '/'], minNum: 1, maxNum: 99, showCubes: false, showOptions: false },
            7: { operations: ['+', '-', '*', '/', '^'], minNum: 1, maxNum: 99, showCubes: false, showOptions: false },
            8: { operations: ['+', '-', '*', '/', '^', '√'], minNum: 1, maxNum: 99, showCubes: false, showOptions: false }
        };
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.createLevelConfigs();
        this.generateQuestion();
        this.gameLoop();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    createLevelConfigs() {
        const container = document.getElementById('levelConfigs');
        container.innerHTML = '';
        
        Object.keys(this.levelConfigs).forEach(level => {
            const config = this.levelConfigs[level];
            const div = document.createElement('div');
            div.className = 'level-config';
            div.innerHTML = `
                <h4>Level ${level} Configuration</h4>
                <div class="config-item">
                    <label>Operations:</label>
                    <select multiple id="ops_${level}">
                        <option value="+" ${config.operations.includes('+') ? 'selected' : ''}>Addition (+)</option>
                        <option value="-" ${config.operations.includes('-') ? 'selected' : ''}>Subtraction (-)</option>
                        <option value="*" ${config.operations.includes('*') ? 'selected' : ''}>Multiplication (×)</option>
                        <option value="/" ${config.operations.includes('/') ? 'selected' : ''}>Division (÷)</option>
                        <option value="^" ${config.operations.includes('^') ? 'selected' : ''}>Power (^)</option>
                        <option value="√" ${config.operations.includes('√') ? 'selected' : ''}>Square Root (√)</option>
                    </select>
                </div>
                <div class="config-item">
                    <label>Min Number:</label>
                    <input type="number" id="min_${level}" value="${config.minNum}" min="1" max="999">
                </div>
                <div class="config-item">
                    <label>Max Number:</label>
                    <input type="number" id="max_${level}" value="${config.maxNum}" min="1" max="999">
                </div>
                <button onclick="app.updateLevelConfig(${level})">Save Level ${level}</button>
            `;
            container.appendChild(div);
        });
    }

    updateLevelConfig(level) {
        const opsSelect = document.getElementById(`ops_${level}`);
        const minInput = document.getElementById(`min_${level}`);
        const maxInput = document.getElementById(`max_${level}`);
        
        const selectedOps = Array.from(opsSelect.selectedOptions).map(option => option.value);
        
        this.levelConfigs[level] = {
            ...this.levelConfigs[level],
            operations: selectedOps,
            minNum: parseInt(minInput.value),
            maxNum: parseInt(maxInput.value)
        };
        
        if (this.currentLevel == level) {
            this.generateQuestion();
        }
        
        alert(`Level ${level} configuration saved!`);
    }

    generateQuestion() {
        const config = this.levelConfigs[this.currentLevel];
        const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
        
        let num1, num2, answer, questionText;
        
        switch(operation) {
            case '+':
                num1 = this.randomNum(config.minNum, config.maxNum);
                num2 = this.randomNum(config.minNum, config.maxNum);
                answer = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
                break;
            case '-':
                num1 = this.randomNum(config.minNum, config.maxNum);
                num2 = this.randomNum(config.minNum, Math.min(num1, config.maxNum));
                answer = num1 - num2;
                questionText = `${num1} - ${num2} = ?`;
                break;
            case '*':
                num1 = this.randomNum(config.minNum, Math.min(config.maxNum, 12));
                num2 = this.randomNum(config.minNum, Math.min(config.maxNum, 12));
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
                break;
            case '/':
                num2 = this.randomNum(Math.max(1, config.minNum), Math.min(config.maxNum, 12));
                answer = this.randomNum(1, Math.min(config.maxNum / num2, 20));
                num1 = answer * num2;
                questionText = `${num1} ÷ ${num2} = ?`;
                break;
            case '^':
                num1 = this.randomNum(2, Math.min(config.maxNum, 10));
                num2 = this.randomNum(2, 4);
                answer = Math.pow(num1, num2);
                questionText = `${num1}^${num2} = ?`;
                break;
            case '√':
                answer = this.randomNum(1, Math.min(Math.sqrt(config.maxNum), 20));
                num1 = answer * answer;
                questionText = `√${num1} = ?`;
                break;
        }
        
        const options = config.showOptions ? this.generateOptions(answer) : null;
        
        this.currentQuestion = {
            text: questionText,
            answer: answer,
            options: options,
            operation: operation,
            userAnswer: null,
            timestamp: Date.now()
        };
        
        this.selectedOption = null;
        this.isAnswered = false;
        this.userInput = '';
    }

    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        
        while (options.length < 3) {
            const wrong = correctAnswer + this.randomNum(-10, 10);
            if (wrong > 0 && wrong !== correctAnswer && !options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    }

    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const config = this.levelConfigs[this.currentLevel];
        
        if (!this.isAnswered) {
            if (config.showOptions) {
                // Check option clicks
                const optionWidth = 200;
                const optionHeight = 100;
                const startX = this.canvas.width * 0.6;
                const startY = 150;
                
                for (let i = 0; i < 3; i++) {
                    const optionX = startX;
                    const optionY = startY + i * 120;
                    
                    if (x >= optionX && x <= optionX + optionWidth &&
                        y >= optionY && y <= optionY + optionHeight) {
                        this.selectedOption = i;
                        this.playSound('click');
                        break;
                    }
                }
            }
            
            // Check answer button
            const buttonY = this.canvas.height - 100;
            if (x >= this.canvas.width/2 - 100 && x <= this.canvas.width/2 + 100 &&
                y >= buttonY && y <= buttonY + 60) {
                this.checkAnswer();
            }
        } else {
            // Check next button
            const buttonY = this.canvas.height - 100;
            if (x >= this.canvas.width/2 - 100 && x <= this.canvas.width/2 + 100 &&
                y >= buttonY && y <= buttonY + 60) {
                this.nextQuestion();
            }
        }
    }

    handleMouseMove(e) {
        // Add hover effects if needed
    }

    checkAnswer() {
        const config = this.levelConfigs[this.currentLevel];
        let userAnswer;
        
        if (config.showOptions) {
            if (this.selectedOption === null) return;
            userAnswer = this.currentQuestion.options[this.selectedOption];
        } else {
            userAnswer = parseInt(this.userInput);
            if (isNaN(userAnswer)) return;
        }
        
        this.currentQuestion.userAnswer = userAnswer;
        const isCorrect = userAnswer === this.currentQuestion.answer;
        
        this.isAnswered = true;
        this.gameHistory.push({
            ...this.currentQuestion,
            level: this.currentLevel,
            correct: isCorrect,
            completedAt: Date.now()
        });
        
        if (isCorrect) {
            this.playSound('correct');
            this.createFireworks();
        } else {
            this.playSound('wrong');
        }
        
        this.updateStats();
    }

    nextQuestion() {
        this.generateQuestion();
    }

    createFireworks() {
        for (let i = 0; i < 15; i++) {
            this.fireworks.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.7,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    }

    playSound(type) {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                break;
            case 'correct':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                break;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawQuestion();
        this.drawOptions();
        this.drawButton();
        this.drawFireworks();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    drawQuestion() {
        if (!this.currentQuestion) return;
        
        const questionX = this.canvas.width * 0.25;
        const questionY = this.canvas.height * 0.3;
        
        this.ctx.font = 'bold 48px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.currentQuestion.text, questionX, questionY);
    }

    drawOptions() {
        if (!this.currentQuestion) return;
        
        const config = this.levelConfigs[this.currentLevel];
        
        if (config.showOptions && this.currentQuestion.options) {
            const optionWidth = 200;
            const optionHeight = 100;
            const startX = this.canvas.width * 0.6;
            const startY = 150;
            
            for (let i = 0; i < this.currentQuestion.options.length; i++) {
                const x = startX;
                const y = startY + i * 120;
                const option = this.currentQuestion.options[i];
                
                // Draw option background
                this.ctx.fillStyle = this.selectedOption === i ? '#ffeb3b' : '#fff';
                if (this.isAnswered) {
                    if (option === this.currentQuestion.answer) {
                        this.ctx.fillStyle = '#4caf50';
                    } else if (this.selectedOption === i && option !== this.currentQuestion.answer) {
                        this.ctx.fillStyle = '#f44336';
                    }
                }
                
                this.ctx.fillRect(x, y, optionWidth, optionHeight);
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x, y, optionWidth, optionHeight);
                
                // Draw option number
                this.ctx.font = 'bold 36px Comic Sans MS';
                this.ctx.fillStyle = '#333';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(option.toString(), x + optionWidth/2, y + 45);
                
                // Draw cubes if enabled
                if (config.showCubes && option <= 20) {
                    this.drawCubes(option, x + optionWidth/2, y + 70);
                }
            }
        } else if (!config.showOptions) {
            // Draw input field for fill-in-the-blank
            const inputX = this.canvas.width * 0.6;
            const inputY = this.canvas.height * 0.3;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(inputX - 100, inputY - 30, 200, 60);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(inputX - 100, inputY - 30, 200, 60);
            
            this.ctx.font = 'bold 32px Comic Sans MS';
            this.ctx.fillStyle = '#333';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.userInput || '_____', inputX, inputY + 10);
        }
    }

    drawCubes(count, centerX, centerY) {
        const cubeSize = 15;
        const cubesPerRow = Math.min(count, 10);
        const rows = Math.ceil(count / cubesPerRow);
        const totalWidth = cubesPerRow * (cubeSize + 2);
        
        let drawnCubes = 0;
        for (let row = 0; row < rows && drawnCubes < count; row++) {
            const cubesInThisRow = Math.min(cubesPerRow, count - drawnCubes);
            const rowWidth = cubesInThisRow * (cubeSize + 2);
            
            for (let col = 0; col < cubesInThisRow; col++) {
                const x = centerX - rowWidth/2 + col * (cubeSize + 2);
                const y = centerY - (rows * (cubeSize + 2))/2 + row * (cubeSize + 2);
                
                const gradient = this.ctx.createLinearGradient(x, y, x + cubeSize, y + cubeSize);
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(1, '#feca57');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y, cubeSize, cubeSize);
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cubeSize, cubeSize);
                
                drawnCubes++;
            }
        }
    }

    drawButton() {
        const buttonY = this.canvas.height - 100;
        const buttonText = this.isAnswered ? 'NEXT' : 'CHECK';
        const buttonColor = this.isAnswered ? '#2196f3' : '#4caf50';
        
        this.ctx.fillStyle = buttonColor;
        this.ctx.fillRect(this.canvas.width/2 - 100, buttonY, 200, 60);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.canvas.width/2 - 100, buttonY, 200, 60);
        
        this.ctx.font = 'bold 24px Comic Sans MS';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(buttonText, this.canvas.width/2, buttonY + 38);
    }

    drawFireworks() {
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += 0.2; // gravity
            fw.life--;
            
            const alpha = fw.life / fw.maxLife;
            this.ctx.fillStyle = fw.color.replace('50%)', `50%, ${alpha})`);
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (fw.life <= 0) {
                this.fireworks.splice(i, 1);
            }
        }
    }

    updateStats() {
        const statsDiv = document.getElementById('statsDisplay');
        const totalQuestions = this.gameHistory.length;
        const correctAnswers = this.gameHistory.filter(q => q.correct).length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        const levelStats = {};
        this.gameHistory.forEach(q => {
            if (!levelStats[q.level]) {
                levelStats[q.level] = { total: 0, correct: 0 };
            }
            levelStats[q.level].total++;
            if (q.correct) levelStats[q.level].correct++;
        });
        
        let statsHTML = `
            <div class="stats">
                <h4>Overall Statistics</h4>
                <p>Total Questions: ${totalQuestions}</p>
                <p>Correct Answers: ${correctAnswers}</p>
                <p>Accuracy: ${accuracy}%</p>
            </div>
        `;
        
        Object.keys(levelStats).forEach(level => {
            const stat = levelStats[level];
            const levelAccuracy = Math.round((stat.correct / stat.total) * 100);
            statsHTML += `
                <div class="stats">
                    <h5>Level ${level}</h5>
                    <p>Questions: ${stat.total}, Correct: ${stat.correct}</p>
                    <p>Accuracy: ${levelAccuracy}%</p>
                </div>
            `;
        });
        
        statsDiv.innerHTML = statsHTML;
    }
}

// Global functions
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
}

function changeLevel() {
    const select = document.getElementById('currentLevel');
    app.currentLevel = parseInt(select.value);
    app.generateQuestion();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        app.gameHistory = [];
        app.updateStats();
    }
}

// Handle keyboard input for fill-in-the-blank questions
document.addEventListener('keydown', (e) => {
    const config = app.levelConfigs[app.currentLevel];
    if (!config.showOptions && !app.isAnswered) {
        if (e.key >= '0' && e.key <= '9') {
            app.userInput = (app.userInput || '') + e.key;
        } else if (e.key === 'Backspace') {
            app.userInput = (app.userInput || '').slice(0, -1);
        } else if (e.key === 'Enter') {
            app.checkAnswer();
        }
    }
});

// Initialize the app
const app = new MathApp();