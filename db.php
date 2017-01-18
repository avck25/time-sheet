<?php
$cs = 'mysql:host=localhost;dbname=babysitting';
$user = 'admin';
$password = 'yankees1';
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];

try {
    $db = new PDO($cs, $user, $password, $options);
} catch(PDOException $e) {
    $error = $e->getMessage();
    echo $error;
    exit;
}
?>