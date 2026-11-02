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
