<?php
require_once 'config.php';

try {
    // Thêm cột password và role nếu chưa có
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER handle");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' AFTER password");
    
    // Cập nhật user admin mặc định (id = 1)
    // Mật khẩu là 'admin123'
    $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET username = 'admin', handle = '@admin', password = :pass, role = 'ADMIN' WHERE id = 1");
    $stmt->execute(['pass' => $passwordHash]);
    
    echo "Database updated successfully. Admin (ID:1) password set to 'admin123'.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
