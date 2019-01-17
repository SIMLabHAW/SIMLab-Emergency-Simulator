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



/* Variable: simConfig
    This variable stores the most valueable data for the simulation, 
    as it contains the currently active parameters for the:
    
    - patient pathology and parameters,
    - simulated measurements and corresponding shown measurement parameters,
    - defibrilator pathology (to change _to_ after a shock),
    - synchonized timer, etc.
 */
var simConfig;

/* Variable: oldConfig
    This variable stores the previous <simConfig> in order to 
    enable dynamic changes of parameters from old to new values. 
*/
var oldConfig;

/* Variable: tempConfig
    This variable is used to store a deepcopy of the current 
    simConfig so that temporary changes are not 
    direcly effecting the simConfig. This is used before the 
    shock is applied for the defibrilation. (Remember: 
        Call by Reference is standard for Objects in JS) 
*/
var tempConfig;

var postChangePathology;

/* Variable: ecgGraph
    Stores a reference to the ECGGraph. */
var ecgGraph;

/* Variable: spo2Graph
    Stores a reference to the SPO2Graph. */
var spo2Graph;

/* Variable: etco2Graph
    Stores a reference to the ETCO2Graph. */
var etco2Graph;

var defaultPathologyList;
var updateTextForms = false;

/* Variable: etco2Calculation
    Used to perform all calculations to simulate the etco2-curve. */
var etco2Calculation = new ETCO2Calculation();

/* Variable: ecgCalculation
    Used to perform all calculations to simulate the ecg-curve. */
var ecgCalculation = new ECGCalculation();

/* Variable: spo2Calculation
    Used to perform all calculations to simulate the spo2-curve. */
var spo2Calculation = new SPO2Calculation();

var ecgCPR = new CPRManagement(1.4, 110, CPRType.ECG);
var spo2CPR = new CPRManagement(1, 110, CPRType.SPO2);
var etco2CPR = new CPRManagement(0.8, 110, CPRType.ETCO2);

const viewType = ViewType.Trainer;

/* Function: initControls
    Called every second and when the values in the UI-Elements change. Responsible for 
    initializing the UI and for setting the current config.
    
    Parameters: 
        config - Contains the current config. It is set to <simConfig>. 
*/
var initControls = function (config) {

    const newPathology = config.vitalSigns.name;

    if (oldConfig === undefined) {
        // This is called on first simulation start.
        oldConfig = config.vitalSigns;

        changeDuration = config.changeDuration;

        /* This is activating the AV Block or the ST Elevation. */
        ecgCalculation.hasAVBlock = (newPathology === "AV Block 3");
        ecgCalculation.hasSTElevation = (newPathology === "ST Elevation");
    }

    if ((simConfig && JSON.stringify(simConfig.vitalSigns) 
    !== JSON.stringify(config.vitalSigns))) {

        oldConfig = simConfig.vitalSigns;

        // ecgCalculation.timeSinceConfigChange is resetted when a new config is found.
        ecgCalculation.timeSinceConfigChange = 0;

        if (oldConfig.name !== config.vitalSigns.name) {
            // If the name of the pathology was changed, the HR is changed instantly.
            ecgCalculation.currentHR = config.vitalSigns.hr;
            spo2Calculation.currentNIBP = {sys: config.vitalSigns.systolic, dia: config.vitalSigns.diastolic};
            etco2Calculation.setCurrentValues(config.vitalSigns.rr, config.vitalSigns.etco2);

            /* This is activating the AV Block or the ST Elevation. */
            ecgCalculation.hasAVBlock = (newPathology === "AV Block 3");
            ecgCalculation.hasSTElevation = (newPathology === "ST Elevation");

        }

        needsPostShockValueUpdate = true;
        updateTextForms = true;

        console.log("Current pathology: " + simConfig.vitalSigns);
    } else {
        updateTextForms = false;
    }

    simConfig = config;

    if (!defaultPathologyList) {
        getVitalSignParameters(function () {
            // add ignore defi option
            var select = document.getElementById('defiPathologySelect');
            var opt = document.createElement('option');
            opt.value = 'ignore Defi';
            opt.innerHTML = 'ignore Defi';
            select.appendChild(opt);

            if (vitalSignParameters) {
                defaultPathologyList = vitalSignParameters;
                for (var pathology of vitalSignParameters) {
                    addPathology(pathology, pathology.name);
                }
            } else {
                console.log("Could not retrieve pathologies from database.");
            }
            addDefiThresholdEnergyLevels();
            addPacerThresholdEnergyLevels();
            updateUI();
        });
    }

    if (simConfig.simState.enableECG) {
        if (!ecgGraph.isGraphRunning()) {
            ecgGraph.start();
        }
    } else {
        ecgGraph.clear();
    }

    if (simConfig.simState.enableSPO2) {
        if (!spo2Graph.isGraphRunning()) {
            spo2Graph.start();
        }
    } else {
        spo2Graph.clear();
    }

    if (simConfig.simState.enableETCO2) {
        if (!etco2Graph.isGraphRunning()) {
            etco2Graph.start();
        }
    } else {
        etco2Graph.clear();
    }

    //change value display in trainerview AND in traineeview
    $('#ecg-checkbox').prop("checked", simConfig.simState.enableECG);
    $('#spo2-checkbox').prop("checked", simConfig.simState.enableSPO2);
    $('#etco2-checkbox').prop("checked", simConfig.simState.enableETCO2);
    $('#nipb-checkbox').prop("checked", simConfig.simState.displayNIBP);

    $('#cprCheckbox').prop("checked", simConfig.simState.hasCPR);
    $('#copdCheckbox').prop("checked", simConfig.simState.hasCOPD);

    if (updateTextForms) {
        updateUI();
    }
};

$("#dynamicChangeSlider").ionRangeSlider({
    type: "single",
    min: 0,
    max: 120,
    postfix: "s"
});

var changeDuration = {isAuto: true, value: 30};

function getDynamicChange() {
    $("#dynamicChangeModalTitle").html("Dynamic Change Config");
    $("#dynamicChangeModalTitle").css("color", "#ffffff");

    $("#dynamicChangeCheckbox").prop("checked", changeDuration.isAuto);
    setAutoChange(changeDuration.isAuto);
    $("#dynamicChangeSlider").data("ionRangeSlider").update({
        from: changeDuration.value
    });
}

function saveDynamicChange() {
    tempConfig = JSON.parse(JSON.stringify(simConfig));

    changeDuration.value = $("#dynamicChangeSlider").data().from;
    changeDuration.isAuto = $("#dynamicChangeCheckbox").prop('checked');

    tempConfig.changeDuration = changeDuration;

	saveLesson(tempConfig);
}

function toggleAutoChangeDuration(checkbox) {
    setAutoChange(checkbox.checked);
}

function setAutoChange(isActive) {
    $("#dynamicChangeLabel").css("color", isActive ? "grey" : "white");
    $("#dynamicChangeSlider").data("ionRangeSlider").update({
        disable: isActive
    });
}

function updateUI() {

    $("#pathology-select").find('option').removeAttr("selected");
    $("#defiPathologySelect").find('option').removeAttr("selected");

    $("#pathology-select option").filter(function () {
        return $(this).val() === simConfig.vitalSigns.name;
    }).prop('selected', true);

    $("#defiPathologySelect option").filter(function () {
        return $(this).val() === simConfig.simState.defiPathology;
    }).prop('selected', true);


    $("#defiThresholdEnergySelect").find('option').removeAttr("selected");
    $("#pacerThresholdEnergySelect").find('option').removeAttr("selected");

    $("#defiThresholdEnergySelect option").filter(function () {
        return $(this).val() == simConfig.simState.defiEnergyThreshold;
    }).prop('selected', true);

    $("#pacerThresholdEnergySelect option").filter(function () {
        return $(this).val() == simConfig.simState.pacer.energyThreshold;
    }).prop('selected', true);

    $('#hrInput').val(simConfig.vitalSigns.hr);
    $('#hrLabel').html(simConfig.vitalSigns.hr);
    $('#spo2Input').val(simConfig.vitalSigns.spo2);
    $('#spo2Label').html(simConfig.vitalSigns.spo2);
    $('#etco2Input').val(simConfig.vitalSigns.etco2);
    $('#etco2Label').html(simConfig.vitalSigns.etco2);
    $('#rrInput').val(simConfig.vitalSigns.rr);
    $('#rrLabel').html(simConfig.vitalSigns.rr);
    $('#sysInput').val(simConfig.vitalSigns.systolic);
    $('#sysLabel').html(simConfig.vitalSigns.systolic);
    $('#diaInput').val(simConfig.vitalSigns.diastolic);
    $('#diaLabel').html(simConfig.vitalSigns.diastolic);

    if (simConfig.simState.enableECG) {
        $('#hrLabel').css("color", "");
        $('#ecgGraphLabel').css("color", "");
        $('#heartRateLabel').css("color", "");
    } else {
        $('#hrLabel').css("color", "lightgrey");
        $('#ecgGraphLabel').css("color", "lightgrey");
        $('#heartRateLabel').css("color", "lightgrey");
    }

    if (simConfig.simState.enableSPO2) {
        $('#spo2Label').css("color", "");
        $('#spo2GraphLabel').css("color", "");
        $('#spo2ParameterLabel').css("color", "");
    } else {
        $('#spo2Label').css("color", "lightgrey");
        $('#spo2GraphLabel').css("color", "lightgrey");
        $('#spo2ParameterLabel').css("color", "lightgrey");
    }

    if (simConfig.simState.enableETCO2) {
        $('#etco2Label').css("color", "");
        $('#etco2GraphLabel').css("color", "");
        $('#etco2ParameterLabel').css("color", "");
        $('#rrLabel').css("color", "");
        $('#rfParameterLabel').css("color", "");
    } else {
        $('#etco2Label').css("color", "lightgrey");
        $('#etco2GraphLabel').css("color", "lightgrey");
        $('#etco2ParameterLabel').css("color", "lightgrey");
        $('#rrLabel').css("color", "lightgrey");
        $('#rfParameterLabel').css("color", "lightgrey");
    }

    if (simConfig.simState.displayNIBP) {
        $('#sysLabel').css("color", "");
        $('#diaLabel').css("color", "");
        $('#sysNIBPLabel').css("color", "");
        $('#diaNIBPLabel').css("color", "");
    } else {
        $('#sysLabel').css("color", "lightgrey");
        $('#diaLabel').css("color", "lightgrey");
        $('#sysNIBPLabel').css("color", "lightgrey");
        $('#diaNIBPLabel').css("color", "lightgrey");
    }
}

function saveAll(){

        if (postChangePathology != undefined) {
            tempConfig = JSON.parse(JSON.stringify(postChangePathology));
            postChangePathology = undefined;
        } else {
            tempConfig = JSON.parse(JSON.stringify(simConfig));
        }
		
		var newValue = $('#hrInput').val();
		// Input Sanatization: (Everything under 0 is BS.)
		if (newValue > 250) {
			newValue = 250;
		}
		if (newValue < 0) {
			newValue = 0;
		}
		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.hr) {

			tempConfig.vitalSigns.hr = parseInt(newValue);
			postValueChange("heart rate", tempConfig.vitalSigns.hr);
		}
	
		var newValue = $('#spo2Input').val();
		// Input Sanatization: (Everything >100 and <0 is BS.)
		if (newValue > 100) {
			newValue = 100;
		}
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.spo2) {
			tempConfig.vitalSigns.spo2 = parseInt(newValue);
			postValueChange("SpO2", tempConfig.vitalSigns.spo2);
		}
	
		var newValue = $('#etco2Input').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.etco2) {
			tempConfig.vitalSigns.etco2 = parseInt(newValue);
			postValueChange("etco2", tempConfig.vitalSigns.etco2);
		}
		
		var newValue = $('#rrInput').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.rr) {
			tempConfig.vitalSigns.rr = parseInt(newValue);
			postValueChange("rr", simConfig.vitalSigns.rr);
		}
	
		var newValue = $('#sysInput').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.systolic) {
			tempConfig.vitalSigns.systolic = parseInt(newValue);
			postValueChange("Sys", tempConfig.vitalSigns.systolic);
		}
	
		var newValue = $('#diaInput').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfig.vitalSigns.diastolic) {
			tempConfig.vitalSigns.diastolic = parseInt(newValue);
			postValueChange("Dia", tempConfig.vitalSigns.diastolic);
		}
		saveLesson(tempConfig);
		initControls(tempConfig);
}

//var postShockValues = {hr: 0, spo2: 0, etco2: 0, rr: 0, sys: 0, dia: 0};

var needsPostShockValueUpdate = true;
function showPostShockModal() {

    var pathologyName = document.getElementById("defiPathologySelect").value;
    var selectedPathology = defaultPathologyList.find(function (pathology) {
        return pathology.name === pathologyName;
    });


    if (needsPostShockValueUpdate) {
        $('#hrInputDefi').val(selectedPathology.hr);
        $('#spo2InputDefi').val(selectedPathology.spo2);
        $('#etco2InputDefi').val(selectedPathology.etco2);
        $('#rrInputDefi').val(selectedPathology.rr);
        $('#sysInputDefi').val(selectedPathology.systolic);
        $('#diaInputDefi').val(selectedPathology.diastolic);
        $("#postShockSettingTitle").text("Post-Shock Parameters for " + selectedPathology.name);
        needsPostShockValueUpdate = false;
    } else {
		$('#hrInputDefi').val(simConfig.simState.hrDefi);
		$('#spo2InputDefi').val(simConfig.simState.spo2Defi);
		$('#etco2InputDefi').val(simConfig.simState.etco2Defi);
		$('#rrInputDefi').val(simConfig.simState.rrDefi);
		$('#sysInputDefi').val(simConfig.simState.sysDefi);
		$('#diaInputDefi').val(simConfig.simState.diaDefi);
    }
}

function saveAllPostShock(){
	
        tempConfigPostShock = JSON.parse(JSON.stringify(simConfig));

		var newValue = $('#hrInputDefi').val();
		// Input Sanatization: (Everything under 0 is BS.)
		if (newValue > 250) {
			newValue = 250;
		}
		if (newValue < 0) {
			newValue = 0;
		}
		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.hrDefi) {

			tempConfigPostShock.simState.hrDefi = parseInt(newValue);
			postValueChange("heart rate defi", tempConfigPostShock.simState.hrDefi);
		}
	
		var newValue = $('#spo2InputDefi').val();
		// Input Sanatization: (Everything >100 and <0 is BS.)
		if (newValue > 100) {
			newValue = 100;
		}
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.spo2Defi) {
			tempConfigPostShock.simState.spo2Defi = parseInt(newValue);
			postValueChange("SpO2 defi", tempConfigPostShock.simState.spo2Defi);
		}
	
		var newValue = $('#etco2InputDefi').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.etco2Defi) {
			tempConfigPostShock.simState.etco2Defi = parseInt(newValue);
			postValueChange("etco2 defi", tempConfigPostShock.simState.etco2Defi);
		}
		
		var newValue = $('#rrInputDefi').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.rrDefi) {
			tempConfigPostShock.simState.rrDefi = parseInt(newValue);
			postValueChange("rr defi", tempConfigPostShock.simState.rrDefi);
		}
	
		var newValue = $('#sysInputDefi').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.sysDefi) {
			tempConfigPostShock.simState.sysDefi = parseInt(newValue);
			postValueChange("Sys defi", tempConfigPostShock.simState.sysDefi);
		}
	
		var newValue = $('#diaInputDefi').val();
		// Input Sanatization: (Everything <0 is BS.)
		if (newValue < 0) {
			newValue = 0;
		}

		if (newValue.length > 0 && newValue != tempConfigPostShock.simState.diaDefi) {
			tempConfigPostShock.simState.diaDefi = parseInt(newValue);
			postValueChange("Dia defi", tempConfigPostShock.simState.diaDefi);
		}
		saveLesson(tempConfigPostShock);
}

function handleChangeCPR(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.hasCPR = checkbox.checked;

    saveLesson(tempConfig);
    initControls(tempConfig);
}

function handleChangeCOPD(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.hasCOPD = checkbox.checked;

    saveLesson(tempConfig);
    initControls(tempConfig);
}

//onOff switches
function handleChangeECG(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.enableECG = checkbox.checked;
    tempConfig.simState.showHR = checkbox.checked;

    if (checkbox.checked) {
        postValueChange("ECG", "On");
        ecgGraph.start();
        $('#hrLabel').css("color", "");
        $('#ecgGraphLabel').css("color", "");
        $('#heartRateLabel').css("color", "");
        $('#pacerEnergyThresholdLabel').css("color", "");
        
    } else {
        $('#hrLabel').css("color", "lightgrey");
        $('#ecgGraphLabel').css("color", "lightgrey");
        $('#heartRateLabel').css("color", "lightgrey");
        $('#pacerEnergyThresholdLabel').css("color", "lightgrey");
        ecgGraph.clear();
        postValueChange("ECG", "Off");
    }

    saveLesson(tempConfig);
    initControls(tempConfig);
}

function handleChangeSpO2(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.enableSPO2 = checkbox.checked;
    tempConfig.simState.showSPO2 = checkbox.checked;

    if (checkbox.checked) {
        spo2Graph.start();
        postValueChange("SPO2", "On");
        $('#spo2Label').css("color", "");
        $('#spo2GraphLabel').css("color", "");
        $('#spo2ParameterLabel').css("color", "");
    } else {
        $('#spo2Label').css("color", "lightgrey");
        $('#spo2GraphLabel').css("color", "lightgrey");
        $('#spo2ParameterLabel').css("color", "lightgrey");
        spo2Graph.clear();
        postValueChange("SPO2", "Off");
    }

    saveLesson(tempConfig);
    initControls(tempConfig);

}

function handleChangeEtCO2(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.enableETCO2 = checkbox.checked;
    tempConfig.simState.displayETCO2 = checkbox.checked;
    tempConfig.simState.displayRR = checkbox.checked;

    if (checkbox.checked) {
        etco2Graph.start();
        postValueChange("EtCO2", "On");
        $('#etco2Label').css("color", "");
        $('#etco2GraphLabel').css("color", "");
        $('#etco2ParameterLabel').css("color", "");
        $('#rrLabel').css("color", "");
        $('#rfParameterLabel').css("color", "");
    } else {
        $('#etco2Label').css("color", "lightgrey");
        $('#etco2GraphLabel').css("color", "lightgrey");
        $('#etco2ParameterLabel').css("color", "lightgrey");
        $('#rrLabel').css("color", "lightgrey");
        $('#rfParameterLabel').css("color", "lightgrey");
        postValueChange("EtCO2", "Off");
        etco2Graph.clear();
    }
    saveLesson(tempConfig);
    initControls(tempConfig);

}

function handleChangeNipb(checkbox) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.displayNIBP = checkbox.checked;

    if (checkbox.checked) {
        $('#sysLabel').css("color", "");
        $('#diaLabel').css("color", "");
        $('#sysNIBPLabel').css("color", "");
        $('#diaNIBPLabel').css("color", "");
        postValueChange("Nipb", "On");

    } else {
        $('#sysLabel').css("color", "lightgrey");
        $('#diaLabel').css("color", "lightgrey");
        $('#sysNIBPLabel').css("color", "lightgrey");
        $('#diaNIBPLabel').css("color", "lightgrey");
        postValueChange("Nipb", "Off");
    }
    saveLesson(tempConfig);
    initControls(tempConfig);
}

function handleChangeRespRatio(respRatio) {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    tempConfig.simState.respRatio = respRatio;

    saveLesson(tempConfig);
    initControls(tempConfig);
}

function handleSelectPathology() {
    postChangePathology = JSON.parse(JSON.stringify(simConfig));
    var pathologyName = document.getElementById("pathology-select").value;
    var selectedPathology = defaultPathologyList.find(function (pathology) {
        return pathology.name === pathologyName;
    });
    if (selectedPathology) {
        postChangePathology.vitalSigns = selectedPathology;
        //initControls(tempConfig);
        //saveLesson(tempConfig);
        updateUIWith(postChangePathology);
        postValueChange("Pathology", selectedPathology.name);
    }
}

function updateUIWith(pathology) {

    $('#hrInput').val(pathology.vitalSigns.hr);
    $('#spo2Input').val(pathology.vitalSigns.spo2);
    $('#etco2Input').val(pathology.vitalSigns.etco2);
    $('#rrInput').val(pathology.vitalSigns.rr);
    $('#sysInput').val(pathology.vitalSigns.systolic);
    $('#diaInput').val(pathology.vitalSigns.diastolic);
}

function handleSelectPathologyDefi() {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    var pathologyName = document.getElementById("defiPathologySelect").value;
    if (pathologyName) {
        console.log("Selected Defi-Pathology " + pathologyName);
        tempConfig.simState.defiPathology = pathologyName;
        needsPostShockValueUpdate = true;

        var selectedPathology = defaultPathologyList.find(function (pathology) {
            return pathology.name === pathologyName;
        });

        tempConfig.simState.hrDefi = parseInt(selectedPathology.hr);
		tempConfig.simState.spo2Defi = parseInt(selectedPathology.spo2);
		tempConfig.simState.etco2Defi = parseInt(selectedPathology.etco2);
		tempConfig.simState.rrDefi = parseInt(selectedPathology.rr);
		tempConfig.simState.sysDefi = parseInt(selectedPathology.systolic); 
		tempConfig.simState.diaDefi = parseInt(selectedPathology.diastolic);

        initControls(tempConfig);
        saveLesson(tempConfig);
        postValueChange("Defi-Pathology", pathologyName);
    }
}

function defiThresholdChanged() {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    newValue = $('#defiThresholdEnergySelect').val();
    tempConfig.simState.defiEnergyThreshold = parseInt(newValue);
    saveLesson(tempConfig);
    initControls(tempConfig);
    postValueChange("Defi Energy Threshold: ", newValue);
}

function pacerThresholdChanged() {
    tempConfig = JSON.parse(JSON.stringify(simConfig));
    newValue = $('#pacerThresholdEnergySelect').val();
    tempConfig.simState.pacer.energyThreshold = parseInt(newValue);
    saveLesson(tempConfig);
    initControls(tempConfig);
    postValueChange("Pacer Energy Threshold: ", newValue);
}

function addPacerThresholdEnergyLevels() {
    var select = document.getElementById("pacerThresholdEnergySelect");
    for (var i = 10; i <= 150; i+=10) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        select.appendChild(opt);
    }
}

/* Function: performFixedPacing
    Checks if conditions for pacing are met and returns a specific ecg. */
function performFixedPacing() {
    var tempConfig = JSON.parse(JSON.stringify(simConfig));
    var changeDuration = JSON.parse(JSON.stringify(changeDuration));
    changeDuration.value = 0;
    changeDuration.isAuto = false;
    var frequency = simConfig.simState.pacer.frequency;
    if (simConfig.vitalSigns.hr < frequency) {
        tempConfig.vitalSigns.hr = frequency;
    }

    // true indicates, that pacing is performed.
    return ecgCalculation.calc(tempConfig.vitalSigns, changeDuration, true);
}

/* Function: getAccordingSPO2
    Checks if conditions for pacing are met and returns a specific spo2. */
function getAccordingSPO2() {
    var tempConfig = JSON.parse(JSON.stringify(simConfig));
    var changeDuration = JSON.parse(JSON.stringify(changeDuration));
    changeDuration.value = 0;
    changeDuration.isAuto = false;
    var frequency = simConfig.simState.pacer.frequency;
    if (simConfig.vitalSigns.hr < frequency) {
        tempConfig.vitalSigns.hr = frequency;
    }

    return spo2Calculation.calc(tempConfig.vitalSigns.hr,
        {sys: tempConfig.vitalSigns.systolic, dia: tempConfig.vitalSigns.diastolic}, changeDuration, true);
}

function addDefiThresholdEnergyLevels() {
    var select = document.getElementById("defiThresholdEnergySelect");

    for (var i = 5; i < 50; i+=5) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        select.appendChild(opt);
    }
    for (var i = 50; i <= 400; i+=50) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        select.appendChild(opt);
    }
}

function addPathology(pathology, name, selected) {
    var select = document.getElementById('pathology-select');
    var opt = document.createElement('option');
    opt.value = pathology.name;
    opt.innerHTML = name;
    select.appendChild(opt);
    if (name === simConfig.vitalSigns.name) {
        opt.selected = true;
    }
    var select = document.getElementById('defiPathologySelect');
    var opt = document.createElement('option');
    opt.value = pathology.name;
    opt.innerHTML = name;
    select.appendChild(opt);
    /*if (name == simConfig.simState.defiPathology) {
        opt.selected = true;
    }*/
}

var totalSeconds = 0;
var timerVar;
var isTimerRunning = false;

function countTimer() {
    totalSeconds++;
    var newTime = formatTime(totalSeconds);
    $("#timerDiv").html(newTime);
    saveTime(newTime);
}

function toggleTimer() {
    isTimerRunning = !isTimerRunning;
    if (isTimerRunning) {
        timerVar = setInterval(countTimer, 1000);
        $("#start_timer").html("<b>STOP TIMER</b>");
        postValueChange("Timer", "Started");
    } else {
        clearInterval(timerVar);
        $("#start_timer").html("<b>START TIMER</b>");
        postValueChange("Timer", "Stopped");
    }

}

function resetTimer() {
    totalSeconds = 0;
    $("#timerDiv").html(formatTime(totalSeconds));
    saveTime('0:00');
    postValueChange("Timer", "Reset");
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
        h,
        m > 9 ? m : (h ? '0' + m : m || '0'),
        s > 9 ? s : '0' + s,
    ].filter(a => a).join(':');
};

$(document).on('click', '#testDropdown .dropdown-menu', function (e) {
    e.stopPropagation();
  });

var pacedDeltaX = 0;

//when everything is loaded....
$(document).ready(function () {
    toggleTimer();

    ecgGraph = new ECGGraph(function () {

        var pacer = simConfig.simState.pacer;
        var isThresholdReached = pacer.energy >= pacer.energyThreshold;
        
        if (pacer.isEnabled) {
            pacedDeltaX += timestep;
            if (pacedDeltaX >= 60/pacer.frequency) {
                pacedDeltaX = 0;
                if (!isThresholdReached || simConfig.vitalSigns.hr >= pacer.frequency)
                    ecgGraph.drawPacerPeak();
            }
    
            if (isThresholdReached && simConfig.vitalSigns.hr < pacer.frequency) {
                ecgValue = performFixedPacing();
            } else {
                ecgValue = ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
            }
        } else {
            ecgValue = ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
        }

        return ecgValue;
    });

    spo2Graph = new Graph("spo2Canvas", "rgb(230, 216, 97)", 50, 150, function () {

        // If HR is deactivated, HR changes should still be possible.
        if (!simConfig.simState.showHR) {
            // Just calculate for dynamic HR change.
            ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
        }

        return spo2Calculation.calc(simConfig.vitalSigns.hr, 
            {sys: simConfig.vitalSigns.systolic, dia: simConfig.vitalSigns.diastolic}, changeDuration);
    });
    etco2Graph = new ETCO2Graph("etco2Canvas", "rgb(27, 213, 238)", 0, 50, function () {
        return etco2Calculation.calc(simConfig.vitalSigns.rr, 
            simConfig.vitalSigns.etco2, changeDuration);

    });
	
    //...load every 1000ms all current values from databasestored in config
    setInterval(function () {
        getLesson(initControls);
    }, 1000);
	
/* 	setTimeout(function() {
		$('#hrInputDefi').val(simConfig.simState.hrDefi);
		$('#spo2InputDefi').val(simConfig.simState.spo2Defi);
		$('#etco2InputDefi').val(simConfig.simState.etco2Defi);
		$('#rrInputDefi').val(simConfig.simState.rrDefi);
		$('#sysInputDefi').val(simConfig.simState.sysDefi);
		$('#diaInputDefi').val(simConfig.simState.diaDefi);
	}, 2000); */
	

});