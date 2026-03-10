<?php
require_once 'config.php';

$id = isset($_GET['id']) ? $_GET['id'] : null;
$userId = isset($_GET['userId']) ? $_GET['userId'] : null;

if ($id && $userId) {
    try {
        // Chỉ xóa nếu là chủ bài viết hoặc là ADMIN
        $stmt = $conn->prepare("DELETE FROM posts WHERE id = :id AND (user_id = :uid OR (SELECT role FROM users WHERE id = :uid2) = 'ADMIN')");
        $stmt->execute(['id' => $id, 'uid' => $userId, 'uid2' => $userId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Post deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unauthorized or post not found"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing ID"]);
}
?>
