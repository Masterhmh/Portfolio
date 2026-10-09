# 📁 projects/ — Cách thêm dự án (không cần biết code)

Web portfolio **tự động** đọc mọi folder con trong này và hiện lên mục "Dự án tiêu biểu".

## Quy ước (nhớ 3 điều)

1. **Tên folder = tên dự án.** Ví dụ: `projects/Tra-Sua-ToCoTo/`, `projects/Pho-Bo-88/`
   (nên viết không dấu, dùng gạch ngang cho gọn link)
2. **Ảnh đánh số từ 1:** `1.jpg`, `2.jpg`, `3.png`… — ảnh số `1` làm **ảnh bìa**.
3. Xong → commit/push — web tự hiện dự án mới, **tự căn bố cục**, không cần sửa code.

## Ví dụ

```
projects/
├── Tra-Sua-ToCoTo/
│   ├── 1.jpg   ← ảnh bìa
│   ├── 2.jpg
│   └── 3.jpg
└── Pho-Bo-88/
    ├── 1.png
    └── 2.png
```

## Lưu ý

- Định dạng: `.jpg` `.png` `.webp` `.gif` đều được.
- Ảnh bìa nên là ảnh đẹp nhất, tỉ lệ ngang (~4:3).
- Folder bắt đầu bằng `_` hoặc `.` sẽ bị bỏ qua.
- File này (`README.md`) không hiện lên web.

## info.txt — biến dự án thành case study (khuyến khích)

Trong mỗi folder dự án, tạo thêm file `info.txt` để web hiện phần
**VẤN ĐỀ → GIẢI PHÁP → KẾT QUẢ** khi mở dự án. Không có file này,
web vẫn hiện gallery ảnh bình thường.

```
TEN: Tên hiển thị đẹp (không bắt buộc — mặc định lấy tên folder)
VAN_DE: Quán mới mở, chưa có nhận diện, khách đi ngang không nhớ tên.
GIAI_PHAP: Logo + bộ màu tươi, menu 1 tờ dễ đọc, biển hiệu bắt mắt từ xa.
KET_QUA: Chủ quán ưng ý, khai trương đúng hẹn.
```

- Mỗi dòng bắt đầu bằng `TEN:`, `VAN_DE:`, `GIAI_PHAP:` hoặc `KET_QUA:`.
- Viết số liệu thật nếu có (vd: "khách check-in tăng rõ sau 1 tháng").
  Không bịa số liệu.
