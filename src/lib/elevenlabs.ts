const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// API key should be stored in environment variables
// Add VITE_ELEVENLABS_API_KEY to your .env file
const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

/**
 * ElevenLabs client for text-to-speech conversion
 */
export const elevenlabsClient = {
  /**
   * Convert text to speech using ElevenLabs API
   * @param text Text to convert to speech
   * @param voiceId Voice ID to use (defaults to "pNInz6obpgDQGcFmaJgB" - Adam voice, good for comedy/roasts)
   * @returns Audio blob
   */
  textToSpeech: async (text: string, voiceId: string = "pNInz6obpgDQGcFmaJgB"): Promise<Blob> => {
    if (!apiKey) {
      throw new Error('VITE_ELEVENLABS_API_KEY environment variable is not set. Please add it to your .env file.');
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.25, // Lower stability = more expressive, dynamic, and playful (perfect for comedy/roasts)
            similarity_boost: 0.85, // Higher similarity = maintains voice character while being expressive
            style: 0.7, // Higher style = more exaggerated and entertaining delivery
            use_speaker_boost: true // Enhances voice clarity and presence
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  },

  /**
   * Get available voices from ElevenLabs API
   * @returns List of available voices
   */
  getVoices: async () => {
    if (!apiKey) {
      throw new Error('VITE_ELEVENLABS_API_KEY environment variable is not set. Please add it to your .env file.');
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }
};
