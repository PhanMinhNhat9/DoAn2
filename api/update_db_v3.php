<?php
require_once 'config.php';

try {
    // Add recipe column to posts table
    $conn->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS recipe TEXT AFTER ai_analysis");
    echo "Database schema updated: 'recipe' column added to 'posts' table.";
} catch(PDOException $e) {
    echo "Error updating database: " . $e->getMessage();
}
?>
