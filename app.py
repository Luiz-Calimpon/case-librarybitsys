from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from sentence_transformers import SentenceTransformer, util
import numpy as np

app = Flask(__name__, static_folder='frontend')
CORS(app)

CASES_FILE = 'cases.json'
EDIT_PASSWORD = os.environ.get('EDIT_PASSWORD', 'default_password')

class SemanticSearch:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.cases = []
        self.case_embeddings = None

    def load_cases(self, cases):
        self.cases = cases
        case_texts = [f"{case['title']} {case['content']}" for case in self.cases]
        self.case_embeddings = self.model.encode(case_texts, convert_to_tensor=True)

    def search(self, query, top_k=5):
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        cos_scores = util.cos_sim(query_embedding, self.case_embeddings)[0]
        top_results = np.argpartition(-cos_scores, range(top_k))[0:top_k]
        results = []
        for idx in top_results:
            results.append({
                'case': self.cases[idx],
                'score': cos_scores[idx].item()
            })
        results.sort(key=lambda x: x['score'], reverse=True)
        return results

searcher = SemanticSearch()

def load_cases():
    if os.path.exists(CASES_FILE):
        with open(CASES_FILE, 'r') as f:
            cases = json.load(f)
            searcher.load_cases(cases)
            return cases
    return []

def save_cases(cases):
    with open(CASES_FILE, 'w') as f:
        json.dump(cases, f)
    searcher.load_cases(cases)

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/cases', methods=['GET'])
def get_cases():
    cases = load_cases()
    return jsonify(cases)

@app.route('/search', methods=['GET'])
def search_cases():
    query = request.args.get('query', '')
    results = searcher.search(query)
    return jsonify([result['case'] for result in results])

@app.route('/edit', methods=['POST'])
def edit_case():
    if request.headers.get('Edit-Password') != EDIT_PASSWORD:
        return jsonify({"error": "Invalid password"}), 401

    case_data = request.json
    cases = load_cases()
    for i, case in enumerate(cases):
        if case['id'] == case_data['id']:
            cases[i] = case_data
            save_cases(cases)
            return jsonify({"success": True})
    return jsonify({"error": "Case not found"}), 404

@app.route('/delete', methods=['POST'])
def delete_case():
    if request.headers.get('Edit-Password') != EDIT_PASSWORD:
        return jsonify({"error": "Invalid password"}), 401

    case_id = request.json['id']
    cases = load_cases()
    cases = [case for case in cases if case['id'] != case_id]
    save_cases(cases)
    return jsonify({"success": True})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = file.filename
        file_content = file.read().decode('utf-8')
        cases = load_cases()
        new_case = {
            "id": str(len(cases) + 1),
            "title": filename,
            "type": "Uploaded File",
            "case_number": f"UF-{len(cases) + 1}",
            "location": "Uploaded Files",
            "content": file_content
        }
        cases.append(new_case)
        save_cases(cases)
        return jsonify({"success": True, "id": new_case["id"]})

if __name__ == '__main__':
    app.run(debug=True)