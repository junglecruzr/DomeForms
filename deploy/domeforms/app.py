import os, json, sqlite3, uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://promptframer.com', 'https://www.promptframer.com', 'https://domeforms.frugalin.cloud'])

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'domeforms.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY, form_id TEXT NOT NULL,
            data TEXT NOT NULL, metadata TEXT,
            status TEXT DEFAULT 'COMPLETED',
            payment_status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS forms (
            id TEXT PRIMARY KEY, name TEXT NOT NULL,
            definition TEXT NOT NULL, status TEXT DEFAULT 'PUBLISHED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "engine": "python-flask", "timestamp": datetime.utcnow().isoformat()})

@app.route('/api/submissions/public', methods=['POST'])
def submit():
    payload = request.get_json(force=True) or {}
    form_id = payload.get('formId')
    data = payload.get('data', {})
    metadata = payload.get('metadata', {})
    
    if not form_id:
        return jsonify({"error": "formId is required"}), 400
    if data.get('honeypot'):
        return jsonify({"error": "Spam detected"}), 400

    submission_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO submissions (id, form_id, data, metadata) VALUES (?, ?, ?, ?)",
        (submission_id, form_id, json.dumps(data), json.dumps(metadata))
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "submissionId": submission_id})

@app.route('/api/forms', methods=['GET', 'POST'])
def forms():
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        payload = request.get_json(force=True) or {}
        form_id = str(uuid.uuid4())
        name = payload.get('name', 'Untitled Form')
        definition = json.dumps(payload.get('definition', {}))
        cursor.execute("INSERT INTO forms (id, name, definition) VALUES (?, ?, ?)", (form_id, name, definition))
        conn.commit()
        conn.close()
        return jsonify({"id": form_id, "name": name}), 201
        
    cursor.execute("SELECT * FROM forms")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/embed.js')
def embed_script():
    return app.response_class(
        response="""
        // DomeForms Embed Engine
        window.DomeForms = {
            openPopup: function(formId, options = {}) {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6); z-index: 99999;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                const iframe = document.createElement('iframe');
                iframe.src = `https://domeforms.frugalin.cloud/forms/${formId}/render?theme=${options.theme || 'default'}`;
                iframe.style.cssText = `
                    width: 90%; max-width: 600px; height: 80vh; border: none;
                    border-radius: 8px; background: white;
                `;
                
                overlay.appendChild(iframe);
                document.body.appendChild(overlay);
                
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        document.body.removeChild(overlay);
                    }
                });
                
                return overlay;
            }
        };
        """,
        mimetype='application/javascript'
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
