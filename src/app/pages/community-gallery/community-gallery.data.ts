export interface CommunityMemory {
  id: string;
  nickname: string;
  themeId: string;
  themeLabel: string;
  story: string;
  year: string;
  toyEmoji: string;
  cardTone: 'yellow' | 'pink' | 'mint' | 'blue';
  ugcConsent: boolean;
  isDemo: boolean;
}

// Nội dung minh họa phục vụ demo microsite, không phải bài gửi thật của người tham gia.
export const COMMUNITY_MEMORIES: CommunityMemory[] = [
  {
    id: 'demo-001',
    nickname: 'Minh Anh',
    themeId: 'gach_lego',
    themeLabel: 'Tháp Gạch Sắc Màu',
    story: 'Ngày đó, cứ cuối tuần là mình lại bày hết hộp gạch ra sàn. Hai anh em thi xem ai xây được tòa tháp cao hơn, rồi vui nhất là lúc cùng nhau nghĩ ra những thành phố chẳng giống ai.',
    year: '2002',
    toyEmoji: '🧱',
    cardTone: 'yellow',
    ugcConsent: true,
    isDemo: true,
  },
  {
    id: 'demo-002',
    nickname: 'Bảo',
    themeId: 'bup_be',
    themeLabel: 'Búp Bê & Thú Bông',
    story: 'Chú gấu bông màu nâu luôn có một chỗ ngồi cạnh mình mỗi tối. Đi đâu cũng mang theo, đến mức mẹ bảo chắc chú gấu thuộc đường về nhà hơn cả mình.',
    year: '1999',
    toyEmoji: '🧸',
    cardTone: 'pink',
    ugcConsent: true,
    isDemo: true,
  },
  {
    id: 'demo-003',
    nickname: 'Gia Hân',
    themeId: 'board_game',
    themeLabel: 'Bàn Cờ & Boardgame',
    story: 'Mỗi lần cả nhà chơi cờ cá ngựa là phòng khách lại ồn như hội. Có hôm chơi đến quên cả giờ cơm, nhưng điều mình nhớ nhất vẫn là tiếng cười của mọi người.',
    year: '2005',
    toyEmoji: '🎲',
    cardTone: 'mint',
    ugcConsent: true,
    isDemo: true,
  },
  {
    id: 'demo-004',
    nickname: 'Hoàng Nam',
    themeId: 'canh_dieu',
    themeLabel: 'Cánh Diều & Gió Lộng',
    story: 'Chiếc diều giấy được hai ông cháu tự dán bằng giấy báo. Có hôm diều chẳng bay cao, nhưng ông vẫn kiên nhẫn chạy cùng mình hết con đường làng.',
    year: '1997',
    toyEmoji: '🪁',
    cardTone: 'blue',
    ugcConsent: true,
    isDemo: true,
  },
  {
    id: 'demo-005',
    nickname: 'An Nhiên',
    themeId: 'gach_lego',
    themeLabel: 'Tháp Gạch Sắc Màu',
    story: 'Mình từng dành cả buổi chiều để lắp một căn nhà nhỏ cho những nhân vật tí hon. Căn nhà cứ được tháo ra rồi xây lại, giống như trí tưởng tượng ngày ấy chẳng bao giờ hết.',
    year: '2007',
    toyEmoji: '🏠',
    cardTone: 'yellow',
    ugcConsent: true,
    isDemo: true,
  },
  {
    id: 'demo-006',
    nickname: 'Tuấn Kiệt',
    themeId: 'board_game',
    themeLabel: 'Bàn Cờ & Boardgame',
    story: 'Bộ xếp hình cũ là món đồ chơi cả nhóm bạn chuyền tay nhau. Mỗi người góp một ý tưởng, cuối cùng chẳng ai nhớ ban đầu định lắp thứ gì nữa.',
    year: '2001',
    toyEmoji: '🧩',
    cardTone: 'mint',
    ugcConsent: false,
    isDemo: true,
  },
];
