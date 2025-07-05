<?php

class Database
{
    private static $pdo = null;

    public static function getConnection()
    {
        if (self::$pdo === null) {
            try {
                $dbPath = realpath(__DIR__ . '/../database/reservas.db');
                self::$pdo = new PDO("sqlite:" . $dbPath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
            } catch (PDOException $e) {
                die("Erro na conexão com o banco de dados SQLite: " . $e->getMessage());
            }
        }

        return self::$pdo;
    }
}

