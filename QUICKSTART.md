# 🎯 Hướng dẫn sử dụng nhanh

## ⚡ Bắt đầu trong 30 giây

### Bước 1: Cài đặt
```bash
pip install -r requirements.txt
```

### Bước 2: Test kết nối
```bash
python test_connection.py
```

### Bước 3: Chạy ứng dụng

**Windows (Batch):**
```bash
run.bat
```

**Windows (PowerShell):**
```powershell
.\run.ps1
```

**Linux/Mac:**
```bash
python index.py
```

### Bước 4: Truy cập
- 🌐 http://localhost:5000/

## 🔗 Các endpoint chính

| URL | Mô tả |
|-----|-------|
| `http://localhost:5000/` | Trang chủ |
| `http://localhost:5000/api/test` | Test kết nối |
| `http://localhost:5000/api/tables` | Danh sách bảng |
| `http://localhost:5000/users` | Danh sách người dùng |

## 💾 Cấu hình

Tất cả cấu hình đọc từ biến môi trường. Tạo file `.env`:

```bash
copy .env.example .env
```

Sau đó chỉnh sửa `.env` với thông tin của bạn.

## 📊 Dữ liệu MySQL

**Host:** mysql-28ed0e5e-minecraftnhat9-6255.a.aivencloud.com  
**Port:** 17616  
**Database:** defaultdb  
**User:** avnadmin  

## 🆘 Gặp sự cố?

### Server không khởi động
```bash
python test_connection.py  # Kiểm tra kết nối database
```

### Port 5000 đã được dùng
Sửa trong `index.py` (dòng cuối):
```python
app.run(debug=True, host='localhost', port=8000)  # Thay đổi port
```

### Import error
```bash
pip install -r requirements.txt  # Cài lại dependencies
```

## 📚 Tài liệu đầy đủ

- [README.md](README.md) - Hướng dẫn chi tiết
- [API_DOCS.md](API_DOCS.md) - Tài liệu API
- [config.py](config.py) - Cấu hình

---

**Thành công! Bây giờ ứng dụng của bạn đã sẵn sàng.**
