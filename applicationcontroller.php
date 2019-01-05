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
    // for trainer & trainee!


    // start session to remain in session
    session_start();
 //xxxxx//   $username = $_SESSION["username"];

    date_default_timezone_set('Europe/Berlin');
    // allows dealing with magic quotes
    if (get_magic_quotes_gpc())   
    {   
        function stripslashes_deep($value)   
        {   
            $value = is_array($value) ?   
            array_map('stripslashes_deep', $value) :   
            stripslashes($value); 
            return $value;   
        }     
        
        $_POST = array_map('stripslashes_deep', $_POST);   
        $_GET = array_map('stripslashes_deep', $_GET);   
        $_COOKIE = array_map('stripslashes_deep', $_COOKIE);   
        $_REQUEST = array_map('stripslashes_deep', $_REQUEST);   
    }

    $applicationController;

    function getApplicationController(){
        global $applicationController;
        if (isset($applicationController)){
            return $applicationController;
        }else{
            $applicationController = new ApplicationController();
            return $applicationController;
        }
    }

    function getCurrentTraineeId(){
        if (isset($_SESSION["traineeID"])){
            return $_SESSION["traineeID"];
        }else{
            return null;
        }
    }

    function getCurrentTrainerId(){
        if (isset($_SESSION["trainerID"])){
            return $_SESSION["trainerID"];
        }else{
            return null;
        }
    }

	function getAllUsersJson(){
        include 'domain.php';
        $users = getAllUsers();
        $AllUsersJson = '[' . implode(",", $users) . ']';
        echo $AllUsersJson;
    }
	
    function getTraineesJson(){
        include 'domain.php';
        $trainees = getTrainees();
        $traineesJson = '[' . implode(",", $trainees) . ']';
        // error_log("getTraineesJson: " .  $traineesJson);
        echo $traineesJson;
    }

	function getTrainersJson(){
        include 'domain.php';
        $trainers = getTrainers();
        $trainersJson = '[' . implode(",", $trainers) . ']';
        // error_log("getTrainersJson: " .  $trainersJson);
        echo $trainersJson;
    }

    function getLessonJson(){
        include 'domain.php';
        $trainerID = getCurrentTrainerId();
        $traineeID = getCurrentTraineeId();
        // error_log("Get lesson for trainer with id: " . $trainerID . " and trainee with id: " . $traineeID);
        $lesson = getLessonByParticipants($trainerID, $traineeID);
      
        if ($lesson){
            echo $lesson;
        }else{
            error_log("No lesson for trainer with id: " . $trainerID . " and trainee with id: " . $traineeID);
        }
    }

    function saveLessonFromJson($lessonJson){
        include 'domain.php';
        $trainerID = getCurrentTrainerId();
        $traineeID = getCurrentTraineeId();
        // error_log("Get lesson for trainer with id: " . $trainerID . " and trainee with id: " . $traineeID);
        $lesson = getLessonByParticipants($trainerID, $traineeID);

        saveLesson($lessonJson);
    }
	
	function saveComment($comment){
        include 'domain.php';
        $trainerID = getCurrentTrainerId();
        $traineeID = getCurrentTraineeId();
        // error_log("Get lesson for trainer with id: " . $trainerID . " and trainee with id: " . $traineeID);

        saveCommentDB($comment,$trainerID,$traineeID);
    }
	
	function saveTime($newTime){
        include 'domain.php';
        $trainerID = getCurrentTrainerId();
        $traineeID = getCurrentTraineeId();
        // error_log("Get lesson for trainer with id: " . $trainerID . " and trainee with id: " . $traineeID);

        saveTimeDB($newTime,$trainerID,$traineeID);
    }
	

    /* Function: getActiveLessonJson
        Description of the function. */
    function getActiveLessonJson(){
        $username = $_SESSION["username"];
        $user = getUserByName($username);
        if($user){
            echo getActiveLessonByUser($user->getId());
        }
    }
    
    class ApplicationController {
        
        public function __construct(){    
            include 'domain.php';
        }


        function getVitalSignParametersJson(){
            $vitalSignParameters = getVitalSignParameters();
            $vitalSignParametersJson = '[' . implode(",", $vitalSignParameters) . ']';
            //error_log("getVitalSignParametersJson: " .  $vitalSignParametersJson);
            echo $vitalSignParametersJson;
        }

    }
    
    switch ($_POST['callMethod']) {

        case 'getAllUsersJson':
            getAllUsersJson();
            break;
		case 'getTraineesJson':
           getTraineesJson();
        break;
        case 'getTrainersJson':
            getTrainersJson();
            break;
		case 'getLessonJson':
            getLessonJson();
            break;
        case 'saveLessonFromJson':
            $lessonJson = $_POST['parameters'];
            saveLessonFromJson($lessonJson);
            break;
        case 'getVitalSignParametersJson':
            getApplicationController()->getVitalSignParametersJson();
            break;
		case 'saveComment':
            $Comment = $_POST['parameters'];
            saveComment($Comment);
            break;
		case 'saveTime':
            $newTime = $_POST['parameters'];
            saveTime($newTime);
            break;
			
		
			
    }
?>