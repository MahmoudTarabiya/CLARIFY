from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from voicefixer import VoiceFixer
import os
import uuid
import json
import urllib.parse
from transcribe import transcribe

app = Flask(__name__)
CORS(app, expose_headers=['X-Transcript'])

vf = VoiceFixer()

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/process', methods=['POST'])
def process_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    allowed = ['mp3', 'wav', 'm4a']
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({'error': 'Invalid file type'}), 400

    unique_id = str(uuid.uuid4())
    input_path = os.path.join(os.path.abspath(UPLOAD_FOLDER), f'{unique_id}.{ext}')
    output_path = os.path.join(os.path.abspath(OUTPUT_FOLDER), f'{unique_id}_cleaned.wav')
    transcript_path = os.path.join(os.path.abspath(OUTPUT_FOLDER), f'{unique_id}_transcript.json')
    file.save(input_path)

    try:
        vf.restore(
            input=input_path,
            output=output_path,
            cuda=False
        )
        print(f"[VoiceFixer] Output exists: {os.path.exists(output_path)}")
        print(f"[VoiceFixer] Output path: {output_path}")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
    try:
        transcript, segments = transcribe(output_path)
        print(f"[Whisper] Transcript: '{transcript}'")
    except Exception as e:
        print(f"[Whisper ERROR]: {e}")
        transcript = ''
        segments = []

    
    with open(transcript_path, 'w', encoding='utf-8') as f:
        json.dump({'transcript': transcript, 'segments': segments}, f, ensure_ascii=False)

    
    response = send_file(
        output_path,
        as_attachment=True,
        download_name='cleaned_audio.wav',
        mimetype='audio/wav'
    )
    response.headers['X-Transcript'] = urllib.parse.quote(transcript)
    return response

@app.route('/transcript/<file_id>', methods=['GET'])
def get_transcript(file_id):
    transcript_path = os.path.join(OUTPUT_FOLDER, f'{file_id}_transcript.json')
    if not os.path.exists(transcript_path):
        return jsonify({'error': 'Transcript not found'}), 404
    with open(transcript_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=False, port=5000)