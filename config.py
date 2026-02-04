# Cấu hình kết nối MySQL Aiven

DATABASE_CONFIG = {
    'host': 'mysql-28ed0e5e-minecraftnhat9-6255.a.aivencloud.com',
    'user': 'avnadmin',
    'password': 'AVNS_4XFD9IS0RnRM9umpDkp',
    'database': 'defaultdb',
    'port': 17616,
    'ssl_mode': 'REQUIRED',
    'charset': 'utf8mb4'
}

# Cấu hình Flask
FLASK_CONFIG = {
    'DEBUG': True,
    'HOST': 'localhost',
    'PORT': 5000
}

# Cấu hình ứng dụng
APP_CONFIG = {
    'secret_key': 'your-secret-key-change-this',
    'max_content_length': 16 * 1024 * 1024  # 16MB max file size
}
