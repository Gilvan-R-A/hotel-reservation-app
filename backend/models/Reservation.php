<?php

require_once __DIR__ . '/../config/database.php';

class Reservation
{
    public static function getAll()
    {
        $db = Database::getConnection();
        $query = "SELECT * FROM reservations";
        $stmt = $db->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function create($room_number, $start_time, $end_time, $customer_name, $customer_email)
    {

        if (!self::isValidEmail($customer_email)) {
            throw new Exception("O e-mail fornecido é inválido.");
        }

        $db = Database::getConnection();
        $query = 'INSERT INTO reservations (room_number, start_time, end_time, customer_name, customer_email) 
                  VALUES (:room_number, :start_time, :end_time, :customer_name, :customer_email)';
        $stmt = $db->prepare($query);

        return $stmt->execute([
            ':room_number' => $room_number,
            ':start_time' => $start_time,
            ':end_time' => $end_time,
            ':customer_name' => $customer_name,
            ':customer_email' => $customer_email
        ]);
    }

    public static function update($id, $room_number, $start_time, $end_time, $customer_name, $customer_email)
    {
        $db = Database::getConnection();
        $query = 'UPDATE reservations SET room_number = :room_number, 
                  start_time = :start_time, end_time = :end_time, 
                  customer_name = :customer_name, customer_email = :customer_email 
                  WHERE id = :id';
        $stmt = $db->prepare($query);

        return $stmt->execute([
            ':id' => $id,
            ':room_number' => $room_number,
            ':start_time' => $start_time,
            ':end_time' => $end_time,
            ':customer_name' => $customer_name,
            ':customer_email' => $customer_email,
        ]);
    }

    public static function delete($id)
    {
        $db = Database::getConnection();
        $query = 'DELETE FROM reservations WHERE id = :id';
        $stmt = $db->prepare($query);

        return $stmt->execute([':id' => $id]);
    }

    public static function checkConflict($room_number, $start_time, $end_time, $exclude_id = null)
    {
        $db = Database::getConnection();

        $query = "SELECT * FROM reservations WHERE room_number = :room_number 
                  AND ((start_time < :end_time AND end_time > :start_time) OR
                       (start_time < :end_time AND end_time > :start_time))";

        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(':room_number', $room_number);
        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);

        if ($exclude_id) {
            $stmt->bindParam(':exclude_id', $exclude_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

}
