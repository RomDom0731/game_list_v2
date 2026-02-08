let games = []; // All games (for stats)
let currentPage = 1;
const recordsPerPage = 10;

const modal = document.getElementById("modal-overlay");
const addButton = document.getElementById("add-game-button");
const cancelButton = document.getElementById("cancel-button");
const form = document.getElementById("game-form");
const viewButton = document.getElementById("view-button");
const listView = document.getElementById("list-view");
const statsView = document.getElementById("stats-view");

// Initial Load
async function init() {
    await fetchGames();
}

async function fetchGames() {
    try {
        const response = await fetch(`/.netlify/functions/api?page=${currentPage}`);
        const result = await response.json();
        
        // Use result.allGames for stats and result.data (the slice of 10) for the list
        games = result.allGames; 
        renderList(result.data); 
        renderStats(games);
        updatePaginationUI(result.page, result.totalPages);
        populateGenreDropdown()
    } catch (error) {
        console.error("Failed to fetch games:", error);
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
    currentView = "stats";
    listView.classList.add("hidden");
    // Ensure pagination is hidden in stats view
    document.getElementById("pagination-controls").classList.add("hidden");
    statsView.classList.remove("hidden");
    viewButton.textContent = "View Games";
    renderStats(games); 
}

function showList() {
    currentView = "list";
    statsView.classList.add("hidden");
    listView.classList.remove("hidden");
    // Ensure pagination is visible in list view
    document.getElementById("pagination-controls").classList.remove("hidden");
    viewButton.textContent = "View Stats";
    fetchGames();
}

function populateGenreDropdown() {
    const genreSelect = document.getElementById("genre");
    if (!genreSelect) return;

    // Use the full games list to find all unique genres
    const uniqueGenres = [...new Set(games.map(game => game.genre))].filter(Boolean).sort();

    genreSelect.innerHTML = '<option value="" disabled selected>Select a genre</option>';

    uniqueGenres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

// Global scope functions for buttons in ui.js
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
    if (confirm("Are you sure you want to delete this game?")) {
        await fetch(`/.netlify/functions/api?id=${id}`, { method: 'DELETE' });
        await fetchGames();
    }
};

// Event Listeners
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

    // Server-side validation check (Requirement 5)
    if (!gameData.title || !gameData.genre) {
        alert("Please fill in all fields.");
        return;
    }

    if (window.editedGameID) {
        gameData.id = window.editedGameID;
    }

    try {
        await fetch("/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameData)
        });

        // Reset state
        window.editedGameID = null;
        modal.classList.add("hidden");
        form.reset();
        
        // Refresh data
        await fetchGames(); 
    } catch (err) {
        console.error("Save failed:", err);
    }
};

init();