<?php
    require 'db.php';

   

    $query1 = 'SELECT c.name, c.id
              FROM client_names c';

    

    $statement = $db->prepare($query1);
    
    $statement->execute();
    $name = $statement->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($name);
    ?>