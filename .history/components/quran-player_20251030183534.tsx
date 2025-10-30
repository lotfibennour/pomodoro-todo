// components/quran-player.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

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
    { number: 3, name: 'آل عمران', englishName: 'Ali Imran' },
    // Add all 114 surahs...
    { number: 114, name: 'الناس', englishName: 'An-Nas' }
  ]);

  const [reciters] = useState<Reciter[]>([
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.ghamdi', name: 'Saad Al Ghamdi' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit Abdus Samad' },
    // Add more reciters...
  ]);

  const getAudioUrl = (surahNumber: number, reciterId: string) => {
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
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

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSurahChange = (value: string) => {
    const surahNumber = parseInt(value);
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

  const handleReciterChange = (value: string) => {
    setCurrentReciter(value);
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
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm">
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
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="h-10 w-10 rounded-full"
            >
              <Square className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="hidden md:flex w-full max-w-xs lg:max-w-md items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleProgressChange}
              className="flex-1"
            />
            <span className="text-xs font-medium text-muted-foreground min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Reciter and Surah selectors, volume */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            {/* Reciter Select */}
            <Select value={currentReciter} onValueChange={handleReciterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select reciter" />
              </SelectTrigger>
              <SelectContent>
                {reciters.map(reciter => (
                  <SelectItem key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Surah Select */}
            <Select value={currentSurah.toString()} onValueChange={handleSurahChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select surah" />
              </SelectTrigger>
              <SelectContent>
                {surahs.map(surah => (
                  <SelectItem key={surah.number} value={surah.number.toString()}>
                    {surah.number}. {surah.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default QuranPlayer;