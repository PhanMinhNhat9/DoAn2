<?php
require_once 'config.php';

$action = $_GET['action'] ?? 'get';
$data = json_decode(file_get_contents("php://input"));

try {
    if ($action === 'post') {
        if (!empty($data->userId) && !empty($data->image)) {
            $stmt = $conn->prepare("INSERT INTO stories (user_id, image_url, expires_at) 
                                    VALUES (:u, :i, DATE_ADD(NOW(), INTERVAL 24 HOUR))");
            $stmt->execute(['u' => $data->userId, 'i' => $data->image]);
            echo json_encode(["status" => "success", "message" => "Story posted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing data"]);
        }
    } else {
        // Get active stories (not expired)
        $stmt = $conn->query("SELECT s.*, u.username, u.avatar 
                              FROM stories s 
                              JOIN users u ON s.user_id = u.id 
                              WHERE s.expires_at > NOW() 
                              ORDER BY s.created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
