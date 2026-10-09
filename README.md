# Portfolio — Hoàng Hùng · Brand Designer F&B

Portfolio cá nhân phong cách **liquid glass**: chế độ sáng/tối tự động theo hệ thống
(có nút đổi tay), hiệu ứng chuyển động, mục dự án **tự load từ folder `projects/`**.

## 🚀 Đưa web lên mạng (GitHub Pages)

1. Vào repo này → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)** → **Save**
4. Đợi ~1 phút → web chạy tại `https://masterhmh.github.io/Portfolio`

## 🖼️ Thêm dự án mới

Xem hướng dẫn trong [`projects/README.md`](projects/README.md) — tóm tắt:

- Tạo folder con trong `projects/`, **tên folder = tên dự án**
- Cho ảnh vào, **đánh số** `1.jpg`, `2.jpg`… (ảnh `1` = ảnh bìa)
- Push lên — web tự cập nhật, không cần sửa code

## 🧩 Tuỳ chỉnh nhanh

| Muốn đổi… | Sửa ở… |
|---|---|
| Ảnh đại diện | Thêm file `assets/avatar.jpg` rồi sửa thẻ `.avatar` trong `index.html` |
| SĐT / Zalo / Email | Mục `#contact` trong `index.html` (đang để "sắp cập nhật") |
| Màu sắc | Biến `--c1 --c2 --c3` trong `assets/style.css` |
| Nội dung các mục | Trực tiếp trong `index.html` |

## 📂 Cấu trúc

```
├── index.html          ← nội dung web
├── assets/
│   ├── style.css       ← liquid glass + sáng/tối + motion
│   └── app.js          ← theme, hiệu ứng, tự load dự án từ GitHub API
├── projects/
│   └── README.md       ← hướng dẫn thêm dự án (mỗi dự án = 1 folder con)
└── .nojekyll           ← để GitHub Pages phục vụ file nguyên bản
```
