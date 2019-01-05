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
    
    
    /* Initializes the Database-Connection and the Domain. */
    include 'dbinit.php';
    include 'domain.php';
	
	if(empty($_POST["username"]) or empty($_POST["role"])){
		exit("You need to enter a username and role");
	}
	
    $username = $_POST["username"];
    $role = $_POST["role"];
	

    $currentUser = getUserByName($username);

    if($currentUser == null){
        /* If no user is found with the given username, a new user is created. */
        error_log("User not in database. Creating one.");
        $currentUser = createUser($username, $role);
    }
	else if($currentUser->getRole() != $role){
		updateUser($username, $role);
	}

    error_log("Starting session for user " . $currentUser->getName());

    session_start();

    $_SESSION["username"]= $currentUser->getName();
    
    switch ($role){
        case 'trainee':
            $_SESSION["traineeID"]= $currentUser->getId();
            header('Location: join_lesson.html');
            exit();
            break;
        case 'trainer':
            $_SESSION["trainerID"]= $currentUser->getId();
            header('Location: create_lesson.html');
            exit();
            break;
    }
?> 