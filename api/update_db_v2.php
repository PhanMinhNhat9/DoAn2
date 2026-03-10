<?php
require_once 'config.php';

try {
    // 1. Bảng Likes
    $conn->exec("CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, post_id)
    )");

    // 2. Bảng Comments
    $conn->exec("CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 3. Bảng Bookmarks (Lưu bài viết)
    $conn->exec("CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bookmark (user_id, post_id)
    )");

    // 4. Bảng Follows
    $conn->exec("CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_follow (follower_id, following_id)
    )");

    // 5. Bảng Stories
    $conn->exec("CREATE TABLE IF NOT EXISTS stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        image_url LONGTEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 6. Cập nhật bảng Posts - thêm các cột cần thiết
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS privacy ENUM('public', 'private') DEFAULT 'public'");
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0");
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0 AFTER likes");
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT AFTER caption");
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_analysis TEXT AFTER tags");

    // 7. Cập nhật bảng Users - thêm các cột cần thiết
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) AFTER id");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT AFTER location");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS followers INT DEFAULT 0");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS following INT DEFAULT 0");

    echo "Database schema updated successfully with all interaction tables and columns.";
} catch(PDOException $e) {
    echo "Error updating database: " . $e->getMessage();
}
?>
