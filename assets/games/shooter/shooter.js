/* ============================
   SPASO Cyberpunk Shooter — FIXED Edition
   ============================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fix: always match canvas to screen
function resizeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeGame();
window.addEventListener("resize", resizeGame);

// GAME STATE
let gameRunning = false;
let wave = 1;

// PLAYER
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 22,
    speed: 4,
    hp: 100
};

// OBJECTS
let bullets = [];
let enemies = [];

// INPUT
let mouseX = 0, mouseY = 0;
let keys = {};

// EVENTS
window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });
window.addEventListener("mousedown", shoot);

// SHOOT FUNCTION
function shoot() {
    if (!gameRunning) return;

    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);

    bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * 8,
        dy: Math.sin(angle) * 8,
        size: 6
    });
}

// WAVES
function spawnWave() {
    let count = 4 + wave * 2;

    for (let i = 0; i < count; i++) {
        let ex, ey, safe = false;

        // Fix: Never spawn enemies too close to player
        while (!safe) {
            ex = Math.random() * canvas.width;
            ey = Math.random() * canvas.height;
            if (Math.hypot(ex - player.x, ey - player.y) > 200) safe = true;
        }

        enemies.push({
            x: ex,
            y: ey,
            size: 20,
            speed: 1 + wave * 0.25,
            hp: 20 + wave * 5
        });
    }
}

// UPDATE LOOP
function update() {
    if (!gameRunning) return;

    // Movement
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Bullets
    bullets.forEach((b, i) => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    });

    // Enemies
    enemies.forEach((e, i) => {
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        // Collision damage
        if (Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) {
            player.hp -= 0.3;
            document.getElementById("healthBar").style.width = player.hp + "%";
        }

        // Bullet hits enemy
        bullets.forEach((b, bi) => {
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.size + b.size) {
                e.hp -= 12;
                bullets.splice(bi, 1);
            }
        });

        // Remove dead enemy
        if (e.hp <= 0) enemies.splice(i, 1);
    });

    // Next wave
    if (enemies.length === 0) {
        wave++;
        document.getElementById("waveInfo").textContent = "Wave " + wave;
        spawnWave();
    }

    // Player death
    if (player.hp <= 0) endGame();

    draw();
    requestAnimationFrame(update);
}

// DRAW LOOP
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffae";
    ctx.fillStyle = "#00ffae";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bullets
    bullets.forEach((b) => {
        ctx.fillStyle = "#00ffae";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Enemies
    enemies.forEach((e) => {
        ctx.fillStyle = "#ff0066";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff0066";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.shadowBlur = 0;
}

// START GAME
function startGame() {
    document.getElementById("startScreen").style.display = "none";

    // Reset everything
    wave = 1;
    player.hp = 100;
    enemies = [];
    bullets = [];

    document.getElementById("healthBar").style.width = "100%";
    document.getElementById("waveInfo").textContent = "Wave 1";

    gameRunning = true;
    spawnWave();
    update();
}

// END GAME
function endGame() {
    gameRunning = false;

    document.getElementById("finalScore").textContent =
        "Waves Survived: " + (wave - 1);

    document.getElementById("gameOver").style.display = "flex";
}

// RESTART
function restartGame() {
    location.reload();
}
