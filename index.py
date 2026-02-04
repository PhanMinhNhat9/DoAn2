from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import os
from dotenv import load_dotenv

# Load biến môi trường từ .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key_here')

# Cấu hình kết nối MySQL
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'mysql-28ed0e5e-minecraftnhat9-6255.a.aivencloud.com')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'avnadmin')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', 'AVNS_4XFD9IS0RnRM9umpDkp')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'defaultdb')
app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT', 17616))
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# SSL configuration
app.config['MYSQL_USE_UNICODE'] = True
app.config['MYSQL_CHARSET'] = 'utf8mb4'

mysql = MySQL(app)

# Route trang chủ
@app.route('/')
def index():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT 1 + 2 as three')
        result = cursor.fetchone()
        
        # Lấy danh sách các bảng
        cursor.execute('SHOW TABLES')
        tables = cursor.fetchall()
        cursor.close()
        
        table_list = '<ul>' + ''.join([f'<li>{t[0]}</li>' for t in tables]) + '</ul>' if tables else '<p>Chưa có bảng nào</p>'
        
        return f'''
        <html>
        <head>
            <title>MySQL Web App</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
                .container {{ background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                h1 {{ color: #333; }}
                .success {{ color: green; padding: 10px; background: #d4edda; border-radius: 4px; }}
                a {{ display: inline-block; margin: 10px 5px 10px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }}
                a:hover {{ background: #0056b3; }}
                ul {{ list-style: none; padding: 0; }}
                li {{ padding: 5px; background: #f9f9f9; margin: 5px 0; border-left: 3px solid #007bff; padding-left: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 Chào mừng đến Web Application</h1>
                <div class="success">✓ Kết nối MySQL thành công (Test: 1 + 2 = {result['three']})</div>
                
                <h2>📊 Các bảng trong database:</h2>
                {table_list}
                
                <h2>🔗 Các chức năng:</h2>
                <a href="/api/test">🔍 Kiểm tra API</a>
                <a href="/api/tables">📋 Danh sách bảng (JSON)</a>
                <a href="/users">👥 Xem người dùng</a>
            </div>
        </body>
        </html>
        '''
    except Exception as e:
        return f'<h1>❌ Lỗi!</h1><p>{str(e)}</p>', 500

# Route lấy danh sách người dùng
@app.route('/users')
def users():
    try:
        return render_template('users.html')
    except Exception as e:
        return f'<p>Chưa có bảng users hoặc lỗi: {str(e)}</p><a href="/">Về trang chủ</a>'

# API route lấy danh sách người dùng
@app.route('/api/users', methods=['GET'])
def api_users():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SHOW TABLES')
        tables = cursor.fetchall()
        
        if not tables:
            cursor.close()
            return jsonify({'users': [], 'message': 'Chưa có bảng nào'})
        
        # Nếu tồn tại bảng users, lấy dữ liệu
        try:
            cursor.execute('SELECT * FROM users LIMIT 50')
            user_data = cursor.fetchall()
        except:
            user_data = []
        
        cursor.close()
        return jsonify({'users': user_data, 'tables': [t for t in tables]})
    except Exception as e:
        return jsonify({'error': str(e), 'users': []}), 500

# Route API test
@app.route('/api/test', methods=['GET'])
def api_test():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT VERSION()')
        version = cursor.fetchone()
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Kết nối MySQL thành công',
            'mysql_version': str(version['VERSION()']) if 'VERSION()' in version else str(version)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route API lấy danh sách các bảng
@app.route('/api/tables', methods=['GET'])
def api_tables():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SHOW TABLES')
        tables = cursor.fetchall()
        
        table_list = [t['Tables_in_defaultdb'] if 'Tables_in_defaultdb' in t else list(t.values())[0] for t in tables]
        cursor.close()
        
        return jsonify({
            'status': 'success',
            'database': 'defaultdb',
            'tables': table_list,
            'total': len(table_list)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
