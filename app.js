
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const keys = {};
const mouse = { x: W/2, y: H/2 };

let player, enemies, bullets;
let score = 0;
let running = false;

function reset() {
  player = {
    x: W/2,
    y: H/2,
    hp: 100,
    speed: 4,
    ammo: 3,
    reload: 0
  };

  enemies = [];
  bullets = [];
  score = 0;

  for(let i=0;i<4;i++) {
    spawnEnemy();
  }

  updateHUD();
}

function updateHUD() {
  document.getElementById("health").textContent =
    Math.max(0, player.hp);

  document.getElementById("score").textContent = score;
  document.getElementById("ammo").textContent = player.ammo;
}

function spawnEnemy() {
  enemies.push({
    x: Math.random()*W,
    y: Math.random()*H,
    hp: 60,
    speed: 1.2,
    r: 18
  });
}

function shoot() {
  if(!running || player.ammo <= 0 || player.reload > 0) return;

  const angle = Math.atan2(
    mouse.y-player.y,
    mouse.x-player.x
  );

  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle)*9,
    vy: Math.sin(angle)*9,
    life: 100
  });

  player.ammo--;

  if(player.ammo === 0) {
    player.reload = 80;
  }

  updateHUD();
}

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", shoot);

function update() {
  if(!running) return;

  let dx = 0, dy = 0;

  if(keys["z"] || keys["w"] || keys["arrowup"]) dy--;
  if(keys["s"] || keys["arrowdown"]) dy++;
  if(keys["q"] || keys["a"] || keys["arrowleft"]) dx--;
  if(keys["d"] || keys["arrowright"]) dx++;

  const length = Math.hypot(dx,dy) || 1;

  player.x += dx/length*player.speed;
  player.y += dy/length*player.speed;

  player.x = Math.max(20,Math.min(W-20,player.x));
  player.y = Math.max(20,Math.min(H-20,player.y));

  if(player.reload > 0) {
    player.reload--;

    if(player.reload === 0) {
      player.ammo = 3;
      updateHUD();
    }
  }

  enemies.forEach(enemy => {
    const angle = Math.atan2(
      player.y-enemy.y,
      player.x-enemy.x
    );

    enemy.x += Math.cos(angle)*enemy.speed;
    enemy.y += Math.sin(angle)*enemy.speed;

    if(Math.hypot(player.x-enemy.x,player.y-enemy.y)<30) {
      player.hp -= 0.15;

      if(player.hp <= 0) {
        player.hp = 0;
        running = false;
        document.getElementById("menu").style.display = "block";
        document.querySelector(".menu h1").textContent = "GAME OVER";
        document.querySelector(".menu p").textContent =
          "Ton score : " + score;
        document.getElementById("start").textContent = "REJOUER";
      }

      updateHUD();
    }
  });

  bullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;

    enemies.forEach(enemy => {
      if(Math.hypot(bullet.x-enemy.x,bullet.y-enemy.y)<25
        && enemy.hp>0 && bullet.life>0) {

        enemy.hp -= 30;
        bullet.life = 0;

        if(enemy.hp <= 0) {
          score += 100;
          updateHUD();
        }
      }
    });
  });

  bullets = bullets.filter(b =>
    b.life>0 && b.x>0 && b.x<W && b.y>0 && b.y<H
  );

  enemies = enemies.filter(e => e.hp>0);

  while(enemies.length < 4) spawnEnemy();
}

function drawCharacter(x,y,color,r=20) {
  ctx.fillStyle = "#17213c";
  ctx.beginPath();
  ctx.arc(x,y,r+3,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x-6,y-5,5,0,Math.PI*2);
  ctx.arc(x+7,y-5,5,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#17213c";
  ctx.beginPath();
  ctx.arc(x-5,y-5,2,0,Math.PI*2);
  ctx.arc(x+8,y-5,2,0,Math.PI*2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0,0,W,H);

  // Sol de l'arène
  ctx.fillStyle = "#253b55";
  ctx.fillRect(0,0,W,H);

  // Grille
  ctx.strokeStyle = "#ffffff12";

  for(let x=0;x<W;x+=45) {
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,H);
    ctx.stroke();
  }

  for(let y=0;y<H;y+=45) {
    ctx.beginPath();
    ctx.moveTo(0,y);
    ctx.lineTo(W,y);
    ctx.stroke();
  }

  // Ennemis
  enemies.forEach(enemy => {
    drawCharacter(enemy.x,enemy.y,"#f04e6a");

    ctx.fillStyle = "#111";
    ctx.fillRect(enemy.x-18,enemy.y-29,36,5);

    ctx.fillStyle = "#61ff77";
    ctx.fillRect(enemy.x-18,enemy.y-29,36*Math.max(0,enemy.hp/60),5);
  });

  // Balles
  bullets.forEach(bullet => {
    ctx.fillStyle = "#ffe35b";
    ctx.beginPath();
    ctx.arc(bullet.x,bullet.y,7,0,Math.PI*2);
    ctx.fill();
  });

  // Joueur
  if(player) {
    drawCharacter(player.x,player.y,"#38aaff");

    const angle = Math.atan2(
      mouse.y-player.y,
      mouse.x-player.x
    );

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x,player.y);
    ctx.lineTo(
      player.x+Math.cos(angle)*30,
      player.y+Math.sin(angle)*30
    );
    ctx.stroke();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("start").addEventListener("click", () => {
  reset();
  running = true;
  document.getElementById("menu").style.display = "none";
});

reset();
loop();
