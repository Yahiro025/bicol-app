"use client";
import { useRef, useState } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!url) return null;

  return (
    <div className="flex items-center gap-3">
      <audio 
        ref={audioRef} 
        src={url} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all group"
        title="Listen to pronunciation"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Volume2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
        )}
      </button>
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Listen</span>
    </div>
  );
}
