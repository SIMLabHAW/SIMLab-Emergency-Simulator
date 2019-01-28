<?php

    /* Copyright (C) 2018 HAW-Hamburg,
    Project lead: Prof. Dr. Boris Tolg, Prof. Dr. Stefan Oppermann,
    Development: Christian Bauer, Serena Glass, Christine Geßner, Chahinez Chaouchi.

    This file is part of SIMLab-Emergency-Simulator.

    SIMLab-Emergency-Simulator
    is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    SIMLab-Emergency-Simulator
    is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with SIMLab-Emergency-Simulator.  If not, see <http://www.gnu.org/licenses/>. */
    session_start();
 
 	/*Function: joinActiveLesson
    Checks whether a lesson for the session's trainee id exists. If yes, sets session's trainer 
    id and returns true. Otherwise returns false. */
   function joinActiveLesson(){
        include 'domain.php';
        $username = $_SESSION['username'];
        $traineeID = $_SESSION['traineeID'];
        //error_log("Try to join sesson for trainee with id: " . $traineeID);
        $user = getUserByName($username);
        $lesson = getLessonByParticipants(null, $traineeID);
       
        if($lesson){
            //error_log("Found a sesson for trainee with id: " . $traineeID);
            $trainerID = $lesson->getTrainerId();
            $lesson_to_compare = getLessonByParticipants($trainerID, $traineeID);

            if ($lesson->getId() == $lesson_to_compare->getId()){

                $_SESSION['trainerID'] = $trainerID;
                //error_log("Joining lesson with id: " . $lesson->getId());
                echo json_encode(["active"=>"true"]);
            
            }else{
                echo json_encode(["active"=>"false"]);
            }
        }else{
            echo json_encode(["active"=>"false"]);
        }
   }

   switch ($_POST['callMethod']) {
    case 'joinActiveLesson':
        joinActiveLesson();
        break;   
}
?> 