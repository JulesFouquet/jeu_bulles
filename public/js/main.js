document.addEventListener('DOMContentLoaded', () => {
    const counterDisplay = document.querySelector("h3#score-display");
    const livesDisplay = document.getElementById("lives");
    const gameZone = document.getElementById("game-zone");
    const restartBtn = document.getElementById("restart-btn");
    const leaderboardTable = document.querySelector("#score-table tbody");
    const gameOverModal = document.getElementById("game-over");
    const finalScore = document.getElementById("final-score");
    const finalMissclicks = document.getElementById("final-missclicks");
    const okBtn = document.getElementById("ok-btn");
    const replayBtn = document.getElementById("replay-btn");
    const playBtn = document.getElementById("play-btn");

    let counter = 0;
    let missClicks = 0;
    let lives = 3;
    let intervalId;
    let spawnDelay = 2000;
    let scoreSent = false;
    const playerPseudo = document.querySelector("h3#player-pseudo").textContent;

    // --- Vies ---
    function updateLives() {
        livesDisplay.innerHTML = "❤️".repeat(Math.max(0, lives));
        if (lives <= 0) stopGame();
    }

    // --- Game Over ---
    async function showGameOver() {
        finalScore.textContent = `Score: ${counter}`;
        finalMissclicks.textContent = `Miss clicks: ${missClicks}`;
        gameOverModal.style.display = "flex";

        if (!scoreSent) {
            scoreSent = true;
            try {
                await fetch('/jeu/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: counter, missClicks: missClicks })
                });
                await updateLeaderboard();
            } catch(err) {
                console.error("Erreur envoi score :", err);
            }
        }
    }

    okBtn?.addEventListener("click", () => { gameOverModal.style.display = "none"; });
    replayBtn?.addEventListener("click", () => { 
        gameOverModal.style.display = "none"; 
        startGame(); 
    });

    // --- Bulles ---
    function bubbleMaker() {
        const bubble = document.createElement("span");
        bubble.classList.add("bubble");
        gameZone.appendChild(bubble);

        const size = Math.random() * 60 + 40;
        bubble.style.width = size + "px";
        bubble.style.height = size + "px";

        let x, y;
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { x = Math.random() * (gameZone.clientWidth - size); y = 0; }
        else if (side === 1) { x = gameZone.clientWidth - size; y = Math.random() * (gameZone.clientHeight - size); }
        else if (side === 2) { x = Math.random() * (gameZone.clientWidth - size); y = gameZone.clientHeight - size; }
        else { x = 0; y = Math.random() * (gameZone.clientHeight - size); }

        const targetX = gameZone.clientWidth / 2 - size / 2;
        const targetY = gameZone.clientHeight / 2 - size / 2;
        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 1 + Math.random() * 2;

        bubble.style.left = x + "px";
        bubble.style.top = y + "px";

        let lifeLost = false;

        bubble.addEventListener("click", (e) => {
            e.stopPropagation();
            counter++;
            counterDisplay.textContent = counter;
            lifeLost = true;
            bubble.remove();
        });

        function move() {
            x += Math.cos(angle) * speed;
            y += Math.sin(angle) * speed;
            bubble.style.left = x + "px";
            bubble.style.top = y + "px";

            const bRect = bubble.getBoundingClientRect();
            const zoneRect = gameZone.getBoundingClientRect();

            if (!lifeLost &&
                (bRect.top < zoneRect.top ||
                 bRect.left < zoneRect.left ||
                 bRect.bottom > zoneRect.bottom ||
                 bRect.right > zoneRect.right)) {
                lifeLost = true;
                lives--;
                updateLives();
                bubble.remove();
            } else if (!lifeLost) {
                requestAnimationFrame(move);
            }
        }

        requestAnimationFrame(move);
    }

    // --- Spawn ---
    function spawnBubbles() {
        bubbleMaker();
        spawnDelay = Math.max(700, spawnDelay * 0.98);
        intervalId = setTimeout(spawnBubbles, spawnDelay);
    }

    // --- Démarrage / arrêt ---
    function startGame() {
        counter = 0;
        missClicks = 0;
        lives = 3;
        counterDisplay.textContent = counter;
        updateLives();
        scoreSent = false;
        spawnBubbles();
    }

    function stopGame() {
        clearTimeout(intervalId);
        document.querySelectorAll(".bubble").forEach(b => b.remove());
        showGameOver();
    }

    // --- clics manqués ---
    gameZone.addEventListener("click", (e) => {
        if (!e.target.classList.contains("bubble")) { missClicks++; }
    });

    restartBtn?.addEventListener("click", () => { stopGame(); startGame(); });

    playBtn?.addEventListener("click", () => {
        startGame();
        playBtn.style.display = "none";
    });

   // --- Leaderboard ---
async function updateLeaderboard() {
    try {
        const res = await fetch('/jeu/scores');
        const data = await res.json();

        // Tri par score, puis par missClicks si scores égaux
        data.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.missClicks - b.missClicks;
        });

        leaderboardTable.innerHTML = '';

        data.forEach((entry, index) => {
            if (index >= 10) return;

            const tr = document.createElement("tr");

            if (index === 0) tr.classList.add("top1");
            else if (index === 1) tr.classList.add("top2");
            else if (index === 2) tr.classList.add("top3");

            if (entry.pseudo === playerPseudo) tr.classList.add("current-player");

            tr.innerHTML = `<td>${entry.pseudo}</td><td>${entry.score}</td><td>${entry.missClicks}</td>`;
            leaderboardTable.appendChild(tr);
        });

    } catch(err) {
        console.error("Erreur leaderboard :", err);
    }
}


    // --- Initialisation du leaderboard dès le chargement ---
    updateLeaderboard();
});
