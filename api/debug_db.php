<?php
require_once 'config.php';

try {
    echo "TABLES:\n";
    $stmt = $conn->query("SHOW TABLES");
    while($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo $row[0] . "\n";
    }

    echo "\nUSERS TABLE STRUCTURE:\n";
    $stmt = $conn->query("DESCRIBE users");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
