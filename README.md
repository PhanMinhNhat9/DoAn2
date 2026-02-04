# 🌐 Web Application - Kết nối MySQL với Python

Ứng dụng web Flask kết nối với MySQL database trên Aiven.

## 🎯 Tính năng

- ✅ Kết nối MySQL với SSL
- 🔐 Hỗ trợ environment variables
- 📊 API RESTful
- 🎨 Giao diện HTML hiện đại
- 🧪 Script kiểm tra kết nối
- 📚 Tài liệu API đầy đủ

## 📋 Yêu cầu hệ thống

- Python 3.7+
- pip (Python package manager)
- Kết nối Internet (để kết nối MySQL server)

## 🚀 Bắt đầu nhanh

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Kiểm tra kết nối MySQL
```bash
python test_connection.py
```

Kết quả mong đợi:
```
✓ Kết nối MySQL thành công!
✓ Kết quả test: 1 + 2 = 3
✓ MySQL Version: 8.0.45
```

### 3. Chạy ứng dụng

**Trên Windows - Sử dụng batch:**
```bash
run.bat
```

**Trên Windows - Sử dụng PowerShell:**
```powershell
.\run.ps1
```

**Trên Linux/Mac:**
```bash
python index.py
```

### 4. Truy cập ứng dụng
- 🏠 Trang chủ: [http://localhost:5000/](http://localhost:5000/)
- 🔍 Kiểm tra API: [http://localhost:5000/api/test](http://localhost:5000/api/test)
- 📋 Danh sách bảng: [http://localhost:5000/api/tables](http://localhost:5000/api/tables)
- 👥 Danh sách người dùng: [http://localhost:5000/users](http://localhost:5000/users)

## 📁 Cấu trúc dự án

```
DoAn2/
├── index.py                 # File chính Flask app
├── config.py                # Cấu hình (không dùng nếu có .env)
├── test_connection.py       # Script test kết nối
├── requirements.txt         # Python dependencies
├── .env.example             # Template environment variables
├── .gitignore              # Git ignore rules
├── API_DOCS.md             # Tài liệu API
├── README.md               # File này
├── run.bat                 # Script chạy trên Windows (batch)
├── run.ps1                 # Script chạy trên Windows (PowerShell)
├── run.py                  # Script chạy Python
└── templates/
    ├── index.html          # Trang chủ
    └── users.html          # Trang danh sách người dùng
```

## 🔧 Cấu hình

### Database Connection Info
```
Host: mysql-28ed0e5e-minecraftnhat9-6255.a.aivencloud.com
Port: 17616
Database: defaultdb
User: avnadmin
SSL: REQUIRED
```

### Sử dụng Environment Variables

1. **Tạo file `.env` từ template:**
```bash
copy .env.example .env
```

2. **Chỉnh sửa `.env` với credentials của bạn**

3. **Ứng dụng sẽ tự load từ `.env`**

## 📚 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Trang chủ HTML |
| GET | `/api/test` | Kiểm tra kết nối MySQL |
| GET | `/api/tables` | Danh sách các bảng (JSON) |
| GET | `/api/users` | Danh sách người dùng (JSON) |
| GET | `/users` | Danh sách người dùng (HTML) |

Xem chi tiết trong [API_DOCS.md](API_DOCS.md)

## 🐛 Troubleshooting

### Lỗi: "Kết nối bị từ chối"
- Kiểm tra internet connection
- Kiểm tra firewall settings
- Xác nhận thông tin MySQL credentials

### Lỗi: "No module named 'flask'"
```bash
pip install -r requirements.txt
```

### Port 5000 đã được sử dụng
Thay đổi port trong `index.py`:
```python
app.run(debug=True, host='localhost', port=8000)
```

### Lỗi SSL
Đảm bảo sử dụng `ssl-mode=REQUIRED`

## 🔒 Bảo mật

⚠️ **QUAN TRỌNG:**

- ❌ **KHÔNG** commit file `.env` vào git
- ❌ **KHÔNG** lộ password trong code
- ✅ Sử dụng environment variables
- ✅ Thay đổi SECRET_KEY trước deployment

## 📝 Ghi chú phát triển

### Tạo bảng users (nếu chưa có)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Thêm dữ liệu test
```sql
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');
```

## 📚 Tài liệu tham khảo

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-MySQLdb](https://flask-mysqldb.readthedocs.io/)
- [Aiven MySQL](https://aiven.io/mysql)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 💡 Ý tưởng tiếp theo

- [ ] Thêm authentication
- [ ] Tạo admin dashboard
- [ ] Implement CRUD operations
- [ ] Thêm logging
- [ ] Unit tests
- [ ] Docker support
- [ ] Deployment guide

## 📄 License

Đây là dự án học tập.

---

**Được tạo bởi:** GitHub Copilot  
**Ngày cập nhật:** 2026-02-04

