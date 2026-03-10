<?php
require_once 'config.php';

try {
    // Lấy tags và ảnh đại diện cho tag đó từ các bài đăng thực tế
    $query = "SELECT tags, image_url FROM posts WHERE tags IS NOT NULL AND tags != '' ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $tagData = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tags = explode(',', $row['tags']);
        foreach ($tags as $tag) {
            $tag = trim($tag);
            if (!empty($tag)) {
                if (!isset($tagData[$tag])) {
                    $tagData[$tag] = [
                        "count" => 0,
                        "image" => $row['image_url'] // Lấy ảnh của bài mới nhất có tag này
                    ];
                }
                $tagData[$tag]["count"]++;
            }
        }
    }
    
    // Sắp xếp theo số lượng bài đăng giảm dần
    uasort($tagData, function($a, $b) {
        return $b['count'] - $a['count'];
    });
    
    $trending = [];
    $count = 0;
    foreach ($tagData as $tagName => $data) {
        if ($count >= 6) break;
        $trending[] = [
            "id" => $count + 1,
            "name" => str_replace('#', '', $tagName),
            "posts" => $data['count'] . " posts",
            "image" => $data['image']
        ];
        $count++;
    }
    
    echo json_encode($trending);
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
