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
