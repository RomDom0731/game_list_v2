let games = []; // All games (for stats)
let currentPage = 1;
const recordsPerPage = 10;

const modal = document.getElementById("modal-overlay");
const addButton = document.getElementById("add-game-button");
const cancelButton = document.getElementById("cancel-button");
const form = document.getElementById("game-form");
const viewButton = document.getElementById("view-button");

// Initial Load
async function init() {
    await fetchGames();
    populateGenreDropdown();
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
    } catch (error) {
        console.error("Failed to fetch games:", error);
    }
}

function updatePaginationUI(current, total) {
    document.getElementById("prev-btn").disabled = (current === 1);
    document.getElementById("next-btn").disabled = (current >= total);
    document.getElementById("page-indicator").textContent = `Page ${current} of ${total}`;
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
        title: document.getElementById("title").value,
        genre: document.getElementById("genre").value,
        rating: Number(document.getElementById("rating").value)
    };
    if (window.editedGameID) gameData.id = window.editedGameID;

    await fetch("/.netlify/functions/api", {
        method: "POST",
        body: JSON.stringify(gameData)
    });

    window.editedGameID = null;
    modal.classList.add("hidden");
    form.reset();
    await fetchGames();
};

init();