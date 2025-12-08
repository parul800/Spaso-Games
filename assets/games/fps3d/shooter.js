/* shooter.js - SPASO Wave Shooter
   - Safe for file:/// (wrapped in window.onload)
   - Preloads images, shows alerts if missing
   - SMG fire, bullet beam, grenade, explosion, HUD, boss wave
*/

window.onload = () => {
  console.log("SPASO shooter.js loaded");

  // Basic canvas setup
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Asset paths (place these PNGs alongside index.html)
  const ASSETS = {
    monster: "assets/sprites/monster.png",
    boss: "assets\sprites\boss_idle.png",
    gun: "assets\sprites\ChatGPT Image Dec 8, 2025, 05_17_47 AM.png",         // optional overlay
    grenadeIcon: "grenade.png" // optional icon
  };

  // Preload images with error handlers
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(src);
    });
  }

  // attempt to load all; missing images handled gracefully
  let IMG = {
    monster: null,
    boss: null,
    gun: null,
    grenadeIcon: null
  };

  Promise.allSettled([
    loadImage(ASSETS.monster),
    loadImage(ASSETS.boss),
    loadImage(ASSETS.gun),
    loadImage(ASSETS.grenadeIcon)
  ]).then(results => {
    // results order matches above
    if (results[0].status === "fulfilled") IMG.monster = results[0].value;
    else alert("Warning: monster.png not found. Place monster.png in same folder.");

    if (results[1].status === "fulfilled") IMG.boss = results[1].value;
    else alert("Warning: boss.png not found. Place boss.png in same folder.");

    if (results[2].status === "fulfilled") IMG.gun = results[2].value;
    else console.log("gun.png not found — overlay disabled.");

    if (results[3].status === "fulfilled") IMG.grenadeIcon = results[3].value;
    else console.log("grenade.png not found — icon disabled.");

    // All set — enable start button
    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").innerText = "Start Game";
  });

  // Game state
  let hp = 100;
  let wave = 1;
  let enemies = [];
  let gameRunning = false;
  let smgFire = false;
  let grenades = 3;
  let score = 0;

  // Config (enemy full-screen-ish size)
  function enemySize() {
    // full-screen height style (your requested)
    const h = Math.floor(canvas.height * 0.85);
    const w = Math.floor(h * 0.6);
    return { w, h };
  }

  // Utility: spawn enemy (monster or boss)
  function spawnEnemy(isBoss = false) {
    const size = enemySize();
    const xCenter = Math.floor(Math.random() * (canvas.width - size.w));
    const enemy = {
      img: isBoss ? (IMG.boss || IMG.monster) : (IMG.monster),
      x: xCenter,
      y: -size.h - 20,
      w: size.w,
      h: size.h,
      speed: isBoss ? 1.6 + wave * 0.2 : 2 + wave * 0.25,
      hp: isBoss ? 350 + wave * 50 : 70 + wave * 10,
      flash: 0,
      dir: Math.random() < 0.5 ? -1 : 1,
      swaySpeed: 1 + Math.random() * 1.5
    };
    enemies.push(enemy);
  }

  // Start button handling
  document.getElementById("startBtn").onclick = () => {
    // If images not loaded, warn
    if (!IMG.monster) {
      if (!confirm("monster.png missing — continue with placeholders?")) return;
    }

    document.getElementById("startScreen").style.display = "none";
    gameRunning = true;
    enemies = [];
    hp = 100;
    wave = 1;
    score = 0;
    grenades = 3;
    document.getElementById("hp").innerText = hp;
    document.getElementById("wave").innerText = wave;
    spawnEnemy();
    requestAnimationFrame(loop);
  };

  // Input: SMG hold mouse
  window.addEventListener("mousedown", () => (smgFire = true));
  window.addEventListener("mouseup", () => (smgFire = false));

  // Grenade key G
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "g" && grenades > 0) {
      grenades--;
      // big damage to all enemies
      enemies.forEach(en => {
        en.hp -= 120;
        en.flash = 6;
      });
      // explosion animation (temporary particles)
      spawnExplosion(canvas.width / 2, canvas.height / 2, 50);
    }
  });

  // Particle / explosion manager
  const particles = [];
  function spawnExplosion(cx, cy, count = 30) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 40 + Math.random() * 30,
        size: 4 + Math.random() * 6,
        color: (Math.random() > 0.6) ? "#66ffcc" : "#00ff66"
      });
    }
  }

  // Draw gun overlay if exists
  function drawGun() {
    if (!IMG.gun) {
      // simple muzzle line or small rectangle
      ctx.fillStyle = "rgba(0,255,180,0.05)";
      ctx.fillRect(canvas.width / 2 - 40, canvas.height - 160, 80, 120);
      return;
    }
    // draw gun image bottom-center scaled
    const gw = Math.floor(canvas.width * 0.45);
    const gh = Math.floor(gw * (IMG.gun.height / IMG.gun.width));
    ctx.drawImage(IMG.gun, canvas.width / 2 - gw / 2, canvas.height - gh, gw, gh);
  }

  // Main loop
  function loop() {
    if (!gameRunning) return;

    // clear bg — subtle vignette / cyber background
    ctx.fillStyle = "#030200";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw slight grid / neon scan (optional)
    drawNeonGrid();

    // update + draw enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      // sway left-right
      e.x += e.dir * e.swaySpeed;
      if (e.x < 0 || e.x + e.w > canvas.width) e.dir *= -1;

      // move down
      e.y += e.speed;

      // draw enemy image if available otherwise placeholder rect
      if (e.img) ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
      else {
        ctx.fillStyle = "#552222";
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }

      // damage flash overlay
      if (e.flash && e.flash > 0) {
        ctx.fillStyle = "rgba(255,0,0,0.25)";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        e.flash--;
      }

      // if reached bottom area (player zone) - damage player
      if (e.y + e.h >= canvas.height - 60) {
        hp -= (wave >= 5 ? 3 : 1);
        e.y = canvas.height - e.h - 60; // keep it reducing but not below ground
        document.getElementById("hp").innerText = Math.max(0, hp);
      }

      // remove dead enemy -> spawn energy burst (safe)
      if (e.hp <= 0) {
        // score
        score += (wave >= 5 ? 500 : 50);
        // explosion at center of enemy
        spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, 24);
        enemies.splice(i, 1);
      }
    }

    // draw particles
    for (let p = particles.length - 1; p >= 0; p--) {
      const part = particles[p];
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
      part.x += part.vx;
      part.y += part.vy;
      part.vy += 0.15; // gravity
      part.life--;
      part.size *= 0.99;
      if (part.life <= 0 || part.size < 0.3) particles.splice(p, 1);
    }

    // SMG Auto-fire: find nearest enemy (first in array)
    if (smgFire && enemies.length > 0) {
      const target = enemies[0];
      // damage rate tied to frame time: apply fixed damage per frame
      target.hp -= 4;
      target.flash = 4;

      // neon beam
      ctx.save();
      ctx.strokeStyle = "#00ffd0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(target.x + target.w / 2, target.y + target.h / 2);
      ctx.stroke();

      // muzzle flash short rect
      ctx.fillStyle = "rgba(255,255,160,0.2)";
      ctx.fillRect(canvas.width / 2 - 6, canvas.height / 2 - 40, 12, 20);
      ctx.restore();
    }

    // draw gun overlay
    drawGun();

    // HUD draw (neon overlay)
    drawHUD();

    // wave handling: if all enemies dead -> next wave
    if (enemies.length === 0) {
      wave++;
      document.getElementById("wave").innerText = wave;
      // spawn wave count; wave 5 spawn boss
      if (wave >= 5) {
        spawnEnemy(true); // boss
      } else {
        // simple wave growth
        for (let i = 0; i < Math.min(3, wave); i++) spawnEnemy(false);
      }
    }

    // GAME OVER check
    if (hp <= 0) {
      gameRunning = false;
      document.getElementById("gameOver").style.display = "flex";
      document.getElementById("finalScore").innerText = `You reached Wave ${wave} — Score ${score}`;
      return;
    }

    requestAnimationFrame(loop);
  }

  // Neon HUD / small UI rendering
  function drawHUD() {
    // top left HUD already in HTML, but draw quick neon values bottom-left too
    ctx.save();
    // ammo / grenade hint bottom-left
    ctx.font = "16px monospace";
    ctx.fillStyle = "#00ff88";
    ctx.fillText(`HP: ${hp}`, 20, canvas.height - 80);
    ctx.fillText(`Wave: ${wave}`, 20, canvas.height - 60);
    ctx.fillText(`Grenades: ${grenades}`, 20, canvas.height - 40);

    // small crosshair center
    ctx.strokeStyle = "rgba(0,255,200,0.9)";
    ctx.lineWidth = 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // neon background grid helper (subtle)
  function drawNeonGrid() {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // small debug helper to force spawn (console usage)
  window.SPAWN = (n = 1) => {
    for (let i = 0; i < n; i++) spawnEnemy(false);
  };

  // Done — expose some debugging helper to console
  window.SPAso = {
    spawnEnemy,
    enemies,
    setHP: (v) => { hp = v; document.getElementById("hp").innerText = hp; }
  };
}; // end window.onload

