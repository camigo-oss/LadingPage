<?php
require 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM destinos ORDER BY nombre");
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos']);
}
