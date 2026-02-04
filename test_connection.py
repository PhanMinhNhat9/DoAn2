#!/usr/bin/env python3
"""
Script kiểm tra kết nối MySQL
"""

import MySQLdb
from config import DATABASE_CONFIG

def test_connection():
    """Kiểm tra kết nối đến MySQL"""
    try:
        # Kết nối đến MySQL
        connection = MySQLdb.connect(
            host=DATABASE_CONFIG['host'],
            user=DATABASE_CONFIG['user'],
            passwd=DATABASE_CONFIG['password'],
            db=DATABASE_CONFIG['database'],
            port=DATABASE_CONFIG['port'],
            ssl={'ssl': True}
        )
        
        cursor = connection.cursor()
        
        # Test query
        cursor.execute('SELECT 1 + 2 as three')
        result = cursor.fetchone()
        
        print("✓ Kết nối MySQL thành công!")
        print(f"✓ Kết quả test: 1 + 2 = {result[0]}")
        
        # Lấy phiên bản MySQL
        cursor.execute('SELECT VERSION()')
        version = cursor.fetchone()
        print(f"✓ MySQL Version: {version[0]}")
        
        cursor.close()
        connection.close()
        
        return True
    except MySQLdb.Error as e:
        print(f"✗ Lỗi kết nối MySQL: {e}")
        return False
    except Exception as e:
        print(f"✗ Lỗi: {e}")
        return False

if __name__ == '__main__':
    test_connection()
