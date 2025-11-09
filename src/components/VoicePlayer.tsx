import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { elevenlabsClient } from '../lib/elevenlabs';

interface VoicePlayerProps {
  text: string;
  className?: string;
}

export const VoicePlayer = ({ text, className = '' }: VoicePlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Enhance text with expressive tags for a funnier, more insulting delivery
  const enhanceTextForVoice = (text: string): string => {
    // Remove HTML tags if present
    let cleanText = text.replace(/<[^>]*>/g, '');
    
    // Add a sarcastic opening if the text starts with certain phrases
    if (/^(well|oh|wow|look|listen)/i.test(cleanText.trim())) {
      cleanText = '[sarcastic] ' + cleanText;
    }
    
    // Add laughs after emojis (they're often used for emphasis in roasts)
    cleanText = cleanText.replace(/(🔥|💸|💰|😅|😂|💀|🤡)/g, '$1 [laughs]');
    
    // Add dramatic pauses before key financial terms (for comedic timing)
    cleanText = cleanText.replace(/\b(£\d+|\$\d+)/g, '[pause] $1');
    
    // Add sarcastic emphasis to overly positive words in a roast context
    cleanText = cleanText.replace(/\b(great job|amazing|wonderful|fantastic|excellent work)\b/gi, '[sarcastic] $1 [laughs]');
    
    // Add mischievous tone to transitions that set up a roast
    cleanText = cleanText.replace(/\b(but|however|though|let me tell you|here's the thing)\b/gi, '[mischievously] $1');
    
    return cleanText;
  };

  const handlePlay = async () => {
    // If already playing, stop playback
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // Otherwise, generate and play audio
    setIsLoading(true);
    try {
      // Enhance the text with expressive tags for comedic delivery
      const enhancedText = enhanceTextForVoice(text);
      const audioBlob = await elevenlabsClient.textToSpeech(enhancedText);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio URL if it exists
      if (audioRef.current && audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
      if (error instanceof Error) {
        if (error.message.includes('VITE_ELEVENLABS_API_KEY')) {
          alert('ElevenLabs API key is not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlay}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <VolumeX className="h-4 w-4" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span>Listen</span>
          </>
        )}
      </Button>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};
