const API_URL = "https://your-render-app-name.onrender.com/api";
let games = [];
let currentPage = 1;
const recordsPerPage = 10;

const modal = document.getElementById("modal-overlay");
const addButton = document.getElementById("add-game-button");
const cancelButton = document.getElementById("cancel-button");
const form = document.getElementById("game-form");
const viewButton = document.getElementById("view-button");
const listView = document.getElementById("list-view");
const statsView = document.getElementById("stats-view");

async function init() {
    await fetchGames();
}

async function fetchGames() {
    try {
        const response = await fetch(`${API_URL}?page=${currentPage}`);
        const result = await response.json();
        if (result && result.data){
            games = result.allGames; 
            renderList(result.data); 
            renderStats(games);
            updatePaginationUI(result.page, result.totalPages);
            populateGenreDropdown();
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function updatePaginationUI(current, total) {
    document.getElementById("prev-btn").disabled = (current === 1);
    document.getElementById("next-btn").disabled = (current >= total);
    document.getElementById("page-indicator").textContent = `Page ${current} of ${total}`;
}

viewButton.onclick = () => {
    if (statsView.classList.contains("hidden")) {
        showStats();
    } else {
        showList();
    }
};

function showStats() {
    listView.classList.add("hidden");
    document.getElementById("pagination-controls").classList.add("hidden");
    statsView.classList.remove("hidden");
    viewButton.textContent = "View Games";
    renderStats(games); 
}

function showList() {
    statsView.classList.add("hidden");
    listView.classList.remove("hidden");
    document.getElementById("pagination-controls").classList.remove("hidden");
    viewButton.textContent = "View Stats";
    fetchGames();
}

function populateGenreDropdown() {
    const genreSelect = document.getElementById("genre");
    if (!genreSelect) return;
    const uniqueGenres = [...new Set(games.map(game => game.genre))].filter(Boolean).sort();
    genreSelect.innerHTML = '<option value="" disabled selected>Select a genre</option>';
    uniqueGenres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

window.updateGame = (id) => {
    const game = games.find(g => g.id === id);
    if (game) {
        document.getElementById("title").value = game.title;
        document.getElementById("genre").value = game.genre;
        document.getElementById("rating").value = game.rating;
        window.editedGameID = id;
        modal.classList.remove("hidden");
    }
};

window.deleteGame = async (id) => {
    if (confirm("Confirm deletion?")) {
        await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        const totalAfter = games.length - 1;
        const maxPages = Math.ceil(totalAfter / recordsPerPage);
        if (currentPage > maxPages && currentPage > 1) {
            currentPage = maxPages;
        }
        await fetchGames();
    }
};

document.getElementById("prev-btn").onclick = () => { currentPage--; fetchGames(); };
document.getElementById("next-btn").onclick = () => { currentPage++; fetchGames(); };
addButton.onclick = () => modal.classList.remove("hidden");
cancelButton.onclick = () => modal.classList.add("hidden");

form.onsubmit = async (e) => {
    e.preventDefault();
    const gameData = {
        title: document.getElementById("title").value.trim(),
        genre: document.getElementById("genre").value,
        rating: Number(document.getElementById("rating").value)
    };
    if (window.editedGameID) gameData.id = window.editedGameID;
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
    });
    if (!window.editedGameID) {
        const newTotal = games.length + 1;
        currentPage = Math.ceil(newTotal / recordsPerPage);
    }
    window.editedGameID = null;
    modal.classList.add("hidden");
    form.reset();
    await fetchGames(); 
};

init();