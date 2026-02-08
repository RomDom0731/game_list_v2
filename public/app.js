let currentPage = 1;

async function fetchGames(page = 1) {
    const response = await fetch(`/.netlify/functions/api?page=${page}`);
    const result = await response.json();
    
    renderList(result.data); // result.data contains exactly 10 records
    updatePaginationControls(result.page, result.totalPages);
}

function updatePaginationControls(current, total) {
    const controls = document.getElementById('pagination-controls');
    controls.innerHTML = `
        <button ${current === 1 ? 'disabled' : ''} onclick="changePage(${current - 1})">Prev</button>
        <span>Page ${current} of ${total}</span>
        <button ${current === total ? 'disabled' : ''} onclick="changePage(${current + 1})">Next</button>
    `;
}

window.changePage = (newPage) => {
    currentPage = newPage;
    fetchGames(currentPage);
};

// Initial load
fetchGames(currentPage);