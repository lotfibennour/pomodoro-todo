import React, { useState, useRef, useEffect } from 'react';

interface Surah {
  number: number;
  name: string;
}

interface Reciter {
  id: string;
  name: string;
}

interface QuranPlayerProps {
  className?: string;
}

const QuranPlayer: React.FC<QuranPlayerProps> = ({ className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentReciter, setCurrentReciter] = useState<string>('ar.alafasy');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch surahs data from JSON
  useEffect(() => {
    fetch('/path/to/surahs.json') // Replace with your actual surahs JSON path
      .then(res => res.json())
      .then(data => {
        // Adjust this mapping based on your actual JSON structure
        const surahsList = data.map((item: any) => ({
          number: item.number,
          name: item.name
        }));
        setSurahs(surahsList);
      })
      .catch(error => {
        console.error('Error loading surahs:', error);
        // Fallback to default surahs if fetch fails
        setSurahs(Array.from({ length: 114 }, (_, i) => ({
          number: i + 1,
          name: `Surah ${i + 1}`
        })));
      });
  }, []);

  // Fetch reciters data from JSON
  useEffect(() => {
    fetch('/path/to/reciters.json') // Replace with your actual reciters JSON path
      .then(res => res.json())
      .then(data => {
        // Adjust this mapping based on your actual JSON structure
        // Example: if your JSON has a structure like the example provided
        const recitersList = data[0].contents[0].contents.map((reciter: any) => ({
          id: reciter.id, // or generate from name if id doesn't exist
          name: reciter.name
        }));
        setReciters(recitersList);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading reciters:', error);
        // Fallback to default reciters if fetch fails
        setReciters([
          { id: 'ar.alafasy', name: 'Mishary Alafasy' },
          // Add more fallback reciters if needed
        ]);
        setLoading(false);
      });
  }, []);

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
    }
  };

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  if (loading) {
    return <div>Loading Quran Player...</div>;
  }

  return (
    <div className={`quran-player ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={getAudioUrl(currentSurah, currentReciter)}
        preload="metadata"
      />
      
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #007bff',
          backgroundColor: isPlaying ? '#007bff' : 'white',
          color: isPlaying ? 'white' : '#007bff',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Stop Button */}
      <button
        onClick={handleStop}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #dc3545',
          backgroundColor: 'white',
          color: '#dc3545',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
      >
        Stop
      </button>

      {/* Reciter Select */}
      <select
        value={currentReciter}
        onChange={(e) => handleReciterChange(e.target.value)}
        style={{
          padding: '0.5rem',
          border: '1px solid #ced4da',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          minWidth: '200px'
        }}
      >
        {reciters.map(reciter => (
          <option key={reciter.id} value={reciter.id}>
            {reciter.name}
          </option>
        ))}
      </select>

      {/* Surah Select */}
      <select
        value={currentSurah}
        onChange={(e) => handleSurahChange(Number(e.target.value))}
        style={{
          padding: '0.5rem',
          border: '1px solid #ced4da',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          minWidth: '120px'
        }}
      >
        {surahs.map(surah => (
          <option key={surah.number} value={surah.number}>
            {surah.name}
          </option>
        ))}
      </select>

      {/* Current Playing Info */}
      <div style={{
        fontSize: '0.875rem',
        color: '#6c757d',
        marginLeft: 'auto'
      }}>
        Now playing: {currentSurah} - {reciters.find(r => r.id === currentReciter)?.name}
      </div>
    </div>
  );
};

export default QuranPlayer;