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
