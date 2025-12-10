const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 600;

let drone = { x: 60, y: 200, size: 22, gravity: 0.3, lift: -6, velocity: 0 };
let pipes = [];
let score = 0;
let gameStarted = false;
let gameOver = false;

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    gameStarted = true;
    loop();
}

document.getElementById("startBtn").onclick = startGame;

function restartGame() {
    location.reload();
}

// Fly
canvas.addEventListener("mousedown", () => drone.velocity = drone.lift);
canvas.addEventListener("touchstart", () => drone.velocity = drone.lift);

function resetGame() {
    document.getElementById("gameOver").style.display = "flex";
    document.getElementById("finalScore").textContent = "Score: " + score;
    gameOver = true;
}

function spawnPipe() {
    let gap = 150;
    let top = Math.random() * (canvas.height - gap - 100);
    pipes.push({
        x: canvas.width,
        topHeight: top,
        bottomY: top + gap,
        width: 50
    });
}

setInterval(() => {
    if (gameStarted && !gameOver) spawnPipe();
}, 1600);

function loop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drone physics
    drone.velocity += drone.gravity;
    drone.y += drone.velocity;

    // Draw drone (glowing circle)
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ff99";
    ctx.fillStyle = "#00ff99";
    ctx.beginPath();
    ctx.arc(drone.x, drone.y, drone.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw pipes
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#00ff99";

    pipes.forEach(pipe => {
        pipe.x -= 2.5;

        // Top pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);

        // Collision
        if (
            drone.x + drone.size > pipe.x &&
            drone.x - drone.size < pipe.x + pipe.width &&
            (drone.y - drone.size < pipe.topHeight || drone.y + drone.size > pipe.bottomY)
        ) {
            resetGame();
        }

        // Score
        if (pipe.x + pipe.width === drone.x) score++;
    });

    // Out of screen
    if (drone.y > canvas.height || drone.y < 0) resetGame();

    // Score display
    ctx.fillStyle = "#00ff99";
    ctx.font = "24px Courier";
    ctx.fillText("Score: " + score, 20, 40);

    requestAnimationFrame(loop);
}
