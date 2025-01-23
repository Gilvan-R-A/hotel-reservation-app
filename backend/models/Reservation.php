<?php

require_once __DIR__ . '/../config/database.php';

class Reservation {

    public static function getAll() {
        global $pdo;
        $stmt = $pdo->query('SELECT * FROM reservations');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function create($room_number, $start_time, $end_time, $customer_name, $customer_email) {
        global $pdo;
        $stmt = $pdo->prepare('INSERT INTO reservations (room_number, start_time, end_time, customer_name, customer_email) 
        VALUES (:room_number, :start_time, :end_time, :customer_name, :customer_email)');
        return $stmt->execute([
            ':room_number' => $room_number,
            ':start_time' => $start_time,
            ':end_time' => $end_time,
            ':customer_name' => $customer_name,
            ':customer_email' => $customer_email
        ]);
    }

    public static function update($id, $room_number, $start_time, $end_time, $customer_name, $customer_email) {
        global $pdo;
        $stmt = $pdo->prepare('UPDATE reservations SET room_number = :room_number, 
        start_time = :start_time, end_time = :end_time, customer_name = :customer_name, customer_email = :customer_email WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            ':room_number' => $room_number,
            ':start_time' => $start_time,
            ':end_time' => $end_time,
            ':customer_name' => $customer_name,
            ':customer_email' => $customer_email,
        ]);
    }

    public static function delete($id) {
        global $pdo;
        $stmt = $pdo->prepare(('DELETE FROM reservations WHERE id = :id'));
        return $stmt->execute([':id' => $id]);
    }

}
