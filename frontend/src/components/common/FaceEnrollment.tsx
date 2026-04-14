import * as faceapi from "@vladmandic/face-api";
import { useRef, useEffect, useState } from 'react';
import api from '../../api/axiosClient'

interface FaceEnrollmentProps {
  employeeId: number;
  onSuccess?: () => void;
}

const FaceEnrollment = ({ employeeId, onSuccess }: FaceEnrollmentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        });
    };
    
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
        startVideo();
      } catch (err) {
        console.error("Failed to load models", err);
      }
    };
    loadModels();
  }, []);

  const handleEnroll = async () => {
    if (!videoRef.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // I-convert ang Float32Array into a simple String/Array
        const descriptorString = JSON.stringify(Array.from(detection.descriptor));
        
        // I-send sa API endpoint mo
        await api.put(`/employees/enroll-face/${employeeId}`, { 
          faceDescriptor: descriptorString 
        });

        alert("Face data captured and saved successfully!");
        if (onSuccess) onSuccess();
      } else {
        alert("No face detected! Humarap nang maayos sa camera.");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Nagka-error sa pag-save ng face data.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-4">Face Enrollment</h3>
      <div className="relative">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="rounded-lg w-full max-w-md border-4 border-slate-200" 
        />
        {!isModelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 opacity-75">
            Loading AI Models...
          </div>
        )}
      </div>
      <button 
        disabled={!isModelsLoaded}
        onClick={handleEnroll} 
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition-all disabled:bg-gray-400"
      >
        Scan and Register Face
      </button>
    </div>
  );
};

export default FaceEnrollment; // IMPORTANTE: Ito ang fix sa Fast Refresh error