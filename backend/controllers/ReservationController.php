<?php

require_once '../config/database.php';

class ReservationController {
    public static function index () {
        global $pdo;
        $stmt = $pdo->query('SELECT * FROM  reservations');
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public static function store() {
        global $pdo;
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare(
            'INSERT INTO  reservations (room_number, start_time, end_time, customer_name, customer_email)
             VALUES (:room_number, :start_time, :end_time, :customer_name, customer_email)'
        );
        $stmt->execute($data);
        echo json_encode(['message' => 'Reserva criada com sucesso.']);
    }
}