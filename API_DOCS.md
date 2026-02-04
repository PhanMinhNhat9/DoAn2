# 📚 API Documentation

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Trang chủ
**GET** `/`

Trả về trang HTML chính của ứng dụng với thông tin kết nối và danh sách bảng.

**Response:**
```html
HTML page với thông tin kết nối
```

---

### 2. Kiểm tra kết nối API
**GET** `/api/test`

Kiểm tra kết nối MySQL và lấy thông tin phiên bản.

**Response:**
```json
{
  "status": "success",
  "message": "Kết nối MySQL thành công",
  "mysql_version": "8.0.45-0~debian-1~bullseye"
}
```

---

### 3. Danh sách các bảng
**GET** `/api/tables`

Lấy danh sách tất cả các bảng trong database.

**Response:**
```json
{
  "status": "success",
  "database": "defaultdb",
  "tables": ["table1", "table2", "table3"],
  "total": 3
}
```

---

### 4. Danh sách người dùng (HTML)
**GET** `/users`

Trả về trang HTML hiển thị danh sách người dùng.

**Response:**
```html
HTML page với bảng người dùng
```

---

### 5. Danh sách người dùng (JSON API)
**GET** `/api/users`

Lấy dữ liệu người dùng dưới dạng JSON.

**Response:**
```json
{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com"},
    {"id": 2, "name": "Jane", "email": "jane@example.com"}
  ],
  "tables": ["users", "posts", "comments"]
}
```

---

## 🔒 Thông tin kết nối

- **Host**: mysql-28ed0e5e-minecraftnhat9-6255.a.aivencloud.com
- **Port**: 17616
- **Database**: defaultdb
- **User**: avnadmin
- **SSL**: REQUIRED

## 📝 Ghi chú

Tất cả các API endpoints có thể gặp lỗi nếu:
- Database không kết nối được
- Bảng không tồn tại
- Lỗi syntax trong query

Trong trường hợp lỗi, server sẽ trả về:
```json
{
  "status": "error",
  "message": "Chi tiết lỗi"
}
```
