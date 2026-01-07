
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
  private checkAudio: HTMLAudioElement | null = null;
  private currentMusicUrl: string | null = null;
  private contextResumed = false;
  private isDucking = false;
  private isInCheck = false;
  private duckTimeout: any = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  resumeContext() {
    if (this.contextResumed) return;

    if (this.musicAudio && this.musicAudio.paused && this.currentMusicUrl) {
        this.musicAudio.play()
            .then(() => { this.contextResumed = true; })
            .catch(() => {});
    }
    
    const dummy = new Audio('');
    dummy.play().catch(() => {});
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applyVolume();
  }

  private applyVolume() {
    let effectiveMusicVol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.musicVolume;
    let effectiveSfxVol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.sfxVolume;

    if (this.isInCheck) {
        effectiveMusicVol = 0;
    } else if (this.isDucking) {
        effectiveMusicVol *= 0.3;
    }

    if (this.musicAudio) {
      this.musicAudio.volume = Math.min(effectiveMusicVol, 1.0);
    }
    
    if (this.checkAudio) {
      this.checkAudio.volume = Math.min(effectiveSfxVol, 1.0);
    }
  }

  private duckMusic(durationMs: number = 1500) {
      if (this.settings.muted || this.isInCheck) return;
      
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
    
    if (key === 'CHECK') return; 

    let effectiveSfxVol = this.settings.masterVolume * this.settings.sfxVolume;
    
    if (key === 'CAPTURE') {
        effectiveSfxVol *= 2.5;
    } else if (key === 'EVOLVE') {
        effectiveSfxVol *= 0.75;
    }

    if (effectiveSfxVol <= 0) return;

    this.duckMusic(key === 'CAPTURE' ? 1000 : 2000);

    const url = SOUNDS[key];
    const audio = new Audio(url);
    
    audio.volume = Math.min(effectiveSfxVol, 1.0);
    audio.play().catch(e => console.warn("Audio play blocked", e));
  }
  
  playCheckSound() {
    if (this.settings.muted) return;
    
    if (this.isInCheck && this.checkAudio) return;
    
    this.isInCheck = true;
    this.applyVolume();

    if (this.checkAudio) {
        this.checkAudio.pause();
        this.checkAudio = null;
    }

    const url = SOUNDS.CHECK;
    this.checkAudio = new Audio(url);
    this.checkAudio.loop = true;
    
    let effectiveSfxVol = this.settings.masterVolume * this.settings.sfxVolume;
    this.checkAudio.volume = Math.min(effectiveSfxVol, 1.0);
    
    this.checkAudio.play().catch(e => {
        console.warn("Check audio play blocked", e);
    });
  }

  stopCheckSound(restoreMusic = true) {
    if (this.checkAudio) {
        this.checkAudio.pause();
        this.checkAudio.currentTime = 0;
        this.checkAudio = null;
    }
    
    if (restoreMusic && this.isInCheck) {
        this.isInCheck = false;
        this.applyVolume();
    } else if (!restoreMusic) {
    } else {
        this.isInCheck = false;
    }
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
