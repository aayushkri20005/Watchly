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


// 
//  AUTH — LOGOUT
// 

document.getElementById("logoutbtn").addEventListener("click", function () {
  currentUser = null;
  localStorage.removeItem("watchly_session");

  document.getElementById("appsection").style.display  = "none";
  document.getElementById("authsection").style.display = "flex";
  document.getElementById("searchresults").innerHTML   = "";

  switchTab("login");
});

// 
//  SESSION RESTORE (on page load)
//

window.addEventListener("load", function () {
  const session = localStorage.getItem("watchly_session");
  if (session) {
    const u     = JSON.parse(session);
    const users = getUsers();
    if (users[u.email]) loginUser(u.email, u.name);
  }
});



// 
//  SEARCH
// 

document.getElementById("searchbtn").addEventListener("click", searchMovies);

document.getElementById("searchmovies").addEventListener("keydown", function (e) {
  if (e.key === "Enter") searchMovies();
});

async function searchMovies() {
  const query     = document.getElementById("searchmovies").value.trim();
  const container = document.getElementById("searchresults");

  if (!query) return;

  container.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;

  try {
    const res  = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_KEY}`);
    const data = await res.json();

    if (data.Response === "False") {
      container.innerHTML = `<p class="search-info">No movies found for "<strong>${query}</strong>"</p>`;
      return;
    }

    container.innerHTML = "";
    data.Search.forEach((movie, i) => {
      const card = buildMovieCard(movie);
      card.style.animationDelay = `${i * 0.05}s`;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="search-info">Could not fetch results. Check your internet connection.</p>`;
  }
}

// 
//  MOVIE CARD
// 

function buildMovieCard(movie) {
  const userData  = getUserData(currentUser.email);
  const inWatched  = userData.watched.some(m  => m.imdbID === movie.imdbID);
  const inWatching = userData.watching.some(m => m.imdbID === movie.imdbID);
  const inWishlist = userData.wishlist.some(m => m.imdbID === movie.imdbID);

  const card = document.createElement("div");
  card.className   = "movie-card fade-in";
  card.dataset.id  = movie.imdbID;

  const fallbackPoster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231c1c28'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%237878a0' font-size='40'%3E🎬%3C/text%3E%3C/svg%3E";
  const poster = movie.Poster !== "N/A" ? movie.Poster : fallbackPoster;

  card.innerHTML = `
    <img src="${poster}" alt="${movie.Title}" loading="lazy" />
    <div class="card-body">
      <div class="card-title">${movie.Title}</div>
      <div class="card-year">${movie.Year}</div>
      <div class="card-actions">
        <button class="add-btn watched ${inWatched ? 'added-watched' : ''}" data-list="watched">
          ${inWatched ? '✓ Watched' : '+ Watched'}
        </button>
        <button class="add-btn watching ${inWatching ? 'added-watching' : ''}" data-list="watching">
          ${inWatching ? '✓ Watching' : '+ Watching'}
        </button>
        <button class="add-btn wishlist ${inWishlist ? 'added-wishlist' : ''}" data-list="wishlist">
          ${inWishlist ? '✓ Wishlist' : '+ Wishlist'}
        </button>
      </div>
    </div>`;

  card.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      addToList(movie, this.dataset.list);
      refreshCardButtons(movie.imdbID);
    });
  });

  return card;
}

// Refresh the button states on a card after adding/removing
function refreshCardButtons(imdbID) {
  const card = document.querySelector(`.movie-card[data-id="${imdbID}"]`);
  if (!card) return;

  const userData   = getUserData(currentUser.email);
  const inWatched  = userData.watched.some(m  => m.imdbID === imdbID);
  const inWatching = userData.watching.some(m => m.imdbID === imdbID);
  const inWishlist = userData.wishlist.some(m => m.imdbID === imdbID);

  const btns = card.querySelectorAll(".add-btn");
  btns[0].className   = `add-btn watched ${inWatched ? 'added-watched' : ''}`;
  btns[0].textContent = inWatched ? '✓ Watched' : '+ Watched';
  btns[1].className   = `add-btn watching ${inWatching ? 'added-watching' : ''}`;
  btns[1].textContent = inWatching ? '✓ Watching' : '+ Watching';
  btns[2].className   = `add-btn wishlist ${inWishlist ? 'added-wishlist' : ''}`;
  btns[2].textContent = inWishlist ? '✓ Wishlist' : '+ Wishlist';
}



// 
//  LIST MANAGEMENT
// 

function addToList(movie, list) {
  const data      = getUserData(currentUser.email);
  const alreadyIn = data[list].some(m => m.imdbID === movie.imdbID);

  if (alreadyIn) {
    // Toggle off — remove from this list
    data[list] = data[list].filter(m => m.imdbID !== movie.imdbID);
    showToast(`Removed "${movie.Title}" from ${list}`);
  } else {
    // Remove from other lists first (a movie lives in only one list at a time)
    ["watched", "watching", "wishlist"].forEach(l => {
      if (l !== list) data[l] = data[l].filter(m => m.imdbID !== movie.imdbID);
    });
    data[list].push({
      imdbID: movie.imdbID,
      Title:  movie.Title,
      Year:   movie.Year,
      Poster: movie.Poster,
    });
    showToast(`Added "${movie.Title}" to ${list}!`);
  }

  saveUserData(currentUser.email, data);
  renderAllLists();
}

function removeFromList(imdbID, list) {
  const data  = getUserData(currentUser.email);
  data[list]  = data[list].filter(m => m.imdbID !== imdbID);
  saveUserData(currentUser.email, data);
  renderAllLists();
  refreshCardButtons(imdbID);
  showToast("Removed from list");
}



// 
//  RENDER LISTS
//

function renderAllLists() {
  renderList("watched");
  renderList("watching");
  renderList("wishlist");
}

function renderList(list) {
  const data   = getUserData(currentUser.email);
  const movies = data[list];
  const ul     = document.getElementById(`${list}list`);
  const empty  = document.getElementById(`panel-empty-${list}`);
  const count  = document.getElementById(`${list}-count`);

  count.textContent = movies.length;
  ul.innerHTML      = "";

  if (movies.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  const fallbackPoster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 54'%3E%3Crect width='36' height='54' fill='%231c1c28'/%3E%3C/svg%3E";

  movies.forEach(movie => {
    const poster = movie.Poster !== "N/A" ? movie.Poster : fallbackPoster;

    const li = document.createElement("li");
    li.className  = "list-item";
    li.innerHTML  = `
      <img src="${poster}" alt="${movie.Title}" />
      <div class="item-info">
        <div class="item-title">${movie.Title}</div>
        <div class="item-year">${movie.Year}</div>
      </div>
      <button class="item-remove" title="Remove">✕</button>`;

    li.querySelector(".item-remove").addEventListener("click", () => removeFromList(movie.imdbID, list));
    ul.appendChild(li);
  });
}


//
// FULLY COMPLETED VERSION V.01
//