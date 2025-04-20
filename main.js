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
let selectedShipColor = "#00ffcc"; // צבע ברירת מחדל
let bgMusic = new Audio("audio/music.mp3");
const hitEnemySound = document.getElementById("hitEnemySound");
const playerHitSound = document.getElementById("playerHitSound");
bgMusic.loop = true;
bgMusic.volume = 0.3;
let users = JSON.parse(localStorage.getItem("users")) || [
  { username: "p", password: "testuser" }
];

// const users = [{ username: "p", password: "testuser" }];
let scoresHistory = [];//הוספתי

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
document.getElementById("aboutModal").addEventListener("click", function (event) {
  const dialog = this;
  const rect = dialog.getBoundingClientRect();

  // נבדוק אם הלחיצה לא הייתה בתוך הדיאלוג
  const isClickInside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!isClickInside) {
    dialog.close();
  }
});

//פונקציה יציאה ממסך אודות
function closeAbout() {
  const aboutModal = document.getElementById("aboutModal");
  if (aboutModal) {
    aboutModal.close(); // סגירת הדיאלוג
  }
}
function openAbout() {
  const aboutModal = document.getElementById("aboutModal");
  if (aboutModal) {
    aboutModal.showModal();
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
  document.getElementById("shipColor").addEventListener("input", (e) => {
    selectedShipColor = e.target.value;
  });
  document.getElementById("newGameBtn").addEventListener("click", startNewGame);

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

  if (!u || !p || !cp || !fn || !ln || !email)
    errors.push("יש למלא את כל השדות.");

  if (p.length < 8 || !/\d/.test(p) || !/[A-Za-z]/.test(p))
    errors.push("הסיסמה צריכה להכיל לפחות 8 תווים של אותיות ומספרים");

  if (p !== cp)
    errors.push("אימות סיסמה שגוי.");

  if (/\d/.test(fn) || /\d/.test(ln))
    errors.push("שמות לא יכולים להכיל מספרים.");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("אימייל לא תקין.");

  // בדיקת שם משתמש קיים
  const savedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  if (savedUsers.some(user => user.username === u)) {
    errors.push("שם המשתמש כבר קיים במערכת.");
  }

  if (errors.length > 0) return alert(errors.join("\n"));

  // שמירת המשתמש החדש בלוקאל סטורג'
  savedUsers.push({ username: u, password: p });
  localStorage.setItem("registeredUsers", JSON.stringify(savedUsers));

  alert("נרשמת בהצלחה!");
  showScreen("login");
}


// function handleRegister(e) {
//   e.preventDefault();
//   const f = e.target;
//   const u = f.username.value.trim();
//   const p = f.password.value;
//   const cp = f.confirmPassword.value;
//   const fn = f.firstName.value.trim();
//   const ln = f.lastName.value.trim();
//   const email = f.email.value.trim();
//   const errors = [];

//   if (!u || !p || !cp || !fn || !ln || !email) errors.push("יש למלא את כל השדות.");
//   if (p.length < 8 || !/\d/.test(p) || !/[A-Za-z]/.test(p)) errors.push("הסיסמה צריכה להכיל לפחות 8 תווים של אותיות ומספרים");
//   if (p !== cp) errors.push("אימות סיסמה שגוי.");
//   if (/\d/.test(fn) || /\d/.test(ln)) errors.push("שמות לא יכולים להכיל מספרים.");
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("אימייל לא תקין.");

//   if (errors.length > 0) return alert(errors.join("\n"));

//   users.push({ username: u, password: p });
//   alert("נרשמת בהצלחה!");
//   showScreen("login");
// }
function handleLogin(e) {
  e.preventDefault();
  const u = e.target.loginUser.value.trim();
  const p = e.target.loginPass.value.trim();

  const savedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const found = savedUsers.find(user => user.username === u && user.password === p);

  if (found) {
    currentUser = found;
    scoresHistory = [];

    showScreen("config");
  } else {
    document.getElementById("loginError").textContent = "שם משתמש או סיסמה שגויים.";
  }
}


// function handleLogin(e) {
//   e.preventDefault();
//   const u = e.target.loginUser.value.trim();
//   const p = e.target.loginPass.value.trim();
//   const found = users.find(user => user.username === u && user.password === p);

//   if (found) {
//     currentUser = found;
//     scoresHistory = [] //הוספתי
//     showScreen("config");
//   } else {
//     document.getElementById("loginError").textContent = "שם משתמש או סיסמה שגויים.";
//   }
// }

// function displayScoreTable(scores = []) {
//   const resultsDiv = document.getElementById("results");
//   resultsDiv.innerHTML = `<h3 style="text-align: center; font-size: 24px;">🏆 טבלת שיאים אישית</h3>`;

//   const currentScore = scores[scores.length - 1]; // המשחק האחרון ששוחק
//   const currentScoreIndex = scores.length - 1;

//   const sortedScores = [...scores]
//     .map((val, idx) => ({ val, originalIndex: idx }))
//     .sort((a, b) => b.val - a.val); // מיון מהגבוה לנמוך עם האינדקסים המקוריים

//   const table = document.createElement("table");
//   table.className = "score-table";

//   const headerRow = table.insertRow();
//   headerRow.innerHTML = `<th>מקום</th><th>ניקוד</th>`;

//   sortedScores.forEach((entry, i) => {
//     const row = table.insertRow();
//     row.innerHTML = `<td>${i + 1}</td><td>${entry.val}</td>`;

//     // סימון ירוק אם זו התוצאה של המשחק הנוכחי
//     if (entry.originalIndex === currentScoreIndex) {
//       row.classList.add("current-score");
//     }
//   });

//   resultsDiv.appendChild(table);

//   const buttonsContainer = document.createElement("div");
//   buttonsContainer.className = "results-buttons";

//   const newGameBtn = document.createElement("button");
//   newGameBtn.textContent = "🚀 משחק חדש";
//   newGameBtn.onclick = () => startNewGame();
//   buttonsContainer.appendChild(newGameBtn);

//   const resetBtn = document.createElement("button");
//   resetBtn.textContent = "🗑️ איפוס טבלת שיאים";
//   resetBtn.onclick = () => {
//     if (confirm("האם את/ה בטוח/ה שברצונך לאפס את הטבלה?")) {
//       const key = `scores_${currentUser.username}`;
//       localStorage.removeItem(key);
//       scoresHistory = [];
//       displayScoreTable([]);
//     }
//   };
//   buttonsContainer.appendChild(resetBtn);

//   resultsDiv.appendChild(buttonsContainer);
// }


function displayScoreTable(scores = [], currentGameIndex = -1) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<h3 style="text-align: center; font-size: 24px;">🏆 טבלת שיאים אישית</h3>`;

  // Store original indexes to track current game score
  const indexedScores = scores.map((val, idx) => ({ val, originalIndex: idx }));

  const sortedScores = [...indexedScores].sort((a, b) => b.val - a.val);

  const table = document.createElement("table");
  table.className = "score-table";

  const headerRow = table.insertRow();
  headerRow.innerHTML = `<th>מקום</th><th>ניקוד</th>`;

  sortedScores.forEach((entry, i) => {
    const row = table.insertRow();
    row.innerHTML = `<td>${i + 1}</td><td>${entry.val}</td>`;

    if (entry.originalIndex === currentGameIndex) {
      row.classList.add("current-score");
    }
  });

  resultsDiv.appendChild(table);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "results-buttons";

  const newGameBtn = document.createElement("button");
  newGameBtn.textContent = "🚀 משחק חדש";
  newGameBtn.onclick = () => startNewGame();
  buttonsContainer.appendChild(newGameBtn);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🗑️ איפוס טבלת שיאים";
  resetBtn.onclick = () => {
    if (confirm("האם את/ה בטוח/ה שברצונך לאפס את הטבלה?")) {
      const key = `scores_${currentUser.username}`;
      localStorage.removeItem(key);
      scoresHistory = [];
      displayScoreTable([]);
    }
  };
  buttonsContainer.appendChild(resetBtn);

  resultsDiv.appendChild(buttonsContainer);
}



function startGame() {
    showScreen("game");
    score = 0;
    lives = 3;
    timeLeft = selectedGameTime;
    bgMusic.currentTime = 0;
    document.getElementById("scoreDisplay").textContent = `נקודות: ${score}`;
    document.getElementById("livesDisplay").textContent = ` | פסילות: ${lives}`;
    document.getElementById("timerDisplay").textContent = ` | זמן: ${formatTime(timeLeft)}`;
    gameTimer = setInterval(() => {
      timeLeft--;
      document.getElementById("timerDisplay").textContent = ` | זמן: ${formatTime(timeLeft)}`;
      if (timeLeft <= 0) endGame();
    }, 1000);
    bgMusic.play().catch((e) => {
      console.warn("הדפדפן חסם השמעה אוטומטית:", e);
    });

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
    player.style.background = selectedShipColor;
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
        const hitEnemySound = document.getElementById("hitEnemySound");
        hitEnemySound.currentTime = 0;
        hitEnemySound.play();
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
      const playerHitSound = document.getElementById("playerHitSound");
      playerHitSound.currentTime = 0;
      playerHitSound.play();
      b.remove();
      enemyBullets.splice(i, 1);
      if (lives <= 0) {
        alert("You Lost!");
        endGame(true,true);
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
    endGame(true,false);
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

function startNewGame() {
  // ניקוי משחק קודם בלי לשמור תוצאה
  clearInterval(gameTimer);
  clearInterval(gameInterval);
  clearInterval(window.enemyShootInterval);
  clearInterval(window.enemySpeedInterval);

  // עצירת מוזיקה אם מופעלת
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  // הסתרת תוצאה קודמת, התחלה נקייה
  const canvas = document.getElementById("gameCanvas");
  if (canvas) canvas.innerHTML = "";
  
  // התחלת משחק חדש
  startGame();
}




// function endGame(saveScore = true) {
//   clearInterval(gameTimer);
//   clearInterval(gameInterval);
//   clearInterval(window.enemyShootInterval);

//   if (bgMusic) {
//     bgMusic.pause();
//     bgMusic.currentTime = 0;
//   }

//   if (saveScore && currentUser) {
//     const key = `scores_${currentUser.username}`;
//     const existingScores = JSON.parse(localStorage.getItem(key)) || [];

//     existingScores.push(score);
//     localStorage.setItem(key, JSON.stringify(existingScores));

//     // send index of new score
//     displayScoreTable(existingScores, existingScores.length - 1);

//     alert("You can do better");
//     showScreen("results");
//   } else {
//     showScreen("config");
//   }
// }
function endGame(saveScore = true, didLose = false) {
  clearInterval(gameTimer);
  clearInterval(gameInterval);
  clearInterval(window.enemyShootInterval);

  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  if (saveScore && currentUser) {
    const key = `scores_${currentUser.username}`;
    const existingScores = JSON.parse(localStorage.getItem(key)) || [];

    existingScores.push(score);
    localStorage.setItem(key, JSON.stringify(existingScores));

    displayScoreTable(existingScores, existingScores.length - 1); // ✅ הצגת טבלה

    if (didLose) {
      alert("You can do better");
    }

    showScreen("results");
  } else {
    showScreen("config");
  }
}




function showScoreTable(scores) {
  const container = document.getElementById("results");
  container.innerHTML = `
    <h2>טבלת שיאים אישית</h2>
    <table class="score-table">
      <thead>
        <tr>
          <th>מקום</th>
          <th>ניקוד</th>
        </tr>
      </thead>
      <tbody>
        ${scores.map((s, i) => `
          <tr${i === 0 ? ' style="background-color:#d4f8d4;font-weight:bold;"' : ''}>
            <td>${i + 1}</td>
            <td>${s}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <button onclick="startGame()">משחק חדש</button>
  `;
}



function showUsers() {
  console.log("Current users:", users);
}
