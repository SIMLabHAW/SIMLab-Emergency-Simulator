/* Copyright (C) 2018 HAW-Hamburg,
Project lead: Prof. Dr. Boris Tolg, Prof. Dr. Stefan Oppermann,
Development: Christian Bauer, Serena Glass.

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


/* Function: PacerManagement
    Contains the alrogithms to perform the simulated pacing.

    See also: <Arrhythmia Monitoring Algorithm: http://incenter.medical.philips.com/doclib/enc/fetch/577817/577869/Arrhythmia_Monitoring_Algorithm_Application_Note_(ENG).pdf%3fnodeid%3d578137%26vernum%3d-2>
*/
var PacerManagement = function() {

    /* Variable: self
        Contains a reference to "this". */
    var self = this;

    /* Constant: energyBounds
        Stores the bounds of the Energy. */
    const energyBounds = {max: 150, min: 10};

    /* Constant: frequencyBounds
        Stores the bounds of the Frequency. */
    const frequencyBounds = {max: 200, min: 50};

    /* Variable: energy 
        Stores the current energy level. */
    var energy = 10;

    /* Function: thresholdEnergy 
        Returns the current Threshold Energy */
    var thresholdEnergy = function() { return simConfig.simState.pacer.energyThreshold; };

    /* Variable: frequency
        Stores the current frequency level. */
    var frequency = 60;

    /* Variable: pacedDeltaX
        Stores a counting value to draw the pacer peaks at the specified <frequency>.
     */
    this.pacedDeltaX = 0;

    /* Variable: 
        Stores a flag, if the pacer is currently active. */
    this.isEnabled = false;

    /* Function: getNormalizedEnergy
        Calculates and returns the normalized Energy. Used for the pacer peak heights. */
    this.getNormalizedEnergy = function() { return energy/energyBounds.max; };

    /* Function: isThresholdReached
        Checks and returns if the currently chosen energy is higher or equal to the 
        threshold at which the pacer starts to overtake the internal heartrate. */
    this.isThresholdReached = function() { return energy >= thresholdEnergy(); };

    /* Function: getFrequency
        Returns the current pacer-frequency. */
    this.getFrequency = function() { return frequency; };

    /* Function: updatePacerDB
        Used to updated the pacer state in the database. This is necessary to also show pacer 
        peaks on the TrainerView. */
    function updatePacerDB() {
        tempConfig = JSON.parse(JSON.stringify(simConfig));
        tempConfig.simState.pacer.energy = energy;
        tempConfig.simState.pacer.frequency = frequency;
        tempConfig.simState.pacer.isEnabled = self.isEnabled;
        saveLesson(tempConfig);
        initControls(tempConfig);
    }

    /* Function: updatePacerEnabledStateDB
        This function is updating only the pacer enabled flag in the database. 
            
        Parameters: 
            config - Contains the current config to be adapted. */
    this.updatePacerEnabledStateDB = function(config) {
        tempConfig = JSON.parse(JSON.stringify(config));
        tempConfig.simState.pacer.isEnabled = self.isEnabled;
        saveLesson(tempConfig);
        initControls(tempConfig);
    }


    /* Function: togglePacing
        Toggles the pacing and adapts the UI correspondently. */
    this.togglePacing = function() { 
        this.isEnabled = !this.isEnabled
        if(this.isEnabled) {
            $("#pacerButton").removeClass("btn-light");
            $("#pacerButton").addClass("btn-success");
        } else {
            $("#pacerButton").removeClass("btn-success");
            $("#pacerButton").addClass("btn-light");
        }
        updatePacerDB();
    }

    /* Function: deactivatePacing
        Deactivates the Pacing. */
    this.deactivatePacing = function() {
        this.isEnabled = false;
        $("#pacerButton").removeClass("btn-success");
        $("#pacerButton").addClass("btn-light");
        updatePacerDB();
    }

    /* Function: energyUp
        Increases the energy of the Pacer. */
    this.energyUp = function() {
        if (energy + 10 <= energyBounds.max) {
            energy += 10;
            $("#pacerEnergyLabel").html(energy + "<br>mA");
        }
        updatePacerDB();
    }

    /* Function: energyDown
        Decreases the energy of the Pacer. */
    this.energyDown = function() {
        if (energy - 10 >= energyBounds.min) {
            energy -= 10;
            $("#pacerEnergyLabel").html(energy + "<br>mA");
        }
        updatePacerDB();
    }

    /* Function: frequencyUp
        Increases the frequency of the Pacer. */
    this.frequencyUp = function() {
        if (frequency + 10 <= frequencyBounds.max) {
            frequency += 10;
            $("#pacerFrequencyLabel").html(frequency + "<br>bpm");
        }
        updatePacerDB();
    }

    /* Function: frequencyUp
        Decreases the frequency of the Pacer. */
    this.frequencyDown = function() {
        if (frequency - 10 >= frequencyBounds.min) {
            frequency -= 10;
            $("#pacerFrequencyLabel").html(frequency + "<br>bpm");
        }
        updatePacerDB();
    }


    /* Function: performFixedPacing
        Checks if conditions for pacing are met and returns a specific ecg. */
    this.performFixedPacing = function() {
        var tempConfig = JSON.parse(JSON.stringify(simConfig));
        var cd = JSON.parse(JSON.stringify(changeDuration));
        cd.value = 0;
        cd.isAuto = false;
        if (simConfig.vitalSigns.hr < frequency) {
            tempConfig.vitalSigns.hr = frequency;
        }

        // true indicates, that pacing is performed.
        return ecgCalculation.calc(tempConfig.vitalSigns, cd, true);
    }

    /* Function: getAccordingSPO2
        Checks if conditions for pacing are met and returns a specific spo2. */
    this.getAccordingSPO2 = function() {
        var tempConfig = JSON.parse(JSON.stringify(simConfig));
        var cd = JSON.parse(JSON.stringify(changeDuration));
        cd.value = 0;
        cd.isAuto = false;
        if (simConfig.vitalSigns.hr < frequency) {
            tempConfig.vitalSigns.hr = frequency;
        }

        return spo2Calculation.calc(tempConfig.vitalSigns.hr,
            {sys: tempConfig.vitalSigns.systolic, dia: tempConfig.vitalSigns.diastolic}, cd, true);
    }
}