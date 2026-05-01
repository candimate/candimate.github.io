# 🚀 Candimate — High-Performance Photo Gallery Engine

Candimate là một nền tảng Web App mã nguồn mở chuyên dụng cho việc lưu trữ và trình diễn kho ảnh quy mô lớn. Dự án tập trung vào **hiệu năng tối đa (Ultra Lite)**, **kiến trúc dữ liệu phân cấp** và **trải nghiệm UI/UX mượt mà** dựa trên ngôn ngữ thiết kế Fluent UI.

---

## 🛠 Core Architecture (Kiến trúc cốt lõi)

### 1. Ultra Lite Optimization

* **Minimalist Codebase**
  Toàn bộ logic hiển thị và xử lý được tối ưu hóa từ hơn **6000 dòng code xuống còn ~159 dòng HTML/JS nguyên bản**

* **No Framework Reliance**
  Không phụ thuộc vào thư viện ngoài (React, Vue, Tailwind...)
  → giảm tải tài nguyên và tăng tốc độ phản hồi

* **Custom Glass UI**
  Hệ thống giao diện Glassmorphism tự phát triển
  → tối ưu `backdrop-filter` cho hiệu ứng mượt ngay cả trên máy cấu hình thấp

---

### 2. Scalable Data Structure (Cấu trúc dữ liệu)

Hệ thống sử dụng cơ chế nạp dữ liệu phân cấp thông qua JSON nhằm đảm bảo khả năng mở rộng lớn mà không ảnh hưởng đến tốc độ tải ban đầu.

```
/data/
├── /2026/                # Phân loại theo năm
│   ├── index.json        # Manifest tổng của năm
│   └── /albums/
│       ├── album_01.json # Metadata + danh sách ảnh
│       └── album_02.json
└── /2027/                # Mở rộng theo thời gian
```

---

## ⚡ Technical Features

* **Modular JavaScript**
  Tổ chức logic theo module → dễ bảo trì & mở rộng

* **Dynamic Media Player**
  Tích hợp audio player (optional), hỗ trợ trải nghiệm đa giác quan

* **Responsive Grid System**
  Grid thông minh:

  * tự động scale theo màn hình
  * hỗ trợ layout (1 ảnh lớn + 2 ảnh nhỏ)

* **Lazy Loading**
  Chỉ load ảnh khi cần → giảm tải ban đầu

* **Randomized Rendering**
  Trang chủ hiển thị ảnh ngẫu nhiên → tăng tính khám phá

---

## 📦 Installation & Deployment

### 1. Clone repository

```bash
git clone https://github.com/lidora-labs/candimate.git
```

---

### 2. Cấu hình dữ liệu

* Thêm ảnh vào các file `.json` trong thư mục:

```
/data/{year}/albums/
```

---

### 3. Deploy

Candimate là static web → deploy dễ dàng trên:

* GitHub Pages
* Vercel
* Netlify

---

## 📊 Data Flow

```
User → app.js → index.json → album.json → render UI
```

---

## 🎯 Design Goals

* Ultra lightweight frontend
* Scalable data architecture
* Framework-free development
* Easy contribution (non-dev friendly)

---

## 📌 Notes

* Hình ảnh thuộc về chủ sở hữu tương ứng
* Dự án phục vụ mục đích học tập & phi thương mại

---

## 👨‍💻 Author

Developed as a high school project with focus on:

* Performance optimization
* System design
* Real-world frontend architecture
