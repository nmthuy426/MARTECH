import { CampaignAdminStore } from '../../services/campaign-admin-store';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MemoryThemeId, MemoryCardFormData } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';

@Component({
  selector: 'app-page3-create',
  templateUrl: './page3-create.html',
  styleUrls: ['./page3-create.css'],
  imports: [CommonModule, FormsModule],
})
export class Page3Create implements OnInit {
  // Dữ liệu nhập vào Form
  nickname: string = '';
  periodYear: string = '';
  eraCategory: string = '2000s';
  storyText: string = '';
  galleryConsent: boolean = false;
  voucherConsent: boolean = false;

  // Trạng thái UI & Storage
  selectedTheme: MemoryThemeId = MemoryThemeId.GACH_LEGO;
  previewImageSrc: string | null = null;
  wordCount: number = 0;
  isProcessing: boolean = false;
  progressPercent: number = 0;

  constructor(
    private router: Router,
    private adminStore: CampaignAdminStore,
    private marTechService: MarTechService
  ) {}

  ngOnInit(): void {
    // 1. Đọc lại theme_id chuẩn đã lưu từ Trang 2
    const savedTheme = sessionStorage.getItem('theme_id') as MemoryThemeId;
    if (savedTheme) {
      this.selectedTheme = savedTheme;
    }

    // 2. Bắn Event: Xem bước tải ảnh (Giai đoạn 3.2 trong Docs)
    this.marTechService.trackEvent('photo_step_view', {
      theme_id: this.selectedTheme
    });
  }

  private formStarted = false;

  // Đếm số từ trong câu chuyện
  onStoryInput(): void {
    this.trackFormStart();
    const trimmed = this.storyText.trim();
    this.wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  }

  trackFormStart(): void {
    if (!this.formStarted) {
      this.formStarted = true;
      this.marTechService.trackEvent('story_form_start');
    }
  }

  // Chèn nhanh Mood Tag
  addMood(mood: string): void {
    this.storyText += (this.storyText ? ' ' : '') + `[${mood}]`;
    this.onStoryInput();
  }

  // Event 3.2: Tải ảnh từ máy tính
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Kiểm tra file quá 15MB
      if (file.size > 15 * 1024 * 1024) {
        this.marTechService.trackEvent('memory_card_create_fail', {
          theme_id: this.selectedTheme,
          error_type: 'anh_qua_nang'
        });
        alert('File ảnh quá lớn! Vui lòng chọn ảnh dưới 15MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewImageSrc = e.target?.result as string;

        // Bắn Event: Upload ảnh thành công
        this.marTechService.trackEvent('memory_photo_upload', {
          theme_id: this.selectedTheme
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Event 3.2: Bỏ qua / Xóa ảnh
  removePhoto(): void {
    this.previewImageSrc = null;
    this.marTechService.trackEvent('photo_step_skip', {
      theme_id: this.selectedTheme
    });
  }

  // Chọn ảnh mẫu Preset
  selectPreset(presetType: string): void {
    const presets: Record<string, string> = {
      brick: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT9AJA3oglZu9OxZQCaQB5qmz8QvbWuP0QLvP_iKdzcytIF5K8FiCdhgoipcwB4nnWViRCKjKUlZRa-1s7LVnzP8q7To8clZJMWXnkCkUxuSntZKVg09UA6qefyFr7KaP9Q-EPjkZiCpbRylfY_led7VQT8Nb0mQ-3Gifsh3FUm2ir3qDgkaaZqePODpBxs7sm3W6dkx68Shw9SkR7j5U6o-U6S4dbUetAwoELgDk',
      tamiya: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDftwyaek1dSd3fOkHNh-HvmIiMdEy2Uctwvo87uZuaj3nNozZfuvFwOjtgL7wKUzWS-ajk7cldMok6A-UDvL695EN4Q1HQWhngZaQq1X1Bpf4jU5bC_Zu2pYEiuxAmmyrX2PRJ_cN1BxEcSHAmU7J9y6tijnvMtkdTz36aDI6dl_RdmI5YuIwfymUnbzQILFFYMmzRX8kbpwfT82L7Fr81zmA3NTvNTp0OT6vTXN0',
      tamagotchi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-ZXh5VDXCB9PNh8PotYAVNgaoZHhJpYZSPgc4FSEqcoSBFvVnZkiq8P0xMW9M0Xsh_YVPQoYscON6c4OWvjdDF0dQCVu2pIfBXfASodyKp9M1ZZHeeJEBqrhOgMQgXSZDlECODmtJxvgbUDeE0pA0pxslBJUtrvAo_v_hObSom_JfMG4cK4ZzTeI2eO9gtsOWZgpMLEHFkObhjHL0yN5vLEvuy-n3wjJlGhyS9fE',
      doll: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClPn_Icx7s5tAys70nelSBcMSXlMDt8B56uGZXcWXGOHvK5KmBbYPYtMmK_gTiJYzIRuxPslPFw7NVEFj6svAgidNegkgbZ2_RkKbHuAISAlg7nZwSIIF6D7QfaRcNrtOrYTeDKT4f_g9PKRHV5cYqxI5qnnVDTVFW0gXITPAQpbOh1o4S3yvmJQQ-Ur3CcH37NDXQmD2zR53flDdNRVYso7Xl2srrDs7sMVzlzTo'
    };

    if (presets[presetType]) {
      this.previewImageSrc = presets[presetType];
      this.marTechService.trackEvent('memory_photo_upload', {
        theme_id: this.selectedTheme,
        preset_used: presetType
      });
    }
  }

  // Submit Form - Đúc Thẻ Memory Card (Giai đoạn 3.3, 3.4, 3.5)
 // Hàm onSubmit() trong page3-create.component.ts
onSubmit(): void {
  if (this.isProcessing) return;
  this.trackFormStart();
  if (!this.nickname.trim()) {
    alert('Vui lòng nhập Biệt danh tuổi thơ của bạn nhé!');
    return;
  }

  // 💡 MẸO HAY: Nếu chưa có ảnh upload, tự động lấy ảnh demo mặc định!
  const defaultPhoto = this.previewImageSrc || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZhzjbUO2QZGf3nrMjfdcY9ZSFh3hBLhtSL04mr217yFbW8nce6qVkuYdcLTJr7CNIdyCKYwJmFpNSUj_nnDTzGCrIixbRYGK-cBbP12j-Lx13XrVdikVW080gDVBJ69ONQgkEUewK8eW7zyVTutu9wY1uEGtW6a7suK4C-BiNYB1VmCnOg8IYqhnyWRQuzLY9Xx5zw5sJxdb8oLuObjt-AjpJ_fXQ5Aw7QEn2uek';

  this.isProcessing = true;
  this.progressPercent = 0;

  const interval = setInterval(() => {
    this.progressPercent += 25;

    if (this.progressPercent >= 100) {
      clearInterval(interval);

      // Đóng gói dữ liệu chuyển sang Trang 4
      const cardData = {
        nickname: this.nickname,
        periodYear: this.periodYear || '199x',
        eraCategory: this.eraCategory,
        storyText: this.storyText || 'Kỷ niệm tuổi thơ thật êm đềm...',
        photoUrl: defaultPhoto,
        theme_id: this.selectedTheme
      };

      sessionStorage.setItem('memory_card_data', JSON.stringify(cardData));
      const storedStory = this.adminStore.captureStory(cardData, this.galleryConsent);
      if(storedStory)sessionStorage.setItem('ttwr.current_story',storedStory.id);
      const storyMeta = {story_id:storedStory?.id,card_id:storedStory?.cardId};
      this.marTechService.trackEvent('story_submit_success', { ...storyMeta, theme_id: this.selectedTheme, story_length: this.storyText.length });
      this.marTechService.trackEvent('memory_card_create_success', { ...storyMeta, theme_id: this.selectedTheme });
      if (this.galleryConsent) {
        this.marTechService.trackEvent('ugc_usage_consent_granted', storyMeta);
        this.marTechService.trackEvent('ugc_submission', storyMeta);
      }

      setTimeout(() => {
        this.isProcessing = false;
        this.router.navigate(['/page4']);
      }, 300);
    }
  }, 200);
}
}