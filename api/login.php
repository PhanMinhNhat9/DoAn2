<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    try {
        $stmt = $conn->prepare("SELECT id, username, COALESCE(name, username) as name, password, handle, avatar, location, bio, role, 
                               (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
                               (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
                               (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as posts_count,
                               (SELECT COALESCE(SUM(likes), 0) FROM posts WHERE user_id = users.id) as received_likes
                               FROM users WHERE username = :user");
        $stmt->execute(['user' => $data->username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password'])) {
            // Xóa password trước khi gửi về client
            unset($user['password']);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => $user
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid username or password"
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing credentials"]);
}
?>
