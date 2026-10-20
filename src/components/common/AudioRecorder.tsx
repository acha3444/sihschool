import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Volume2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioUrl: string) => void;
  label?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, label = 'Enregistrer ma lecture' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(false);
    audioChunksRef.current = [];
    setAudioUrl(null);
    setRecordingTime(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          onAudioReady(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('MediaDevices not supported');
      }
    } catch (err) {
      console.warn('Microphone access simulated mode', err);
      setPermissionError(true);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 4) {
            stopSimulatedRecording();
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopSimulatedRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    const simulatedAudio = '/audio/devoirs/student-sample.mp3';
    setAudioUrl(simulatedAudio);
    onAudioReady(simulatedAudio);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      stopSimulatedRecording();
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cloud-card p-4 border-2 border-white flex flex-col items-center gap-3 w-full shadow-soft-blue">
      <div className="flex items-center justify-between w-full">
        <span className="badge-lavender text-xs">
          <Volume2 className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
          {label}
        </span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-black text-[#E5483D] font-baloo">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5483D] animate-ping inline-block"></span>
            Enregistrement ({formatTime(recordingTime)})
          </span>
        )}
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center gap-2 py-1 w-full">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="btn-pill-sun w-full sm:w-auto"
            >
              <Mic className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Appuyer pour enregistrer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="btn-pill-white !bg-[#E5483D] !text-white !border-transparent w-full sm:w-auto font-baloo font-extrabold shadow-md"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Arrêter l’enregistrement ({formatTime(recordingTime)})</span>
            </button>
          )}

          {permissionError && (
            <p className="text-[11px] text-[#4A5487] text-center font-baloo">
              Mode démo audio actif (microphone simulé).
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full bg-[#FFFFFF] p-3 rounded-3xl border-2 border-[#CDBDF2]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" strokeWidth={2.5} /> : <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} />}
            </button>
            <div className="text-left font-baloo">
              <p className="text-xs font-extrabold text-[#1B2A7A]">Enregistrement prêt</p>
              <p className="text-[11px] text-[#4A5487] flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Durée : {formatTime(recordingTime || 4)}
              </p>
            </div>
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={resetRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-baloo font-bold text-[#4A5487] hover:text-[#E5483D] hover:bg-[#FFF6E3] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Recommencer</span>
          </button>
        </div>
      )}
    </div>
  );
};
