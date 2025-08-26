document.addEventListener('DOMContentLoaded', () => {

    // ------------------- Auth -------------------
    const pseudoInput = document.getElementById('pseudo');
    const passwordInput = document.getElementById('password');
    const authMessage = document.getElementById('auth-message');
    const API_URL = 'http://localhost:3000'; // API bulle-api

    const showMessage = (msg, success = true) => {
        if (!authMessage) return;
        authMessage.textContent = msg;
        authMessage.style.color = success ? 'green' : 'red';
    };

    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const pseudo = pseudoInput.value.trim();
            const password = passwordInput.value.trim();
            if (!pseudo || !password) { showMessage('Pseudo et mot de passe requis', false); return; }
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pseudo, password }),
                });
                const data = await res.json();
                showMessage(res.ok ? data.message : (data.message || 'Erreur inscription'), res.ok);
            } catch (err) {
                showMessage('Erreur serveur', false);
                console.error(err);
            }
        });
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const pseudo = pseudoInput.value.trim();
            const password = passwordInput.value.trim();
            if (!pseudo || !password) { showMessage('Pseudo et mot de passe requis', false); return; }
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pseudo, password }),
                });
                const data = await res.json();
                if (res.ok) {
                    showMessage('Connexion réussie ✅');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('pseudo', pseudo);
                    window.location.href = 'index.html';
                } else {
                    showMessage(data.message || 'Erreur connexion', false);
                }
            } catch (err) {
                showMessage('Erreur serveur', false);
                console.error(err);
            }
        });
    }

    // ------------------- Jeu -------------------
    const counterDisplay = document.querySelector("h3");
    const livesDisplay = document.getElementById("lives");
    const gameZone = document.getElementById("game-zone");
    const restartBtn = document.getElementById("restart-btn");
    const leaderboardList = document.getElementById("score-list");

    let counter = 0;
    let missClicks = 0;
    let lives = 3;
    let intervalId;
    let spawnDelay = 3000; 
    let playerPseudo = "";

    function askPseudo() {
        playerPseudo = prompt("Entrez votre pseudo :", "Player") || "Player";
    }

    const updateLivesDisplay = () => {
        const safeLives = Math.max(0, lives);
        livesDisplay.innerHTML = "❤️".repeat(safeLives);
    };

    const updateLives = () => {
        lives = Math.max(0, lives);
        updateLivesDisplay();
        if (lives <= 0) {
            stopGame();
            showGameOver();
        }
    };

    const gameOverModal = document.getElementById("game-over");
    const finalScore = document.getElementById("final-score");
    const finalMissclicks = document.getElementById("final-missclicks");
    const okBtn = document.getElementById("ok-btn");
    const replayBtn = document.getElementById("replay-btn");

    const showGameOver = () => {
        finalScore.textContent = `Score: ${counter}`;
        finalMissclicks.textContent = `Miss clicks: ${missClicks}`;
        gameOverModal.style.display = "flex";
        updateLeaderboard(counter);
    };

    okBtn?.addEventListener("click", () => { gameOverModal.style.display = "none"; });
    replayBtn?.addEventListener("click", () => { gameOverModal.style.display = "none"; startGame(); });

    const bubbleMaker = () => {
        const bubble = document.createElement("span");
        bubble.classList.add("bubble");
        gameZone.appendChild(bubble);

        const size = Math.random() * 100 + 50 + "px";
        bubble.style.height = size;
        bubble.style.width = size;

        const maxTop = gameZone.clientHeight - parseInt(size) - 20;
        const maxLeft = gameZone.clientWidth - parseInt(size) - 20;
        bubble.style.top = Math.random() * maxTop + "px";
        bubble.style.left = Math.random() * maxLeft + "px";

        let lifeLost = false;

        bubble.addEventListener("click", (e) => {
            counter++;
            counterDisplay.textContent = counter;
            bubble.remove();
            e.stopPropagation();
        });

        const checkOutOfBounds = setInterval(() => {
            const bubbleRect = bubble.getBoundingClientRect();
            const zoneRect = gameZone.getBoundingClientRect();
            if (!lifeLost &&
                (bubbleRect.top < zoneRect.top ||
                 bubbleRect.left < zoneRect.left ||
                 bubbleRect.bottom > zoneRect.bottom ||
                 bubbleRect.right > zoneRect.right)) {
                lifeLost = true;
                lives = Math.max(0, lives - 1);
                updateLives();
                bubble.remove();
                clearInterval(checkOutOfBounds);
            }
        }, 50);
    };

    const spawnBubbles = () => {
        bubbleMaker();
        spawnDelay = Math.max(500, spawnDelay * 0.95);
        intervalId = setTimeout(spawnBubbles, spawnDelay);
    };

    const startGame = () => {
        counter = 0;
        missClicks = 0;
        lives = 3;
        counterDisplay.textContent = counter;
        spawnDelay = 3000;
        updateLivesDisplay();
        spawnBubbles();
    };

    const stopGame = () => {
        clearTimeout(intervalId);
        document.querySelectorAll(".bubble").forEach(b => b.remove());
    };

    gameZone?.addEventListener("click", (e) => {
        if (!e.target.classList.contains("bubble")) { missClicks++; }
    });

    restartBtn?.addEventListener("click", () => { stopGame(); startGame(); });

    async function updateLeaderboard(score) {
        try {
            await fetch("http://localhost:3000/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pseudo: playerPseudo, score }),
            });

            const response = await fetch("http://localhost:3000/score");
            const data = await response.json();

            leaderboardList.innerHTML = "";
            data.forEach((entry) => {
                const li = document.createElement("li");
                li.textContent = `${entry.pseudo} - ${entry.score}`;
                leaderboardList.appendChild(li);
            });
        } catch (err) { console.error("Erreur leaderboard :", err); }
    }

    // ------------------- Démarrage -------------------
    askPseudo();
    startGame();
});
