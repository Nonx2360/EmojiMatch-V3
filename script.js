let currentPlayer = 1;
let playerCount = 2;
let scores = {};
let playerNames = {};
let firstCard = null;
let secondCard = null;
let locked = false;
let matchedPairs = 0;

const emojis = ['😀', '😎', '😍', '🤔', '😴', '🤣', '😇', '🤩', '😋', '😜',
    '😺', '🎮', '🎨', '🎭', '🎪', '🎰', '🎲', '🎯', '🎱', '🎳',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🌈', '🌞', '🌙', '⭐', '🌟', '⚡', '☄️', '🌪️', '🌈', '🌍',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'
];

// Initialize with 2 inputs by default
document.addEventListener('DOMContentLoaded', () => {
    generatePlayerInputs();
});

function generatePlayerInputs() {
    const countInput = document.getElementById('playerCount');
    let val = parseInt(countInput.value);

    // Enforce limits
    if (val < 1) val = 1;
    if (val > 4) val = 4;
    countInput.value = val;
    playerCount = val;

    const playerNamesDiv = document.getElementById('playerNames');
    playerNamesDiv.innerHTML = '';

    for (let i = 1; i <= playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `Player ${i} Name`;
        input.value = `Player ${i}`;
        playerNamesDiv.appendChild(input);
    }
}

function startGame() {
    // Get player names
    playerNames = {};
    for (let i = 1; i <= playerCount; i++) {
        const nameInput = document.getElementById(`player${i}`);
        playerNames[i] = nameInput ? nameInput.value.trim() || `Player ${i}` : `Player ${i}`;
    }

    // Reset scores
    scores = {};
    for (let i = 1; i <= playerCount; i++) {
        scores[i] = 0;
    }

    currentPlayer = 1;
    matchedPairs = 0;

    // Switch Screens
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    createGrid(parseInt(document.getElementById('gridSize').value));
    updateStatus();
}

function backToSetup() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
    // Reset grid
    document.getElementById('grid').innerHTML = '';
}

function createGrid(size) {
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // Calculate optimal card size based on viewport
    const viewportSize = Math.min(window.innerWidth, window.innerHeight) * 0.75; // slightly smaller to fit header
    const gapTotal = (size - 1) * 12; // 12px gap
    const cardSize = (viewportSize - gapTotal) / size;

    grid.innerHTML = '';

    const totalCards = size * size;
    let emojiPairs = [];

    // Select random emojis for this game
    const shuffledEmojis = [...emojis].sort(() => 0.5 - Math.random());
    const selectedEmojis = shuffledEmojis.slice(0, totalCards / 2);

    for (let i = 0; i < totalCards / 2; i++) {
        emojiPairs.push(selectedEmojis[i], selectedEmojis[i]);
    }
    emojiPairs = emojiPairs.sort(() => Math.random() - 0.5);

    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = `${cardSize}px`;
        card.style.height = `${cardSize}px`;

        // 3D Structure
        const inner = document.createElement('div');
        inner.className = 'card-inner';

        const front = document.createElement('div');
        front.className = 'card-front';
        // Front is the "back" of the card (pattern/logo)

        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = emojiPairs[i];

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.dataset.value = emojiPairs[i];
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    }
}

function flipCard(card) {
    if (locked || card.classList.contains('flipped')) return;

    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        checkMatch();
    }
}

function checkMatch() {
    locked = true;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        scores[currentPlayer]++;
        matchedPairs++;

        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        // Small confetti for match
        fireConfetti(0.3);

        firstCard = null;
        secondCard = null;
        locked = false;

        const totalPairs = Math.pow(parseInt(document.getElementById('gridSize').value), 2) / 2;
        if (matchedPairs === totalPairs) {
            setTimeout(() => determineWinner(), 500);
        } else {
            updateStatus();
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard = null;
            secondCard = null;
            locked = false;

            // Next player
            currentPlayer = (currentPlayer % playerCount) + 1;
            updateStatus();
        }, 1000);
    }

    // Update score immediately to show progress
    updateStatus();
}

function updateStatus() {
    const statusDiv = document.getElementById('status');
    let html = `<span style="color: #a5b4fc">Turn:</span> ${playerNames[currentPlayer]}`;

    // Add tooltip or smaller text for scores
    let scoreText = Object.entries(scores).map(([id, score]) => {
        const isCurrent = parseInt(id) === currentPlayer;
        const style = isCurrent ? 'font-weight:bold; color:var(--secondary-color);' : '';
        return `<span style="${style}">${playerNames[id]}: ${score}</span>`;
    }).join(' | ');

    statusDiv.innerHTML = `<div style="display:flex; flex-direction:column; align-items:flex-end; font-size:0.9rem;">
        <div>${html}</div>
        <div style="font-size:0.8rem; opacity:0.8">${scoreText}</div>
    </div>`;
}

function determineWinner() {
    // Find max score
    let maxScore = -1;
    let winners = [];

    for (const [id, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            winners = [playerNames[id]];
        } else if (score === maxScore) {
            winners.push(playerNames[id]);
        }
    }

    let message = '';
    if (winners.length === 1) {
        message = `${winners[0]} wins with ${maxScore} pairs!`;
    } else {
        message = `It's a tie between ${winners.join(' & ')} with ${maxScore} pairs!`;
    }

    showWinnerPopup(message);
}

function showWinnerPopup(message) {
    // Big confetti
    fireConfetti(1.5);
    const interval = setInterval(() => fireConfetti(0.5), 2000);

    Swal.fire({
        title: '🎉 Victory! 🎉',
        text: message,
        icon: 'success',
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonText: 'Play Again',
        confirmButtonColor: '#6a11cb',
        backdrop: `rgba(0,0,0,0.8)`,
        allowOutsideClick: false,
        didOpen: () => {
            // Keep confetti running while open
        },
        willClose: () => {
            clearInterval(interval);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            backToSetup();
        }
    });
}

function fireConfetti(particleRatio) {
    if (typeof confetti !== 'undefined') {
        confetti({
            origin: { y: 0.7 },
            particleCount: 100 * particleRatio,
            spread: 70,
            startVelocity: 30,
        });
    }
}