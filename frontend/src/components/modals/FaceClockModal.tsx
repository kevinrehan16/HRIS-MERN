import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js';
import { useRef, useEffect, useState } from 'react';
import api from '../../api/axiosClient';

const FaceClock = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [status, setStatus] = useState("Initializing AI...");

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const MODEL_URL = '/models';
        
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        const res = await api.get('/employees/with-face');
        const data = res.data.data || [];
        setEmployees(data);
        
        setIsModelsLoaded(true);
        setStatus("Ready to Scan");
        startVideo();
      } catch (err) {
        console.error("Init Error:", err);
        setStatus("Failed to load system.");
      }
    };
    init();
  }, []);

  const handleAttendance = async (type: 'IN' | 'OUT') => {
    // Safety check for video and employee data
    if (!videoRef.current || videoRef.current.readyState !== 4) return;
    if (!employees || employees.length === 0) {
      alert("No registered employees found in the system.");
      return;
    }

    try {
      setStatus("Scanning face...");

      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("No face detected. Please adjust your position.");
        return;
      }

      // 2. Map and Parse Descriptors with Error Handling
      const labeledDescriptors = employees.map(emp => {
        try {
          const descArray = new Float32Array(JSON.parse(emp.faceDescriptor));
          return new faceapi.LabeledFaceDescriptors(emp.id.toString(), [descArray]);
        } catch (e) {
          return null;
        }
      }).filter(ld => ld !== null) as faceapi.LabeledFaceDescriptors[];

      if (labeledDescriptors.length === 0) {
        setStatus("Error: No valid face records found.");
        return;
      }

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4);
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      console.log("Match Result:", bestMatch.toString()); 
      console.log("Best Match Label:", bestMatch.label);

      if (bestMatch.label !== 'unknown') {
        const employeeId = Number(bestMatch.label);
        const matchedEmployee = employees.find(e => e.id === employeeId);
        const fullName = `${matchedEmployee.firstName} ${matchedEmployee.lastName}`;

        // 3. Trigger Attendance API
        try {
          if (type === 'IN') {
            await api.post('/attendance/time-in', { employeeId });
          } else {
            await api.patch('/attendance/time-out', { employeeId });
          }

          setStatus(`Success! ${type} for ${fullName}`);
          alert(`${type} Recorded: ${fullName}`);
        } catch (apiErr: any) {
          setStatus(apiErr.response?.data?.message || "Record failed.");
        }
      } else {
        setStatus("Face not recognized. Access denied.");
      }
    } catch (err) {
      console.error("Scan Error:", err);
      setStatus("AI Error. Please restart.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">Attendance Kiosk</h2>
        <div className={`px-4 py-1 rounded-full text-sm font-medium inline-block ${status.includes('Success') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {status}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative border-8 border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-black">
          <video ref={videoRef} autoPlay muted className="w-[640px] h-[480px] object-cover scale-x-[-1]" />
          {!isModelsLoaded && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Loading AI Models...</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 mt-12">
        <button 
          disabled={!isModelsLoaded}
          onClick={() => handleAttendance('IN')}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-12 py-5 rounded-2xl text-2xl font-black shadow-xl transform transition hover:-translate-y-1 active:scale-95"
        >
          CLOCK IN
        </button>
        <button 
          disabled={!isModelsLoaded}
          onClick={() => handleAttendance('OUT')}
          className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 px-12 py-5 rounded-2xl text-2xl font-black shadow-xl transform transition hover:-translate-y-1 active:scale-95"
        >
          CLOCK OUT
        </button>
      </div>
    </div>
  );
};

export default FaceClock;