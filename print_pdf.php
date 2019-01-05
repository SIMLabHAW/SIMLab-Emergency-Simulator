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
    $trainee_id_session = $_SESSION["traineeID"];
    $trainer_id_session = $_SESSION["trainerID"];
    $sql = ' SELECT DISTINCT(m.traineeID) as traineeID,u.username as trainee_name
			FROM SimLabESDB.messages m 
			join SimLabESDB.users u 	
			on u.id = m.traineeID and m.trainerID = '.$trainer_id_session.' and m.message is not null';

	include 'dbconnect.php';
	$result = mysqli_query($link,$sql);
	$rows = mysqli_fetch_all($result,MYSQLI_NUM);

    $sql_name = 'select u.username as trainer_name
				FROM SimLabESDB.users u 
				where u.id = '.$_SESSION["trainerID"];

	include 'dbconnect.php';
	$result = mysqli_query($link,$sql_name);
	$name = mysqli_fetch_all($result,MYSQLI_NUM);	
	
?>

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Emergency Simulator</title>
    <base href="./">

    <!--<meta name="viewport" content="width=device-width, initial-scale=1">-->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <!-- link rel="icon" href="http://getbootstrap.com/favicon.ico"-->

    <title>Emergency Simulator - Session Printer</title>

    <!-- Bootstrap core CSS -->
    <link href="bootstrap.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>

<body>
    <div class="container-fluid" style="padding-top:100px">


        <div class="row d-flex justify-content-center">
            <div class="jumbotron">
                <h3>Choose Session to Print</h3>
                <form id="lesson-form" role="lesson-form" action="create_pdf.php" method="post">
                    <div class="form-group">
                        <label for="trainerID">Trainer:</label>
                        <!--select id="trainerID" name="trainerID" class="custom-select" form="lesson-form" required>
                            <option></option>
                        </select-->
						<?php
							echo '<input type="text" name = "trainerID" id="trainerID" value="'.$trainer_id_session.'" style= "display:none"></input>';
							echo '<span id = "trainer_name">'.$name[0][0].'</span>';
						?>
						 
                    </div>
                    <div class="form-group">
                        <label for="traineeID">Trainee</label>
                        <select id="traineeID" name="traineeID" class="custom-select" form="lesson-form" required>
                        <?php
							foreach($rows as $row) {
								echo '<option value="'. $row[0].'"';if($row[0] == $trainee_id_session ){echo" selected='selected' ";} echo'>'. $row[1] . '</option>';
							}
						?>
                        </select>		
																		
                    </div>
                    <div style=float:left>
                        <button name="submit" type="submit" style="height: 40px; font-size: 1rem" class="btn btn-primary">Print</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>

<script language="javascript" type="text/javascript" src="js/jquery-3.2.1.min.js"></script>
<script language="javascript" type="text/javascript" src="js/popper.min.js"></script>
<script language="javascript" type="text/javascript" src="js/bootstrap.min.js"></script>

<script>
			//post: request to server on applicationcontroller.php


</script>

</html>
