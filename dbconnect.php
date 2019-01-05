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

    /* Initialization of the link to the mySQL server. */
    $link = mysqli_connect('localhost', 'root', ''); 

    /* Checks, if the database is accessable. */
    if (!$link) { 
        $output = 'Unable to connect to the database server.'; 
        error_log($error);
        exit(); 
    }  

    if (!mysqli_set_charset($link, 'utf8')) { 
        $output = 'Unable to set encoding "utf8".'; 
        error_log($error);
        exit(); 
    } 

    if (!mysqli_select_db($link, 'SimLabESDB')) { 
        $error = 'Unable to locate the database "SimLabESDB".'; 
        error_log($error);
        exit(); 
    } 
    
?>