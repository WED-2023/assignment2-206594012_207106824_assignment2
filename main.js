// Space Battle

// משתנים גלובליים למשחק
let currentUser = null;
let selectedShootKey = " ";
let selectedGameTime = 120;
let gameInterval = null;
let gameTimer = null;
let enemySpeed = 5;
let shootCooldown = false;
let playerX = 0, playerY = 0;
let bullets = [], enemyBullets = [], enemies = [];
let score = 0, lives = 3, timeLeft = 0;
const users = [{ username: "p", password: "testuser" }];

// פונקציית הצגת מסכים
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
  const target = document.getElementById(screenId);
  if (target) target.style.display = "block";
}

// פונקציית יציאה
function logout() {
  currentUser = null;
  alert("התנתקת בהצלחה!");
  showScreen("welcome");
}

//פונקציה יציאה ממסך אודות
function closeAbout() {
  const aboutModal = document.getElementById("aboutModal");
  if (aboutModal) {
    aboutModal.close(); // סגירת הדיאלוג
  }
}

// טעינה ראשונית
window.addEventListener("DOMContentLoaded", () => {

  showUsers(); // הדפסת המשתמשים לקונסול בעת טעינת הדף

  showScreen("welcome");
  const day = document.querySelector("select[name='day']");
  const month = document.querySelector("select[name='month']");
  const year = document.querySelector("select[name='year']");
  for (let i = 1; i <= 31; i++) day.innerHTML += `<option value="${i}">${i}</option>`;
  ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"].forEach((m, i) => {
    month.innerHTML += `<option value="${i + 1}">${m}</option>`;
  });
  for (let y = new Date().getFullYear(); y >= 1900; y--) year.innerHTML += `<option value="${y}">${y}</option>`;

  document.getElementById("registerForm").addEventListener("submit", handleRegister);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("shootKeyInput").addEventListener("keydown", (e) => {
    e.preventDefault();
    selectedShootKey = e.key;
    e.target.value = e.key;
  });
  document.getElementById("gameTime").addEventListener("change", (e) => {
    selectedGameTime = parseInt(e.target.value);
  });
  document.getElementById("startGameBtn").addEventListener("click", startGame);
  document.getElementById("exitGameBtn").addEventListener("click", endGame);
  document.getElementById("logoutBtn").addEventListener("click", logout);

});

function handleRegister(e) {
  e.preventDefault();
  const f = e.target;
  const u = f.username.value.trim();
  const p = f.password.value;
  const cp = f.confirmPassword.value;
  const fn = f.firstName.value.trim();
  const ln = f.lastName.value.trim();
  const email = f.email.value.trim();
  const errors = [];

  if (!u || !p || !cp || !fn || !ln || !email) errors.push("יש למלא את כל השדות.");
  if (p.length < 8 || !/\d/.test(p) || !/[A-Za-z]/.test(p)) errors.push("סיסמה לא תקינה.");
  if (p !== cp) errors.push("אימות סיסמה שגוי.");
  if (/\d/.test(fn) || /\d/.test(ln)) errors.push("שמות לא יכולים להכיל מספרים.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("אימייל לא תקין.");

  if (errors.length > 0) return alert(errors.join("\n"));

  users.push({ username: u, password: p });
  alert("נרשמת בהצלחה!");
  showScreen("login");
}

function handleLogin(e) {
  e.preventDefault();
  const u = e.target.loginUser.value.trim();
  const p = e.target.loginPass.value.trim();
  const found = users.find(user => user.username === u && user.password === p);

  if (found) {
    currentUser = found;
    showScreen("config");
  } else {
    document.getElementById("loginError").textContent = "שם משתמש או סיסמה שגויים.";
  }
}

function startGame() {
    showScreen("game");
    score = 0;
    lives = 3;
    timeLeft = selectedGameTime;
    document.getElementById("scoreDisplay").textContent = `נקודות: ${score}`;
    document.getElementById("livesDisplay").textContent = ` | פסילות: ${lives}`;
    document.getElementById("timerDisplay").textContent = ` | זמן: ${formatTime(timeLeft)}`;
    gameTimer = setInterval(() => {
      timeLeft--;
      document.getElementById("timerDisplay").textContent = ` | זמן: ${formatTime(timeLeft)}`;
      if (timeLeft <= 0) endGame();
    }, 1000);

    // יצירת כפתור יציאה מהמשחק
    const exitBtn = document.createElement("button");
    exitBtn.textContent = "יציאה מהמשחק";
    exitBtn.style.position = "absolute";
    exitBtn.style.top = "10px";
    exitBtn.style.left = "10px";
    exitBtn.style.zIndex = 1000;
    exitBtn.onclick = () => endGame();
    document.getElementById("gameCanvas").appendChild(exitBtn);

    // איפוס זירת המשחק
    const canvas = document.getElementById("gameCanvas");
    canvas.innerHTML = "";
    bullets = [];
    enemyBullets = [];
    enemies = [];

    // יצירת שחקן
    const player = document.createElement("div");
    player.id = "player";
    player.style.position = "absolute";
    player.style.width = "50px";
    player.style.height = "50px";
    player.style.background = "blue";
    player.style.bottom = "0px";
    playerX = window.innerWidth / 2 - 25;
    playerY = 0;
    player.style.left = playerX + "px";
    canvas.appendChild(player);

    // יצירת מטריצת אויבים (4 שורות x 5 עמודות)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const enemy = document.createElement("div");
        enemy.className = "enemy";
        enemy.dataset.row = row;
        enemy.style.position = "absolute";
        enemy.style.width = "40px";
        enemy.style.height = "40px";
        enemy.style.background = "red";
        enemy.style.top = `${row * 60 + 50}px`;
        enemy.style.left = `${col * 60 + 200}px`;
        canvas.appendChild(enemy);
        enemies.push(enemy);
      }
    }

    // תנועה וירי
    document.addEventListener("keydown", handleGameKeys);
    gameInterval = setInterval(updateGame, 50);
    window.enemyShootInterval = setInterval(enemyShoot, 1000);
    window.enemySpeedInterval = setInterval(boostEnemySpeed, 5000);

    enemies.push(enemy);

    let speedBoosts = 0;

    function boostEnemySpeed() {
      if (speedBoosts >= 4) return;
      speedBoosts++;
      enemySpeed += 2; // תאוצה הדרגתית
    }


  // תנועה של השחקן
  function handleGameKeys(e) {
    const player = document.getElementById("player");
    if (!player) return;

    if (e.key === "ArrowLeft") playerX -= 15;
    if (e.key === "ArrowRight") playerX += 15;
    if (e.key === "ArrowUp") playerY += 15;
    if (e.key === "ArrowDown") playerY -= 15;
    if (e.key === selectedShootKey && !shootCooldown) shoot(player);

    // גבולות – תנועה ב־40% התחתונים של המסך
    const canvasWidth = document.getElementById("gameCanvas").clientWidth;
    const maxY = window.innerHeight * 0.4;
    playerX = Math.max(0, Math.min(canvasWidth - 50, playerX));
    playerY = Math.max(0, Math.min(maxY, playerY));
    
    player.style.left = playerX + "px";
    player.style.bottom = playerY + "px";
  }

  // ירי שחקן
  function shoot(player) {
    shootCooldown = true;
    setTimeout(() => shootCooldown = false, 300);

    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.position = "absolute";
    bullet.style.width = "5px";
    bullet.style.height = "15px";
    bullet.style.background = "yellow";
    bullet.style.left = playerX + 22 + "px";
    bullet.style.bottom = playerY + 50 + "px";
    document.getElementById("gameCanvas").appendChild(bullet);
    bullets.push(bullet);
  }
  
}



function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateGame() {
  // תזוזת כדורי שחקן
  bullets.forEach((b, i) => {
    const bottom = parseInt(b.style.bottom);
    b.style.bottom = bottom + 20 + "px";
    if (bottom > window.innerHeight) {
      b.remove();
      bullets.splice(i, 1);
      return;
    }

    // בדיקת פגיעות באויבים
    enemies.forEach((enemy, j) => {
      const eRect = enemy.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      if (
        bRect.top < eRect.bottom &&
        bRect.bottom > eRect.top &&
        bRect.left < eRect.right &&
        bRect.right > eRect.left
      ) {
        const row = parseInt(enemy.dataset.row);
        const rowScore = [20, 15, 10, 5][row];
        score += rowScore;
        document.getElementById("scoreDisplay").textContent = `נקודות: ${score}`;

        enemy.remove();
        enemies.splice(j, 1);
        b.remove();
        bullets.splice(i, 1);
      }
    });
  });

// תנועת אויבים (הלוך ושוב)
let shift = false;
enemies.forEach(enemy => {
  const currentLeft = parseInt(enemy.style.left);
  const newLeft = currentLeft + enemySpeed;
  const canvasWidth = document.getElementById("gameCanvas").clientWidth;
  enemy.style.left = newLeft + "px";
  // בדיקה אם צריך להחליף כיוון
  if (newLeft + 40 >= canvasWidth || newLeft <= 0) shift = true;
});
  if (shift) {
    enemySpeed *= -1;
    enemies.forEach(enemy => {
      const currentTop = parseInt(enemy.style.top);
      enemy.style.top = (currentTop + 20) + "px";
      // התאמה לגבולות - החזרת אויבים לגבול אם עברו
      const left = parseInt(enemy.style.left);
      if (left < 0) enemy.style.left = "0px";
      if (left + 40 > window.innerWidth) enemy.style.left = (window.innerWidth - 40) + "px";
    });
}

// תנועת כדורים של אויבים
  enemyBullets.forEach((b, i) => {
    const top = parseInt(b.style.top);
    const bulletSpeed = parseInt(b.dataset.speed || "30");
    b.style.top = top + bulletSpeed + "px";
    if (top > window.innerHeight) {
      b.remove();
      enemyBullets.splice(i, 1);
      return;
    }

    const player = document.getElementById("player");
    if (!player) return;
    const pRect = player.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    if (
      bRect.top < pRect.bottom &&
      bRect.bottom > pRect.top &&
      bRect.left < pRect.right &&
      bRect.right > pRect.left
    ) {
      lives--;
      document.getElementById("livesDisplay").textContent = ` | פסילות: ${lives}`;
      b.remove();
      enemyBullets.splice(i, 1);
      if (lives <= 0) {
        alert("You Lost!");
        endGame();
      } else {
        playerX = window.innerWidth / 2 - 25;
        playerY = 0;
        player.style.left = playerX + "px";
        player.style.bottom = playerY + "px";
      }
    }
  });

  // סיום אם אין אויבים
  if (enemies.length === 0) {
    endGame();
    alert("Champion!");
  }

}
 // ירי אויבים
 function enemyShoot() {
  const canvas = document.getElementById("gameCanvas");
  const canvasHeight = canvas.clientHeight;
  if (enemyBullets.length > 0) {
    const b = enemyBullets[enemyBullets.length - 1];
    const top = parseInt(b.style.top);
    if (top < canvasHeight * 0.75) return;
  }

  const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  if (!randomEnemy) return;
  const bullet = document.createElement("div");
  bullet.className = "enemy-bullet";
  bullet.style.position = "absolute";
  bullet.style.width = "5px";
  bullet.style.height = "15px";
  bullet.style.background = "white";
  bullet.style.left = randomEnemy.offsetLeft + 18 + "px";
  bullet.style.top = randomEnemy.offsetTop + 40 + "px";
  bullet.dataset.speed = "30";
  document.getElementById("gameCanvas").appendChild(bullet);
  enemyBullets.push(bullet);
}



function endGame() {
  clearInterval(gameTimer);
  clearInterval(gameInterval);
  clearInterval(window.enemyShootInterval);
  alert("המשחק נגמר!");
  showScreen("results");
}

function showUsers() {
  console.log("Current users:", users);
}
