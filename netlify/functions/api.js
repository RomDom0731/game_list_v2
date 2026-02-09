const fs = require('fs');
const path = require('path');

// FORCE /tmp if ANY Netlify-specific variables are present
const isNetlify = process.env.NETLIFY === 'true' || 
                  process.env.LAMBDA_TASK_ROOT || 
                  process.env.CONTEXT === 'production';

const DATA_FILE = isNetlify 
    ? path.join('/tmp', 'games.json') 
    : path.join(__dirname, 'games.json');

// Initial 31 records for requirement
const INITIAL_DATA = [
  { id: 1, title: "Fortnite", genre: "Third-Person Shooter", rating: 9 },
  { id: 2, title: "Legend of Heroes: Trails to Azure", genre: "JRPG", rating: 9 },
    { id: 3, title: "The Legend of Zelda: Breath of the Wild", genre: "Action-Adventure", rating: 10 },
    { id: 4, title: "Elden Ring", genre: "Action RPG", rating: 10 },
    { id: 5, title: "Minecraft", genre: "Sandbox", rating: 9.5 },
    { id: 6, title: "Cyberpunk 2077", genre: "Action RPG", rating: 8.5 },
    { id: 7, title: "The Witcher 3: Wild Hunt", genre: "RPG", rating: 10 },
    { id: 8, title: "Red Dead Redemption 2", genre: "Action-Adventure", rating: 10 },
    { id: 9, title: "Hades", genre: "Roguelike", rating: 9 },
    { id: 10, title: "Stardew Valley", genre: "Simulation", rating: 9.5 },
    { id: 11, title: "Overwatch 2", genre: "Hero Shooter", rating: 7.5 },
    { id: 12, title: "Baldur's Gate 3", genre: "RPG", rating: 10 },
    { id: 13, title: "Valorant", genre: "Tactical Shooter", rating: 8 },
    { id: 14, title: "Apex Legends", genre: "Battle Royale", rating: 8.5 },
    { id: 15, title: "God of War Ragnarök", genre: "Action-Adventure", rating: 9.5 },
    { id: 16, title: "Final Fantasy VII Rebirth", genre: "RPG", rating: 9.5 },
    { id: 17, title: "Doom Eternal", genre: "First-Person Shooter", rating: 9 },
    { id: 18, title: "Hollow Knight", genre: "Metroidvania", rating: 10 },
    { id: 19, title: "Celeste", genre: "Platformer", rating: 9 },
    { id: 20, title: "Sea of Thieves", genre: "Adventure", rating: 8 },
    { id: 21, title: "Rocket League", genre: "Sports", rating: 8.5 },
    { id: 22, title: "Grand Theft Auto V", genre: "Action-Adventure", rating: 9.5 },
    { id: 23, title: "Mass Effect Legendary Edition", genre: "RPG", rating: 10 },
    { id: 24, title: "Ghost of Tsushima", genre: "Action-Adventure", rating: 9 },
    { id: 25, title: "Persona 5 Royal", genre: "JRPG", rating: 10 },
    { id: 26, title: "Animal Crossing: New Horizons", genre: "Simulation", rating: 8.5 },
    { id: 27, title: "Disco Elysium", genre: "RPG", rating: 9.5 },
    { id: 28, title: "Portal 2", genre: "Puzzle", rating: 10 },
    { id: 29, title: "Outer Wilds", genre: "Exploration", rating: 9.5 },
    { id: 30, title: "Street Fighter 6", genre: "Fighting", rating: 8.5 },
    { id: 31, title: "Rhythm Heaven", genre: "Music", rating: 8 }
];

function readData() {
  try {
      if (!fs.existsSync(DATA_FILE)) {
          fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA));
          return INITIAL_DATA;
      }
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return data ? JSON.parse(data) : INITIAL_DATA;
  } catch (err) {
      return INITIAL_DATA; 
  }
}

// Helper to save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

exports.handler = async (event) => {
  let games = readData();
  const method = event.httpMethod;
  const params = event.queryStringParameters;
  const body = event.body ? JSON.parse(event.body) : null;

  if (method === "GET") {
      const page = parseInt(params.page) || 1;
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      return {
          statusCode: 200,
          body: JSON.stringify({
              data: games.slice(start, start + pageSize),
              allGames: games,
              page: page,
              totalPages: Math.ceil(games.length / pageSize)
          })
      };
  }

  if (method === "POST") {
      if (body.id) {
          const idx = games.findIndex(g => g.id === body.id);
          if (idx !== -1) games[idx] = body;
      } else {
          body.id = Date.now();
          games.push(body);
      }
      saveData(games); // PERSIST TO JSON FILE
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (method === "DELETE") {
      // Ensure the ID is treated as a number for the comparison
      const idToDelete = parseInt(params.id);
      
      if (isNaN(idToDelete)) {
          return { statusCode: 400, body: JSON.stringify({ error: "Invalid ID" }) };
      }
  
      games = games.filter(g => g.id !== idToDelete);
      saveData(games); // PERSIST TO JSON FILE
      
      return { 
          statusCode: 200, 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ success: true }) 
      };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};