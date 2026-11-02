import { ConsentPrompt } from '../../components/consent-prompt/consent-prompt';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryCardFormData, MemoryThemeId } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';


@Component({
  selector: 'app-page4-memory',
  imports: [ConsentPrompt],
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
  sharePromptVisible = false;
  shareCard(): void {
    this.marTechService.trackEvent('share_click', {share_channel:'facebook'});
    this.sharePromptVisible = true;
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.origin), '_blank', 'noopener,noreferrer');
  }
  // Thêm/Kiểm tra hàm này trong page4-memory.component.ts

goToPage5(): void {
  // 1. Bắn event MarTech tracking khi click khám phá đồ chơi gợi ý
  this.marTechService.trackEvent('product_collection_click', {
    theme_id: this.cardData.theme_id
  });

  // 2. Chuyển sang Trang 5
  this.router.navigate(['/page5']);
}
}