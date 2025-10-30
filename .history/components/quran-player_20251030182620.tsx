// components/quran-player.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
}

interface Reciter {
  id: string;
  name: string;
}

const QuranPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentReciter, setCurrentReciter] = useState<string>('ar.alafasy');
  
  // Mock data - replace with your JSON fetching
  const [surahs] = useState<Surah[]>([
    { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah' },
    { number: 2, name: 'البقرة', englishName: 'Al-Baqarah' },
    { number: 114, name: 'الناس', englishName: 'An-Nas' }
  ]);

  const [reciters] = useState<Reciter[]>([
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.ghamdi', name: 'Saad Al Ghamdi' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit Abdus Samad' }
  ]);

  const getAudioUrl = (surahNumber: number, reciterId: string) => {
    return `/mnt/cdn/islamic-network-cdn/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    setCurrentTime(0);
    // Auto-play when surah changes
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        setIsPlaying(true);
      }
    }, 100);
  };

  const handleReciterChange = (reciterId: string) => {
    setCurrentReciter(reciterId);
    setCurrentTime(0);
    // Auto-play when reciter changes
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        setIsPlaying(true);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  const currentSurahData = surahs.find(s => s.number === currentSurah);
  const currentReciterData = reciters.find(r => r.id === currentReciter);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur-sm">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={getAudioUrl(currentSurah, currentReciter)}
        preload="metadata"
      />
      
      <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
        {/* Left: Album art and track info */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img 
              alt="Album Art" 
              className="h-16 w-16 rounded-md object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSWe9q8rs5hr-V19TlzPynln9PP69qzggayepN8nVdHCvw2Ca8YQm-m0D9St1CHdyx5E9e9ouvphOxyUK3wh6Y_3BPPlMIMIASSPAlvG6ehCvmTHochEPYQhDknxaJFJZdZgq_PAe0AhhIFTPxkGOFxdoXMLbsfRze1BASTqq_eg4p946gbcdd1jFavI9O-FU_WzRHQM-8gjX941hydbXX4bcwgd_kcq9PgJx4yjK-iGfk3H_KLby5aOghLUmTJ4hctRdb_ZPudUpk"
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-foreground">
              {currentSurahData?.englishName || `Surah ${currentSurah}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentReciterData?.name || 'Reciter'}
            </p>
          </div>
        </div>

        {/* Center: Playback controls and progress bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              aria-label="Play/Pause"
              onClick={handlePlayPause}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-foreground bg-muted hover:bg-border transition-colors"
            >
              <span className="material-symbols-outlined">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              aria-label="Stop"
              onClick={handleStop}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <span className="material-symbols-outlined">stop</span>
            </button>
          </div>
          <div className="hidden md:flex w-full max-w-xs lg:max-w-md items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {formatTime(currentTime)}
            </p>
            <div 
              className="flex h-1.5 flex-1 rounded-full bg-muted cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full rounded-full bg-primary relative transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute -right-1.5 -top-1.5 size-4 rounded-full bg-white border-2 border-primary cursor-pointer ring-2 ring-white hover:scale-110 transition-transform"></div>
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Right: Reciter and Surah selectors, volume */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            {/* Reciter Select */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-muted-foreground text-lg">mic</span>
              <select
                value={currentReciter}
                onChange={(e) => handleReciterChange(e.target.value)}
                className="form-select w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-10 placeholder:text-muted-foreground pl-10 pr-8 text-sm font-normal appearance-none"
              >
                {reciters.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 text-muted-foreground text-lg pointer-events-none">expand_more</span>
            </div>

            {/* Surah Select */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-muted-foreground text-lg">book</span>
              <select
                value={currentSurah}
                onChange={(e) => handleSurahChange(Number(e.target.value))}
                className="form-select w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-10 placeholder:text-muted-foreground pl-10 pr-8 text-sm font-normal appearance-none"
              >
                {surahs.map(surah => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.englishName}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 text-muted-foreground text-lg pointer-events-none">expand_more</span>
            </div>
          </div>

          <button 
            aria-label="Volume"
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined">volume_up</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default QuranPlayer;