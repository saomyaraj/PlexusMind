# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from nlp_processor import NLPProcessor

app = Flask(__name__)
CORS(app)

# Initialize NLP processor
nlp = NLPProcessor()

@app.route('/process', methods=['POST'])
def process_text():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        result = nlp.process_text(data['text'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/relationship', methods=['POST'])
def analyze_relationship():
    data = request.json
    if not data or 'text1' not in data or 'text2' not in data:
        return jsonify({'error': 'Both text samples are required'}), 400
    
    try:
        result = nlp.find_relationships(data['text1'], data['text2'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)