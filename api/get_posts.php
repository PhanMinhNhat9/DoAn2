<?php
require_once 'config.php';

$search = $_GET['search'] ?? '';
$userId = $_GET['userId'] ?? null; // For checking liked/bookmarked
$filter = $_GET['filter'] ?? null; // 'bookmarks', 'profile', 'explore'
$targetUser = $_GET['targetUser'] ?? null; // For profile page

try {
    $where = ["p.privacy = 'public'"];
    $params = [];

    if ($search) {
        $where[] = "(p.caption LIKE :s OR p.tags LIKE :s OR u.username LIKE :s)";
        $params['s'] = "%$search%";
    }

    if ($filter === 'profile' && $targetUser) {
        // Show specific user's posts (including their private ones if viewed by themselves)
        $where = ["u.handle = :hu"];
        if ($userId && $userId != $targetUser) {
             $where[] = "p.privacy = 'public'";
        }
        $params['hu'] = $targetUser;
    }

    if ($filter === 'bookmarks' && $userId) {
        $where[] = "EXISTS (SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = :uid)";
        $params['uid'] = $userId;
    }

    $whereClause = implode(" AND ", $where);
    $order = ($filter === 'explore') ? "RAND()" : "p.created_at DESC";

    $query = "SELECT p.*, COALESCE(u.name, u.username) as name, u.handle, u.avatar, u.location, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following,
              EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = :uid_check) as is_liked,
              EXISTS (SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = :uid_check) as is_bookmarked,
              EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = :uid_check AND f.following_id = u.id) as is_following
              FROM posts p 
              JOIN users u ON p.user_id = u.id 
              WHERE $whereClause
              ORDER BY $order";
    
    $params['uid_check'] = $userId ?? 0;
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    
    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $posts[] = [
            "id" => $row['id'],
            "user" => [
                "id" => $row['user_id'],
                "name" => $row['name'],
                "handle" => $row['handle'],
                "avatar" => $row['avatar'],
                "location" => $row['location'],
                "bio" => $row['bio'] || "Food explorer & VietFood enthusiast 🍜",
                "followers" => $row['followers'],
                "following" => $row['following'],
                "isFollowing" => (bool)$row['is_following']
            ],
            "image" => $row['image_url'],
            "caption" => $row['caption'],
            "aiAnalysis" => $row['ai_analysis'],
            "recipe" => $row['recipe'],
            "likes" => (int)$row['likes'],
            "comments" => (int)$row['comments_count'],
            "time" => $row['created_at'],
            "tags" => explode(',', $row['tags']),
            "isLiked" => (bool)$row['is_liked'],
            "isBookmarked" => (bool)$row['is_bookmarked'],
            "privacy" => $row['privacy']
        ];
    }
    
    echo json_encode($posts);
} catch(PDOException $e) {
    echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
}
?>
