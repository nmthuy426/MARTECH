// src/app/models/martech-events.model.ts
export enum MemoryThemeId {
  GACH_LEGO = 'gach_lego',   // Tháp Gạch Sắc Màu
  BUP_BE = 'bup_be',         // Búp Bê & Thú Bông
  BOARD_GAME = 'board_game', // Bàn Cờ & Boardgame
  CANH_DIEU = 'canh_dieu'    // Cánh Diều & Gió Lộng
}
export interface MemoryCardFormData {
  nickname: string;
  periodYear: string;
  eraCategory: string;
  storyText: string;
  photoUrl: string | null;
  theme_id: MemoryThemeId;
}

// Thuộc tính riêng cho event lỗi (Mục 2 trong Docs)
export type CardCreateErrorType = 'anh_qua_nang' | 'loi_tao_card' | 'mat_ket_noi';