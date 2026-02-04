#!/usr/bin/env python3
"""
Script chạy web server
"""

import os
import sys

# Thêm thư mục hiện tại vào path
sys.path.insert(0, os.path.dirname(__file__))

from index import app

if __name__ == '__main__':
    print("🚀 Bắt đầu server Flask...")
    print("📍 Truy cập: http://localhost:5000/")
    print("🔧 Dừng server: Ctrl+C")
    
    app.run(
        debug=True,
        host='localhost',
        port=5000,
        use_reloader=True
    )
