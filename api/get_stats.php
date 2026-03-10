<?php
require_once 'config.php';

try {
    // Tổng số bài viết (Photos)
    $stmt = $conn->query("SELECT COUNT(*) as total FROM posts");
    $totalPhotos = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Tổng số người tham gia (Contributors)
    $stmt = $conn->query("SELECT COUNT(DISTINCT user_id) as total FROM posts");
    $activeContributors = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Tổng số lượt thích
    $stmt = $conn->query("SELECT SUM(likes) as total FROM posts");
    $totalLikes = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Tổng số Caption AI (Giả sử bằng số bài viết)
    $stmt = $conn->query("SELECT COUNT(*) as total FROM posts WHERE ai_analysis IS NOT NULL AND ai_analysis != ''");
    $aiCaptions = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        "totalPhotos" => (int)$totalPhotos,
        "activeContributors" => (int)$activeContributors,
        "totalLikes" => (int)$totalLikes,
        "aiCaptions" => (int)$aiCaptions
    ]);
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
