<?php
require_once 'config.php';

$userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

try {
    // 1. Tổng quan cơ bản
    $stmt = $conn->prepare("SELECT 
        COUNT(*) as total_posts,
        SUM(likes) as total_likes,
        (SELECT COUNT(*) FROM follows WHERE following_id = :uid) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = :uid) as following_count
        FROM posts WHERE user_id = :uid");
    $stmt->execute(['uid' => $userId]);
    $overview = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Trung bình tương tác mỗi bài
    $avg_likes = $overview['total_posts'] > 0 ? round($overview['total_likes'] / $overview['total_posts'], 1) : 0;

    // 3. Bài viết được yêu thích nhất (Engagement Peak)
    $stmt = $conn->prepare("SELECT caption, likes, image_url as image, created_at as time FROM posts WHERE user_id = :uid ORDER BY likes DESC LIMIT 1");
    $stmt->execute(['uid' => $userId]);
    $topPost = $stmt->fetch(PDO::FETCH_ASSOC);

    // 4. Hoạt động 7 ngày gần nhất (Mock data for chart logic or simplified count)
    // Thực tế có thể truy vấn GROUP BY DATE(time)
    $stmt = $conn->prepare("SELECT DATE(created_at) as date, COUNT(*) as count, SUM(likes) as likes 
                           FROM posts WHERE user_id = :uid 
                           AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                           GROUP BY DATE(created_at) ORDER BY date ASC");
    $stmt->execute(['uid' => $userId]);
    $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "overview" => [
                "posts" => (int)$overview['total_posts'],
                "likes" => (int)$overview['total_likes'],
                "followers" => (int)$overview['followers_count'],
                "following" => (int)$overview['following_count'],
                "avgLikes" => $avg_likes
            ],
            "topPost" => $topPost,
            "recentActivity" => $recentActivity
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
