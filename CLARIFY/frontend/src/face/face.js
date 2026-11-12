import './face.css';
import { useState, useRef, useEffect } from 'react';

function Face() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progressStep, setProgressStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const inputRef = useRef(null);

  const allowed = ['mp3', 'wav', 'm4a'];

  const steps = [
    'Uploading your file...',
    'Analyzing audio...',
    'Removing background noise...',
    'Enhancing voice clarity...',
    'Transcribing audio...',
    'Finalizing output...',
  ];

  useEffect(() => {
    if (!isProcessing) {
      setProgressStep(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const validateFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('❌ نوع الملف غير مدعوم. يرجى رفع MP3, WAV, أو M4A');
      return false;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('❌ حجم الملف أكبر من 500MB');
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    setError(null);
    setDownloadUrl(null);
    setTranscript('');
    if (validateFile(f)) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);
    setTranscript('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError('❌ ' + data.error);
        return;
      }

      // جيب الـ transcript من الـ header
      const transcriptText = response.headers.get('X-Transcript');
      if (transcriptText) {
        setTranscript(decodeURIComponent(transcriptText));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError('❌ تعذر الاتصال بالسيرفر');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="headerFace">
        <span className="colorBoll"></span>
        <span className="colorMove sele">AI-Powered Audio Enhancement</span>
      </div>

      <h1 className='text-1'>
        <div className='m1'>Remove Noise</div>
        <span className='under-text'>Transcribe Audio.</span>
      </h1>

      <p className="p1">
        Transform noisy recordings into crystal clear audio with automatic transcription.
        Powered by advanced AI noise reduction algorithms.
      </p>

      <div className="buttons-container">
        <button className="btn-primary" onClick={() => document.getElementById('processing').scrollIntoView({ behavior: 'smooth' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
          </svg>
          Start Cleaning Audio
        </button>
        <button className="btn-secondary">View Examples</button>
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        id="processing"
        onClick={() => !isProcessing && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.m4a"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="mic-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </div>

        {file ? (
          <h2 className="drop-title">✅ {file.name}</h2>
        ) : (
          <h2 className="drop-title">Drop your noisy audio</h2>
        )}
        <p className="drop-subtitle">Supports MP3, WAV, M4A up to 500MB</p>

        <div className="formats">
          {['MP3', 'WAV', 'M4A'].map(f => (
            <span className="format-item" key={f}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons after upload */}
      {file && !isProcessing && !downloadUrl && (
        <div className="buttons-container">
          <button className="btn-primary" onClick={handleProcess}>
            🎙️ Process Audio
          </button>
          <button className="btn-secondary" onClick={() => { setFile(null); setError(null); }}>
            Remove File
          </button>
        </div>
      )}

      {/* Processing UI */}
      {isProcessing && (
        <div className="processing-container">
          <div className="processing-spinner"></div>
          <p className="processing-title colorMove">Processing your audio...</p>
          <p className="processing-step">{steps[progressStep]}</p>
          <div className="processing-steps-list">
            {steps.map((step, i) => (
              <div key={i} className={`step-item ${i < progressStep ? 'done' : ''} ${i === progressStep ? 'active' : ''}`}>
                <span className="step-dot"></span>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>
          <p className="processing-note">⏱️ This may take a few minutes depending on file size</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="status-container">
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Download + Transcript */}
      {downloadUrl && (
        <div>
          <div className="buttons-container">
            <a href={downloadUrl} download="cleaned_audio.wav" className="btn-primary" style={{ textDecoration: 'none' }}>
              ⬇️ Download Cleaned Audio
            </a>
            <button className="btn-secondary" onClick={() => { setFile(null); setDownloadUrl(null); setTranscript(''); }}>
              Process Another File
            </button>
          </div>

          {transcript && (
            <div className="transcript-container">
              <h3 className="colorMove">📝 Transcript</h3>
              <p className="transcript-text">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      <div className='content-text'>
        <h2 className='colorMove'>Powerful Features</h2>
        <p className='p-under'>Everything you need for professional audio processing</p>
      </div>

      <div id="features" className="features">
        <div className="feature-card">
          <div className="feature-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </div>
          <h3>AI Noise Removal</h3>
          <p>Advanced algorithms remove background noise, hum, static, and echo while preserving speech clarity.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon teal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <h3>Smart Transcription</h3>
          <p>Automatic speech-to-text with speaker detection, timestamps, and support for 99+ languages.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon pink">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
          <h3>Instant Processing</h3>
          <p>Cloud-powered processing delivers results in seconds, not minutes. Handle files up to 4 hours long.</p>
        </div>
      </div>

    </div>
  );
}

export default Face;