# Bàn giao: Insight từ Gallery và tinh gọn Admin

> Người nhận: teammate phụ trách backend, có thể dùng AI hỗ trợ đọc và triển khai.
> Đây là brief giao việc, không phải thông báo hai task bên dưới đã hoàn thành.
> Đọc code hiện tại trước khi thay đổi. Chỉ làm hai task trong tài liệu này, giữ nguyên các luồng khác.

## 0. Bắt đầu — pull main rồi đọc context

**Quy trình mới theo chủ repo: làm và push trực tiếp trên `main`, không cần branch phụ hoặc PR. Quy trình này thay thế yêu cầu branch cá nhân trong bản bàn giao cũ.**

Trước khi sửa code, mở đúng repo, kiểm tra thay đổi có sẵn rồi lấy bản `main` mới nhất:

```bash
git status
git switch main
git pull --ff-only origin main
```

Nếu chưa có repo trên máy, clone trước rồi vào thư mục repo và chạy các bước trên. Nếu có thay đổi chưa lưu hoặc pull báo lịch sử phân kỳ, kiểm tra và xử lý công việc/conflict hiện có; không dùng reset --hard, xóa file hay force-push để bỏ qua.

Đọc theo thứ tự sau, rồi mới bắt đầu hai task:

1. `BACKEND-HANDOFF.md`: toàn bộ phạm vi, nghiệm thu, quy tắc dữ liệu và quy trình Git mới.
2. `README.md`, `package.json`, `angular.json`: cách chạy, dependency, build và cấu trúc project.
3. `GIFT-FLOW-README.md`, `ADMIN-README.md`: luồng Campaign, người nhận quà và vận hành Admin; đối chiếu code nếu mô tả cũ khác hiện trạng.
4. `src/app/app.routes.ts`, `src/app/pages/admin/admin.ts`, `admin.html`, `admin.css`: route, danh sách tab, deep link và bố cục cần tinh gọn.
5. `src/app/services/admin-data-source.ts`, `campaign-admin-store.ts`, `martech-service.ts`, `dashboard-analytics.ts`: nguồn mock/live, adapter, story, consent, event và cách tính KPI.
6. `src/app/pages/community-gallery/`, `src/app/pages/admin/livestream/`, `public/mock/mykingdom_campaign_mock_400.json`: corpus Gallery, phần phân tích hiện có và dữ liệu để triển khai insight mới.
7. `src/app/pages/admin/operations/`, `src/app/pages/admin/family/`, `src/app/services/family-crm.ts`, `gift-shop.ts`: các chức năng cần giữ khi gom tab và liên kết hồ sơ/đơn.
8. Các file `*.spec.ts` nằm cạnh những phần sẽ sửa; đọc generator/validator trong mục 3 nếu cần đổi schema.

Sau đó chạy project, mở Campaign và Admin hiện tại để hiểu hành vi thực tế. Không chỉ dựa vào brief để viết lại từ đầu.

## 1. Mục tiêu bàn giao

1. **Bổ sung phân tích câu chuyện Gallery:** Làm tương tự chức năng phân tích bình luận hiện có, nhưng đầu vào là nội dung các câu chuyện/Memory Card trong Gallery của campaign. Từ đó tổng hợp chủ đề, cảm xúc, trải nghiệm và nhu cầu nổi bật; mỗi insight phải có câu chuyện hoặc trích đoạn dẫn chứng, rồi đề xuất ý tưởng post/video phù hợp. Trong tab “Phân tích tương tác & Ý tưởng nội dung”, chia thành hai tab con: **“Bình luận & phản hồi”** và **“Insight ký ức Campaign”**.

2. **Tối ưu bố cục và điều hướng Admin:** Hiện có nhiều tab chính nên khá ngợp. Gom các chức năng liên quan thành khoảng 5–6 nhóm chính, đưa phần chi tiết vào tab con hoặc hồ sơ tương ứng. Ưu tiên những thông tin và thao tác quan trọng, giảm các bảng/nội dung lặp lại giữa các tab, nhưng vẫn giữ chức năng và dữ liệu hiện có. Đề xuất cách nhóm cụ thể nằm trong mục 5 của file bàn giao.

Không làm dự báo khả năng mua/rời bỏ, không tự đăng bài hoặc gửi email/Zalo. Không yêu cầu xây lại toàn bộ website hay chuyển framework để làm hai task này.

## 2. Context sản phẩm

Campaign khai thác ký ức đồ chơi tuổi thơ của phụ huynh: chọn chủ đề → kể chuyện/thêm ảnh → nhận Memory Card → tùy chọn chia sẻ Gallery hoặc tìm quà. Sau khi nhận thẻ, popup cho chọn quà cho bản thân, chơi cùng con hoặc tặng người khác. Cửa hàng demo có gợi ý theo người nhận, giỏ hàng, voucher, checkout và hồ sơ người nhận nếu được đồng ý lưu.

Admin phục vụ hiểu nhu cầu khách, quản lý nội dung/UGC, khách hàng và gia đình, chăm sóc, đơn hàng, consent và cấu hình. Phần phân tích hiện có đọc bình luận mẫu/nhập tay theo kênh TikTok/Facebook/YouTube, tổng hợp chủ đề và tạo nháp post/video **bằng quy tắc**, chưa gọi mô hình AI thật. Task mới bổ sung một nguồn insight khác: **câu chuyện ký ức của chính campaign**, không đổi tên phần bình luận rồi coi là đã làm xong.

- Repo: https://github.com/quynhtho1205/the-toys-we-remember
- Website: https://the-toys-we-remember.vercel.app/
- Campaign: `/home`, `/choose-memory`, `/create-memory`, `/memory-card`, `/gallery`, `/gift-shop`.
- Trang bộ sưu tập cũ vẫn tồn tại: `/recommended-toys`.
- Admin: `/admin`; tab phân tích hiện tại: `/admin?tab=livestream`.
- `main` hiện chứa Campaign và Admin đã tích hợp. **Lấy code từ `origin/main`, không lấy nhánh `microsite` cũ làm nền.**
- Baseline khi viết brief: `ca38d65`. Tài liệu này sẽ được commit sau baseline; khi bắt đầu vẫn cần lấy `origin/main` mới nhất.

## 3. Hiện trạng kỹ thuật và dữ liệu

Frontend dùng Angular 22 standalone components, TypeScript, Angular signals, CSS/Tailwind và Vitest. Hiện chưa có backend dùng chung: dữ liệu thao tác được lưu bằng localStorage/sessionStorage trong cùng origin của trình duyệt. Đừng giả định dữ liệu localhost đã tự xuất hiện trên Vercel hoặc một thiết bị khác.

Admin có hai nguồn dữ liệu:

- **Mock 400 khách**: đọc `public/mock/mykingdom_campaign_mock_400.json`; các thay đổi quản trị được lưu vào overlay riêng.
- **Thao tác trực tiếp**: event, story, hồ sơ và đơn demo được ghi khi người dùng thao tác trên Campaign.

Các tab phải dùng cùng nguồn đang chọn. Không ghi đè mock bằng dữ liệu thật, không nhập lặp mỗi lần tải trang. Hồ sơ/đơn demo dùng local storage, không phải hệ thống xác thực hay thanh toán thật. Nếu triển khai backend/AI thật trong phạm vi task 1, ghi rõ phần đã kết nối và phần còn mô phỏng; không đổi nhãn thành “AI đã phân tích” khi thực tế chỉ chạy mẫu cố định.

### Các file nên đọc trước

| File / thư mục | Vai trò |
| --- | --- |
| `src/app/app.routes.ts` | Route Campaign, Admin và cửa hàng demo |
| `src/app/pages/admin/admin.ts`, `admin.html`, `admin.css` | Danh sách tab, query param, bố cục và bộ lọc Admin |
| `src/app/pages/admin/livestream/` | Phân tích tương tác & Ý tưởng nội dung hiện có; tên thư mục/id cũ vẫn là livestream |
| `src/app/pages/admin/operations/` | Khách hàng, stories, UGC, automation, orders, consent, settings |
| `src/app/pages/admin/family/` | Hồ sơ gia đình/con, tư vấn và các chức năng CRM liên quan |
| `src/app/services/admin-data-source.ts` | Chọn mock/live, tải mock, adapter dữ liệu và overlay |
| `src/app/services/campaign-admin-store.ts` | Story, quyền UGC, duyệt/ẩn/nổi bật, cấu hình và các bản ghi quản trị |
| `src/app/pages/community-gallery/` | Gallery thực tế: nguồn dữ liệu, điều kiện hiện bài, sắp xếp, phân trang và popup |
| `src/app/services/martech-service.ts` | Event, định danh khách/phiên, marketing consent |
| `src/app/services/dashboard-analytics.ts` | KPI, phễu, consent và attribution |
| `src/app/services/family-crm.ts`, `gift-shop.ts` | Hồ sơ người nhận, liên kết gia đình/đơn và phạm vi đồng ý cá nhân hóa |
| `public/mock/mykingdom_campaign_mock_400.json` | Dataset gốc 400 khách |
| `scripts/generate_campaign_mock.py`, `personalize_campaign_mock.py`, `validate_campaign_mock.py` | Sinh, bổ sung nội dung và kiểm tra mock |
| `GIFT-FLOW-README.md`, `ADMIN-README.md` | Context bổ sung; nếu mô tả cũ khác code, đối chiếu code và brief này |

## 4. Task 1 — Insight từ câu chuyện Gallery

### Vị trí và dữ liệu đầu vào

Trong **Phân tích tương tác & Ý tưởng nội dung**, tạo hai tab con:

- **Bình luận & phản hồi**: giữ chức năng hiện có.
- **Insight ký ức Campaign**: chức năng mới, chuyên phân tích Memory Card/câu chuyện trong Gallery.

Corpus mặc định phải khớp điều kiện Gallery hiện tại: `ugcConsent === true`, `submitted === true`, `status === 'approved'`, cùng nguồn dữ liệu đang chọn. Phân tích toàn bộ tập đủ điều kiện trong phạm vi lọc, không chỉ 9 thẻ của trang đầu. Không dùng bài chờ duyệt, bài đã ẩn hoặc bài không có quyền chia sẻ để bổ sung số lượng.

`CampaignStory` hiện có các trường chính: `id`, `cardId`, `visitorId`, `sessionId`, `createdAt`, `nickname`, `periodYear`, `eraCategory`, `theme_id`, `storyText`, `photoUrl`, `ugcConsent`, `submitted`, `status`, `featured`, `cardStatus`. JSON mock dùng tên snake_case và đã được chuyển đổi trong `AdminDataSource`; tránh tạo thêm một adapter không tương thích.

Phân tích **văn bản** câu chuyện, chủ đề, năm/giai đoạn và metadata cần thiết. Không cần phân tích ảnh AI, không cần tải ảnh ra dịch vụ khác. Không tự đưa liên hệ, hồ sơ con, lịch sử mua hoặc dữ liệu khách không liên quan vào prompt.

### Cần suy ra được gì?

- Chủ đề/đồ chơi xuất hiện nhiều và các nhóm câu chuyện liên quan.
- Cảm xúc/ký ức nổi bật: gắn kết anh chị em, bạn bè, gia đình, sự sáng tạo, mong muốn tìm lại món đồ cũ… Đây là gợi ý phân nhóm, không phải kết luận có sẵn.
- Động cơ hoặc giá trị được người kể nói rõ: muốn chơi cùng con, mua lại cho bản thân, tặng người thân, cùng làm một món đồ chơi… Không suy đoán ý định mua nếu câu chuyện không nói đến.
- Những trải nghiệm lặp lại và cơ hội nội dung phù hợp campaign: câu chuyện anh em, làm diều, đồ chơi được trao lại, quà sinh nhật…
- Đề xuất bài post/video hoặc hoạt động tiếp nối từ insight, có liên kết về những câu chuyện làm căn cứ.

Không biến số liệu trong tập mock thành kết luận về toàn bộ khách hàng MyKingdom. Không suy luận thông tin nhạy cảm, thu nhập, tuổi thật của người kể hoặc đặc điểm của trẻ từ một câu chuyện ký ức. Nhắc đến tuổi thơ năm 1998 không có nghĩa người đó hiện có con hay muốn mua sản phẩm.

### Cách trình bày và đầu ra

Hiển thị phạm vi phân tích, nguồn mock/live, số bài đủ điều kiện, thời gian chạy và bộ lọc đang áp dụng. Có danh sách câu chuyện đầu vào và phần insight tương ứng. Cho lọc ít nhất theo thời gian gửi bài và chủ đề; giai đoạn ký ức là trường riêng, không nhầm với ngày gửi.

Mỗi insight cần có tiêu đề, giải thích ngắn, số bài hỗ trợ, tỷ trọng trên tập bài đủ điều kiện, `storyIds` và trích đoạn dẫn chứng. Một bài có thể thuộc nhiều insight, vì vậy tỷ trọng không bắt buộc cộng thành 100%. Cho mở câu chuyện/thẻ gốc từ dẫn chứng. Các con số phải tính từ dữ liệu gốc, không để mô hình tự bịa hoặc ghi cứng lên giao diện.

Phía dưới cho chọn insight để tạo nháp post/video, chỉnh sửa và lưu. Phân biệt rõ bản nháp với nội dung đã xuất bản. Có trạng thái đang xử lý, không có dữ liệu, lỗi và thử lại. Khi đổi nguồn/bộ lọc hoặc bài bị ẩn/thu hồi quyền, phải bỏ kết quả cũ hoặc đánh dấu cần chạy lại; không để insight cũ chứa nội dung đã bị loại tiếp tục hiển thị.

### Gợi ý triển khai backend — được phép điều chỉnh cho phù hợp repo

Tạo service/adapter để frontend gọi backend phân tích, thay vì nhúng API key trong Angular. Backend kiểm tra quyền truy cập và điều kiện dùng bài, lấy đúng corpus, rồi gọi mô hình nếu có cấu hình. Khi chưa có key/provider, trả lỗi rõ hoặc fallback có nhãn mô phỏng; không giả kết quả AI thật. Không commit `.env`, token hoặc khóa API.

Một contract tham khảo cho endpoint phân tích (đây là đề xuất, chưa tồn tại):

```ts
// POST /api/campaign-insights
// Backend tự lấy và xác minh bài theo nguồn/quyền; không tin cờ consent do client tự gửi.
type Request = {
  source: 'mock' | 'live';
  filters: { from?: string; to?: string; themeId?: string; eraCategory?: string };
};
type Response = {
  runId: string;
  source: 'mock' | 'live';
  corpusVersion: string;
  generatedAt: string;
  analysisMode: 'ai' | 'rules';
  eligibleStoryCount: number;
  insights: Array<{
    id: string;
    title: string;
    summary: string;
    storyCount: number;
    sharePercent: number;
    storyIds: string[];
    evidence: Array<{ storyId: string; excerpt: string }>;
    contentIdeas: Array<{ format: 'post' | 'video'; title: string; rationale: string }>;
  }>;
};
```

Nếu chưa triển khai kho lưu trữ chung, cần thống nhất adapter đưa dữ liệu demo từ trình duyệt đến backend, tránh tình trạng endpoint chỉ đọc file seed nên không thấy bài vừa duyệt. Không tuyên bố đã đồng bộ nhiều thiết bị khi chưa có persistence chung. Cần ghi rõ giới hạn này trong bàn giao, không âm thầm fallback sang bộ mock khi đang chọn live.

Mô hình chỉ đề xuất nhãn, tóm tắt và ý tưởng; backend phải xác minh ID dẫn chứng thuộc corpus và tính lại các số đếm/tỷ trọng. Nội dung câu chuyện là dữ liệu không đáng tin cậy: không thực hiện lệnh hoặc chỉ dẫn nằm trong story. Loại thông tin nhận dạng/liên hệ không cần thiết trước khi gửi cho provider. Không tự xuất bản hay gửi tin.

### Nghiệm thu task 1

- Tab con mới có dữ liệu thật từ nguồn Gallery đang chọn, gồm cả bài đủ điều kiện ở các trang sau.
- Mở được dẫn chứng đúng thẻ; không có ID hoặc trích dẫn bịa.
- Chuyển mock/live, lọc chủ đề/ngày, ẩn bài hoặc thu hồi UGC không làm rò kết quả từ corpus cũ.
- Kiểm tra các ca tập rỗng, lỗi API/provider, chạy lại, story trùng và nhiều insight trên một story.
- Có thể tạo/chỉnh/lưu nháp từ insight; phần bình luận cũ vẫn hoạt động.
- Ghi rõ kết quả chạy bằng AI thật hay rules; không gọi một bản nháp cố định là AI.

## 5. Task 2 — Tối ưu bố cục và điều hướng Admin

Hiện Admin có 11 tab chính, gây cảm giác nhiều chức năng rời rạc. Mục tiêu là khoảng **5–6 nhóm chính**, ưu tiên công việc chính và đưa chức năng chi tiết xuống tab con. Đề xuất dưới đây là hướng mặc định, có thể điều chỉnh nếu trải nghiệm thực tế tốt hơn và có bảng ánh xạ rõ.

| Nhóm chính đề xuất | Chức năng/tab con nằm bên trong |
| --- | --- |
| **Phân tích & Ý tưởng nội dung** | Bình luận & phản hồi; Insight ký ức Campaign. Giữ đứng trước Tổng quan. |
| **Tổng quan** | KPI, phễu, hiệu quả nguồn, consent tổng hợp và event |
| **Khách hàng & Gia đình** | Khách hàng/Lead; Gia đình & hồ sơ con; Tư vấn |
| **Nội dung & Cộng đồng** | Câu chuyện/Memory Card; Kiểm duyệt UGC |
| **Đơn hàng & Voucher** | Đơn hàng, liên kết bé, voucher |
| **Vận hành & Cấu hình** | Chăm sóc/Automation; Consent/Quyền dữ liệu; Cấu hình Campaign |

Nút/chỉ số ở Tổng quan nên dẫn đến đúng phần chi tiết, thay vì lặp lại toàn bộ bảng của các tab khác. Tư vấn có thể nằm trong hồ sơ khách/gia đình nếu giảm thêm tab con mà vẫn dễ tìm. Không chỉ làm sidebar chữ nhỏ hơn hoặc giấu menu bằng CSS rồi coi là hoàn thành.

Giữ query param/deep link cũ như `?tab=livestream`, `customers`, `families`, `consultation`, `stories`, `community`, `automation`, `orders`, `consent`, `settings`, `overview`: ánh xạ sang đúng nhóm/tab con hoặc redirect tương thích. Reload, nút back/forward của browser và chuyển nguồn dữ liệu không được đưa người dùng về nhầm phần. Giữ bộ lọc khi phù hợp; bộ lọc riêng của một loại dữ liệu không được âm thầm áp vào loại khác.

Nghiệm thu: sidebar chỉ còn khoảng 5–6 nhóm; tính năng cũ vẫn truy cập được; tìm kiếm, lọc, phân trang, popup, đổi mock/live, thao tác duyệt và liên kết hồ sơ/đơn vẫn hoạt động. Kiểm tra cả bố cục desktop và mobile, có ảnh trước/sau và bảng ánh xạ tab cũ → nhóm mới trong phần bàn giao.

## 6. Quy tắc bắt buộc giữ nguyên

- **Consent:** marketing, UGC và lưu hồ sơ để gợi ý quà là các quyền riêng. Không tự bật thay khách. Hồ sơ đồng ý cá nhân hóa quà không được tự dùng cho automation/marketing.
- **Mẫu số consent:** số lần ô consent thực sự hiển thị (ít nhất 50%), nối bằng `consent_impression_id`, phân biệt `create` / `share` / `connect`. Không đếm ô đang bị popup che.
- **SQL → Customer:** số người đã thuộc SQL rồi sau đó mua / tổng người thuộc SQL. Không cộng khách mua ngoài phễu Lead vào tử số này. Không ghi cứng tỷ lệ ước tính cũ.
- **Đơn/doanh thu:** click mở MyKingdom không phải đơn. Doanh thu campaign cần mã đơn ổn định, không trùng và `campaign_attributed === true`; khách mua ngoài Lead vẫn được tính nếu đơn đáp ứng attribution.
- **Checkout demo:** `DEMO_...`, kênh `demo_checkout`, `shop_demo=true`; không tự gắn cờ xác nhận doanh thu campaign cho đơn mô phỏng.
- **Định danh:** dùng ID khách/phiên/story/card ổn định. `user_id` có thể chưa tồn tại trước khi để lại liên hệ; không gộp khách theo nickname hoặc giả định luôn có user_id.
- **Dữ liệu:** giữ đúng bộ mock 400 khách và các liên kết; không nhân đôi khi reload. Thao tác mock chỉ sửa mock, không làm mất dữ liệu live. Ảnh Gallery gắn theo story ID, không theo vị trí trong danh sách.
- **Campaign:** không phá tạo/tải thẻ, popup chọn người nhận, Gallery, cửa hàng demo và consent. Không dùng nhánh microsite cũ để ghi đè main.

## 7. Chạy và kiểm tra

Đọc `package.json`, `package-lock.json` và yêu cầu Node của phiên bản Angular hiện tại trước khi cài. Dùng Node tương thích Angular 22; không hạ dependency để ép máy cũ chạy. Repo dùng npm; giữ lockfile.

```bash
npm ci
npm start -- --port 4300
npm run build
npm test -- --watch=false
python3 scripts/validate_campaign_mock.py public/mock/mykingdom_campaign_mock_400.json
```

Không cần sinh lại mock nếu chỉ đọc/phân tích hoặc đổi menu. Nếu thực sự thay đổi schema, phải cập nhật generator/validator/adapter cùng nhau, có migration rõ và không làm mất dữ liệu. Bản nền đã chạy 66 tests; số lượng có thể tăng khi thêm tính năng. Có warning budget CSS ở một số component; phân biệt warning với build fail, không tự nới budget để che regression.

Ngoài tests, mở giao diện thật để kiểm tra hai task và các luồng liên quan. Nếu có backend mới, bổ sung hướng dẫn chạy, `.env.example` không có secret, API contract, kiểm tra lỗi và cách frontend truy cập endpoint trên local/Vercel. Frontend build được chưa đồng nghĩa backend đã deploy hoặc kết nối thành công.

## 8. Git — cập nhật trực tiếp main và danh tính của teammate

**Làm trên `main` và push `origin main` sau mỗi đợt thay đổi đã kiểm tra để Vercel cập nhật website chính. Không dùng branch phụ, không yêu cầu mở PR.** Trước mỗi đợt làm tiếp theo, kiểm tra trạng thái và pull main mới nhất như mục 0, tránh sửa trên bản code cũ.

**Commit phải đứng tên chính teammate và push bằng tài khoản GitHub của chính teammate.** Kiểm tra `git config --get user.name`, `git config --get user.email` và tài khoản GitHub đang dùng. Nếu chưa đúng, teammate xác nhận tên và email GitHub của mình rồi cấu hình cho repo:

```bash
git config --local user.name "TEN_THAT_CUA_BAN"
git config --local user.email "EMAIL_GITHUB_CUA_BAN"
```

Các giá trị trên là chỗ điền, không dùng nguyên văn. Có thể dùng email noreply GitHub của chính teammate. Không lấy tên/email của chủ repo, AI hoặc danh tính tự suy ra từ hostname. Không đổi Git config toàn máy nếu không cần.

AI chỉ hỗ trợ triển khai. **Không thêm `Co-authored-by` cho AI/bot, không thêm chữ ký “generated by AI” hoặc dùng AI làm author/committer.** Không giả mạo người khác; nếu chưa biết danh tính Git chính xác thì hỏi teammate. Quy tắc này áp dụng cả AI đang đọc file này. Không đưa token/credential vào code, commit, terminal output hoặc tin nhắn.

Trước khi commit, xem diff và chỉ stage file thuộc task. Không đưa `node_modules`, `dist`, file `.env`, cache Python hoặc dữ liệu cá nhân vào commit. Ví dụ cho các file đã kiểm tra:

```bash
git diff --check
git add path/to/file-1 path/to/file-2
git commit -m "Add campaign story insights and simplify admin navigation"
# Thay COMMIT_HASH bằng commit vừa tạo để kiểm tra author/committer và message.
git show --format=fuller --no-patch COMMIT_HASH
git push origin main
```

Trước khi push, kiểm tra đang ở `main` và chạy build/tests phù hợp. Không push bản đang lỗi để thử trực tiếp trên website. Nếu push bị từ chối vì main có commit mới, fetch và đồng bộ commit mới (rebase/giải quyết conflict phù hợp), kiểm tra lại rồi push bình thường; không force-push.

Sau mỗi lần push main:

1. Kiểm tra deployment Vercel của commit vừa push đã thành công.
2. Mở https://the-toys-we-remember.vercel.app/ và phần Admin vừa sửa, tải lại trang để xem thay đổi thực tế.
3. Kiểm tra tính năng vừa làm cùng các luồng liên quan. Nếu deploy lỗi hoặc giao diện chưa đúng, sửa và kiểm tra lại trước khi báo hoàn thành.
4. Gửi mã commit, nội dung thay đổi và ảnh kiểm tra cho chủ repo. Không coi push thành công là bằng chứng website/backend đã chạy đúng.

Nếu backend mới cần cấu hình hoặc deploy riêng, nêu rõ và kiểm tra đường gọi API trên Vercel; push frontend lên main không tự làm backend hoạt động.

## 9. Bàn giao lại cho chủ repo

Gửi link commit trên main và website/deployment đã kiểm tra, hướng dẫn chạy backend nếu có, cấu hình cần thiết không kèm secret, ảnh tab insight Gallery và menu đã tinh gọn. Nêu rõ nguồn dữ liệu/corpus, AI thật hay fallback, kết quả tests/build, bảng ánh xạ tab cũ → mới, lỗi/giới hạn còn lại và cách kiểm tra trên UI. Không chỉ gửi code hoặc ảnh mà thiếu cách chạy.

## 10. Prompt ngắn có thể đưa cho AI của teammate

> Trước khi làm, kiểm tra trạng thái Git, chuyển sang main và pull origin/main mới nhất theo mục 0; không ghi đè công việc có sẵn. Đọc các file đúng thứ tự ở mục 0 và đối chiếu giao diện hiện tại rồi mới sửa. Triển khai hai task: insight từ Gallery và tinh gọn điều hướng Admin; giữ nguyên quy tắc dữ liệu/consent/phễu. Làm trực tiếp trên main, không tạo branch phụ hoặc PR. Sau mỗi đợt thay đổi đã qua build/tests phù hợp, commit và push origin main để Vercel cập nhật, rồi mở website kiểm tra thực tế. Không force-push. Commit/push bằng danh tính Git của tôi đã được xác nhận, không kèm co-author/chữ ký AI; nếu chưa biết danh tính thì hỏi, không tự đoán. Bàn giao theo mục 9. Không tự mở rộng sang thanh toán thật, dự báo mua/rời bỏ hoặc gửi tin thật.
