<?php
require_once 'config.php';

$userId = isset($_GET['id']) ? $_GET['id'] : 1;

try {
    $stmt = $conn->prepare("SELECT id, username, COALESCE(name, username) as name, handle, avatar, location, bio, role,
                           (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
                           (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
                           (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as posts_count,
                           (SELECT COALESCE(SUM(likes), 0) FROM posts WHERE user_id = users.id) as received_likes
                           FROM users WHERE id = :id");
    $stmt->bindParam(":id", $userId);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode($user);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
