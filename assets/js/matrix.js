const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const letters = "01";
const fontSize = window.innerWidth < 720 ? 10 : 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff00";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.97) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(draw, window.innerWidth < 720 ? 60 : 35);
