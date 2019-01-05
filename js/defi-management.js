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


/* Function: DefiManagement
    Used to perform all defibrillator related task. */
var DefiManagement = function() {

    /* Variable: chargeValue
        This variable stores the currently chosen charge Value. */
    var chargeValue = 150;

    /* Constant: defiChargeBounds
        Stores max, intermediate and min values for the defi charge.  */
    const defiChargeBounds = {max: 400, intermediate: 50, min: 5};

    /* Variable: defiDischargeTimer
        This variable contains the automatic defibrilator discharge timer. */
    var defiDischargeTimer;

    /* Variable: showECGPeaks
        Indicates, if the ECG peaks are marked by triangles for the syncronization of the 
        defibrillation. */
    var showECGPeaks = false

    /* Variable: isShockPending
        Indicates, if a defibrillation shock is pending This is the case, when the shock-Button 
        is pressed and the next R-wave is still to be detected. */
    var isShockPending = false;

    this.shockPending = function() { return isShockPending};

    /* Function: defiEnergyDown 
        Used to reduce the Defibrilation Charge Energy 
        and to update the corresponding Label.
        
        See Also: <defiEnergyUp>
    */
    this.defiEnergyDown = function() {
        if (chargeValue - 5 >= defiChargeBounds.min) {
            if (chargeValue - 50 >= defiChargeBounds.intermediate) {
                chargeValue -= 50;
            } else {
                chargeValue -= 5;
            }
            $("#defiChargeLabel").html(chargeValue + "<br>J");
        }
    }

    /* Function: defiEnergyUp
        Used to increase the Defibrilation Charge Energy
        and to update the corresponding Label.

        See Also: <defiEnergyDown>
    */
    this.defiEnergyUp = function() {
        if (chargeValue + 5 <= defiChargeBounds.max) {
            if (chargeValue >= defiChargeBounds.intermediate) {
                chargeValue += 50;
            } else {
                chargeValue += 5;
            }
            $("#defiChargeLabel").html(chargeValue + "<br>J");
        }
    }

    /* Function: defiCharge
        This function temporary saves the current <simConfig>, calls the function, which plays 
        the loading sound <playDefiLoadSound> and opens the loading bar modal. 
    */
    this.defiCharge = function() {
        var charge = chargeValue + " J";

        /* Create a deepcopy of the current simConfig so that changes to tempConfig are not 
        direcly effecting the simConfig. (Remember: Call by Reference is standard for Objects 
        in JS) */
        tempConfig = JSON.parse(JSON.stringify(simConfig));
        tempConfig.simState.defiCharge = charge;
        soundManagement.playDefiLoadSound();
        $("#defiChargeModal").modal();
        $("#defiChargeModalLabel").html("Charging to: " + chargeValue + " J");
        saveComment("Defi Charged to: " + chargeValue + "J");
    }

    /* Function: defiFullyCharged
        In this function, the automatic <defiDischargeTimer> is started,  which "discharges" 
        the defibrilator after 30000ms automatically if no shock is performed. This function 
        is called, when the "charge"-Soundfile has finished playing.
    */
    this.defiFullyCharged = function() {
        clearTimeout(defiDischargeTimer);
        $("#defiShockButton").removeAttr("disabled");
        $("#defiChargeModal").modal('hide');
        defiDischargeTimer = setTimeout(function () {
            isShockPending = false;
            $("#defiShockButton").attr('disabled', 'disabled');
        }, 30000);
    }

    this.isShowingECGPeaks = function() { return showECGPeaks };

    /* Function: defiShock 
        This function is used to syncronally or asyncronally provide a shock to the patient. 
        This is depended on, if the syncronization is active (indicated by <showECGPeaks>). 
        If a sync Shock is expected, the shock is put on hold, until the next peak is found in 
        the ECG.
    */
    this.defiShock = function() {
        if (showECGPeaks) {
            isShockPending = true;
        } else {
            performShock();
        }
    }

    /* Function: performShock 
        This function is responsible to change the current pathology to the before chosen 
        defiPathology from the Trainer. To apply the shock, it is first tested if the chosen 
        defiPathology is not ignored. Then, the active pathology is changed to the defiPathology 
        and the config is pushed to the database and <initControls> is reloaded. Also, the 
        function to play the sound for the shock is called and some UI-resets adaptions are made.

        See Also: <playDefiShockSound>.
    */
    function performShock() {
        /* If The defiPathology was changed after the charge began, it is important to pull the 
        current config to make it possible to use the most recent defiPathology after the shock. */
       if (chargeValue >= simConfig.simState.defiEnergyThreshold) {
           tempConfig.simState.defiPathology = simConfig.simState.defiPathology;
           var pathologyName = tempConfig.simState.defiPathology;
           if (pathologyName === 'ignore Defi') return;

           var selectedPathology = defaultPathologyList.find(function (pathology) {
               return pathology.name === pathologyName;
            });
            tempConfig.vitalSigns = selectedPathology;
			tempConfig.vitalSigns.hr = parseInt(simConfig.simState.hrDefi);
			tempConfig.vitalSigns.spo2 = parseInt(simConfig.simState.spo2Defi);
			tempConfig.vitalSigns.etco2 = parseInt(simConfig.simState.etco2Defi);
			tempConfig.vitalSigns.rr = parseInt(simConfig.simState.rrDefi);
			tempConfig.vitalSigns.systolic = parseInt(simConfig.simState.sysDefi);
			tempConfig.vitalSigns.diastolic = parseInt(simConfig.simState.diaDefi);
            saveLesson(tempConfig);
            initControls(tempConfig);
            soundManagement.playDefiShockSound();
            document.getElementById("defiShockButton").disabled = true;
            saveComment("Defibrillation applied");
       } else {
           soundManagement.playDefiShockSound();
           document.getElementById("defiShockButton").disabled = true;
           saveComment("Defibrillation Energy to Low!");
       }
    }

    /* Function: performSyncShock
        This function is used to perform a shock after waiting for the R-peak.
    */
    this.performSyncShock = function() {
        isShockPending = false;
        performShock();
    }

    /* Function: deactivateDefiSync
        This function is used to deactivate the defi Syncronization, if no R-Peak can be detected.
    */
    this.deactivateDefiSync = function() {
        showECGPeaks = false;
        $("#defiSyncButton").removeClass("btn-success");
        $("#defiSyncButton").addClass("btn-light");
    }

    /* Function: toggleDefiSync
        This function is used to toggle the UI and the flag for the visible ecg-peaks.
    */
    this.toggleDefiSync = function() {
        showECGPeaks = !showECGPeaks;

        if (showECGPeaks) {
            $("#defiSyncButton").removeClass("btn-light");
            $("#defiSyncButton").addClass("btn-success");
        } else {
            $("#defiSyncButton").removeClass("btn-success");
            $("#defiSyncButton").addClass("btn-light");
        }
    }

}