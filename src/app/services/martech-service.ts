import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MarTechService {
  private sessionId: string = '';

  constructor() {
    this.initSession();
  }

  // Khởi tạo Session ID ngẫu nhiên nếu chưa có
  private initSession(): void {
    let sId = sessionStorage.getItem('session_id');
    if (!sId) {
      sId = 'S_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      sessionStorage.setItem('session_id', sId);
    }
    this.sessionId = sId;
  }

  /**
   * Hàm bắn Event tracking chuẩn theo tài liệu MarTech Docs
   */
  trackEvent(eventName: string, customData: any = {}): void {
    const payload = {
      event_name: eventName,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: sessionStorage.getItem('user_id') || undefined,
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      utm_source: sessionStorage.getItem('utm_source') || 'direct',
      ...customData
    };

    // Log ra console để em và giảng viên dễ kiểm tra
    console.log(`📊 [MARTECH EVENT TRACKED]: ${eventName}`, payload);
  }
}
