
class SoundEngine {
  private enabled: boolean = true;
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    // Usamos sonidos de UI futuristas minimalistas (Short SFX)
    const baseUrl = 'https://assets.mixkit.co/active_storage/sfx';
    this.sounds = {
      hover: new Audio(`${baseUrl}/2571/2571-preview.mp3`), // Digital hover
      click: new Audio(`${baseUrl}/2568/2568-preview.mp3`), // Soft click
      transition: new Audio(`${baseUrl}/2570/2570-preview.mp3`), // Tech swoosh
      success: new Audio(`${baseUrl}/2569/2569-preview.mp3`), // Notification
      error: new Audio(`${baseUrl}/2572/2572-preview.mp3`), // Error/Bup
    };

    // Configuración de volumen para que no molesten
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.15;
      sound.preload = 'auto';
    });
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  play(type: 'hover' | 'click' | 'transition' | 'success' | 'error') {
    if (!this.enabled) return;
    
    const sound = this.sounds[type];
    if (sound) {
      sound.currentTime = 0; // Reiniciar para permitir play rápido
      sound.play().catch(() => {
        // Ignorar errores de autoplay del navegador
      });
    }
  }
}

export const soundEngine = new SoundEngine();
