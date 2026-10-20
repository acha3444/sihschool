import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBase64: string, durationSeconds: number) => void;
  label?: string;
  initialAudioUrl?: string | null;
  onReset?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  label = 'Note vocale / Récitation',
  initialAudioUrl = null,
  onReset,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialAudioUrl) {
      setAudioUrl(initialAudioUrl);
    }
  }, [initialAudioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];
    setAudioUrl(null);
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Le microphone n\'est pas supporté par ce navigateur. Veuillez utiliser l\'import de fichier.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Sélectionner le meilleur mimeType supporté
      let selectedMimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/ogg',
        ];
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
          }
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMime = selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });

        // Convertir en Base64 Data URL pour persistance fiable universelle
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          onAudioReady(base64Audio, recordingTime || 1);
        };
        reader.readAsDataURL(audioBlob);

        // Arrêter tous les tracks du micro
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // morceaux de 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erreur accès micro:', err);
      setPermissionError(
        err.message || 'Accès au microphone refusé. Vous pouvez importer un fichier audio directement.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onReset) onReset();
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

  // Import de fichier audio externe (dictaphone, WhatsApp, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      alert('Veuillez sélectionner un fichier audio valide (.mp3, .m4a, .wav, .webm).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      setAudioUrl(base64Audio);
      setRecordingTime(10);
      onAudioReady(base64Audio, 10);
      setPermissionError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#CDBDF2] shadow-xs space-y-3">
      {/* Entête */}
      <div className="flex items-center justify-between">
        <span className="badge-lavender text-xs font-black uppercase flex items-center gap-1.5 py-0.5 px-2.5">
          <Volume2 className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
          {label}
        </span>

        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-black text-[#E5483D] animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5483D] inline-block"></span>
            Enregistrement en cours ({formatTime(recordingTime)})
          </span>
        )}
      </div>

      {/* État 1 : Aucun enregistrement en cours */}
      {!audioUrl && (
        <div className="flex flex-col items-center gap-3 py-2">
          {!isRecording ? (
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={startRecording}
                className="btn-pill-sun text-xs font-black !min-h-[42px] px-5 flex items-center gap-2 shadow-sm"
              >
                <Mic className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>Appuyer pour enregistrer avec le micro</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-pill-white text-xs font-bold !min-h-[42px] px-4 flex items-center gap-1.5 border border-[#CDBDF2]"
              >
                <Upload className="w-3.5 h-3.5 text-[#4A5487]" />
                <span>Importer un audio</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="btn-pill-white !bg-[#E5483D] !text-white !border-transparent text-xs font-black !min-h-[44px] px-6 flex items-center gap-2 shadow-md animate-bounce"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Terminer l'enregistrement ({formatTime(recordingTime)})</span>
            </button>
          )}

          {permissionError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Autorisation microphone requise</p>
                <p className="text-[11px] mt-0.5">
                  Vérifiez que votre navigateur autorise l'accès au micro, ou cliquez sur <strong>Importer un audio</strong> pour envoyer directement un enregistrement audio depuis votre téléphone.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* État 2 : Enregistrement prêt à être réécouté ou réinitialisé */}
      {audioUrl && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFF6E3] p-3.5 rounded-2xl border-2 border-[#FFE15C]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-[#1B2A7A] text-[#FFE15C] flex items-center justify-center shadow-sm hover:scale-105 transition-transform flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Écouter'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div>
              <p className="text-xs font-black text-[#1B2A7A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
                <span>Enregistrement prêt</span>
              </p>
              <p className="text-[11px] text-[#4A5487] font-semibold">
                Durée : {recordingTime > 0 ? formatTime(recordingTime) : 'Audio valide'} · Cliquez pour écouter
              </p>
            </div>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={resetRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#9B1C1C] hover:bg-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réenregistrer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
