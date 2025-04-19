<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;

class Database
{
    private static $pdo = null;

    public static function getConnection()
    {
        if (self::$pdo === null) {
            $dotenvPath = __DIR__ . '/../../';

            if (file_exists($dotenvPath . '.env')) {
                $dotenv = Dotenv::createImmutable($dotenvPath);
                $dotenv->load();
            }

            $host = $_ENV['DB_HOST'];
            $dbname = $_ENV['DB_NAME'];
            $user = $_ENV['DB_USER'];
            $password = $_ENV['DB_PASS'];
            $port = $_ENV['DB_PORT'];

            try {
                self::$pdo = new PDO("mysql:host=$host; port=$port; dbname=$dbname; charset=utf8mb4", $user, $password);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die("Erro ao conectar ao banco de dados: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}
