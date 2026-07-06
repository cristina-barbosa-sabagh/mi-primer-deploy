const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height, GROUND = H - 60;

const player = { x: 80, y: GROUND, r: 18, vy: 0, jumping: false };
const GRAVITY = 0.9, JUMP = -15;

let obstacles = [], score = 0, speed = 5, frame = 0;
let spawnGap = 90;           // frames entre obstáculos (baja con el tiempo)
let nextSpawn = spawnGap;    // cuándo aparece el próximo
let state = 'play'; // 'play' | 'over'

function reset() {
  obstacles = []; score = 0; speed = 5; frame = 0;
  spawnGap = 90; nextSpawn = spawnGap;
  player.y = GROUND; player.vy = 0; player.jumping = false;
  state = 'play';
}

function jump() {
  if (state === 'over') { reset(); return; }
  if (!player.jumping) { player.vy = JUMP; player.jumping = true; }
}

// Controles: espacio, clic y tap
window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); jump(); }
});
cv.addEventListener('mousedown', jump);
cv.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });

function spawn() {
  const h = 24 + Math.random() * 26;
  obstacles.push({ x: W + 20, w: 18, h });
}

function drawPlayer() {
  const feet = player.y;            // línea de los pies
  const bodyH = 26, cx = player.x;
  const bodyBottom = feet, bodyTop = feet - bodyH;
  // cuerpo
  ctx.fillStyle = '#f97316';
  ctx.fillRect(cx - 8, bodyTop, 16, bodyH);
  // piernas
  ctx.fillStyle = '#334155';
  const swing = Math.sin(frame * 0.4) * 5;
  ctx.fillRect(cx - 7, bodyBottom, 5, 10 + swing);
  ctx.fillRect(cx + 2, bodyBottom, 5, 10 - swing);
  // cabeza
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, bodyTop - player.r + 4, player.r, 0, Math.PI * 2);
  ctx.fill();
  // ojo
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx + 6, bodyTop - player.r, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  ctx.clearRect(0, 0, W, H);

  // piso
  ctx.fillStyle = '#86efac';
  ctx.fillRect(0, GROUND, W, H - GROUND);

  if (state === 'play') {
    frame++;

    // aparecen obstáculos cada vez más seguido (con algo de azar)
    if (frame >= nextSpawn) {
      spawn();
      nextSpawn = frame + spawnGap + Math.random() * 30;
    }

    // cada 5 segundos aprox: más rápido y huecos más chicos
    if (frame % 300 === 0) {
      speed += 0.5;                          // se acelera de a poco
      spawnGap = Math.max(45, spawnGap - 4); // nunca menos de 45 frames
    }

    // física del salto
    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= GROUND) { player.y = GROUND; player.vy = 0; player.jumping = false; }

    // mover obstáculos + puntaje + colisión
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed;
      if (o.x + o.w < player.x - 8 && !o.passed) { o.passed = true; score++; }
      if (o.x + o.w < -20) obstacles.splice(i, 1);

      const py = player.y, ph = 26 + player.r;
      const hitX = player.x + 8 > o.x && player.x - 8 < o.x + o.w;
      const hitY = py > GROUND - o.h;
      if (hitX && hitY) state = 'over';
    }
  }

  // dibujar obstáculos
  ctx.fillStyle = '#ef4444';
  obstacles.forEach(o => ctx.fillRect(o.x, GROUND - o.h, o.w, o.h));

  drawPlayer();

  // puntaje
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score, 16, 30);

  if (state === 'over') {
    ctx.fillStyle = 'rgba(15,23,42,.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.fillText('¡Game Over!', W / 2, H / 2 - 10);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Puntos: ' + score, W / 2, H / 2 + 24);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Toca o presiona espacio para reiniciar', W / 2, H / 2 + 56);
  }

  requestAnimationFrame(loop);
}
loop();
