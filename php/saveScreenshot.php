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
	$date = date("Y-m-d H.i.s");

	$sql_trainer = 'select u.username as trainer_name
					FROM SimLabESDB.users u 
					where u.id = '.$_SESSION["trainerID"];

		include 'dbconnect.php';
		$result = mysqli_query($link,$sql_trainer);
		$trainerName = mysqli_fetch_all($result,MYSQLI_NUM);

	$sql_trainee = 'select u.username as trainer_name
					FROM SimLabESDB.users u 
					where u.id = '.$_SESSION["traineeID"];

		include 'dbconnect.php';
		$result = mysqli_query($link,$sql_trainee);
		$traineeName = mysqli_fetch_all($result,MYSQLI_NUM);

	$imageData=file_get_contents('php://input');
	
	if (isset($imageData)) {
		// Remove the headers (data:,) part.
		// A real application should use them according to needs such as to check image type
		$filteredData=substr($imageData, strpos($imageData, ",")+1);
		
		// Need to decode before saving since the data we received is already base64 encoded
		$unencodedData=base64_decode($filteredData);

		//The name of the directory that we need to create.
		$directoryName = '../screenshots/'.$trainerName[0][0].'';
		
		//Check if the directory already exists.
		if(!is_dir($directoryName)){
			//Directory does not exist, so lets create it.
			mkdir($directoryName, 0755, true);
		}
		
		$directoryName2 = '../screenshots/'.$trainerName[0][0].'/'.$traineeName[0][0].'';
		if(!is_dir($directoryName2)){
			mkdir($directoryName2, 0755, true);
		}
		
		// Save file
		$fp = fopen('../screenshots/'.$trainerName[0][0].'/'.$traineeName[0][0].'/'.$date.'.png', 'wb' );
		echo $fp ;
		fwrite( $fp, $unencodedData);
		fclose( $fp );
	}
?>