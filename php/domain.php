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

	/* Class: User
    Holds user specific data > id, name, role (trainer or trainee), which can be retrieved 
    through functions getId(), getName() and getRole() respectively. */   
   class User implements Serializable {
		
		// Property: id
		// Value of the user id.
        private $id;
		
		/* Property: name
		Holds the user name.*/
        private $name;
		
		// Property: role
		// Holds the user role.
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
		// Function: __toString
		// Returns the current User parameters as json encoded string.
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
		// Function: getId
		// Returns the user id.
        public function getId() {
            return $this->id;
        }
		// Function: getRole
		// Returns the user role.
		public function getRole() {
            return $this->role;
        }
		// Function: getName
		// Returns the user name.
        public function getName() {
            return $this->name;
        }
    }
	// Class: Message
    // Holds message specific data.
    class Message implements Serializable {
		// Property: trainerID
		// Value of the trainer id
        private $trainerID;
		// Property: traineeID
		// Value of the trainee id
        private $traineeID;
		// Property: date
		// Holds the message date
        private $date;
		// Property: message
		// Holds the message body
        private $message;
		
		// Constructor: __construct
		// Initializes the object.
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
		// Function: getTrainerId
		// Returns the trainer id.
        public function getTrainerId() {
            return $this->trainerID;
        }
		// Function: getTraineeId
		// Returns the trainee id.
        public function getTraineeId() {
            return $this->traineeID;
        }
		// Function: getDate
		// Returns the date.
        public function getDate() {
            return $this->date;
        }
		// Function: getId
		// Returns the message.
        public function getMessage() {
            return $this->message;
        }
    }

	//Class: VitalSignParameters
    //Holds all the parameters that characterize the state of a patient. Multiple instances are used to describe default parameter sets like sinus rythm or asystolic in patients. This is done by function getVitalSignParameters().
    class VitalSignParameters {
		// Property: name
		// Name of the default pathology.		
        private $name;
		// Property: hr
		// Value of the default heart rate for the pathology.
        private $hr;
		// Property: Noise
		// Amplitude of the noise, e.g. 0.01 is 1% of baseline.
        private $Noise;
		// Property: xValOffset
		// Value of the time offset.
        private $xValOffset;
		// Property: pWaveFactor
		// Factor to be multiplied with p-Wave values.
        private $pWaveFactor;
		// Property: qWaveFactor
		// Factor to be multiplied with q-Wave values.
        private $qWaveFactor;
		// Property: qrsComplexFactor
		// Factor to be multiplied with qrs-Complex values.	
        private $qrsComplexFactor;
		// Property: sWaveFactor
		// Factor to be multiplied with s-Wave values.
        private $sWaveFactor;
		// Property: tWaveFactor
		// Factor to be multiplied with t-Wave values.
        private $tWaveFactor;
		// Property: uWaveFactor
		// Factor to be multiplied with u-Wave values.
        private $uWaveFactor;
		// Property: pWavePreFactor
		// Factor to be multiplied with p-Wave values.
        private $pWavePreFactor;
		// Property: qrsAmplitudeOffset
		// Value of the qrs amplitude offset.
        private $qrsAmplitudeOffset;
		// Property: qrsDurationOffset
		// Value of the qrs duration offset.
        private $qrsDurationOffset;
		// Property: systolic
		// Value of the default systolic blood pressure for the pathology.		
        private $systolic;
		// Property: diastolic
		// Value of the default diastolic blood pressure for the pathology.
        private $diastolic;
		// Property: spo2
		// Value of the default oxygen saturation for the pathology.
        private $spo2;
		// Property: rr
		// Value of the default respiration rate for the pathology.
        private $rr;
		// Property: etco2
		// Value of the default end tidal CO2 for the pathology.
        private $etco2;
		// Constructor: __construct
		// Initializes the object.
        public function __construct(
            $name, $hr, $Noise, $xValOffset,
            $pWaveFactor, $qWaveFactor, $qrsComplexFactor,
            $sWaveFactor, $tWaveFactor, $uWaveFactor, $pWavePreFactor,
            $qrsAmplitudeOffset, $qrsDurationOffset, $systolic, $diastolic,
            $spo2, $rr, $etco2) {
            $this->name = $name;
            $this->hr = (int) $hr;
            $this->Noise = (float) $Noise;
            $this->xValOffset = (float) $xValOffset;
            $this->pWaveFactor = (float)$pWaveFactor;
            $this->qWaveFactor = (float)$qWaveFactor;
            $this->qrsComplexFactor = (float)$qrsComplexFactor;
            $this->sWaveFactor = (float)$sWaveFactor;
            $this->tWaveFactor = (float)$tWaveFactor;
            $this->uWaveFactor = (float)$uWaveFactor;
            $this->pWavePreFactor = (float)$pWavePreFactor;
            $this->qrsAmplitudeOffset = (float) $qrsAmplitudeOffset;
            $this->qrsDurationOffset = (float) $qrsDurationOffset;
            $this->systolic = (int) $systolic;
            $this->diastolic = (int) $diastolic;
            $this->spo2 = (float) $spo2;
            $this->rr = (int) $rr;
            $this->etco2 = (int) $etco2;
        }
		// Function: __toString
		// Returns the current VitalSignParameters as json encoded string.
        public function __toString() {

            $array = [
                "name" => $this->name,
                "hr" => $this->hr,
                "Noise" => $this->Noise,
                "xValOffset" => $this->xValOffset,
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
    }
	// Class: Lesson
    // Holds all the parameters that characterize the current lesson.
    class Lesson implements Serializable {
		// Property: id
		// Value of the lesson id.
        private $id;
		
		// Property: trainerID
		// Value of the trainer id.
        private $trainerID;
		
		// Property: traineeID
		// Value of the trainer id.		
        private $traineeID;
		
		// Property: vitalSignParameters
		// Object with vitalsign parameters, compare with class VitalSignParameters.
        private $vitalSignParameters;
		
		// Property: timer
		// Value of the GUI clock.
        private $timer;
		
		// Property: simState
		// Object with simulation parameters, compare with class SimulationState.		
        private $simState;
		
		// Property: changeDuration
		// Object with parameters that define the time it takes changes to vital signs to take effect, compare with class ChangeDuration.
		private $changeDuration;
		
		// Property: active
		// Indicates whether the lesson is still active.
        private $active;

		// Constructor: __construct
		// Initializes the object.		
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
		// Function: __toString
		// Returns the current Lesson parameters as json encoded string.
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
		// Function: getId
		// Returns the lesson id.
        public function getId() {
            return $this->id;
        }
		// Function: getTrainerId
		// Returns the trainer id.
        public function getTrainerId() {
            return $this->trainerID;
        }
		// Function: getTraineeId
		// Returns the trainee id.
        public function getTraineeId() {
            return $this->traineeID;
        }
		// Function: isActive
		// Returns whether the lesson is still active.
        public function isActive() {
            return $this->active;
        }
    }
	// Function: getTrainees
    // Returns an array of all users with role trainee, containing their id, name and role.
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
	// Function: getTrainers
    // Returns an array of all users with role trainer, containing their id, name and role.
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
	// Function: getAllUsers
    // Returns an array of all users with role trainer or trainee, containing their id, name and role.	
	function getAllUsers(){
		return array_merge(getTrainees(),getTrainers());
    }
	
	// Class: ChangeDuration
    // Holds parameters that determine the time it takes for changes to the vital signs to take effect.
    class ChangeDuration {
		
		// Property: isAuto
		// sets the duration to a default value.
        public $isAuto;
		
		// Property: value
		// sets the duration to a specific value.
        public $value;	
		
		// Constructor: __construct
		// Initializes the object.	
        public function __construct($isAuto, $value) {
            $this->isAuto = $this->toBoolean($isAuto);
            $this->value = (int) $value;
        }
		
        // Function: __toString
		// Returns the current ChangeDuration parameters as json encoded string.
        public function __toString() {
            $array = [
                "isAuto" => $this->isAuto,
                "value" => $this->value
             ];
            return json_encode($array);
        }
		
		// Function: toBoolean
		// Returns true if parameter string equals "true".
		// Parameter: string
        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }
    }
	
	// Class: PacerState
    // Holds parameters defining the state of the pacer.	
	class PacerState {
		// Property: isEnabled
		// Flag, if the pacer is currently active.
        public $isEnabled;
				
		// Property: frequency
		// Current frequency level.
        public $frequency;
		
		// Property: energy
		// Current energy level.		
        public $energy;
	
		// Property: energyThreshold
		// Threshold at which the pacer starts to overtake the internal heartrate.	
        public $energyThreshold;

		// Constructor: __construct
		// Initializes the object.		
        public function __construct($isEnabled, $frequency, $energy, $energyThreshold) {
            $this->isEnabled = $this->toBoolean($isEnabled);
            $this->frequency = (int) $frequency;
            $this->energy = (int) $energy;
            $this->energyThreshold = (int) $energyThreshold;
        }
		
		// Function: __toString
		// Returns the current PacerState parameters as json encoded string.
        public function __toString() {
            $array = [
                "isEnabled" => $this->isEnabled,
                "frequency" => $this->frequency,
                "energy" => $this->energy,
                "energyThreshold" => $this->energyThreshold
             ];
            return json_encode($array);
        }

		// Function: toBoolean
		// Returns true if parameter string equals "true".
		// Parameter: string		
        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }
    }
    
    /* TODO: Export into different Classes like PacerState. */
	
	// Class: SimulationState
    // Holds parameters defining the state of the GUI.	
    class SimulationState {

        // Property: enableECG
		// States whether ECG chart is switched on or off.
		private $enableECG;
        
		// Property: enableSPO2
		// States whether SPO2 chart is switched on or off.
		private $enableSPO2;
        
		// Property: enableETCO2
		// States whether ETCO2 chart is switched on or off.
		private $enableETCO2;
		
		// Property: defiPathology
		// Holds the currently selected pathology.
		private $defiPathology;
		
		// Property: hrDefi
		// Holds the currently selected post-defibrillator heart rate.
		private $hrDefi;
		
		// Property: spo2Defi
		// Holds the currently selected post-defibrillator SPO2.
		private $spo2Defi;
		
		// Property: etco2Defi
		// Holds the currently selected post-defibrillator ETCO2.
		private $etco2Defi;
		
		// Property: rrDefi
		// Holds the currently selected post-defibrillator RR.
		private $rrDefi;
		
		// Property: sysDefi
		// Holds the currently selected post-defibrillator systolic blood pressure.
		private $sysDefi;
		
		// Property: diaDefi
		// Holds the currently selected post-defibrillator diastolic blood pressure.
		private $diaDefi;
		
		// Property: showHR
		// States whether the figure for HR is displayed.
		private $showHR;
		
		// Property: showSPO2
		// States whether the figure for SPO2 is displayed.
		private $showSPO2;
		
		// Property: displayETCO2
		// States whether the figure for ETCO2 is displayed.
		private $displayETCO2;
		
		// Property: displayRR
		// States whether the figure for RR is displayed.
		private $displayRR;
		
		// Property: displayNIBP
		// States whether the figure for NIBP is displayed.
		private $displayNIBP;
        
		// Property: defiCharge
		// Holds the value of the defibrillator charge.
		private $defiCharge;
        
		// Property: defiEnergyThreshold
		// Holds the value of the defibrillator energy threshold.
		private $defiEnergyThreshold;
        
		// Property: hasCPR
		// States whether CPR artifacts are present.
		private $hasCPR;
        
		// Property: hasCOPD
		// States whether the patient has COPD.
		private $hasCOPD;
        
		// Property: pacer
		// Holds an instance of class PacerState.
		private $pacer;
        
		// Property: respRatio
		// Holds the value for the respiration ratio.
		private $respRatio;
		
		// Constructor: __construct
		// Initializes the object.		
        public function __construct(
            $enableECG, $enableSPO2, $enableETCO2, $defiPathology,
            $hrDefi, $spo2Defi, $etco2Defi, $rrDefi, 
            $sysDefi, $diaDefi, $showHR, $showSPO2, 
            $displayETCO2, $displayRR, $displayNIBP,
            $defiCharge, $defiEnergyThreshold, 
            $hasCPR, $hasCOPD, $pacer, $respRatio) {

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
            $this->defiCharge = (int) $defiCharge;
            $this->defiEnergyThreshold =  (int) $defiEnergyThreshold;
            $this->hasCPR = $this->toBoolean($hasCPR);
            $this->hasCOPD = $this->toBoolean($hasCOPD);
            $this->pacer = $pacer;
            $this->respRatio = (int) $respRatio;
			
        }
		
		// Function: toBoolean
		// Returns true if parameter string equals "true".
		// Parameter: string
        private function toBoolean($string){
            $haeh = $string == "true"? true : false;
            //error_log("heah: " . $haeh);
            return $haeh;
        }

		// Function: __toString
		// Returns the current SimulationState parameters as json encoded string.		
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
                "defiCharge" => $this->defiCharge,
                "defiEnergyThreshold" => $this->defiEnergyThreshold,
                "hasCPR" => $this->hasCPR,
                "hasCOPD" => $this->hasCOPD,
				"pacer" => $this->pacer,
				"respRatio" => $this->respRatio
			
            ];
            return json_encode($array);
        }


    }

	// Function: getVitalSignParameters
	// Creates an object of class VitalSignParameters for each default pathology. All objects are returned in an array.
    function getVitalSignParameters(){
        $vitalSignParameters;
        if (!isset($vitalSignParameters)){

            //here default values for the specific pathologies can be adjusted 
            $sinus_rhythm = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Sinus Rhythm", 60, 0.01, 0,
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 1, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 120, 80,
                /* spo2; rr; etco2; */
                97, 12, 36);

            $asystole = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Asystole", 0, 0.01, 0,
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 0, 0,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                0, 0, 0, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                -0.780, 0, 0, 0,
                /* spo2; rr; etco2; */
                0, 0, 0);

            $junctional_rhythm = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Junctional Rhythm", 40, 0.01, 0,
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 0, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, -1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 70, 30, 
                /* spo2; rr; etco2; */
                97, 18, 30);

            $ventricular_tachycardia = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Ventricular Tachycardia", 180, 0.01, 0.13, 
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 0, 1, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                0, 1, 0, 2, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0.110, 70, 60, 
                /* spo2; rr; etco2; */
                97, 18, 35);

            $ventricular_fibrillation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Ventricular Fibrillation", 250, 0.01, 0.10, 
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 0, 0.3, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                0, 2, 0, 2, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 0, 0, 
                /* spo2; rr; etco2; */
                0, 0, 0);

            $atrial_fibrillation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "Atrial Fibrillation", 110, 0.1, 0, 
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                0, 0, 1, 
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 0, 0, 1, 
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 100, 60, 
                /* spo2; rr; etco2; */
                96, 12, 36);

            $av_block3 = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "AV Block 3", 60, 0.01, 0, 
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 1, 1,
                /* sWaveFactor; tWaveFactor; uWaveFactor; pWavePreFactor; */
                1, 1, 1, 1,
                /* qrsAmplitudeOffset; qrsDurationOffset; systolic; diastolic; */
                0, 0, 120, 80,
                /* spo2; rr; etco2; */
                97, 15, 36);

            $st_elevation = new VitalSignParameters(
                /* name; hr; Noise; xValOffset; */
                "ST Elevation", 60, 0.01, 0, 
                /* pWaveFactor; qWaveFactor; qrsComplexFactor; */
                1, 1, 1,
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
	
	// Function: getUserByName
	// Queries the database for a user with a specific username and returns an object of class User.
	// Parameters:
    //    username - Name of the user.
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

	// Function: createUser
	// Creates a new user in the database.
	//
	// Parameters:
    //    username - Name of the new user.
	//    role - Role of the new user.	
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
	
	// Function: updateUser
	// Updates the role of an existing user in the database.
	//
	// Parameters:
    //    username - Name of the user.
	//    role - New role of the user.	
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

	// Function: createLessonIfNotExist
	// Checks whether a lesson for the given trainer / trainee pair exists. Creates a new lesson if not. Default lesson values are defined here. If a lesson exists, returns that lesson instead of creating a new lesson.
	//
	// Parameters:
    //    trainerID - Id of the trainer.
	//    traineeID - Id of the trainee.	
    function createLessonIfNotExist($trainerID, $traineeID) {
        include 'dbconnect.php';
        $lesson = getLessonByParticipants($trainerID, $traineeID);

        if ($lesson){
            return $lesson;
        }else{
            $sinus_rhythm = getVitalSignParameters()["sinus_rhythm"];

            $simState = new SimulationState(
                /* enableECG, enableSPO2, enableETCO2, defiPathology */
                false, false, false, 'Sinus Rhythm',
				/* hrDefi, spo2Defi, etco2Defi, rrDefi, sysDefi,diaDefi */
				60,97,36,12,120,80,
                /* showHR, showSPO2, displayETCO2, displayRR,  */
                false, false, false, false,
                /* displayNIBP, defiCharge, defiEnergyThreshold, */
                false, 150, 150,
                /* hasCPR, hasCOPD, pacer, respRatio */
                false, false, new PacerState(false, 60, 10, 5), 0);

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
	
	// Function: getLessonByParticipants
	// Queries the database for an existing lesson of the given trainer / trainee pair. If yes, returns an object of class Lesson.
	//
	// Parameters:
    //    trainerID - Id of the trainer.
	//    traineeID - Id of the trainee.
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

    // Function: saveLesson
	// Updates current lesson data to the database.
	//
	// Parameters:
    //    lesson_values - Object of class Lesson.
    function saveLesson($lesson_values){ 
        include 'dbconnect.php';

        $simStateArray = $lesson_values["simState"];

        $pacer = new PacerState(
            $simStateArray["pacer"]["isEnabled"],
            $simStateArray["pacer"]["frequency"],
            $simStateArray["pacer"]["energy"],
            $simStateArray["pacer"]["energyThreshold"]);

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
            $simStateArray["defiCharge"],
            $simStateArray["defiEnergyThreshold"],
            $simStateArray["hasCPR"],
            $simStateArray["hasCOPD"],
            $pacer,
            $simStateArray["respRatio"]);	

        $vitalSignArray = $lesson_values["vitalSigns"];
        $vitalSignParameters = new VitalSignParameters(
            $vitalSignArray["name"],
            $vitalSignArray["hr"],
            $vitalSignArray["Noise"],
            $vitalSignArray["xValOffset"],
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
	
	// Function: saveCommentDB
	// Saves a comment / message to the database.
	//
	// Parameters:
    //    comment - The message body.
	//    trainerID - Id of the trainer.
	//    traineeID - Id of the trainee.
	 function saveCommentDB($comment,$trainerID,$traineeID){ 
        // connect to database
        include 'dbconnect.php';
		$date = date("y-m-d h:i:s");
       
        $update_comment_query = "INSERT INTO messages (trainerID, traineeID, date, message) VALUES (".$trainerID.", ".$traineeID.",'".$date."', '".addslashes($comment)."')";
		
        $success_save_comment_query = mysqli_query($link, $update_comment_query);
        return $success_save_comment_query;
    } 

	// Function: saveTimeDB
	// Updates the current clock value to the database.
	//
	// Parameters:
    //    newTime - The new clock value.
	//    trainerID - Id of the trainer.
	//    traineeID - Id of the trainee.	
	 function saveTimeDB($newTime,$trainerID,$traineeID){ 
        // connect to database
        include 'dbconnect.php';
		$date = date("y-m-d h:i:s");
       
        $update_lesson_query = "UPDATE lessons SET timer='$newTime' WHERE trainerID='$trainerID' and traineeID='$traineeID'";
		
        $success_save_lesson_query = mysqli_query($link, $update_lesson_query);
        return $success_save_lesson_query;
    }
?>