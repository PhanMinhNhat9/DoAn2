<?php
require_once 'config.php';

// Nhận dữ liệu từ request POST
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->imageUrl) &&
    !empty($data->caption) &&
    !empty($data->userId)
) {
    try {
        $query = "INSERT INTO posts (user_id, image_url, caption, ai_analysis, recipe, tags) 
                  VALUES (:user_id, :image_url, :caption, :ai_analysis, :recipe, :tags)";
        
        $stmt = $conn->prepare($query);
        
        $stmt->bindParam(":user_id", $data->userId);
        $stmt->bindParam(":image_url", $data->imageUrl);
        $stmt->bindParam(":caption", $data->caption);
        $stmt->bindParam(":ai_analysis", $data->aiAnalysis);
        $recipe = isset($data->recipe) ? $data->recipe : "";
        $stmt->bindParam(":recipe", $recipe);
        $tags = isset($data->tags) ? implode(',', $data->tags) : "";
        $stmt->bindParam(":tags", $tags);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Post created successfully.", "id" => $conn->lastInsertId()]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unable to create post."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["message" => "Incomplete data."]);
}
?>
