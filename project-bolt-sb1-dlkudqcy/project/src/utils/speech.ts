import { EmotionType } from './emotions';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export interface SpeechOptions {
  emotion: EmotionType;
  rate?: number;
  pitch?: number;
}

const emotionVoiceSettings: Record<EmotionType, { rate: number; pitch: number }> = {
  joy: { rate: 1.1, pitch: 1.2 },
  curiosity: { rate: 1.0, pitch: 1.1 },
  calm: { rate: 0.9, pitch: 1.0 },
  anger: { rate: 1.2, pitch: 0.8 },
  confusion: { rate: 0.85, pitch: 0.95 },
  confidence: { rate: 1.0, pitch: 1.05 },
  surprise: { rate: 1.15, pitch: 1.15 },
  sadness: { rate: 0.85, pitch: 0.9 },
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (text: string, options: SpeechOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!synth) {
      console.warn('Speech synthesis not available');
      resolve();
      return;
    }

    if (currentUtterance) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    const settings = emotionVoiceSettings[options.emotion];
    utterance.rate = options.rate ?? settings.rate;
    utterance.pitch = options.pitch ?? settings.pitch;
    utterance.volume = 0.8;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      currentUtterance = null;
      reject(error);
    };

    synth.speak(utterance);
  });
};

export const stopSpeaking = (): void => {
  if (synth) {
    synth.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = (): boolean => {
  return synth ? synth.speaking : false;
};

if (synth && typeof window !== 'undefined') {
  window.speechSynthesis.onvoiceschanged = () => {
    synth.getVoices();
  };
}
