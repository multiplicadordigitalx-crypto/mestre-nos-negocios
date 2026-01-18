
import React, { useState, useRef, useEffect } from 'react';
import { Captions, LockClosed } from './Icons';
import toast from 'react-hot-toast';

interface VideoPlayerProps {
  src: string;
  captionSrc?: string;
  onWatchCompleted: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, captionSrc, onWatchCompleted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [showCaptions, setShowCaptions] = useState(false);
  
  // Rastreia o ponto máximo que o aluno já assistiu nesta sessão
  const maxWatchedTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);

      // CRITICAL FIX: Só atualiza o tempo máximo se o avanço for natural (pequeno intervalo)
      // Se o usuário pular (ex: de 10s para 50s), a diferença será grande e não entra aqui.
      // Isso impede que o 'timeupdate' valide o salto antes do 'seeking' bloquear.
      if (video.currentTime > maxWatchedTimeRef.current) {
          const timeDifference = video.currentTime - maxWatchedTimeRef.current;
          // Aceita apenas avanços menores que 1.5s (reprodução normal ou pequenos lags)
          if (timeDifference < 1.5) {
              maxWatchedTimeRef.current = video.currentTime;
          }
      }
    };

    const handleSeeking = () => {
        // Se tentar pular para frente do que já viu (+ tolerância mínima de 0.2s)
        if (video.currentTime > maxWatchedTimeRef.current + 0.2) {
            // Bloqueia imediatamente e volta para o ponto máximo assistido
            video.currentTime = maxWatchedTimeRef.current;
            toast.error("Visualização obrigatória. Não é permitido avançar sem assistir.", {
                icon: <LockClosed className="w-5 h-5 text-red-500"/>,
                id: "anti-seek-toast" // Evita flood de toasts
            });
        }
    };

    const handleEnded = () => {
      // Verificação final de segurança
      // Se o usuário conseguiu pular para o fim de alguma forma, mas o maxWatchedTime é baixo, não conclui.
      if (maxWatchedTimeRef.current < video.duration - 1) {
          video.currentTime = maxWatchedTimeRef.current;
          toast.error("Por favor, assista o conteúdo completo para concluir.");
          return;
      }

      setProgress(100);
      maxWatchedTimeRef.current = video.duration;
      onWatchCompleted();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onWatchCompleted]);

  const toggleCaptions = () => {
    const video = videoRef.current;
    if (video && video.textTracks && video.textTracks.length > 0) {
        const mode = video.textTracks[0].mode;
        video.textTracks[0].mode = mode === 'showing' ? 'hidden' : 'showing';
        setShowCaptions(mode !== 'showing');
    }
  };

  // Reset maxWatched quando a URL do vídeo muda (nova aula)
  useEffect(() => {
      maxWatchedTimeRef.current = 0;
      setProgress(0);
  }, [src]);

  return (
    <div 
      className="w-full max-w-4xl mx-auto border-4 border-gray-700 rounded-2xl overflow-hidden shadow-2xl bg-black relative group"
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        controlsList="nodownload"
        src={src}
        playsInline
        disablePictureInPicture
      >
        {captionSrc && <track kind="captions" src={captionSrc} default={showCaptions} label="Português" />}
      </video>
      
      {captionSrc && (
          <button 
            onClick={toggleCaptions} 
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title={showCaptions ? "Desativar legendas" : "Ativar legendas"}
          >
             <Captions className={`w-6 h-6 ${showCaptions ? 'text-brand-primary' : 'text-white'}`} />
          </button>
       )}

      {/* Custom Progress Visualizer (Optional overlay to show watched vs unwatched) */}
      <div className="w-full bg-gray-800 h-1 absolute bottom-0 left-0 z-10 pointer-events-none hidden">
        <div
          className="bg-brand-primary h-full transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default VideoPlayer;
