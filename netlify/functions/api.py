from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
CORS(app)

# Path for persistent JSON storage on the server
DATA_FILE = 'games.json'

def read_data():
    if not os.path.exists(DATA_FILE):
        # Initial 31 records to meet the minimum of 30 requirement
        initial_data = [
            {"id": 1, "title": "Fortnite", "genre": "Third-Person Shooter", "rating": 9},
            {"id": 2, "title": "Legend of Heroes: Trails to Azure", "genre": "JRPG", "rating": 9},
            # ... include all 31 records from your current INITIAL_DATA here ...
        ]
        with open(DATA_FILE, 'w') as f:
            json.dump(initial_data, f)
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
    page_size = 10  # Requirement: Exactly 10 records per page
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
    
    # Server-side validation
    if not body.get('title') or not body.get('genre'):
        return jsonify({"error": "Title and Genre are required"}), 400

    if 'id' in body:
        # Update existing record
        for i, g in enumerate(games):
            if g['id'] == body['id']:
                games[i] = body
                break
    else:
        # Create new record
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
    app.run(debug=True)