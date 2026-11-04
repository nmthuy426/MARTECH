import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryCardFormData, MemoryThemeId } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';


@Component({
  selector: 'app-page4-memory',
  templateUrl: './page4-memory.html',
  styleUrls: ['./page4-memory.css']
})
export class Page4Memory implements OnInit {
  // Biến lưu dữ liệu thẻ bài (Mặc định nếu chưa có dữ liệu)
  cardData: MemoryCardFormData = {
    nickname: 'Cu Tí Xóm Chùa',
    periodYear: '1998',
    eraCategory: '90s',
    storyText: 'Chiến tích trốn ngủ trưa nhịn ăn sáng gom tiền mua đồ chơi...',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZhzjbUO2QZGf3nrMjfdcY9ZSFh3hBLhtSL04mr217yFbW8nce6qVkuYdcLTJr7CNIdyCKYwJmFpNSUj_nnDTzGCrIixbRYGK-cBbP12j-Lx13XrVdikVW080gDVBJ69ONQgkEUewK8eW7zyVTutu9wY1uEGtW6a7suK4C-BiNYB1VmCnOg8IYqhnyWRQuzLY9Xx5zw5sJxdb8oLuObjt-AjpJ_fXQ5Aw7QEn2uek',
    theme_id: MemoryThemeId.GACH_LEGO
  };

  // Connect – Nurture: optional contact capture (demo/local storage only)
  contactValue = '';
  marketingConsent = false;
  ugcConsent = false;
  contactSaved = false;
  contactMessage = '';
  isDownloading = false;

  constructor(
    private marTechService: MarTechService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Đọc dữ liệu đúc từ Trang 3
    const savedData = sessionStorage.getItem('memory_card_data');
    if (savedData) {
      try {
        this.cardData = JSON.parse(savedData);
      } catch (e) {
        console.error('Lỗi parse dữ liệu từ Trang 3:', e);
      }
    }

    // 2. Bắn Event Tracking MarTech (Giai đoạn 4.1 trong Docs)
    this.marTechService.trackEvent('memory_card_preview', {
      theme_id: this.cardData.theme_id
    });
  }
  saveConnectPreferences(): void {
    const contact = this.contactValue.trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikePhone = /^\+?[0-9\s().-]{9,15}$/.test(contact);

    if (contact && !looksLikeEmail && !looksLikePhone) {
      this.contactMessage = 'Vui lòng nhập email hoặc số điện thoại hợp lệ.';
      return;
    }
    if (!contact && this.marketingConsent) {
      this.contactMessage = 'Để nhận thông tin từ MyKingdom, bạn cần cung cấp email hoặc số điện thoại. Bạn vẫn có thể lưu riêng lựa chọn chia sẻ Gallery.';
      return;
    }
    if (!contact && !this.ugcConsent) {
      this.contactMessage = 'Bạn có thể bỏ qua bước này và tải Memory Card như bình thường.';
      return;
    }

    // Demo only: contact/consent data stays in this browser, not a backend.
    if (contact) {
      const record = {
        contact,
        contact_type: looksLikeEmail ? 'email' : 'phone',
        marketing_consent: this.marketingConsent,
        ugc_consent: this.ugcConsent,
        theme_id: this.cardData.theme_id,
        session_id: sessionStorage.getItem('session_id') || null,
        created_at: new Date().toISOString(),
        data_type: 'demo_local',
      };
      const storageKey = 'martech_connect_demo_records';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push(record);
      localStorage.setItem(storageKey, JSON.stringify(existing));

      this.marTechService.trackEvent('contact_info_submitted', {
        contact_type: record.contact_type,
        marketing_consent: this.marketingConsent,
        ugc_consent: this.ugcConsent,
        theme_id: this.cardData.theme_id,
        data_type: 'demo_local',
      });
      this.marTechService.trackEvent(
        this.marketingConsent ? 'marketing_consent_granted' : 'marketing_consent_declined',
        { theme_id: this.cardData.theme_id, data_type: 'demo_local' }
      );
    }

    // UGC consent is independent from marketing consent and contact capture.
    if (this.ugcConsent) {
      const themeDetails: Record<string, { label: string; emoji: string; tone: 'yellow' | 'pink' | 'mint' | 'blue' }> = {
        gach_lego: { label: 'Tháp Gạch Sắc Màu', emoji: '🧱', tone: 'yellow' },
        bup_be: { label: 'Búp Bê & Thú Bông', emoji: '🧸', tone: 'pink' },
        board_game: { label: 'Bàn Cờ & Boardgame', emoji: '🎲', tone: 'mint' },
        canh_dieu: { label: 'Cánh Diều & Gió Lộng', emoji: '🪁', tone: 'blue' },
      };
      const theme = themeDetails[this.cardData.theme_id] || themeDetails['gach_lego'];
      const galleryRecord = {
        id: `local-${Date.now()}`,
        nickname: this.cardData.nickname,
        themeId: this.cardData.theme_id,
        themeLabel: theme.label,
        story: this.cardData.storyText,
        year: this.cardData.periodYear || '199x',
        toyEmoji: theme.emoji,
        cardTone: theme.tone,
        ugcConsent: true,
        isDemo: false,
      };
      const galleryKey = 'community_user_memories';
      const galleryRecords = JSON.parse(localStorage.getItem(galleryKey) || '[]');
      galleryRecords.push(galleryRecord);
      localStorage.setItem(galleryKey, JSON.stringify(galleryRecords));
    }

    this.marTechService.trackEvent(
      this.ugcConsent ? 'ugc_usage_consent_granted' : 'ugc_usage_consent_declined',
      { theme_id: this.cardData.theme_id, data_type: 'demo_local' }
    );

    this.contactSaved = true;
    this.contactMessage = this.marketingConsent
      ? 'Đã lưu lựa chọn trong bản demo. Bạn chỉ được đưa vào luồng marketing mô phỏng khi đã đồng ý.'
      : this.ugcConsent
        ? 'Đã lưu lựa chọn chia sẻ Gallery trên trình duyệt này. Bạn không được đưa vào luồng marketing follow-up.'
        : 'Đã lưu lựa chọn trong bản demo. Bạn sẽ không được đưa vào luồng marketing follow-up.';
  }

  skipConnect(): void {
    this.marTechService.trackEvent('connect_step_skipped', {
      theme_id: this.cardData.theme_id,
    });
    this.contactMessage = 'Bạn đã bỏ qua bước kết nối. Hãy tiếp tục tải Memory Card nhé!';
  }

  async downloadMemoryCard(): Promise<void> {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not supported in this browser.');

      // Recreate the existing retro trading-card visual as a crisp PNG.
      const frame = ctx.createLinearGradient(0, 0, 1200, 1500);
      frame.addColorStop(0, '#FFD600');
      frame.addColorStop(0.5, '#FF4FA3');
      frame.addColorStop(1, '#8CE8C0');
      ctx.fillStyle = frame;
      ctx.fillRect(0, 0, 1200, 1500);
      ctx.fillStyle = '#F8F0DC';
      ctx.fillRect(42, 42, 1116, 1416);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 12;
      ctx.strokeRect(42, 42, 1116, 1416);

      ctx.fillStyle = '#FFD600';
      ctx.fillRect(54, 54, 1092, 116);
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 38px Arial, sans-serif';
      ctx.fillText('★ THE TOYS WE REMEMBER ★', 88, 126);
      ctx.font = 'bold 25px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('MYKINGDOM x RETRO', 1100, 126);
      ctx.textAlign = 'left';

      const photoTop = 210;
      const photoHeight = 650;
      ctx.fillStyle = '#111111';
      ctx.fillRect(88, photoTop, 1024, photoHeight);
      try {
        const photo = await this.loadCardImage(this.cardData.photoUrl || '');
        const scale = Math.max(1024 / photo.width, photoHeight / photo.height);
        const sw = 1024 / scale;
        const sh = photoHeight / scale;
        const sx = (photo.width - sw) / 2;
        const sy = (photo.height - sh) / 2;
        ctx.drawImage(photo, sx, sy, sw, sh, 88, photoTop, 1024, photoHeight);
      } catch {
        ctx.fillStyle = '#FFD600';
        ctx.font = 'bold 100px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦', 600, 570);
        ctx.textAlign = 'left';
      }
      ctx.fillStyle = 'rgba(17,17,17,0.88)';
      ctx.fillRect(112, 790, 240, 58);
      ctx.fillStyle = '#FFD600';
      ctx.font = 'bold 38px Arial, sans-serif';
      ctx.fillText(this.cardData.periodYear || '199x', 132, 832);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(88, 900, 1024, 260);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 6;
      ctx.strokeRect(88, 900, 1024, 260);
      ctx.fillStyle = '#E83E78';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText('✦ ORIGINAL STORY', 122, 960);
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.fillText(`${this.cardData.nickname} · ${this.cardData.periodYear || '199x'}`, 122, 1028);
      ctx.font = 'italic 34px Arial, sans-serif';
      this.drawWrappedText(ctx, this.cardData.storyText || 'Kỷ niệm tuổi thơ thật êm đềm...', 122, 1090, 950, 46, 2);

      ctx.fillStyle = '#111111';
      ctx.fillRect(88, 1200, 1024, 3);
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText('MYKINGDOM CERTIFIED NOSTALGIA', 88, 1260);
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('SERIES 01 · THE TOYS WE REMEMBER', 88, 1305);
      ctx.textAlign = 'right';
      ctx.fillText('A MEMORY TO KEEP', 1112, 1400);
      ctx.textAlign = 'left';

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not create PNG.')), 'image/png');
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `the-toys-we-remember-${this.safeFileName(this.cardData.nickname)}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.marTechService.trackEvent('memory_card_download', {
        theme_id: this.cardData.theme_id,
        file_type: 'png',
      });
    } catch (error) {
      console.error('Memory Card download failed:', error);
      alert('Chưa thể tải ảnh ở thời điểm này. M thử lại bằng trình duyệt Chrome nhé.');
    } finally {
      this.isDownloading = false;
    }
  }

  private loadCardImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (!src.startsWith('data:')) image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Card image could not be loaded.'));
      image.src = src;
    });
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number,
  ): void {
    const words = text.split(/\s+/);
    let line = '';
    let lineNumber = 0;
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y + lineNumber * lineHeight);
        lineNumber++;
        line = word;
        if (lineNumber >= maxLines - 1) break;
      } else {
        line = testLine;
      }
    }
    if (lineNumber < maxLines) {
      ctx.fillText(lineNumber === maxLines - 1 ? `${line.slice(0, 70)}${line.length > 70 ? '…' : ''}` : line, x, y + lineNumber * lineHeight);
    }
  }

  private safeFileName(value: string): string {
    return (value || 'memory-card').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'memory-card';
  }

  // Thêm/Kiểm tra hàm này trong page4-memory.component.ts

goToPage5(): void {
  // 1. Bắn event MarTech tracking khi click khám phá đồ chơi gợi ý
  this.marTechService.trackEvent('recommendation_click', {
    theme_id: this.cardData.theme_id
  });

  // 2. Chuyển sang Trang 5
  this.router.navigate(['/page5']);
}
}