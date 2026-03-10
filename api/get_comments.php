<?php
require_once 'config.php';

$postId = $_GET['post_id'] ?? null;

if (!$postId) {
    echo json_encode(["status" => "error", "message" => "Missing post ID"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT c.*, u.username as name, u.avatar 
                            FROM comments c 
                            JOIN users u ON c.user_id = u.id 
                            WHERE c.post_id = :p 
                            ORDER BY c.created_at ASC");
    $stmt->execute(['p' => $postId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
