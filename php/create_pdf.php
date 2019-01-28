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


// All code comes from here http://www.fpdf.org/
require('../fpdf181/fpdf.php');
/* Class: PDF
 Extends the FPDF class of the library PDF. See <fpdf.org: http://www.fpdf.org/>*/
class PDF extends FPDF {
    /* Function: LoadData
	Queries the database for all messages from the past lesson of a trainer and trainee.*/
    function LoadData() {
        // Read file lines
        $sql = '
            select
                date,
                message
            from
                SimLabESDB.messages m
            where 
                m.trainerID = '.$_POST["trainerID"].' and m.traineeID = '.$_POST["traineeID"].'
            ';
        
        include 'dbconnect.php';
        $result = mysqli_query($link,$sql);
        $data = mysqli_fetch_all($result,MYSQLI_NUM);
        //print_r($result); exit('hello');
        return $data;
    }

    /*Function: ImprovedTable
	    Create a formatted table from parameters header and data.
    
        Parameters:
            header - Values for table header. 
	        data - Values for table body. */
    function ImprovedTable($header, $data) {
        // Column widths
        $w = array(50, 140);
        // Header
        for($i=0;$i<count($header);$i++)
            $this->Cell($w[$i],7,$header[$i],1,0,'C');
        $this->Ln();
        // Data
        foreach($data as $row)
        {
            $this->Cell($w[0],6,$row[0],'LR');
            $this->Cell($w[1],6,$row[1],'LR');
            $this->Ln();
        }
        // Closing line
        $this->Cell(array_sum($w),0,'','T');
    }
}

$pdf = new PDF();
// Column headings
$header = array('TimeStamp', 'EventDescription');
// Data loading
$data = $pdf->LoadData();
$pdf->SetFont('Arial','',14);
$pdf->AddPage();
$pdf->ImprovedTable($header,$data);
$pdf->Output();
?>