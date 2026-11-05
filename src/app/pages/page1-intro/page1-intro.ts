import { MarTechService } from '../../services/martech-service';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-page1-intro',
  templateUrl: './page1-intro.html',
  styleUrl: './page1-intro.css',
  imports: [RouterLink],
})
export class Page1IntroComponent implements AfterViewInit {
  @ViewChild('retroSoundBtn') soundBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('soundStatus') soundStatus!: ElementRef<HTMLSpanElement>;
  @ViewChild('heroCta') heroCta!: ElementRef<HTMLAnchorElement>;

  private audioCtx: AudioContext | null = null;

  constructor(private router: Router, private tracking: MarTechService) {}

  ngAfterViewInit(): void {
    this.initEventListeners();
  }

  startJourney(): void {
    this.tracking.trackEvent('journey_start_click');
    this.playRetroBeep(880, 'square', 0.15);
    this.router.navigate(['/choose-memory']);
  }

  private initEventListeners(): void {
    if (this.soundBtn?.nativeElement) {
      this.soundBtn.nativeElement.addEventListener('click', () => {
        this.playRetroBeep(587.33, 'square', 0.08);
        setTimeout(() => this.playRetroBeep(880, 'square', 0.15), 90);

        if (this.soundStatus?.nativeElement) {
          this.soundStatus.nativeElement.innerText = '✨ [TING! Bạn vừa kích hoạt âm thanh ký ức]';
          this.soundStatus.nativeElement.className = 'font-label-md text-label-md text-electric-red font-bold';
        }
      });
    }

    if (this.heroCta?.nativeElement) {
      this.heroCta.nativeElement.addEventListener('mouseenter', () => {
        this.playRetroBeep(659.25, 'triangle', 0.05);
      });
    }
  }

  private playRetroBeep(
    freq: number = 440,
    type: OscillatorType = 'square',
    duration: number = 0.12
  ): void {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc: OscillatorNode = this.audioCtx.createOscillator();
      const gain: GainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext not allowed yet:', e);
    }
  }
}