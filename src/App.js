import React, { useState, useRef } from "react";
import RecordRTC from "recordrtc";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const recorderRef = useRef(null);
  const [recordingBlob, setRecordingBlob] = useState(null);

  // Start recording
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new RecordRTC(stream, { type: "audio" });
        recorder.startRecording();
        recorderRef.current = recorder;
        recorderRef.current.stream = stream;  // Store the stream here
        setIsRecording(true);
      })
      .catch((err) => {
        console.error("Error accessing microphone: ", err);
      });
  };
  

  // Stop recording and create URL for preview
  const stopRecording = () => {
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      setRecordingBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setIsRecording(false);
  
      // Check if the stream exists before trying to stop tracks
      if (recorderRef.current.stream) {
        const stream = recorderRef.current.stream;
        stream.getTracks().forEach(track => track.stop());  // Stop all media tracks
      }
  
      // Clear recorder reference
      recorderRef.current = null;
    });
  };

  // Send the recording
  const sendRecording = () => {
    if (recordingBlob) {
      const formData = new FormData();
      formData.append("audio", recordingBlob, "recording.wav");

      // Simulate sending the recording (e.g., via an API call)
      fetch("your-server-endpoint", {
        method: "POST",
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log("Audio file sent successfully", data);
      })
      .catch(error => {
        console.error("Error sending audio file:", error);
      });
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Voice Recorder</h2>
      {!isRecording ? (
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      )}
      
      {audioURL && (
        <div>
          <h3>Preview</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
      
      {audioURL && (
        <button onClick={sendRecording}>
          Send Recording
        </button>
      )}
    </div>
  );
}

export default App;
