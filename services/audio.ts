import { SOUNDS } from "../constants";
import { AudioSettings } from "../types";

export class AudioManager {
  private static instance: AudioManager;
  private settings: AudioSettings = { 
    masterVolume: 0.5, 
    musicVolume: 0.5, 
    sfxVolume: 0.5, 
    muted: false 
  };
  private musicAudio: HTMLAudioElement | null = null;
  private currentMusicUrl: string | null = null;
  private contextResumed = false;
  private isDucking = false;
  private duckTimeout: any = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Call this on user interaction to unlock AudioContext if needed (browser policy)
  resumeContext() {
    if (this.contextResumed) return;

    if (this.musicAudio && this.musicAudio.paused && this.currentMusicUrl) {
        this.musicAudio.play()
            .then(() => { this.contextResumed = true; })
            .catch(() => {});
    }
    
    // Create a dummy audio to unlock the engine on iOS/Android
    const dummy = new Audio('');
    dummy.play().catch(() => {});
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applyVolume();
  }

  private applyVolume() {
    let effectiveMusicVol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.musicVolume;
    
    if (this.isDucking) {
        effectiveMusicVol *= 0.3; // Duck to 30% volume
    }

    if (this.musicAudio) {
      this.musicAudio.volume = Math.min(effectiveMusicVol, 1.0);
    }
  }

  private duckMusic(durationMs: number = 1500) {
      if (this.settings.muted) return;
      
      this.isDucking = true;
      this.applyVolume();

      if (this.duckTimeout) clearTimeout(this.duckTimeout);
      
      this.duckTimeout = setTimeout(() => {
          this.isDucking = false;
          this.applyVolume();
      }, durationMs);
  }

  playSfx(key: keyof typeof SOUNDS) {
    if (this.settings.muted) return;
    
    let effectiveSfxVol = this.settings.masterVolume * this.settings.sfxVolume;
    
    // Apply special balancing
    if (key === 'CAPTURE') {
        effectiveSfxVol *= 2.5; // Boost capture sound significantly (approx 2x previous)
    } else if (key === 'EVOLVE') {
        effectiveSfxVol *= 0.75; // Lower evolve sound
    }

    if (effectiveSfxVol <= 0) return;

    // Trigger ducking
    this.duckMusic(key === 'CAPTURE' ? 1000 : 2000);

    const url = SOUNDS[key];
    const audio = new Audio(url);
    // Ensure volume doesn't exceed 1.0
    audio.volume = Math.min(effectiveSfxVol, 1.0);
    audio.play().catch(e => console.warn("Audio play blocked", e));
  }

  playMusic(url: string, loop = true) {
    if (this.currentMusicUrl === url && this.musicAudio) {
      if (this.musicAudio.paused) {
          this.musicAudio.play().catch(e => console.warn("Resume blocked", e));
      }
      this.applyVolume(); 
      return;
    }

    this.stopMusic();
    
    this.currentMusicUrl = url;
    this.musicAudio = new Audio(url);
    this.musicAudio.loop = loop;
    this.applyVolume();
    this.musicAudio.play().then(() => {
        this.contextResumed = true;
    }).catch(e => console.warn("Music play blocked (autoplay policy)", e));
  }

  pauseMusic() {
    if (this.musicAudio) {
        this.musicAudio.pause();
    }
  }
  
  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
      this.musicAudio = null;
      this.currentMusicUrl = null;
    }
  }
}