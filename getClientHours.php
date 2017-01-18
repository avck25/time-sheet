<?php
    require 'db.php';

    class Client implements JSONSerializable {
        
        private $fridayHours;
        private $fridayMin;
        private $regDayHours;
        private $regDayMin;
        private $specialDay = null;
        private $specialHours = null;
        private $specialMin = null;

        public function __construct($array, $special) {
            
            foreach ($array[0] as $key => $value) {
               $this->$key = $value;
            }
            if(!empty($special)) {
               foreach ($special[0] as $key => $value) {
                     $this->$key = $value;
                } 
            }
        }

        public function JSONSerialize() {
            return get_object_vars($this);
        }
    }

    if (empty($_GET['id'])) {
        http_response_code(500);
        exit('No id for client');
    }

    $id = intval($_GET['id']);

    

    $query1 = 'SELECT f.hours as fridayHours,f.minutes as fridayMin,r.hours as regDayHours,r.minutes as regDayMin
              FROM friday_hours f
              JOIN client_names c 
                ON f.client_id = c.id 
              JOIN reg_day_hours r
                ON r.client_id = f.client_id
              WHERE f.client_id = :id';

              $query2 = 'SELECT s.day AS specialDay, s.hours as specialHours,s.minutes as specialMin
              FROM special_day s
              WHERE s.client_id = :id';

    
    

    $statement = $db->prepare($query1);
    $statement->bindParam(':id', $id);
    $statement->execute();
    $hours = $statement->fetchAll(PDO::FETCH_ASSOC);
    $statement->closeCursor();

    $statement = $db->prepare($query2);
    $statement->bindParam(':id', $id);
    $statement->execute();
    $special = $statement->fetchAll(PDO::FETCH_ASSOC);
    $statement->closeCursor();

    $client = new Client($hours, $special);
    
    echo json_encode($client);
    ?>