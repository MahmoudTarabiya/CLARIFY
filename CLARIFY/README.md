# CLARIFY
نظام ذكاء اصطناعي لتنضيف الصوت وتحويله لنص.

## Backend
- `app.py`: Flask API (endpoints: /process, /transcript/<id>, /health)
- `transcribe.py`: تحويل الصوت لنص باستخدام Whisper

## المكتبات
Flask, flask-cors, voicefixer, openai-whisper
(لازم ffmpeg يكون متثبت)

## التشغيل
pip install -r requirements.txt
cd Backend && python app.py