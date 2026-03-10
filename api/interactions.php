<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';
$userId = $data->user_id ?? ($data->userId ?? null);
$postId = $data->post_id ?? ($data->postId ?? null);

if (!$userId || !$postId) {
    echo json_encode(["status" => "error", "message" => "Missing IDs"]);
    exit;
}

try {
    if ($action === 'like') {
        // Toggle Like
        $stmt = $conn->prepare("SELECT id FROM likes WHERE user_id = :u AND post_id = :p");
        $stmt->execute(['u' => $userId, 'p' => $postId]);
        if ($stmt->fetch()) {
            $stmt = $conn->prepare("DELETE FROM likes WHERE user_id = :u AND post_id = :p");
            $stmt->execute(['u' => $userId, 'p' => $postId]);
            $conn->prepare("UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = :p")->execute(['p' => $postId]);
            
            // Delete notification
            $stmt = $conn->prepare("DELETE FROM notifications WHERE sender_id = :u AND post_id = :p AND type = 'like'");
            $stmt->execute(['u' => $userId, 'p' => $postId]);

            echo json_encode(["status" => "success", "liked" => false]);
        } else {
            $stmt = $conn->prepare("INSERT INTO likes (user_id, post_id) VALUES (:u, :p)");
            $stmt->execute(['u' => $userId, 'p' => $postId]);
            $conn->prepare("UPDATE posts SET likes = likes + 1 WHERE id = :p")->execute(['p' => $postId]);
            
            // Add notification
            $ownerStmt = $conn->prepare("SELECT user_id FROM posts WHERE id = :p");
            $ownerStmt->execute(['p' => $postId]);
            $owner = $ownerStmt->fetch();
            if ($owner && $owner['user_id'] != $userId) {
                $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (:owner, :sender, 'like', :post)");
                $notifStmt->execute(['owner' => $owner['user_id'], 'sender' => $userId, 'post' => $postId]);
            }

            echo json_encode(["status" => "success", "liked" => true]);
        }
    } 
    elseif ($action === 'bookmark') {
        // Toggle Bookmark
        $stmt = $conn->prepare("SELECT id FROM bookmarks WHERE user_id = :u AND post_id = :p");
        $stmt->execute(['u' => $userId, 'p' => $postId]);
        if ($stmt->fetch()) {
            $stmt = $conn->prepare("DELETE FROM bookmarks WHERE user_id = :u AND post_id = :p");
            $stmt->execute(['u' => $userId, 'p' => $postId]);
            echo json_encode(["status" => "success", "bookmarked" => false]);
        } else {
            $stmt = $conn->prepare("INSERT INTO bookmarks (user_id, post_id) VALUES (:u, :p)");
            $stmt->execute(['u' => $userId, 'p' => $postId]);
            echo json_encode(["status" => "success", "bookmarked" => true]);
        }
    }
    elseif ($action === 'comment') {
        // Add Comment
        if (empty($data->content)) {
            echo json_encode(["status" => "error", "message" => "Empty content"]);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO comments (user_id, post_id, content) VALUES (:u, :p, :c)");
        $stmt->execute(['u' => $userId, 'p' => $postId, 'c' => $data->content]);
        $conn->prepare("UPDATE posts SET comments_count = comments_count + 1 WHERE id = :p")->execute(['p' => $postId]);
        
        // Add notification
        $ownerStmt = $conn->prepare("SELECT user_id FROM posts WHERE id = :p");
        $ownerStmt->execute(['p' => $postId]);
        $owner = $ownerStmt->fetch();
        if ($owner && $owner['user_id'] != $userId) {
            $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, type, post_id, content) VALUES (:owner, :sender, 'comment', :post, :content)");
            $notifStmt->execute(['owner' => $owner['user_id'], 'sender' => $userId, 'post' => $postId, 'content' => $data->content]);
        }

        echo json_encode(["status" => "success", "message" => "Comment added"]);
    }
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
