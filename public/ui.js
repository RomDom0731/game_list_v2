function renderList(games) {
    const listView = document.getElementById("list-view");
    listView.innerHTML = ""; // Clear previous page content

    if (games.length === 0) {
        listView.innerHTML = "<p style='text-align:center;'>No games found.</p>";
        return;
    }

    const container = document.createElement("div");
    container.className = "tables-container";
    listView.appendChild(container);

    const grouped = games.reduce((acc, game) => {
        acc[game.genre] = acc[game.genre] || [];
        acc[game.genre].push(game);
        return acc;
    }, {});

    const sortedGenres = Object.keys(grouped).sort();

    sortedGenres.forEach(genre => {
        const section = document.createElement("div");
        section.className = "genre-card";
        section.innerHTML = `<h3>${genre}</h3>`;
        
        const tbl = document.createElement("table");
        const headerRow = tbl.insertRow();
        ["Title", "Rating", "Actions"].forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });

        grouped[genre].forEach(game => {
            const row = tbl.insertRow();
            row.insertCell().textContent = game.title;
            row.insertCell().textContent = game.rating;

            const actionsCell = row.insertCell();

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => updateGame(game.id);
            actionsCell.appendChild(editButton);
            
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteGame(game.id);
            actionsCell.appendChild(deleteButton);
        });

        section.appendChild(tbl);
        container.appendChild(section);
    });
}

function renderStats(games) {
    const statsContent = document.getElementById("stats-content");
    const totalGames = games.length;

    const avgRating = totalGames > 0 
        ? (games.reduce((sum, game) => sum + game.rating, 0) / totalGames).toFixed(1) 
        : "0.0";

    let mostCommonGenre = "N/A";
    if (totalGames > 0) {
        const counts = games.reduce((acc, game) => {
            acc[acc.genre] = (acc[game.genre] || 0) + 1;
            return acc;
        }, {});
        mostCommonGenre = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card blue">
                <span class="stat-value">${totalGames}</span>
                <span class="stat-label">Total Games in Collection</span>
            </div>
            <div class="stat-card gold">
                <span class="stat-value">${avgRating}</span>
                <span class="stat-label">Average Rating</span>
            </div>
            <div class="stat-card purple">
                <span class="stat-value">${mostCommonGenre}</span>
                <span class="stat-label">Most Played Genre</span>
            </div>
        </div>
    `;
}