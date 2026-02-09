from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
CORS(app)

DATA_FILE = 'games.json'

def read_data():
    if not os.path.exists(DATA_FILE):
        initial_data = [
            {"id": 1, "title": "Fortnite", "genre": "Third-Person Shooter", "rating": 9},
            {"id": 2, "title": "Legend of Heroes: Trails to Azure", "genre": "JRPG", "rating": 9},
            {"id": 3, "title": "The Legend of Zelda: Breath of the Wild", "genre": "Action-Adventure", "rating": 10},
            {"id": 4, "title": "Elden Ring", "genre": "Action RPG", "rating": 10},
            {"id": 5, "title": "Minecraft", "genre": "Sandbox", "rating": 9.5},
            {"id": 6, "title": "Cyberpunk 2077", "genre": "Action RPG", "rating": 8.5},
            {"id": 7, "title": "The Witcher 3: Wild Hunt", "genre": "RPG", "rating": 10},
            {"id": 8, "title": "Red Dead Redemption 2", "genre": "Action-Adventure", "rating": 10},
            {"id": 9, "title": "Hades", "genre": "Roguelike", "rating": 9},
            {"id": 10, "title": "Stardew Valley", "genre": "Simulation", "rating": 9.5},
            {"id": 11, "title": "Overwatch 2", "genre": "Hero Shooter", "rating": 7.5},
            {"id": 12, "title": "Baldur's Gate 3", "genre": "RPG", "rating": 10},
            {"id": 13, "title": "Valorant", "genre": "Tactical Shooter", "rating": 8},
            {"id": 14, "title": "Apex Legends", "genre": "Battle Royale", "rating": 8.5},
            {"id": 15, "title": "God of War Ragnarök", "genre": "Action-Adventure", "rating": 9.5},
            {"id": 16, "title": "Final Fantasy VII Rebirth", "genre": "RPG", "rating": 9.5},
            {"id": 17, "title": "Doom Eternal", "genre": "First-Person Shooter", "rating": 9},
            {"id": 18, "title": "Hollow Knight", "genre": "Metroidvania", "rating": 10},
            {"id": 19, "title": "Celeste", "genre": "Platformer", "rating": 9},
            {"id": 20, "title": "Sea of Thieves", "genre": "Adventure", "rating": 8},
            {"id": 21, "title": "Rocket League", "genre": "Sports", "rating": 8.5},
            {"id": 22, "title": "Grand Theft Auto V", "genre": "Action-Adventure", "rating": 9.5},
            {"id": 23, "title": "Mass Effect Legendary Edition", "genre": "RPG", "rating": 10},
            {"id": 24, "title": "Ghost of Tsushima", "genre": "Action-Adventure", "rating": 9},
            {"id": 25, "title": "Persona 5 Royal", "genre": "JRPG", "rating": 10},
            {"id": 26, "title": "Animal Crossing: New Horizons", "genre": "Simulation", "rating": 8.5},
            {"id": 27, "title": "Disco Elysium", "genre": "RPG", "rating": 9.5},
            {"id": 28, "title": "Portal 2", "genre": "Puzzle", "rating": 10},
            {"id": 29, "title": "Outer Wilds", "genre": "Exploration", "rating": 9.5},
            {"id": 30, "title": "Street Fighter 6", "genre": "Fighting", "rating": 8.5},
            {"id": 31, "title": "Rhythm Heaven", "genre": "Music", "rating": 8}
        ]
        save_data(initial_data)
        return initial_data
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/api', methods=['GET'])
def get_games():
    games = read_data()
    page = int(request.args.get('page', 1))
    page_size = 10
    start = (page - 1) * page_size
    end = start + page_size
    return jsonify({
        "data": games[start:end],
        "allGames": games,
        "page": page,
        "totalPages": (len(games) + page_size - 1) // page_size
    })

@app.route('/api', methods=['POST'])
def save_game():
    games = read_data()
    body = request.get_json()
    if not body.get('title') or not body.get('genre'):
        return jsonify({"error": "Missing fields"}), 400
    rating = body.get('rating')
    if rating is None or not (0 <= float(rating) <= 10):
        return jsonify({"error": "Rating must be between 0 and 10"}), 400
    if 'id' in body:
        for i, g in enumerate(games):
            if g['id'] == body['id']:
                games[i] = body
                break
    else:
        body['id'] = int(time.time() * 1000)
        games.append(body)
    save_data(games)
    return jsonify({"success": True})

@app.route('/api', methods=['DELETE'])
def delete_game():
    games = read_data()
    game_id = int(request.args.get('id'))
    games = [g for g in games if g['id'] != game_id]
    save_data(games)
    return jsonify({"success": True})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)