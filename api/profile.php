<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));
$action = $_GET['action'] ?? '';
$userId = $_GET['userId'] ?? ($_GET['id'] ?? ($data->userId ?? null));

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "Missing User ID"]);
    exit;
}

try {
    if ($action === 'follow') {
        $targetId = $data->targetId ?? null;
        if (!$targetId) {
             echo json_encode(["status" => "error", "message" => "Missing Target ID"]);
             exit;
        }
        $stmt = $conn->prepare("SELECT id FROM follows WHERE follower_id = :u AND following_id = :t");
        $stmt->execute(['u' => $userId, 't' => $targetId]);
        if ($stmt->fetch()) {
            $stmt = $conn->prepare("DELETE FROM follows WHERE follower_id = :u AND following_id = :t");
            $stmt->execute(['u' => $userId, 't' => $targetId]);

            // Delete notification
            $notifStmt = $conn->prepare("DELETE FROM notifications WHERE sender_id = :u AND user_id = :t AND type = 'follow'");
            $notifStmt->execute(['u' => $userId, 't' => $targetId]);

            echo json_encode(["status" => "success", "followed" => false]);
        } else {
            $stmt = $conn->prepare("INSERT INTO follows (follower_id, following_id) VALUES (:u, :t)");
            $stmt->execute(['u' => $userId, 't' => $targetId]);

            // Add notification
            if ($targetId != $userId) {
                $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, type) VALUES (:t, :u, 'follow')");
                $notifStmt->execute(['t' => $targetId, 'u' => $userId]);
            }

            echo json_encode(["status" => "success", "followed" => true]);
        }
    } 
    elseif ($action === 'update') {
        $stmt = $conn->prepare("UPDATE users SET name = :n, handle = :h, location = :l, bio = :b, avatar = :a WHERE id = :u");
        $stmt->execute([
            'u' => $userId,
            'n' => $data->name,
            'h' => $data->handle,
            'l' => $data->location,
            'b' => $data->bio,
            'a' => $data->avatar
        ]);
        echo json_encode(["status" => "success", "message" => "Profile updated"]);
    }
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
