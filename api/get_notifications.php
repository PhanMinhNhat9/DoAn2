<?php
require_once 'config.php';

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "Missing User ID"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            n.id, 
            n.type, 
            n.content, 
            n.created_at, 
            u.username as sender_name, 
            u.avatar as sender_avatar
        FROM notifications n
        JOIN users u ON n.sender_id = u.id
        WHERE n.user_id = :u
        ORDER BY n.created_at DESC
        LIMIT 50
    ");
    $stmt->execute(['u' => $userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format time ago (approximate for display)
    foreach ($notifications as &$n) {
        $time = strtotime($n['created_at']);
        $diff = time() - $time;
        if ($diff < 60) $n['time_ago'] = 'Vừa xong';
        else if ($diff < 3600) $n['time_ago'] = floor($diff/60) . ' phút trước';
        else if ($diff < 86400) $n['time_ago'] = floor($diff/3600) . ' giờ trước';
        else $n['time_ago'] = floor($diff/86400) . ' ngày trước';

        // Set display content based on type
        if ($n['type'] === 'like') $n['display_content'] = 'đã thích bài viết của bạn';
        else if ($n['type'] === 'comment') $n['display_content'] = 'đã bình luận: "' . $n['content'] . '"';
        else if ($n['type'] === 'follow') $n['display_content'] = 'đã bắt đầu theo dõi bạn';
    }

    echo json_encode($notifications);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
