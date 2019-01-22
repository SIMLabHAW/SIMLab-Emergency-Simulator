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

    class User implements Serializable {
        private $id;
        private $name;
		private $role;
        
        public function __construct($id, $name, $role) {
            $this->id = $id;
            $this->name = $name;
			$this->role = $role;
		}

        public function serialize() {
            $array = [
                "id" => $this->id,
                "name" => $this->name,
				"role" => $this->role,
            ];
            return serialize($array);
        }

        public function __toString() {
            $array = [
                "id" => $this->id,
                "name" => $this->name,
				"role" => $this->role,
            ];
            return json_encode($array);
        }

        public function unserialize($serialized) {
            error_log("User#unserialize intentionally left blank");
        }

        public function getId() {
            return $this->id;
        }
		
		public function getRole() {
            return $this->role;
        }

        public function getName() {
            return $this->name;
        }
    }

    class Message implements Serializable {
        private $trainerID;
        private $traineeID;
        private $date;
        private $message;

        public function __construct($trainerID, $traineeID,$date,$message) {
            $this->trainerID = $trainerID;
            $this->traineeID = $traineeID;
            $this->date = $date;
            $this->message = $message;
        }

        public function serialize() {
            $array = [
                "trainerID" => $this->trainerID,
                "traineeID" => $this->traineeID,
                "date" => $this->date,
                "message" => $this->message,
            ];
            return serialize($array);
        }

        public function unserialize($serialized) {
            error_log("User#unserialize intentionally left blank");
        }

        public function getTrainerId() {
            return $this->trainerID;
        }

        public function getTraineeId() {
            return $this->traineeID;
        }

        public function getDate() {
            return $this->date;
        }

        public function getMessage() {
            return $this->message;
        }
    }

    class VitalSignParameters {
        private $name;
        private $hr;
        private $Noise;
        private $xValOffset;
        private $xt;
        private $pWaveFactor;
        private $qWaveFactor;
        private $qrsComplexFactor;
        private $sWaveFactor;
        private $tWaveFactor;
        private $uWaveFactor;
        private $pWavePreFactor;
        private $qrsAmplitudeOffset;
        private $qrsDurationOffset;
        private $systolic;
        private $diastolic;
        private $spo2;
        private $rr;
        private $etco2;


        public function __construct(
            $name, $hr, $Noise, $xValOffset,
            $xt, $pWaveFactor, $qWaveFactor, $qrsComplexFactor,
            $sWaveFactor, $tWaveFactor, $uWaveFactor, $pWavePreFactor,
            $qrsAmplitudeOffset, $qrsDurationOffset, $systolic, $diastolic,
            $spo2, $rr, $etco2) {
            $this->name = $name;
            $this->hr = (int) $hr;
            $this->Noise = (float) $Noise;
            $this->xValOffset = (float) $xValOffset;
            $this->xt = (float) $xt;
            $this->pWaveFactor = (int)$pWaveFactor;
            $this->qWaveFactor = (int)$qWaveFactor;
            $this->qrsComplexFactor = (int)$qrsComplexFactor;
            $this->sWaveFactor = (int)$sWaveFactor;
            $this->tWaveFactor = (int)$tWaveFactor;
            $this->uWaveFactor = (int)$uWaveFactor;
            $this->pWavePreFactor = (int)$pWavePreFactor;
            $this->qrsAmplitudeOffset = (float) $qrsAmplitudeOffset;
            $this->qrsDurationOffset = (float) $qrsDurationOffset;
            $this->systolic = (int) $systolic;
            $this->diastolic = (int) $diastolic;
            $this->spo2 = (float) $spo2;
            $this->rr = (int) $rr;
            $this->etco2 = (int) $etco2;
        }

        public function __toString() {

            $array = [
                "name" => $this->name,
                "hr" => $this->hr,
                "Noise" => $this->Noise,
                "xValOffset" => $this->xValOffset,
                "xt" => $this->xt,
                "pWaveFactor" => $this->pWaveFactor ,
                "qWaveFactor" => $this->qWaveFactor,
                "qrsComplexFactor" => $this->qrsComplexFactor,
                "sWaveFactor" => $this->sWaveFactor,
                "tWaveFactor" => $this->tWaveFactor,
                "uWaveFactor" => $this->uWaveFactor,
                "pWavePreFactor" => $this->pWavePreFactor,
                "qrsAmplitudeOffset" => $this->qrsAmplitudeOffset,
                "qrsDurationOffset" => $this->qrsDurationOffset,
                "systolic" => $this->systolic,
                "diastolic" => $this->diastolic,
                "spo2" => $this->spo2,
                "rr" => $this->rr,
                "etco2" => $this->etco2,
            ];
            return json_encode($array);
        }

        public static function ventExtra() {
            // This Parameter is not meant to be added as a standalone Pathology
            return new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "VentExtra", 60, 0.01, 0.13, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                -0.020, 1, 0, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, -1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 70, 30, 
                /* spo2; rr; etco2; */
                97, 18, 30);
        }

    }

    class Lesson implements Serializable {
        private $id;
        private $trainerID;
        private $traineeID;
        private $vitalSignParameters;
        private $timer;
        private $simState;
		private $changeDuration;
        private $active;

        public function __construct($id,$trainerID,$traineeID,$vitalSignParameters, $timer, $simState, $changeDuration, $active) {
            //error_log("Lesson#constructor " . $id . " vitalSigns " . $vitalSignParameters);
            $this->id = (int) $id;
            $this->trainerID = (int) $trainerID;
            $this->traineeID = (int) $traineeID;
            $this->vitalSignParameters = $vitalSignParameters;
            $this->timer = $timer;
            $this->simState = $simState;
			$this->changeDuration = $changeDuration;
            $this->active = (bool) $active;
        }

        public function serialize() {
            $array = [
                "id" => $this->id,
                "trainerID" => $this->trainerID,
                "traineeID" => $this->traineeID,
                "active" => $this->active,
            ];
            return serialize($array);
        }

        public function unserialize($serialized) {
            error_log("User#unserialize intentionally left blank");
        }

        public function __toString() {

            $array = [
                "id" => $this->id,
                "trainerID" => $this->trainerID,
                "traineeID" => $this->traineeID,
                "vitalSigns" => $this->vitalSignParameters,
                "timer" => $this->timer,
                "simState" => $this->simState,
				"changeDuration" => $this->changeDuration,
                "active" => $this->active,
            ];
            return json_encode($array);
        }

        public function getId() {
            return $this->id;
        }

        public function getTrainerId() {
            return $this->trainerID;
        }

        public function getTraineeId() {
            return $this->traineeID;
        }

        public function isActive() {
            return $this->active;
        }
    }

    function getTrainees(){
        include 'dbconnect.php';
        $trainees_query = "SELECT id, username, role FROM users WHERE role = 'trainee'";
        $result = mysqli_query($link,$trainees_query);
        $trainees = array();
        while($row = $result->fetch_assoc()) {
            $id = $row["id"];
			$role = $row["role"];
            $username = $row["username"];
            if ($id != null && $role != null && $username != null){
                array_push($trainees, new User($id, $username, $role));
            }
        }
        return $trainees;
    }

	function getTrainers(){
        include 'dbconnect.php';
        $trainers_query = "SELECT id, username, role FROM users WHERE role = 'trainer'";
        $result = mysqli_query($link,$trainers_query);
        $trainers = array();
        while($row = $result->fetch_assoc()) {
            $id = $row["id"];
			$role = $row["role"];
            $username = $row["username"];
            if ($id != null && $role != null && $username != null){
                array_push($trainers, new User($id, $username, $role));
            }
        }
        return $trainers;
    }
	
	function getAllUsers(){
		return array_merge(getTrainees(),getTrainers());
        
		/*include 'dbconnect.php';
        $users_query = "select tmp.username, 
				(case when tmp.id = l2.traineeid then 'trainee' else 'trainer' end) as role
				FROM
				(SELECT u.id, u.username, max(l.id) as 'maxlesson'
				FROM users u 
				join lessons l on u.id = l.trainerID or u.id = l.traineeID 
				group by u.id, u.username) tmp
				join lessons l2 on tmp.maxlesson = l2.id";


        $result = mysqli_query($link,$users_query);
        $users = array();
        while($row = $result->fetch_assoc()) {
            $role = $row["role"];
            $username = $row["username"];
            if ($role != null && $username != null){
                array_push($users, new User($username, $role));
            }
        }
        return $users;*/
    }

    class ChangeDuration {
        public $isAuto;
        public $value;

        public function __construct($isAuto, $value) {
            $this->isAuto = $this->toBoolean($isAuto);
            $this->value = (int) $value;
        }
        
        public function __toString() {
            $array = [
                "isAuto" => $this->isAuto,
                "value" => $this->value
             ];
            return json_encode($array);
        }

        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }
    }
	
	class PacerState {
        public $isEnabled;
        public $frequency;
        public $energy;
        public $energyThreshold;

        public function __construct($isEnabled, $frequency, $energy, $energyThreshold) {
            $this->isEnabled = $this->toBoolean($isEnabled);
            $this->frequency = (int) $frequency;
            $this->energy = (int) $energy;
            $this->energyThreshold = (int) $energyThreshold;
        }

        /* public static function copyFrom($pacer) {
            return new self($pacer->isEnabled, $pacer->frequency, 
            $pacer->energy, $pacer->energyThreshold);
        } */
        
        public function __toString() {
            $array = [
                "isEnabled" => $this->isEnabled,
                "frequency" => $this->frequency,
                "energy" => $this->energy,
                "energyThreshold" => $this->energyThreshold
             ];
            return json_encode($array);
        }

        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }
    }
    
    /* TODO: Export into different Classes like PacerState. */
    class SimulationState {

        private $enableECG;
        private $enableSPO2;
        private $enableETCO2;
		private $defiPathology;
		private $hrDefi;
		private $spo2Defi;
		private $etco2Defi;
		private $rrDefi;
		private $sysDefi;
		private $diaDefi;
		private $showHR;
		private $showSPO2;
		private $displayETCO2;
		private $displayRR;
		private $displayNIBP;
		private $timer;
        private $defiCharge;
        private $defiEnergyThreshold;
        private $hasCPR;
        private $hasCOPD;
        private $pacer;
        private $respRatio;
        private $ventExtra;
        private $hasVentExtra;
		
        public function __construct(
            $enableECG, $enableSPO2, $enableETCO2, $defiPathology,$hrDefi,$spo2Defi, $etco2Defi, $rrDefi, $sysDefi, $diaDefi, $showHR, $showSPO2, $displayETCO2, $displayRR,$displayNIBP, $timer, $defiCharge, $defiEnergyThreshold, 
            $hasCPR, $hasCOPD, $pacer, $respRatio, $ventExtra, $hasVentExtra) {

            $this->enableECG = $this->toBoolean($enableECG);
            $this->enableSPO2 = $this->toBoolean($enableSPO2);
            $this->enableETCO2 = $this->toBoolean($enableETCO2);
			$this->defiPathology = $defiPathology;
			$this->hrDefi = $hrDefi;
			$this->spo2Defi = $spo2Defi;
			$this->etco2Defi = $etco2Defi;
			$this->rrDefi = $rrDefi;
			$this->sysDefi = $sysDefi;
			$this->diaDefi = $diaDefi;
			$this->showHR = $this->toBoolean($showHR);
			$this->showSPO2 = $this->toBoolean($showSPO2);
			$this->displayETCO2 = $this->toBoolean($displayETCO2);
			$this->displayRR = $this->toBoolean($displayRR);
			$this->displayNIBP = $this->toBoolean($displayNIBP);
			$this->timer = $timer;
            $this->defiCharge = (int) $defiCharge;
            $this->defiEnergyThreshold =  (int) $defiEnergyThreshold;
            $this->hasCPR = $this->toBoolean($hasCPR);
            $this->hasCOPD = $this->toBoolean($hasCOPD);
            $this->pacer = $pacer;
            $this->respRatio = (int) $respRatio;
            $this->ventExtra = $ventExtra;
            $this->hasVentExtra = $this->toBoolean($hasVentExtra);
			
        }

        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }

        public function __toString() {
            $array = [
                "enableECG" => $this->enableECG,
                "enableSPO2" => $this->enableSPO2,
                "enableETCO2" => $this->enableETCO2,
				"defiPathology" => $this->defiPathology,
				"hrDefi" => $this->hrDefi,
				"spo2Defi" => $this->spo2Defi,
				"etco2Defi" => $this->etco2Defi,
				"rrDefi" => $this->rrDefi,
				"sysDefi" => $this->sysDefi,
				"diaDefi" => $this->diaDefi,
				"showHR" => $this->showHR,
				"showSPO2" => $this->showSPO2,
				"displayETCO2" => $this->displayETCO2,
				"displayRR" => $this->displayRR,
				"displayNIBP" => $this->displayNIBP,
				"timer" => $this->timer,
                "defiCharge" => $this->defiCharge,
                "defiEnergyThreshold" => $this->defiEnergyThreshold,
                "hasCPR" => $this->hasCPR,
                "hasCOPD" => $this->hasCOPD,
				"pacer" => $this->pacer,
                "respRatio" => $this->respRatio,
                "ventExtra" => $this->ventExtra,
                "hasVentExtra" => $this->hasVentExtra
			
            ];
            return json_encode($array);
        }


    }

    function getVitalSignParameters(){
        $vitalSignParameters;
        if (!isset($vitalSignParameters)){

            //here default values for the specific pathologies can be adjusted 
            $sinus_rhythm = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Sinus Rhythm", 60, 0.01, 0,
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 1, 1, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 120, 80,
                /* spo2; rr; etco2; */
                97, 12, 36);

            $asystole = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Asystole", 0, 0.01, 0,
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 0, 0, 0,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                0, 0, 0, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                -0.780, 0, 0, 0,
                /* spo2; rr; etco2; */
                0, 0, 0);

            $junctional_rhythm = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Junctional Rhythm", 40, 0.01, 0,
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                -0.020, 1, 0, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, -1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 70, 30, 
                /* spo2; rr; etco2; */
                97, 18, 30);

            $ventricular_tachycardia = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Ventricular Tachycardia", 180, 0.01, 0.13, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                -0.025, 1, 0, 1, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                0, 1, 0, 2, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0.110, 70, 60, 
                /* spo2; rr; etco2; */
                97, 18, 35);

            $ventricular_fibrillation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Ventricular Fibrillation", 250, 0.05, 0, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 1, 1, 0, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                -6.150, 0, 0, 0, 
                /* spo2; rr; etco2; */
                0, 0, 0);

            $atrial_fibrillation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Atrial Fibrillation", 110, 0.1, 0, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 0, 0, 1, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 0, 0, 1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 100, 60, 
                /* spo2; rr; etco2; */
                96, 12, 36);

            $av_block3 = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "AV Block 3", 60, 0.01, 0, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 1, 1, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 120, 80,
                /* spo2; rr; etco2; */
                97, 15, 36);

            $st_elevation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "ST Elevation", 60, 0.01, 0, 
                /* xt; pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 1, 1, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 120, 80,
                /* spo2; rr; etco2; */
                97, 15, 36);

            $vitalSignParameters = ["sinus_rhythm" => $sinus_rhythm,
                            "asystole" => $asystole,
                            "junctional_rhythm" => $junctional_rhythm,
                            "ventricular_tachycardia" => $ventricular_tachycardia,
                            "ventricular_fibrillation" => $ventricular_fibrillation,
                            "atrial_fibrillation" => $atrial_fibrillation,
                            "av_block3" => $av_block3,
                            "st_elevation" => $st_elevation,
                        ];
        }
        return $vitalSignParameters;
    }

    function getUserByName($username) {
        include 'dbconnect.php';
        $user_query = "SELECT id, username, password, role FROM users WHERE username LIKE '$username' LIMIT 1";
        $result = mysqli_query($link,$user_query);
        while($row = $result->fetch_assoc()) {
            $id = $row["id"];
            $role = $row["role"];
            $username = $row["username"];
            if ($id != null && $role != null && $username != null){
                error_log("Returning user " . $username);
                return new User($id, $username, $role);
            }
        }
        error_log("User doesn't exist in database " . $username);
        return null;
    }

    function createUser($username, $role) {
        include 'dbconnect.php';
        $insert_user_query = "INSERT INTO users (username, password, role) VALUES ('$username', 'none', '$role')";
        $success_insert_user = mysqli_query($link,$insert_user_query);
        if ($success_insert_user){
            error_log("Successfully created user " . $username);
            return getUserByName($username);
        }
        error_log("Could not create User " . $username);
        return null;
    }
	
	function updateUser($username, $role) {
        include 'dbconnect.php';
        $update_user_query = "UPDATE users SET role = '$role' WHERE username = '$username'";
        $success_update_user = mysqli_query($link,$update_user_query);
        if ($success_update_user){
            error_log("Successfully updated user " . $username);
            return getUserByName($username);
        }
        error_log("Could not update User " . $username);
        return null;
    }

    function createLessonIfNotExist($trainerID, $traineeID) {
        include 'dbconnect.php';
        $lesson = getLessonByParticipants($trainerID, $traineeID);

        if ($lesson){
            return $lesson;
        }else{
            $sinus_rhythm = getVitalSignParameters()["sinus_rhythm"];

            // This Parameter is not meant to be added as a standalone Pathology
            $ventExtra = json_decode(VitalSignParameters::ventExtra());

            $simState = new SimulationState(
                /* enableECG, enableSPO2, enableETCO2, defiPathology */
                false, false, false, 'Sinus Rhythm',
				/* hrDefi, spo2Defi, etco2Defi, rrDefi, sysDefi,diaDefi */
				60,97,36,12,120,80,
                /* showHR, showSPO2, displayETCO2, displayRR,  */
                false, false, false, false,
                /* displayNIBP, timer, defiCharge, defiEnergyThreshold, */
                false, false, '0:00', 150,
                /* hasCPR, hasCOPD, pacer, respRatio */
                false, false, new PacerState(false, 60, 10, 5), 0,
                /* ventExtra, hasVentExtra */
                $ventExtra, false);

			$changeDuration = new ChangeDuration(true,30);

            error_log("There is no active lesson for users " . $trainerID . " and " .  $traineeID);
            $insert_lesson_query = "INSERT INTO lessons (trainerID, traineeID, vitalSigns,simState,changeDuration,active) VALUES ('$trainerID', '$traineeID', '$sinus_rhythm','$simState', '$changeDuration',0)";
            $success_insert_lesson_query = mysqli_query($link,$insert_lesson_query);
            if ($success_insert_lesson_query){
                error_log("Successfully created lesson ");
                return getLessonByParticipants($trainerID, $traineeID);
            }
            error_log("Could not create lesson for " . $trainerID . " and " . $traineeID);
            return null;
        }
    }

    function getLessonByParticipants($trainerID, $traineeID){
        
        //error_log("Get parameters for user " . $trainerID);
        // connect to database
        include 'dbconnect.php';
        // get frequency value from database

        unset($sql);
        if ($trainerID) {
            $sql[] = " trainerID = '$trainerID' ";
        }
        if ($traineeID) {
            $sql[] = " traineeID='$traineeID' ";
        }
        
        $get_lesson_query = "SELECT * FROM lessons";

        if (!empty($sql)) {
            $get_lesson_query .= ' WHERE ' . implode(' AND ', $sql);
        }

        //error_log("Query getLessonByParticipants: " . $get_lesson_query);
        
        $result = mysqli_query($link,$get_lesson_query);
          
            if ($result) {
                while($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $id = $row["id"];
                $trainerID = $row["trainerID"];
                $traineeID = $row["traineeID"];
                $vitalSigns = $row["vitalSigns"];
                $timer = $row["timer"];
                $simState = $row["simState"];
				$changeDuration = $row["changeDuration"];
                $active = $row["active"];
                //  if ($id != null && $trainerID != null && $traineeID != null && $active != null){
                //error_log("Returning lesson for trainerID " . $trainerID);
                return new Lesson($id , $trainerID,$traineeID,$vitalSigns, $timer, $simState,$changeDuration, $active);
                //   }
            }
        } else {
            return null;
        }

    }

     /*instead of 1 call for every parameter: all together*/
    function saveLesson($lesson_values){ 
        include 'dbconnect.php';

        $simStateArray = $lesson_values["simState"];

        $pacer = new PacerState(
            $simStateArray["pacer"]["isEnabled"],
            $simStateArray["pacer"]["frequency"],
            $simStateArray["pacer"]["energy"],
            $simStateArray["pacer"]["energyThreshold"]);

        // This Parameter is Static
        $ventExtra = json_decode(VitalSignParameters::ventExtra());

        $simState = new SimulationState(
            $simStateArray["enableECG"],
            $simStateArray["enableSPO2"],
            $simStateArray["enableETCO2"],
            $simStateArray["defiPathology"],
			$simStateArray["hrDefi"],
			$simStateArray["spo2Defi"],
			$simStateArray["etco2Defi"],
			$simStateArray["rrDefi"],
			$simStateArray["sysDefi"],
			$simStateArray["diaDefi"],
			$simStateArray["showHR"],
            $simStateArray["showSPO2"],
            $simStateArray["displayETCO2"],
            $simStateArray["displayRR"],
            $simStateArray["displayNIBP"],
            $simStateArray["timer"],
            $simStateArray["defiCharge"],
            $simStateArray["defiEnergyThreshold"],
            $simStateArray["hasCPR"],
            $simStateArray["hasCOPD"],
            $pacer,
            $simStateArray["respRatio"],
            $ventExtra,
            $simStateArray["hasVentExtra"]);	
            error_log($simState);	
            error_log($ventExtra);
            
        //error_log($simStateArray["pacer"]);
        //error_log(PacerState::copyFrom($simStateArray["pacer"]));

        $vitalSignArray = $lesson_values["vitalSigns"];
        $vitalSignParameters = new VitalSignParameters(
            $vitalSignArray["name"],
            $vitalSignArray["hr"],
            $vitalSignArray["Noise"],
            $vitalSignArray["xValOffset"],
            $vitalSignArray["xt"],
            $vitalSignArray["pWaveFactor"],
            $vitalSignArray["qWaveFactor"],
            $vitalSignArray["qrsComplexFactor"],
            $vitalSignArray["sWaveFactor"],
            $vitalSignArray["tWaveFactor"],
            $vitalSignArray["uWaveFactor"],
            $vitalSignArray["pWavePreFactor"],
            $vitalSignArray["qrsAmplitudeOffset"],
            $vitalSignArray["qrsDurationOffset"],
            $vitalSignArray["systolic"],
            $vitalSignArray["diastolic"],
            $vitalSignArray["spo2"],
            $vitalSignArray["rr"],
            $vitalSignArray["etco2"]);

        $cd = $lesson_values["changeDuration"];
        $changeDuration = new ChangeDuration($cd["isAuto"], $cd["value"]);

        $id = $lesson_values["id"];
        $trainerID = $lesson_values["trainerID"];
        $traineeID = $lesson_values["traineeID"];
        $timer = $lesson_values["timer"];
        $active = $lesson_values["active"];
        
        $update_lesson_query = "UPDATE lessons SET vitalSigns='$vitalSignParameters', timer='$timer',simState='$simState',changeDuration='$changeDuration' WHERE id='$id'";

        $success_save_lesson_query = mysqli_query($link, $update_lesson_query);
        return $success_save_lesson_query;
    }

	 function saveCommentDB($comment,$trainerID,$traineeID){ 
        // connect to database
        include 'dbconnect.php';
		$date = date("y-m-d h:i:s");
       
        $update_comment_query = "INSERT INTO messages (trainerID, traineeID, date, message) VALUES (".$trainerID.", ".$traineeID.",'".$date."', '".addslashes($comment)."')";
		
        $success_save_comment_query = mysqli_query($link, $update_comment_query);
        return $success_save_comment_query;
    } 
	
	 function saveTimeDB($newTime,$trainerID,$traineeID){ 
        // connect to database
        include 'dbconnect.php';
		$date = date("y-m-d h:i:s");
       
        $update_lesson_query = "UPDATE lessons SET timer='$newTime' WHERE trainerID='$trainerID' and traineeID='$traineeID'";
		
        $success_save_lesson_query = mysqli_query($link, $update_lesson_query);
        return $success_save_lesson_query;
    }
?>