import { Injectable, signal } from '@angular/core';

export type ConsentSource = 'create' | 'share' | 'connect';
export interface TrackedEvent {
  event_id: string;
  event_name: string;
  timestamp: string;
  session_id: string;
  visitor_id: string;
  user_id?: string;
  device: string;
  utm_source: string;
  theme_id?: string;
  [key: string]: unknown;
}
const PREFIX = 'ttwr.event.';

@Injectable({ providedIn: 'root' })
export class MarTechService {
  readonly events = signal<TrackedEvent[]>([]);
  readonly storageError = signal(false);
  readonly consentGranted = signal(localStorage.getItem('ttwr.consent') === 'granted');
  private visitorId = this.id('ttwr.visitor', localStorage, 'V');
  private sessionId = this.id('session_id', sessionStorage, 'S');
  private started = false;
  private lastTimestamp = 0;

  constructor() {
    this.reload();
    window.addEventListener('storage', () => {
      this.reload();
      this.consentGranted.set(localStorage.getItem('ttwr.consent') === 'granted');
    });
  }

  private id(key: string, storage: Storage, prefix: string): string {
    let value = storage.getItem(key);
    if (!value) { value = `${prefix}_${crypto.randomUUID()}`; storage.setItem(key, value); }
    return value;
  }

  private reload(): void {
    const events: TrackedEvent[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      try {
        const event = JSON.parse(localStorage.getItem(key) || 'null');
        if (event?.event_id && event?.event_name && event?.timestamp) events.push(event);
      } catch { /* Ignore a damaged record without discarding other events. */ }
    }
    this.events.set(events.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  }

  enterCustomerPage(path: string): void {
    const source = new URLSearchParams(location.search).get('utm_source');
    if (source) sessionStorage.setItem('utm_source', source);
    if (!this.started) {
      this.started = true;
      if (!sessionStorage.getItem('ttwr.started')) {
        sessionStorage.setItem('ttwr.started', '1');
        this.trackEvent('session_start');
        const first = localStorage.getItem('ttwr.first_visit');
        if (first) {
          const days = (Date.now() - Date.parse(first)) / 86400000;
          if (days <= 7) this.trackEvent('return_visit', { days_since_first_visit: days });
        } else localStorage.setItem('ttwr.first_visit', new Date().toISOString());
      }
    }
    if (path === '/home' || path === '/page1' || path === '/') this.trackEvent('landing_page_view');
  }

  trackEvent(eventName: string, customData: Record<string, unknown> = {}): TrackedEvent {
    this.lastTimestamp = Math.max(Date.now(), this.lastTimestamp + 1);
    const event: TrackedEvent = {
      ...customData,
      event_id: crypto.randomUUID(), event_name: eventName, timestamp: new Date(this.lastTimestamp).toISOString(),
      session_id: this.sessionId, visitor_id: this.visitorId,
      user_id: localStorage.getItem('ttwr.user') || undefined,
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      utm_source: sessionStorage.getItem('utm_source') || 'direct',
      theme_id: String(customData['theme_id'] || sessionStorage.getItem('theme_id') || ''),
      ab_group: localStorage.getItem('ttwr.ab_group') || undefined,
    };
    try { localStorage.setItem(PREFIX + event.event_id, JSON.stringify(event)); }
    catch { this.storageError.set(true); }
    this.events.update(events => [...events, event]);
    return event;
  }

  withdrawConsent(visitorId:string):boolean {
    const subject=[...this.events()].reverse().find(e=>e.visitor_id===visitorId&&e.event_name==='marketing_consent_granted');
    if (!subject) return false;
    const event:TrackedEvent={...subject,event_id:crypto.randomUUID(),event_name:'marketing_consent_withdrawn',timestamp:new Date(Math.max(Date.now(),Date.parse(this.events().at(-1)?.timestamp||'')+1||Date.now())).toISOString(),actor:'admin',channel:'all'};
    try {
      localStorage.setItem(PREFIX+event.event_id,JSON.stringify(event));
      if(visitorId===this.visitorId){localStorage.setItem('ttwr.consent','withdrawn');this.consentGranted.set(false);}
      this.events.update(events=>[...events,event]);return true;
    } catch {this.storageError.set(true);return false;}
  }

  recordContact(contactType:string):void {
    this.id('ttwr.user', localStorage, 'U');
    this.trackEvent('contact_info_submitted', {contact_type:contactType});
  }

  grantConsent(source: ConsentSource, impressionId: string, contactType: string): void {
    this.recordContact(contactType);
    if (!localStorage.getItem('ttwr.ab_group')) {
      localStorage.setItem('ttwr.ab_group', crypto.getRandomValues(new Uint32Array(1))[0] % 2 ? 'A' : 'B');
    }
    this.trackEvent('marketing_consent_granted', { consent_source: source, consent_impression_id: impressionId });
    localStorage.setItem('ttwr.consent', 'granted');
    this.consentGranted.set(true);
  }
}
