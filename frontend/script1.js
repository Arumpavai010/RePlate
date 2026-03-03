const API_URL = "https://replate-ttjj-d8mh.onrender.com/api";

// Register
async function register() {
  let user = document.getElementById("regUser").value;
  let pass = document.getElementById("regPass").value;
  let msg = document.getElementById("regMsg");

  if (user === "" || pass === "") {
    msg.textContent = "All fields are required";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();

    if (data.success) {
      msg.style.color = "green";
      msg.textContent = "Registration successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
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
async function login() {
  let user = document.getElementById("loginUser").value;
  let pass = document.getElementById("loginPass").value;
  let msg = document.getElementById("msg");

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();

    console.log("Login response:", data); // ✅ Debug

    if (data.success && data.token) {
      msg.style.color = "green";
      msg.textContent = "Login successful!";

      // ✅ Save token for protected routes
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);

      console.log("Saved token:", localStorage.getItem("token")); // Debug

      setTimeout(() => {
        window.location.href = "index.html";
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
  window.location.href = "index.html";
}