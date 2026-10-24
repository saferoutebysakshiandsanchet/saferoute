// GPS Voice Guidance using Browser SpeechSynthesis API

class VoiceGuidance {
  public enabled: boolean = true;

  public speak(text: string) {
    if (!this.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female')) && v.lang.startsWith('en')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback gracefully
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceGuidance = new VoiceGuidance();
