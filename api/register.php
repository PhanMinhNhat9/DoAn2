<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password) && !empty($data->handle)) {
    try {
        // Kiểm tra xem username đã tồn tại chưa
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = :user");
        $checkStmt->execute(['user' => $data->username]);
        if ($checkStmt->fetch()) {
            echo json_encode(["status" => "error", "message" => "Username already exists"]);
            exit;
        }

        // Hash mật khẩu
        $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
        
        // Tạo avatar mặc định nếu không có
        $avatar = !empty($data->avatar) ? $data->avatar : "https://api.dicebear.com/7.x/avataaars/svg?seed=" . $data->username;
        $location = !empty($data->location) ? $data->location : "Viet Nam";

        // Thêm người dùng mới
        $query = "INSERT INTO users (username, handle, password, avatar, location, role) 
                  VALUES (:username, :handle, :password, :avatar, :location, 'user')";
        
        $stmt = $conn->prepare($query);
        $result = $stmt->execute([
            'username' => $data->username,
            'handle' => $data->handle,
            'password' => $passwordHash,
            'avatar' => $avatar,
            'location' => $location
        ]);

        if ($result) {
            echo json_encode([
                "status" => "success",
                "message" => "Account created successfully"
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create account"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
}
?>
