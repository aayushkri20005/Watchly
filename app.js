// ── CONFIG ──
//  http://www.omdbapi.com/apikey.aspx
// Replace "trilogy" below with your own key for more daily requests
const OMDB_KEY = "trilogy";


// ── STATE ──
let currentUser = null;

// 
//  STORAGE HELPERS
// 

function getUsers() {
  return JSON.parse(localStorage.getItem("watchly_users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("watchly_users", JSON.stringify(users));
}

function getUserData(email) {
  const all = JSON.parse(localStorage.getItem("watchly_data") || "{}");
  return all[email] || { watched: [], watching: [], wishlist: [] };
}

function saveUserData(email, data) {
  const all = JSON.parse(localStorage.getItem("watchly_data") || "{}");
  all[email] = data;
  localStorage.setItem("watchly_data", JSON.stringify(all));
}
// 
//  UI HELPERS
// 
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function showError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.style.display = "block";
}

function clearError() {
  const el = document.getElementById("auth-error");
  el.style.display = "none";
}

// 
//  AUTH — TAB SWITCHING
// 

let currentTab = "login";

function switchTab(tab) {
  currentTab = tab;
  clearError();
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("name-field").style.display = tab === "register" ? "block" : "none";
  document.getElementById("authSubmitBtn").textContent = tab === "login" ? "Login" : "Create Account";
}


// 
//  AUTH — LOGIN / REGISTER
// 

document.getElementById("authSubmitBtn").addEventListener("click", function () {
  clearError();

  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const name     = document.getElementById("nameInput").value.trim();

  if (!email || !password) return showError("Please fill in all fields.");
  if (currentTab === "register" && !name) return showError("Please enter your name.");

  const users = getUsers();

  if (currentTab === "login") {
    if (!users[email])                        return showError("No account found with this email.");
    if (users[email].password !== password)   return showError("Incorrect password.");
    loginUser(email, users[email].name);
  } else {
    if (users[email]) return showError("An account with this email already exists.");
    users[email] = { name, password };
    saveUsers(users);
    loginUser(email, name);
  }
});

// Press Enter on password field to submit
document.getElementById("passwordInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") document.getElementById("authSubmitBtn").click();
});



// 
//  AUTH — LOGIN USER
// 

function loginUser(email, name) {
  currentUser = { email, name };
  localStorage.setItem("watchly_session", JSON.stringify(currentUser));

  // Switch views
  document.getElementById("authsection").style.display = "none";
  document.getElementById("appsection").style.display  = "block";

  // Update header
  document.getElementById("userNameDisplay").textContent = name;
  document.getElementById("userAvatar").textContent      = name.charAt(0).toUpperCase();

  // Clear form fields
  document.getElementById("emailInput").value    = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("nameInput").value     = "";

  renderAllLists();
}

