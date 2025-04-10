const users = [
    { username: "p", password: "testuser" } // משתמש ברירת מחדל
  ];
  
  function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
  }
  
  function closeAbout() {
    document.getElementById("aboutModal").close();
  }
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAbout();
    }
  });

  document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
  
    const errors = [];
  
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email) {
      errors.push("כל השדות חייבים להיות מלאים.");
    }
  
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.push("הסיסמה חייבת להכיל לפחות 8 תווים, כולל אותיות ומספרים.");
    }
  
    if (password !== confirmPassword) {
      errors.push("אימות הסיסמה לא תואם לסיסמה.");
    }
  
    if (/\d/.test(firstName) || /\d/.test(lastName)) {
      errors.push("שם פרטי ושם משפחה לא יכולים להכיל מספרים.");
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errors.push("כתובת המייל אינה חוקית.");
    }
  
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
  
    // אם הכל תקין - שמירה של המשתמש במערך
    users.push({
      username,
      password,
      firstName,
      lastName,
      email,
      birthday: {
        day: form.day.value,
        month: form.month.value,
        year: form.year.value
      }
    });
  
    alert("נרשמת בהצלחה!");
    showScreen("login");
  });
  
  window.addEventListener("DOMContentLoaded", () => {
    const daySelect = document.querySelector("select[name='day']");
    const monthSelect = document.querySelector("select[name='month']");
    const yearSelect = document.querySelector("select[name='year']");
  
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      daySelect.appendChild(option);
    }
  
    const months = [
      "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
      "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];
  
    months.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = month;
      monthSelect.appendChild(option);
    });
  
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      yearSelect.appendChild(option);
    }
    showScreen("welcome");

  });
  
  