# 📁 Cấu trúc dự án

```
DoAn2/
│
├── 📄 index.py                    # File chính - Flask application
├── 📄 config.py                   # Cấu hình (load từ .env)
├── 📄 test_connection.py          # Script test kết nối MySQL
├── 📄 run.py                      # Script chạy Flask
│
├── 📋 requirements.txt            # Python packages cần cài
├── 📋 .env.example                # Template biến môi trường
├── 📋 .gitignore                  # Git ignore rules
│
├── 📖 README.md                   # Hướng dẫn chi tiết
├── 📖 QUICKSTART.md               # Hướng dẫn nhanh (30 giây)
├── 📖 API_DOCS.md                 # Tài liệu API endpoints
├── 📖 PROJECT_STRUCTURE.md        # File này
│
├── 🪟 run.bat                     # Chạy trên Windows (batch)
├── 🪟 run.ps1                     # Chạy trên Windows (PowerShell)
│
└── 📁 templates/                  # Thư mục HTML templates
    ├── index.html                 # Trang chủ
    └── users.html                 # Trang danh sách người dùng
```

## 📝 Chi tiết từng file

### Core Files
- **index.py** - Ứng dụng Flask chính, định nghĩa các routes
- **config.py** - Cấu hình mặc định (không cần nếu dùng .env)
- **requirements.txt** - Liệt kê tất cả Python packages cần thiết

### Database
- **test_connection.py** - Script kiểm tra kết nối MySQL

### Scripts chạy
- **run.py** - Chạy Flask development server (Python)
- **run.bat** - Chạy trên Windows (Command Prompt)
- **run.ps1** - Chạy trên Windows (PowerShell)

### Configuration
- **.env.example** - Template file .env (copy và điền credentials)
- **.gitignore** - Các file không push lên git (passwords, etc.)
- **config.py** - Cấu hình database

### Documentation
- **README.md** - Hướng dẫn chi tiết đầy đủ
- **QUICKSTART.md** - Bắt đầu nhanh trong 30 giây
- **API_DOCS.md** - Tài liệu chi tiết API endpoints
- **PROJECT_STRUCTURE.md** - File này

### Templates (HTML)
- **templates/index.html** - Trang chủ
- **templates/users.html** - Danh sách người dùng

## 🔄 Luồng dữ liệu

```
Request (Browser/API Client)
    ↓
Flask Server (index.py)
    ↓
MySQL Database
    ↓
Response (JSON/HTML)
    ↓
Client
```

## 🚀 Quy trình chạy

```
1. python test_connection.py       # Kiểm tra kết nối (optional)
   ↓
2. python index.py                 # Khởi động Flask server
   ↓
3. Browser: http://localhost:5000/ # Truy cập ứng dụng
   ↓
4. Server xử lý request và trả về dữ liệu từ MySQL
```

## 📦 Python Packages

| Package | Phiên bản | Mục đích |
|---------|-----------|---------|
| Flask | 2.3.2 | Web framework |
| flask-mysqldb | 1.0.1 | MySQL adapter |
| PyMySQL | 1.1.0 | MySQL client library |
| python-dotenv | 1.0.0 | Load environment variables |

## 🗂️ Cách mở rộng

### Thêm route mới
Thêm vào `index.py`:
```python
@app.route('/api/new-endpoint', methods=['GET', 'POST'])
def new_endpoint():
    return jsonify({'message': 'Hello'})
```

### Thêm template HTML
1. Tạo file trong `templates/`
2. Render bằng: `return render_template('file.html')`

### Thêm bảng database
```sql
CREATE TABLE my_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Bảo mật

- Credentials lưu trong `.env` (không track trên git)
- Debug mode tắt khi deploy
- SECRET_KEY thay đổi trước production

---

**Đó là tất cả! Dự án của bạn đã sẵn sàng phát triển.**
