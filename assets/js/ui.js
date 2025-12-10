/* Custom Neon Cursor */
const cursor = document.getElementById("cursor");

document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

/* Mobile hides cursor */
if (window.innerWidth < 720) {
    cursor.style.display = "none";
}

/* Ripple button */
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const x = e.offsetX;
        const y = e.offsetY;
        btn.style.setProperty("--x", x + "px");
        btn.style.setProperty("--y", y + "px");
    });
});

/* Mobile Menu Toggle */
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");

if(menuBtn){
    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("show");
    });
}

const terminal = document.getElementById("terminalText");
const loaderFill = document.getElementById("loaderFill");
const finalStatus = document.getElementById("finalStatus");

const bootLines = [
    "> INITIALIZING SPASO SYSTEM...",
    "> Checking environment variables...",
    "> Loading Neon UI assets...",
    "> Activating matrix renderer...",
    "> Establishing GPU pipelines...",
    "> Compiling shaders...",
    "> Starting cyberpunk framework...",
    "> Loading mini-games engine...",
    "> Optimizing runtime...",
    "> Running diagnostics...",
];

let index = 0;

function typeLine() {
    if (index < bootLines.length) {
        terminal.textContent += bootLines[index] + "\n";
        index++;
        loaderFill.style.width = (index * 10) + "%";
        setTimeout(typeLine, 200); // typing effect speed
    } else {
        completeBoot();
    }
}

function completeBoot() {
    finalStatus.textContent = "SYSTEM ONLINE";
    finalStatus.style.opacity = 1;

    setTimeout(() => {
        document.getElementById("boot").style.opacity = "0";
        setTimeout(() => {
            document.getElementById("boot").style.display = "none";
        }, 600);
    }, 800);
}

window.onload = () => {
    typeLine();
};
