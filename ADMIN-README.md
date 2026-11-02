# Admin Dashboard – The Toys We Remember

Mở `/admin` sau khi khởi chạy microsite (mặc định http://127.0.0.1:4200/admin).
Mở microsite ở tab khác **cùng trình duyệt và cùng địa chỉ/port** để thấy số liệu tự cập nhật. Không dùng lẫn localhost và 127.0.0.1 vì chúng có vùng lưu trữ riêng.

## Cách chạy

Dùng Node.js phù hợp với Angular trong project (24.15 trở lên thuộc nhánh 24, hoặc nhánh được Angular hỗ trợ).

```sh
npm ci
npm start -- --host 127.0.0.1 --port 4200
```

## Đã triển khai

- Trang Admin riêng, tải theo nhu cầu để không tăng toàn bộ giao diện Admin vào microsite lúc khởi động.
- Ledger event lưu bằng localStorage, mỗi event một khóa, cập nhật các tab qua storage notification. Refresh không mất lịch sử. Không phải database/server dùng chung nhiều máy.
- visitor_id ẩn danh ổn định trong cùng trình duyệt, session_id theo tab; khi có liên hệ mới tạo user_id. Không nhận diện cùng người trên các thiết bị khác nhau.
- Tổng quan khách, phiên, gửi chuyện, tạo card, lỗi; biểu đồ hành trình, nguồn và chủ đề; Lead/MQL/SQL, SQL → Customer; bảng consent và nhật ký event có tìm kiếm/phân trang.
- Bộ lọc ngày theo giờ Việt Nam, nguồn, thiết bị; xuất CSV theo bộ lọc.
- Admin không tự sinh các event khách hàng khi mở dashboard.
- Chuẩn hóa collection view/click. Click mở website mua hàng được đặt tên product_outbound_click và không được xem là purchase hoặc add_to_cart.
- Đồng ý UGC mặc định tắt. Bỏ ô voucher cũ đang chọn sẵn; bổ sung consent marketing tự nguyện sau card, độc lập với UGC. Email/số điện thoại chỉ kiểm tra định dạng, không lưu vào ledger.

## Hai quy tắc đã thống nhất

### Consent theo điểm hỏi

`marketing_consent_shown` có `consent_source: create | share | connect` và `consent_impression_id` duy nhất. Chỉ ghi một lần trong mỗi vòng đời khối consent khi tối thiểu 50% khối thực sự xuất hiện trên màn hình (IntersectionObserver).

`marketing_consent_granted` và `marketing_consent_declined` dùng lại cùng mã hiển thị. Tích checkbox chưa bấm xác nhận không tạo granted. Đóng trang không tạo declined nhưng impression vẫn được giữ trong mẫu số.

Opt-in rate tại từng điểm = số mã hiển thị có granted / số mã hiển thị × 100%. Mã trùng bị loại; granted không có impression tương ứng không được tính. Bộ lọc ngày chọn cohort theo thời điểm hiển thị; xác nhận sau đó được nối từ lịch sử đến cuối kỳ lọc.

Điểm create nằm sau màn hình card; điểm share xuất hiện sau thao tác bấm chia sẻ. Trang cộng đồng chưa có trong microsite, nên connect được hỗ trợ trong model/dashboard nhưng chưa có event thực tế. Không tạo số liệu giả cho điểm này.

### SQL → Customer

Lead: có contact_info_submitted và marketing_consent_granted. MQL: Lead sau đó có followup_click hoặc product_collection_view. SQL: MQL sau đó có add_to_cart hoặc consult_request. Tử số SQL → Customer chỉ gồm người mua sau khi đã đạt SQL; mẫu số là số SQL trong cohort khách có tương tác thuộc bộ lọc. Trạng thái được dựng từ toàn bộ lịch sử đến cuối kỳ lọc (kể cả các kênh/thiết bị khác), không mất điều kiện có từ trước ngày bắt đầu lọc.

Ví dụ 35 SQL, 19 người mua sau SQL, 15 người mua ngoài Lead: SQL → Customer = 19/35 = 54,3%; tổng người mua = 34. Người mua ngoài Lead vẫn thuộc tổng người mua, không vào tử số chuyển đổi SQL.

## Dữ liệu chưa có trong microsite Marketing

Chưa có giao diện giỏ hàng, checkout, hệ thống đơn hàng, voucher QR tại POS, follow-up Zalo/email hay trang cộng đồng. Vì vậy các chỉ số tương ứng có thể là 0 hoặc dấu — (mẫu số bằng 0). Không coi lượt bấm link bên ngoài là doanh thu. Chưa có kết quả A/B, CAC, ROAS hoặc LTV thực tế.

Bộ tính doanh thu chỉ nhận giao dịch có order_id, order_value hợp lệ và campaign_attributed=true; loại trùng theo order_id. Khi nối backend, backend cần xác minh attribution theo voucher campaign hoặc click 7 ngày, đồng thời gửi order_id cho cả voucher_redeem. Không gửi flag attribution từ giao diện mua hàng chưa xác minh.

Đây là Admin demo local, chưa có đăng nhập/phân quyền hoặc đồng bộ nhiều người dùng. Để triển khai thật cần API thu event, lưu trữ trung tâm, phân quyền Admin và nguồn giao dịch đã xác thực.

## Kiểm tra

```sh
npm run build
npm test -- --watch=false
```

Các bài kiểm tra bao gồm loại người mua ngoài phễu khỏi SQL conversion, hiển thị consent bị bỏ dở, khử trùng lượt đồng ý, trạng thái trước khoảng ngày lọc, không tính click mua thành đơn, doanh thu có attribution, cập nhật Admin theo event và đồng bộ giữa tab.


## Workspace quản trị 8 tab

Các mục dùng URL `/admin?tab=<id>`; chuyển tab giữ bộ lọc và không ghi thêm lượt truy cập khách hàng.

| Tab | ID | Chức năng |
| --- | --- | --- |
| Tổng quan | overview | KPI, dashboard, nhật ký event và xuất CSV |
| Khách hàng & Lead | customers | Tìm/lọc khách, xem hồ sơ, lịch sử event và ghi chú tư vấn |
| Câu chuyện & Memory Card | stories | Nội dung, ảnh, mã card và bản xem trước dữ liệu thẻ |
| Cộng đồng & UGC | community | Duyệt/ẩn và chọn nổi bật với quyền UGC hợp lệ |
| Chăm sóc & Automation | automation | Lưu mẫu A/B, mô phỏng điều kiện gửi và xem log; SQL quá 24 giờ chờ tư vấn |
| Đơn hàng & Voucher | orders | Event giao dịch và tạo/bật/tắt voucher nháp |
| Consent & Quyền dữ liệu | consent | Tỷ lệ theo điểm hỏi, quyền nhận tin/UGC, hủy nhận tin và nhật ký |
| Cấu hình Campaign | settings | Tên, lịch campaign, giới hạn tin, A/B và bản đồ chủ đề/sản phẩm đề xuất |

Câu chuyện và ảnh được lưu từ lượt tạo card mới trong `ttwr.story.*`. Event cũ không có nội dung không tự chuyển thành câu chuyện. Duyệt/ẩn và nổi bật chỉ cập nhật dữ liệu Admin vì Campaign chưa có trang cộng đồng công khai.

Các thay đổi quản trị lưu ở `ttwr.settings`, `ttwr.note.*`, `ttwr.voucher.*` và `ttwr.run.*`, đồng bộ giữa các tab cùng trình duyệt. Chưa có phân quyền Admin/server nhiều người dùng.

Mô phỏng gửi tin không kết nối Zalo/email, không tạo `followup_delivered` và không làm tăng KPI thực tế. Giới hạn ngày theo giờ Việt Nam và tuần theo 7 ngày gần nhất. Hủy nhận tin tạo event `marketing_consent_withdrawn` trên đúng mã khách (actor=admin), cập nhật trạng thái khách hiện tại và chặn lần mô phỏng sau. Admin không thể tự cấp consent thay khách.

Tên campaign được áp dụng trong Admin; mẫu tin, giới hạn và bật A/B được áp dụng trong mô phỏng. Chủ đề/sản phẩm trong tab cấu hình là bản đề xuất, chưa xuất bản vào các trang Marketing có sẵn. Voucher cũng là bản nháp, chưa được phát hành hoặc áp dụng tại checkout/POS.


## Bộ dữ liệu 400 khách

- JSON: `public/mock/mykingdom_campaign_mock_400.json`.
- Sinh và xác minh: `python3 scripts/generate_campaign_mock.py` (Python chuẩn, không cần thư viện ngoài).
- Kiểm tra lại JSON: `python3 scripts/validate_campaign_mock.py`.
- Báo cáo số liệu: `public/mock/validation-report.json`.
- Seed 42: nội dung file được tái tạo nhất quán. Báo cáo chốt ngày 28/12/2026 cho campaign 02/11–27/12/2026; đây là lịch giả định của bộ dữ liệu.

`AdminDataSource` tải JSON khi mở Admin, mặc định nguồn 400 khách nếu người dùng chưa chọn nguồn. Nút nguồn dữ liệu chuyển giữa tập JSON và dữ liệu tương tác trực tiếp; không thêm nhãn riêng trên dashboard. Trong nguồn 400 khách, bộ lọc kênh dùng nguồn thu hút đầu tiên của khách, còn UTM của từng phiên/event vẫn giữ nguyên. Trong nguồn trực tiếp bộ lọc dùng UTM của event.

JSON gốc chỉ đọc. Những thay đổi Admin trên bộ 400 khách được lưu tách biệt ở `ttwr.mock400.v1.changes`; lựa chọn nguồn ở `ttwr.admin.source`. Không nhập event JSON vào `ttwr.event.*`, không xóa dữ liệu live và không nhân đôi bản ghi khi tải lại. Lưu câu chuyện từ Campaign luôn ghi vào nguồn trực tiếp dù Admin đang xem nguồn 400 khách. Tất cả gửi tin thử nghiệm chỉ tạo log nội bộ.

Các tab dùng cùng adapter cho event, hồ sơ, câu chuyện, UGC, follow-up, đơn, voucher, ghi chú và cấu hình. Bộ lọc ngày chọn thời điểm event; quyền consent trong hồ sơ hiển thị trạng thái mới nhất. Hủy consent trong nguồn 400 khách chỉ thêm event vào overlay của nguồn đó. Đồng hồ quản trị của nguồn này bắt đầu từ thời điểm chốt báo cáo để bàn giao SQL và ghi chú không rơi ngược về trước lịch sử dữ liệu.

AOV, CAC, ROAS được tính lại từ giao dịch và chi phí. Chi phí lọc theo các tuần giao với khoảng ngày và theo kênh; chưa phân bổ chi phí theo thiết bị. LTV là giả định AOV × 3 lần mua, không phải giá trị thực tế đã quan sát. Reach trong JSON là số liệu từng nội dung/nền tảng, không cộng thành số người duy nhất toàn campaign.


Phân tích Livestream: `/admin?tab=livestream` là tab thứ 9. Có 150 bình luận mẫu chia hai phiên (90/60), phân nhóm đa nhãn bằng từ khóa tiếng Việt, dẫn chứng và mẫu đề xuất video chỉnh sửa được. Đây là demo tại máy, chưa gọi AI hay Facebook. Chế độ live không có bình luận mẫu. Bình luận nhập thêm giữ trong phiên; ý tưởng đã lưu dùng khóa `ttwr.livestream.drafts` và tách theo chế độ. Không nối danh tính người bình luận với CRM và không gửi tin tự động.


## Hồ sơ gia đình và chăm sóc vòng đời

Admin có 11 tab. Hai tab mới: `/admin?tab=families` và `/admin?tab=consultation`. JSON mock có thêm `crm`: 65 gia đình (các khách đã có liên hệ), 82 bé, 30 tư vấn, 11 giao dịch trước campaign và 14 liên kết đơn–bé. `scripts/generate_crm_mock.py` được chương trình sinh chính gọi; bộ kiểm tra xác minh tham chiếu và chặn liên kết chéo gia đình. Không thêm 65 khách vào tổng 400.

Hồ sơ chỉnh sửa, trạng thái công việc, bản nháp và cấu hình kịch bản lưu riêng ở `ttwr.crm.v1.mock` / `ttwr.crm.v1.live`. Chọn nguồn ở Tổng quan; tất cả phần CRM đọc nguồn đó. Ngày đánh giá mock dùng ngày báo cáo 28/12/2026. Hồ sơ có ngày sinh sẽ tính nhóm tuổi lúc lưu.

Automation bổ sung hàng đợi sinh nhật trong 14 ngày, đổi nhóm tuổi, 14 ngày sau mua, 90 ngày chưa giao dịch và tư vấn chưa giải quyết. Có người phụ trách, trạng thái, nháp tin theo mẫu, duyệt và chạy thử. Consent kiểm tra lại ở lúc chạy thử, dùng chung nhật ký và giới hạn 1 tin/ngày, 3 tin/7 ngày với automation cũ. Không gửi Zalo/email. Không có dự báo mua hàng/rời bỏ.

Tổng quan thêm số gia đình, bé, việc cần xử lý, mua sau tư vấn và mua lại. Các bảng CRM được ghi rõ là toàn bộ nguồn đang chọn, độc lập bộ lọc event campaign. Giao dịch trước campaign chỉ phục vụ chăm sóc và tỷ lệ mua lại, không tăng doanh thu campaign. Chưa đo hiệu quả sau nhắc vì không có gửi thật/gán đơn sau nhắc.

Tư vấn hiện nhập thủ công; gợi ý tối đa ba sản phẩm theo chủ đề và ngân sách từ danh mục mock, chưa xác minh độ tuổi/an toàn. Livestream thêm nhóm khen/lo ngại với dẫn chứng bằng từ khóa. Cấu hình hiển thị kết nối Facebook/Zalo/email/chatbot/POS là chưa kết nối. Chưa phát hành voucher QR đổi ở POS thật.
