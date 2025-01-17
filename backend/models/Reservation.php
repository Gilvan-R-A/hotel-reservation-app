<?php

require_once '../config/database.php';

class Reservation 
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAllReservations()
    {
        $stmt = $this->pdo->query('SELECT * FROM reservations');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createReservation($data)
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO reservations (room_Number, start_time, end_time, customer_name, customer_email)
             VALUES (:room_number, :start_time, :end_time, :customer_name, :customer_email)'
        );

        $stmt->bindParam(':room_number', $data['room_number'], PDO::PARAM_INT);
        $stmt->bindParam(':start_time', $data['start_time'], PDO::PARAM_STR);
        $stmt->bindParam(':end_time', $data['end_time'], PDO::PARAM_STR);
        $stmt->bindParam(':customer_name', $data['customer_name'], PDO::PARAM_STR);
        $stmt->bindParam(':customer_email', $data['customer_email'], PDO::PARAM_STR);

        return $stmt->execute();
    }

    public function checkConflict($startTime, $endTime, $roomNumber)
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM reservations 
            WHERE room_number = :room_number 
            AND ((start_time < :end_time AND end_time > :start_time))'
        );

        $stmt->bindParam(':room_number', $roomNumber, PDO::PARAM_INT);
        $stmt->bindParam(':start_time', $startTime, PDO::PARAM_STR);
        $stmt->bindParam(':end_time', $endTime, PDO::PARAM_STR);
        $stmt->execute();

        return $stmt->fetchColumn() > 0;

    }

}