// Grid Runner — Improved Neon Runner
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// size & scale
function resize() {
  canvas.width = Math.min(900, Math.floor(window.innerWidth));
  canvas.height = Math.floor(window.innerHeight);
}
resize();
window.addEventListener('resize', resize);

// UI elements
const distanceEl = document.getElementById('distance');
const scoreEl = document.getElementById('score');
const startOverlay = document.getElementById('startOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const tryBtn = document.getElementById('tryBtn');
const finalDist = document.getElementById('finalDist');

let running = false;
let paused = false;
let gameOver = false;

// world
let scrollSpeed = 4;       // base speed
let speedIncrease = 0.001; // gradually increase
let distance = 0;
let score = 0;

// player
const player = {
  x: 80,
  y: 0,
  w: 36,
  h: 56,
  vy: 0,
  gravity: 0.9,
  jumpPower: -16,
  onGround: true,
  dashCooldown: 0,
  isDashing: false
};

// obstacles array
let obstacles = [];
let obstacleTimer = 0;

// particles
let particles = [];

// input / touch detection
let lastTap = 0;
function handleTap() {
  const now = Date.now();
  const dt = now - lastTap;
  if (dt < 300) {
    // double tap => dash
    if (player.dashCooldown <= 0 && !player.isDashing) {
      player.isDashing = true;
      player.dashCooldown = 80; // frames
      player.vy = -6; // slight lift
      setTimeout(()=> player.isDashing = false, 220);
    }
  } else {
    // single tap => jump (if on ground)
    if (player.onGround) {
      player.vy = player.jumpPower;
      player.onGround = false;
    }
  }
  lastTap = now;
}

// touch / mouse
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  handleTap();
}, { passive: false });
canvas.addEventListener('mousedown', (e) => handleTap());

// pause / resume / UI
startBtn.onclick = () => { startOverlay.style.display='none'; running=true; };
pauseBtn.onclick = () => { paused = !paused; pauseOverlay.style.display = paused ? 'flex' : 'none'; };
resumeBtn && (resumeBtn.onclick = ()=> { paused=false; pauseOverlay.style.display='none' });
restartBtn && (restartBtn.onclick = ()=> location.reload());
tryBtn && (tryBtn.onclick = ()=> location.reload());

// spawn obstacles
function spawnObstacle() {
  const w = 28 + Math.random()*36;
  const h = 40 + Math.random()*80;
  const y = canvas.height - 80 - h;
  obstacles.push({ x: canvas.width + 40, y, w, h, passed:false });
}

// create particles
function spawnParticle(x,y,life=40) {
  particles.push({ x, y, vx:(Math.random()-0.5)*1.6, vy: -Math.random()*1.8, life, size:2+Math.random()*3 });
}

// update
function update() {
  if (!running || paused || gameOver) { requestAnimationFrame(update); return; }

  // speed
  scrollSpeed += speedIncrease;
  distance += scrollSpeed * 0.02;
  distanceEl.textContent = "Distance: " + Math.floor(distance) + "m";

  // player physics
  player.vy += player.gravity * (player.isDashing ? 0.35 : 1);
  player.y += player.vy;

  // ground collision
  const groundY = canvas.height - 80 - player.h;
  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.onGround = true;
  }

  // dash cooldown
  if (player.dashCooldown > 0) player.dashCooldown--;

  // spawn obstacles
  obstacleTimer++;
  if (obstacleTimer > Math.max(40, 120 - scrollSpeed*6)) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  // move obstacles
  obstacles.forEach((o,i) => {
    o.x -= scrollSpeed;
    // passed & scoring
    if (!o.passed && o.x + o.w < player.x) { o.passed = true; score++; scoreEl.textContent = "Score: " + score; }
    // collision
    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y + player.h > o.y) {
      // collision response: short slow-motion and knockback
      triggerSlowMo();
      // remove obstacle (player survives but slowed)
      obstacles.splice(i,1);
      for(let k=0;k<10;k++) spawnParticle(player.x + player.w/2, player.y + 10);
    }
    // remove offscreen
    if (o.x < -200) obstacles.splice(i,1);
  });

  // spawn trail particles
  if (Math.random() < 0.6) spawnParticle(player.x, player.y + player.h/2, 30);

  // update particles
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.life--;
    if (p.life <= 0) particles.splice(i,1);
  });

  // end condition (distance cap optional)
  if (distance > 99999) { gameOver = true; }

  render();
  requestAnimationFrame(update);
}

// slow motion effect
let slowMoFrames = 0;
function triggerSlowMo() {
  slowMoFrames = 24;
  const origSpeed = scrollSpeed;
  const smInterval = setInterval(()=> {
    scrollSpeed = Math.max(1.4, scrollSpeed * 0.92);
    slowMoFrames--;
    if (slowMoFrames <= 0) {
      clearInterval(smInterval);
      scrollSpeed = origSpeed;
    }
  }, 16);
}

// render
function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // parallax background (grid lines)
  const cols = 20;
  ctx.strokeStyle = 'rgba(0,255,102,0.04)';
  ctx.lineWidth = 1;
  for (let i=0;i<cols;i++){
    const x = (i/cols)*canvas.width + (distance*0.5 % 40);
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
  }

  // ground
  ctx.fillStyle = '#001100';
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  // draw obstacles
  obstacles.forEach(o=>{
    // neon box
    ctx.fillStyle = '#00ff66';
    roundRect(ctx, o.x, o.y, o.w, o.h, 6, true, false);
    // inner shade
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(o.x+4, o.y+6, o.w-8, o.h-10);
  });

  // draw player (neon runner)
  ctx.save();
  // player glow
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#00ff66';
  ctx.fillStyle = player.isDashing ? '#66fff0' : '#00ff66';
  roundRect(ctx, player.x, player.y, player.w, player.h, 8, true, false);
  ctx.restore();

  // particles
  particles.forEach(p=>{
    ctx.fillStyle = 'rgba(0,255,102,0.9)';
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
}

// helper: rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof stroke == 'undefined') stroke = true;
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// start loop & initial placement
function init() {
  player.y = canvas.height - 80 - player.h;
  obstacles = [];
  particles = [];
  distance = 0; score = 0;
  scrollSpeed = 4;
  obstacleTimer = 0;
  document.getElementById('distance').textContent = "Distance: 0m";
  document.getElementById('score').textContent = "Score: 0";
}
init();

// start game when clicking start
startBtn.onclick = () => {
  startOverlay.style.display = 'none';
  running = true;
  requestAnimationFrame(update);
};

// pause/resume handlers already wired above

// restart & try again
if (restartBtn) restartBtn.addEventListener('click', ()=> location.reload());
if (tryBtn) tryBtn.addEventListener('click', ()=> location.reload());

// input: keyboard for desktop
window.addEventListener('keydown', (e)=>{
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    handleJumpKey();
  } else if (e.code === 'KeyD') {
    // dash
    if (player.dashCooldown <= 0) { player.isDashing = true; player.dashCooldown = 80; setTimeout(()=> player.isDashing=false,220); }
  } else if (e.code === 'KeyP') {
    paused = !paused; pauseOverlay.style.display = paused ? 'flex' : 'none';
  }
});

function handleJumpKey() {
  if (player.onGround) { player.vy = player.jumpPower; player.onGround=false; }
}

// expose roundRect for reuse
window.roundRect = roundRect;
