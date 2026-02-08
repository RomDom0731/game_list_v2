let games = [];
let currentView = "list";
let editedGameID = null;
let currentPage = 1;
const recordsPerPage = 10; // Requirement: Exactly 10 per page

const modal = document.getElementById("modal-overlay");
const addButton = document.getElementById("add-game-button");
const cancelButton = document.getElementById("cancel-button");
const form = document.getElementById("game-form");
const viewButton = document.getElementById("view-button");
const listView = document.getElementById("list-view");
const statsView = document.getElementById("stats-view");

async function init() {
    initData(); // Ensures initial 30+ records are available
    games = loadData();
    renderCurrentPage();
    populateGenreDropdown();
}

function renderCurrentPage() {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageData = games.slice(startIndex, endIndex);

    renderList(pageData); // Only sends 10 records to the UI
    updatePaginationUI();
}

function updatePaginationUI() {
    const totalPages = Math.ceil(games.length / recordsPerPage);
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const indicator = document.getElementById("page-indicator");

    if(prevBtn) prevBtn.disabled = (currentPage === 1);
    if(nextBtn) nextBtn.disabled = (currentPage >= totalPages);
    if(indicator) indicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

function closeModal() {
    form.reset();
    editedGameID = null;
    document.querySelector(".modal h2").textContent = "Add Game";
    modal.classList.add("hidden");
}

function populateGenreDropdown() {
    const genreSelect = document.getElementById("genre");
    const uniqueGenres = [...new Set(games.map(game => game.genre))].sort();
    genreSelect.innerHTML = '<option value="" disabled selected>Select a genre</option>';

    uniqueGenres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

function showStats() {
    currentView = "stats";
    listView.classList.add("hidden");
    document.getElementById("pagination-controls").classList.add("hidden");
    statsView.classList.remove("hidden");
    viewButton.textContent = "View Games";
    renderStats(games); // Stats use the full dataset
}

function showList() {
    currentView = "list";
    statsView.classList.add("hidden");
    listView.classList.remove("hidden");
    document.getElementById("pagination-controls").classList.remove("hidden");
    viewButton.textContent = "View Stats";
    renderCurrentPage();
}

function updateGame(id) {
    const game = games.find(g => g.id === id);
    if (game){
        editedGameID = id;
        document.getElementById("title").value = game.title;
        document.getElementById("genre").value = game.genre;
        document.getElementById("rating").value = game.rating;
        document.querySelector(".modal h2").textContent = "Edit Game";
        modal.classList.remove("hidden");
    }
}

function deleteGame(id){
    if (confirm("Are you sure you want to delete this game?")) {
        games = games.filter(game => game.id !== id);
        saveData(games);
        renderCurrentPage();
        renderStats(games);
        populateGenreDropdown();
    }
}

// Pagination Controls
document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
});

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentPage * recordsPerPage < games.length) {
        currentPage++;
        renderCurrentPage();
    }
});

viewButton.addEventListener("click", () => {
    currentView === "list" ? showStats() : showList();
});

addButton.addEventListener("click", () => modal.classList.remove("hidden"));
cancelButton.addEventListener("click", () => closeModal());

form.addEventListener("submit", e => {
    e.preventDefault();
    const updatedData = {
        title: document.getElementById("title").value.trim(),
        genre: document.getElementById("genre").value,
        rating: Number(document.getElementById("rating").value)
    };

    if (!updatedData.title || !updatedData.genre) {
        alert("All fields are required.");
        return;
    }
    
    if (editedGameID !== null) {
        const index = games.findIndex(game => game.id === editedGameID);
        games[index] = { ...games[index], ...updatedData };
        editedGameID = null;
    } else {
        const nextId = games.length > 0 ? Math.max(...games.map(game => game.id)) + 1 : 1;
        games.push({ id: nextId, ...updatedData });
    }
    
    saveData(games);
    renderCurrentPage();
    renderStats(games);
    populateGenreDropdown();
    closeModal();
});

init();