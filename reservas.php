<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$usuario_id = $input['usuario_id'] ?? null;
$paquete_id = $input['paquete_id'] ?? null;
$fecha_viaje = $input['fecha_viaje'] ?? null;
$numero_personas = $input['numero_personas'] ?? 1;
$precio_total = $input['precio_total'] ?? null;
$estado=$input['estado']?? null;
$notas=$input['notas']?? null;

if (!$usuario_id || !$paquete_id || !$fecha_viaje || !$precio_total) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos requeridos']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO reservas 
        (usuario_id, paquete_id, fecha_viaje, numero_personas, precio_total, estado, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $usuario_id,
        $paquete_id,
        $fecha_viaje,
        $numero_personas,
        $precio_total,
        $estado,
        $notas

    ]);

    http_response_code(201);
    echo json_encode([
        'message' => 'Reserva creada con éxito',
        'id' => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo crear la reserva']);
}
