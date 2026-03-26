# 📸 Candimate

> *“Còn gì ý nghĩa hơn khi những khoảnh khắc rực rỡ nhất đều được gói trọn tại đây.”*

**Candimate** là một nền tảng lưu trữ và chia sẻ ảnh học đường mã nguồn mở. Dự án được xây dựng với mục tiêu lưu giữ những khoảnh khắc thanh xuân một cách bền vững, đảm bảo chất lượng cao và không bị thất lạc theo thời gian.

![Version](https://img.shields.io/badge/Version-2026.3-00f2fe?style=for-the-badge)
![License](https://img.shields.io/badge/License-Open_Source-green?style=for-the-badge)
![UI](https://img.shields.io/badge/UI-Glassmorphism-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-GitHub_Pages-black?style=for-the-badge)

---

## 🌿 Giới thiệu

Candimate ra đời để giải quyết những vấn đề thực tế trong môi trường học đường:
- ❌ **Thất lạc dữ liệu:** Ảnh sự kiện lưu trên Google Drive thường dễ bị mất link hoặc quá hạn.
- ❌ **Giảm chất lượng:** Đăng ảnh qua Facebook/Zalo bị nén mạnh, làm mất đi độ sắc nét của kỷ niệm.
- ❌ **Thiếu tổ chức:** Không có một hệ thống lưu trữ tập trung và lâu dài.

👉 **Candimate** xuất hiện như một **“Pinterest của học đường”** – nơi lưu giữ ảnh chất lượng cao, có tổ chức và tồn tại mãi với thời gian.

---

## ✨ Tính năng nổi bật

* 📁 **Gallery Album:** Quản lý ảnh thông minh theo từng sự kiện dựa trên cấu trúc JSON.
* ⚡ **Siêu tốc độ:** Tối ưu hóa tốc độ tải với CDN mạnh mẽ từ **Cloudinary**.
* 🎨 **Giao diện Apple-inspired:** Thiết kế **Glassmorphism** (kính mờ) hiện đại, sang trọng.
* 🏫 **Chất học đường:** Background bảng xanh thân thuộc, gợi nhớ không gian lớp học.
* 🔍 **Smart Search:** Tìm kiếm và gợi ý ảnh nhanh chóng.
* ❤️ **Favorite System:** Lưu ảnh yêu thích cá nhân hóa qua `localStorage` (Không cần đăng nhập).
* 📱 **Responsive:** Hiển thị hoàn hảo trên cả Desktop và Mobile (với thanh Bottom Bar vuốt chạm).
* 🚀 **Zero Backend:** Chạy hoàn toàn dưới dạng web tĩnh (Static Site), bảo mật và dễ triển khai.

---

## 🧠 Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS).
- **Data Engine:** JSON (Đóng vai trò như một Database linh hoạt).
- **Deployment:** [GitHub Pages](https://pages.github.com/).
- **Image Hosting:** [Cloudinary](https://cloudinary.com/).

---

## 📂 Cấu trúc dự án

```text
/candimate
├── assets/
│   ├── css/            # Giao diện Glassmorphism & Layout
│   └── js/             # Logic xử lý ảnh, LocalStorage & UI
├── data/               # Các file "Database" JSON
│   ├── net_dep_hoc_duong.json
│   ├── chu_nhat_xanh.json
│   └── tuoi_tre_thpt_loc_hiep_15-3.json
├── index.html          # Trang chủ chính
└── README.md           # Tài liệu dự án

---

### 🚀 Cách sử dụng & Triển khai

## 1. Khởi tạo dự án
Sử dụng Git để sao chép mã nguồn về máy cục bộ:
```bash
git clone https://github.com/your-username/candimate
```

### 2. Quản lý hình ảnh
* Tải ảnh lên dịch vụ lưu trữ **Cloudinary**.
* Sử dụng các tham số tối ưu hóa để tiết kiệm băng thông và tăng tốc độ tải: `q_auto,f_auto`.

### 3. Cấu trúc dữ liệu JSON
Toàn bộ thông tin ảnh được quản lý trong thư mục `/data`. Bạn có thể tạo mới hoặc chỉnh sửa các file `.json` theo mẫu sau:

```json
[
  {
    "id": "001",
    "url": "link_anh_preview",
    "full": "link_anh_goc_chat_luong_cao",
    "album": "Ten_Album"
  }
]
```

### 4. Deploy (Triển khai)
Dự án được tối ưu hóa cho **GitHub Pages**:
1. Truy cập vào **Settings** -> **Pages** trên kho lưu trữ GitHub.
2. Tại mục Build and deployment, chọn branch **main**.
3. Nhấn **Save**. Trang web sẽ sẵn sàng hoạt động sau vài giây!

---

## ❤️ Hệ thống yêu thích (Personalization)

**Candimate** ưu tiên quyền riêng tư và trải nghiệm cá nhân của mỗi học sinh:
* **Tương tác:** Chỉ cần nhấn ❤️ để lưu giữ những khoảnh khắc bạn yêu thích nhất.
* **Lưu trữ:** Dữ liệu được quản lý thông qua `localStorage` ngay trên thiết bị cá nhân.
* **Riêng tư:** Tuyệt đối **không cần đăng nhập**, đảm bảo trải nghiệm mượt mà và an toàn tối đa.

---

## 🎯 Mục tiêu dự án

Candimate không chỉ đơn thuần là một thư viện ảnh, mà là một **Nền tảng lưu giữ ký ức**. Tôi hướng tới việc tạo ra một không gian bền vững, nơi mà nhiều năm sau, các bạn vẫn có thể tìm thấy nụ cười rực rỡ thời học sinh của mình với chất lượng tốt nhất.

---

## 🔓 Bản quyền & Đóng góp (Open Source)

Dự án hoàn toàn mã nguồn mở. Bạn có thể tự do:
* **Fork** và tùy chỉnh giao diện/tính năng theo ý thích.
* **Triển khai** cho trường học, lớp học hoặc tổ chức của riêng bạn.
* *Lưu ý:* Khuyến khích giữ lại Credit cho tác giả để ủng hộ các dự án phi lợi nhuận.

---

## 👨‍💻 Tác giả

**Đỗ Tất Vinh (laris)**
---
> **Copyright © 2026 Candimate Team.**

---
