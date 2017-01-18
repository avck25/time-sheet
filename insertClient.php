<?php
    require 'db.php';

    if (empty($_POST['client'])) {
        http_response_code(500);
        exit('No client');
    }

    $client = $_POST['client'];
    $regularDay = $client['regularDay'];
    $friday = $client['friday'];
    if(!empty($client['specialDay'])){
         $specialDay = $client['specialDay'];
    } else {
        $specialDay = '';
    }

    
    

    $query1 = 'INSERT INTO `client_names`(`id`, `name`) VALUES (null, :name)';

    $query2 = 'INSERT INTO `reg_day_hours`(`client_id`, `hours`, `minutes`) VALUES (:id,:hours,:minutes)';

    $query3 = 'INSERT INTO `friday_hours`(`client_id`, `hours`, `minutes`) VALUES (:id,:hours,:minutes)';

    $query4 = 'INSERT INTO `special_day`(`client_id`, `day`, `hours`, `minutes`) VALUES (:id,:day,:hours,:minutes)';

    $statement = $db->prepare($query1);
    $statement->bindParam(':name', $client['name']);
    $rowsInserted = $statement->execute();
    if($rowsInserted) {
            $id = $db->lastInsertId();
        }
        else {
            http_response_code(500);
            exit('Unable to add contact');
        }
    
    

    $statement = $db->prepare($query2);
    $statement->bindParam(':id', $id);
    $statement->bindParam(':hours', $regularDay['hours']);
    $statement->bindParam(':minutes', $regularDay['minutes']);
    $rowsInserted = $statement->execute();
    if(!$rowsInserted) {
            http_response_code(500);
            exit('Unable to add regularDay hours');
        }

    $statement = $db->prepare($query3);
    $statement->bindParam(':id', $id);
    $statement->bindParam(':hours', $friday['hours']);
    $statement->bindParam(':minutes', $friday['minutes']);
    $rowsInserted = $statement->execute();
    if(!$rowsInserted) {
            http_response_code(500);
            exit('Unable to add friday hours');
        }

    if(!empty($specialDay)) {
        $statement = $db->prepare($query4);
        $statement->bindParam(':id', $id);
        $statement->bindParam(':day', $specialDay['day']);
        $statement->bindParam(':hours', $specialDay['hrsAndMin']['hours']);
        $statement->bindParam(':minutes', $specialDay['hrsAndMin']['minutes']);
        $rowsInserted = $statement->execute();
        if(!$rowsInserted) {
                http_response_code(500);
                exit('Unable to add specialDay hours');
        }
    }

    echo('Client Added Succesfully');
        
    ?>