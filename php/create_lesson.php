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

    if (isset($_POST['trainee-select']) && $_SESSION['trainerID']){
        include 'domain.php';
        // error_log("Create lessons submitted");
        $traineeID = $_POST['trainee-select'];
        $trainerID = $_SESSION['trainerID'];

        $lesson = createLessonIfNotExist($trainerID, $traineeID);

        if ($lesson){
            $_SESSION['traineeID'] = $traineeID;
            // error_log("Starting application for lesson with id: " . $lesson->getId());
            header('Location: ../trainerview.html');
        }else{
            error_log("Could not start application");
        }
    }

?> 