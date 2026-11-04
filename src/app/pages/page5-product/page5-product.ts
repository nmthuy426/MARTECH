import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MemoryThemeId } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';

interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  themeId: MemoryThemeId;
  matchRate: number;
  originalPrice: string;
  salePrice: string;
  discountBadge: string;
  badgeTag: string;
  stockStatus: string;
  imageUrl: string;
  ageRange: string;
  description: string;
  productUrl: string;
}

@Component({
  selector: 'app-page5-products',
  templateUrl: './page5-product.html',
  styleUrls: ['./page5-product.css'],
  imports: [CommonModule],
})
export class Page5Product implements OnInit {
  selectedTheme: MemoryThemeId = MemoryThemeId.GACH_LEGO;
  userNickname: string = '';

  // Danh sách sản phẩm gợi ý cá nhân hóa theo Theme
  products: RecommendedProduct[] = [
    {
      id: 'lego-classic-10698',
      name: 'LEGO CLASSIC THÙNG GẠCH SÁNG TẠO LỚN',
      category: 'XẾP HÌNH SÁNG TẠO',
      themeId: MemoryThemeId.GACH_LEGO,
      matchRate: 99,
      originalPrice: '1.699.000₫',
      salePrice: '1.299.000₫',
      discountBadge: 'TIẾT KIỆM -24%',
      badgeTag: 'TOP VINTAGE PICK',
      stockStatus: 'CÒN HÀNG SẴN',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI5DqeGBLPIUwvy7tBXUAcebCN9TVX5I5L2yxpVbgu2Y-YdwrCezoe_HwT-qXMXH5YLXxXIK7tIQLebRolU42DmG12fP42zVHTaOIzGc4uiWelHSOMkI5PfmLpDfUG_IAerB1JnkiN_X7QdqZc_9zxv_27gTP03b_EB7XYk0xtOQTmNE-w_CkXj8GnvcbPG2V20F3jIlXabVn3guXKfmxvYumEo3Adshq4EXj6c38',
      ageRange: 'ĐỘ TUỔI: 4 - 99 TUỔI',
      description: 'Tái hiện ngôi nhà ngói đỏ, xe kéo gỗ và những mô hình bạn từng xếp thời bé.',
      productUrl: 'https://MyKingdom.com'
    },
    {
      id: 'barbie-retro-signature',
      name: 'BÚP BÊ BARBIE SIGNATURE RETRO EDITION',
      category: 'BÚP BÊ & SƯU TẦM',
      themeId: MemoryThemeId.BUP_BE,
      matchRate: 97,
      originalPrice: '1.150.000₫',
      salePrice: '899.000₫',
      discountBadge: 'GIẢM -22%',
      badgeTag: 'BARBIE SIGNATURE',
      stockStatus: 'CHỈ CÒN 8 HỘP',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcqJhHQuv9TUFTcUt1kh_q8o8XUuyyZBAxjLgJZzl6vgpvHgD3z47vKpKbenMKN0Js0Hq_rCfF_c64hUPh0-t2ApNhh1aI_bFRc9_Yzu8LsdOI9Jm2PsbBsvSrZDsW3XAxhA3q2WQY7v3JcfIbHnyt4J9h4pwhJ6honNHn3aVRXBKV9PZj9rEXR8QQ1QoEm9YntxS0HtXsBeXDScbCmwp_P4tDUhfu9_GTOzDFAdU',
      ageRange: 'SƯU TẦM CAO CẤP',
      description: 'Cô búp bê từng làm bao cô bé 8x-9x mê mẩn, nay trở lại với phục trang hoài niệm nguyên bản.',
      productUrl: 'https://MyKingdom.com'
    },
    {
      id: 'monopoly-vintage-wood',
      name: 'CỜ TỶ PHÚ MONOPOLY NOSTALGIA VINTAGE',
      category: 'BOARD GAME GIA ĐÌNH',
      themeId: MemoryThemeId.BOARD_GAME,
      matchRate: 98,
      originalPrice: '950.000₫',
      salePrice: '750.000₫',
      discountBadge: 'ƯU ĐÃI -21%',
      badgeTag: 'VINTAGE WOOD BOX',
      stockStatus: 'BÁN CHẠY NHẤT',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvWP9zM88ddTaNS_LnvYWeZkM2Sm_YrOFrKK7HonzhnyRZJ6FqFRJoZE1XkOP4iexFZ86ZuzO3MTkVKpuQSQSY1GiNBX4XQDeaJn-5NSYY6HEJhGsGaU_q3Fc-Nw7bNAK2_ygU-OfWClHmp5no0mSNOUYcwaMb-LUmzedtXsyaJAGQBkX7P9gUVsBNIATn8s54jrCJtGssQMzmubgfPRuvliBZG7ojMHzE0PSlKe8',
      ageRange: 'PHIÊN BẢN GỖ HOÀI NIỆM',
      description: 'Những buổi chiều hè cả xóm quây quần mua nhà. Hộp gỗ lưu giữ tiếng cười rôm rả năm xưa.',
      productUrl: 'https://MyKingdom.com'
    }
  ];

  constructor(
    private router: Router,
    private marTechService: MarTechService
  ) {}

  ngOnInit(): void {
    // 1. Đọc Theme và Nickname đã chọn từ Session Storage
    const savedTheme = sessionStorage.getItem('theme_id') as MemoryThemeId;
    if (savedTheme) {
      this.selectedTheme = savedTheme;
    }

    const savedCard = sessionStorage.getItem('memory_card_data');
    if (savedCard) {
      try {
        const parsed = JSON.parse(savedCard);
        this.userNickname = parsed.nickname || '';
      } catch (e) {
        console.warn('Lỗi parse card data:', e);
      }
    }

    // 2. Bắn Event Tracking MarTech: Xem danh sách gợi ý sản phẩm (Giai đoạn 5.1 trong Docs)
    this.marTechService.trackEvent('recommendation_view', {
      theme_id: this.selectedTheme
    });
  }

  /**
   * Bắn event khi người dùng click vào nút mua sản phẩm (Chuyển sang MyKingdom.com)
   * Event: product_click (Giai đoạn 5.2 trong Docs)
   */
  onProductClick(product: RecommendedProduct): void {
    this.marTechService.trackEvent('product_click', {
      theme_id: this.selectedTheme,
      product_id: product.id,
      product_name: product.name,
      price: product.salePrice
    });

    window.open(product.productUrl, '_blank');
  }

  /**
   * Bắn event khi click banner xem toàn bộ cửa hàng MyKingdom
   */
  onVisitStoreClick(): void {
    this.marTechService.trackEvent('store_visit_click', {
      theme_id: this.selectedTheme
    });

    window.open('https://MyKingdom.com', '_blank');
  }
}