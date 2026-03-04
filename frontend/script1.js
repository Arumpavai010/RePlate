const API_URL = "https://replate-ttjj-d8mh.onrender.com/api";

// Register
async function register() {
  let user = document.getElementById("regUser").value;
  let pass = document.getElementById("regPass").value;
  let role = document.getElementById("regRole").value;
  let msg = document.getElementById("regMsg");

  if (user === "" || pass === "" || role === "") {
    msg.style.color = "red";
    msg.textContent = "All fields are required";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass, role })
    });

    const data = await res.json();   // ✅ only once

    if (data.success) {
      msg.style.color = "green";
      msg.textContent = "Registration successful! Logging you in...";

      // Auto-login with the same credentials
      await login(user, pass);
    } else {
      msg.style.color = "red";
      msg.textContent = data.message || "Registration failed";
    }
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error: " + err.message;
  }
}

// Login
async function login(usernameParam, passwordParam) {
  let username = usernameParam || document.getElementById("loginUser")?.value;
  let password = passwordParam || document.getElementById("loginPass")?.value;
  let msg = document.getElementById("msg") || document.getElementById("regMsg");

  if (!username || !password) {
    msg.style.color = "red";
    msg.textContent = "Username and password required";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success && data.token) {
      msg.style.color = "green";
      msg.textContent = "Login successful!";

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);

      const role = (data.user.role || "").toLowerCase();

      setTimeout(() => {
        if (role === "donor") {
          window.location.href = "donor.html";
        } else if (role === "receiver") {
          window.location.href = "receiver.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1000);

    } else {
      msg.style.color = "red";
      msg.textContent = data.message || "Invalid username or password";
    }
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error: " + err.message;
  }
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}