// ── STATE ──
let currentUser = null;

// ═══════════════════════════════════════
//  STORAGE HELPERS
// ═══════════════════════════════════════

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
// ═══════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════
