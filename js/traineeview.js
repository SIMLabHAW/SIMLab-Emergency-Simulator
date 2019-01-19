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

/* Variable: defaultPathologyList
    This variable stores a list of Pathologies, which are predefied 
    for every new patient. */
var defaultPathologyList;

/* Variable: chargeValue
    This variable stores the currently chosen charge Value. */
var chargeValue = 150;

/* Variable: peakSoundVolume
    This variable stores the currently active ECG 
    or SpO2 Peak Volume. */
var peakSoundVolume = 0.8;

/* Variable: shouldUseScaling
    This variable defines, if the Vital-Signs-Graphs should s
    cale automatically. IS CURRENTLY NOT IN USE! */
var shouldUseScaling = false;

/* Variable: screenVisible
    This variable defines if the simulated monitor is on or off. */
var screenVisible = true;

var screenVisibilityInitialized = false;

/* Variable: isRangeSliderInitilized
    This variable is a flag that stores, if the Range Sliders 
    where already initialized. */
var isRangeSliderInitilized = false;


/* Variable: nibpOneSecondTimer
    This variable stores the one second interval Timer for the 
    decrease of the <nibpIntervalDuration>. */
var nibpOneSecondTimer;

/* Variable: nibpCountdownInterval 
    This variable stores the currently chosen NIBP-Interval. */
var nibpCountdownInterval;

/* Variable: nibpIntervalDuration
    This variable contains the duration of the NIBP-Interval. Ranging 
    from 60sec to 5*60sec. */
var nibpIntervalDuration;

/* Variable: changeDuration
    This variable contains the DataModel for the changeDuration. */
var changeDuration;

/* Variable: graphsPaused
    Indicates, if the Graphs are paused. Used for UI-states. */
var graphsPaused = false;

/* Variable: etco2Calculation
    Used to perform all calculations to simulate the etco2-curve. */
var etco2Calculation = new ETCO2Calculation();

/* Variable: ecgCalculation
    Used to perform all calculations to simulate the ecg-curve. */
var ecgCalculation = new ECGCalculation();

/* Variable: spo2Calculation
    Used to perform all calculations to simulate the spo2-curve. */
var spo2Calculation = new SPO2Calculation();

var pacerManagement = new PacerManagement();

var defiManagement = new DefiManagement();

var ecgCPR = new CPRManagement(1.4, 110, CPRType.ECG);
var spo2CPR = new CPRManagement(1, 110, CPRType.SPO2);
var etco2CPR = new CPRManagement(0.8, 110, CPRType.ETCO2);

const viewType = ViewType.Trainee;

/* Function: initControls
    Called every second and when the values in the UI-Elements change. Responsible for 
    initializing the UI and for setting the current config.
    
    Parameters: 
        newConfig - Contains the current or new config. It is set to <simConfig>. */
var initControls = function (newConfig) {
    // Only if the device-simulation is started, the digital information is shown.
	if(!screenVisible && newConfig){
        ecgGraph.clear();
        spo2Graph.clear();
        etco2Graph.clear();		
		soundManagement.stopAlarmSound();
        return;
    }
	
    const newPathology = newConfig.vitalSigns.name;

    if (oldConfig === undefined) {
        oldConfig = newConfig.vitalSigns;
        pacerManagement.updatePacerEnabledStateDB(newConfig);

        /* This is activating the AV Block or the ST Elevation. */
        ecgCalculation.hasAVBlock = (newPathology === "AV Block 3");
        ecgCalculation.hasSTElevation = (newPathology === "ST Elevation");
    }

    if (simConfig !== undefined && JSON.stringify(simConfig.vitalSigns) 
    !== JSON.stringify(newConfig.vitalSigns)) {
        /* If only a parameter of a current pathology was changed, 
        the changes to hr, spo2, etco2 and rr occur dynamically. */
        oldConfig = simConfig.vitalSigns;

        // timeSinceConfigChange is resetted when a new configuration is submitted.
        ecgCalculation.timeSinceConfigChange = 0;
        if (oldConfig.name !== newPathology) {
            // If the Name of the pathology was changed, the HR is changed instantly.
            ecgCalculation.currentHR = newConfig.vitalSigns.hr;
            ecgCalculation.hasNewMode = true;
            spo2Calculation.currentNIBP = {sys: newConfig.vitalSigns.systolic, dia: newConfig.vitalSigns.diastolic};
            etco2Calculation.setCurrentValues(newConfig.vitalSigns.rr, newConfig.vitalSigns.etco2);

            /* This is activating the AV Block or the ST Elevation. */
            ecgCalculation.hasAVBlock = (newPathology === "AV Block 3");
            ecgCalculation.hasSTElevation = (newPathology === "ST Elevation");
        }
    }

    simConfig = newConfig;
    changeDuration = newConfig.changeDuration;

    if (!defaultPathologyList) {
        getVitalSignParameters(function () {
            if (vitalSignParameters) {
                defaultPathologyList = vitalSignParameters;
            }
        });
    }

    //TODO: Combine enable and show!?

    if (simConfig.simState.enableECG) {
        if (!ecgGraph.isGraphPaused() && !ecgGraph.isGraphRunning()) {
            ecgGraph.start();
        }
    } else {
        ecgGraph.clear();
    }

    if (simConfig.simState.enableSPO2) {
        if (!spo2Graph.isGraphPaused() && !spo2Graph.isGraphRunning()) {
            spo2Graph.start();
        }
    } else {
        spo2Graph.clear();
    }

    if (simConfig.simState.enableETCO2) {
        if (!etco2Graph.isGraphPaused() && !etco2Graph.isGraphRunning()) {
            etco2Graph.start();
        }
    } else {
        etco2Graph.clear();
    }

    if (!simConfig.simState.showHR) {
        if (!simConfig.simState.showSPO2) {
            $('#hrLabel').html(simConfig.vitalSigns.hr.display = "--");
            ecgAlarm.deactivateMeasurement();
        }
    }

    if (!simConfig.simState.showSPO2) {
        $('#spo2Label').html(simConfig.vitalSigns.spo2.display = "--");
        spo2Alarm.deactivateMeasurement();
        if (!simConfig.simState.showHR) {
            $('#hrLabel').html(simConfig.vitalSigns.hr.display = "--");
            ecgAlarm.deactivateMeasurement();
        }
    }

    if (!simConfig.simState.displayETCO2) {
        $('#etco2Label').html(simConfig.vitalSigns.etco2.display = "--");
        etco2Alarm.deactivateMeasurement();
    }

    if (!simConfig.simState.displayRR) {
        $('#rrLabel').html(simConfig.vitalSigns.rr.display = "--");
        rrAlarm.deactivateMeasurement();
    }

    if (!simConfig.simState.displayNIBP) {
        $('#diaLabel').html(simConfig.vitalSigns.diastolic.display = "--");
        $('#sysLabel').html(simConfig.vitalSigns.systolic.display = "--");
        $("#madLabel").html("(--)");
        diaAlarm.deactivateMeasurement();
        sysAlarm.deactivateMeasurement();
    }

    $("#timerDiv").html(simConfig.timer);

};

/* Function: screenOnOff
    This function turns the simulated display screen on and off. 
*/
function screenOnOff() {

	if(screenVisible && screenVisibilityInitialized) {

        $("#shutdownModal").modal();

        $("#shutdownModalYes").on("click", function(){
            $("#shutdownModal").modal('hide');

             $(".powerButton").css('visibility','hidden');

            $("#powerOffImage").attr("src", "assets/img/power-off.svg");
            
            screenVisible = false;
        });
        
        $("#shutdownModalNo").on("click", function(){
            $("#shutdownModal").modal('hide');
        });
        
    } else if (screenVisible && !screenVisibilityInitialized) { 
        $(".powerButton").css('visibility','hidden');

        $("#powerOffImage").attr("src", "assets/img/power-off.svg");
        
        screenVisible = false;
        screenVisibilityInitialized = true;

    } else {

        $("#bootingLabel").text("Booting Device");
        $("#startupModal").modal();

        setTimeout(function () {
            $("#bootingLabel").text("Performing Selftest");
        }, 2500);

        setTimeout(function () {
            $("#startupModal").modal('hide');

            $(".powerButton").css('visibility','visible');

            $("#powerOffImage").attr("src", "assets/img/power-off-green.svg");

            screenVisible = true;
        }, 5000);
	}
}

function screenLoading() {

}

/* Function: initIonRangeSlider
    This function initializes the Range Slider that are shown in the Settings-Modal.
    It is called by <getAlarmLevels> and only executed once. 

*/
function initIonRangeSlider() {
    if (isRangeSliderInitilized) return;

    isRangeSliderInitilized = true;
    $("#hrSlider").ionRangeSlider({
        type: "double",
        min: 20,
        max: 140
    });
    $("#spo2Slider").ionRangeSlider({
        type: "single",
        min: 0,
        max: 100
    });
    $("#etcoSlider").ionRangeSlider({
        type: "double",
        min: 20,
        max: 60
    });
    $("#rrSlider").ionRangeSlider({
        type: "double",
        min: 4,
        max: 50
    });
    $("#sysSlider").ionRangeSlider({
        type: "double",
        min: 80,
        max: 200
    });
    
    $("#diaSlider").ionRangeSlider({
        type: "double",
        min: 20,
        max: 150
    });
}


/* Function: changeSettingTabTo
    This function is used to visually modify the Setting Tab Title Bar 
    in the Settin-Modal to identify the active Tab. 

    Parameters: 
        tabNr -  This number specifies the clicked Tab to i.e. react to 
        multiple clicks on the same Tab. 
*/
/* function changeSettingTabTo(tabNr) {
    if (tabNr === 2 && $("#navAlarmSettingTab").hasClass("active")) {
        $("#navAlarmSettingTab").removeClass("active");
        $("#navSoundSettingTab").addClass("active");
    } else if (tabNr === 1 && $("#navSoundSettingTab").hasClass("active")) {
        $("#navSoundSettingTab").removeClass("active");
        $("#navAlarmSettingTab").addClass("active");
    }
} */

/* Function: togglePauseGraphs
    This function is used to toggle the Pause-Mode for the three 
    Vital-Signs Graphs. 
*/
function togglePauseGraphs() {
    graphsPaused = !graphsPaused;

    if(graphsPaused) {
        $("#toggleGraphPauseButton").removeClass("btn-light");
        $("#toggleGraphPauseButton").addClass("btn-success");
        $("#snowflakeIcon").attr("src", "assets/img/snowflake-white.svg");
    } else {
        $("#toggleGraphPauseButton").removeClass("btn-success");
        $("#toggleGraphPauseButton").addClass("btn-light");
        $("#snowflakeIcon").attr("src", "assets/img/snowflake.svg");
    }

    ecgGraph.togglePauseGraph();
    spo2Graph.togglePauseGraph();
    etco2Graph.togglePauseGraph();
}

// TODO: Dont save Screenshots in the Folder, but in the database!

/* Function: takeScreenshot
    This function is used to take a Screenshot from the current Traineeview. 
    The screenshot is then stored in a folder on the serverside. 
    
    See also: This functionality is provided by 
    <html2canvas: https://html2canvas.hertzen.com/>
*/
function takeScreenshot() {
	 $("#screenshotCanvas").html("");
	 html2canvas(document.body).then(function(canvas) {
		$("#screenshotCanvas").append(canvas);
		var canvas = document.getElementById('screenshotCanvas').getElementsByTagName('canvas')[0];
        var canvasData = canvas.toDataURL("image/png");
        var ajax = new XMLHttpRequest();
        ajax.open("POST",'./php/saveScreenshot.php', true);
        ajax.setRequestHeader('Content-Type', 'application/upload');
        ajax.send(canvasData);
	 });
}

/* Function: formatTime
    This function turns a number into a correcly formatted h:mm:ss format.

    Parameters: 
        seconds - contains the value of the time that should be 
        formatted (in seconds).
*/
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

/* Function: getNIBP
This function will either start a one-time or repeated NIBP-Measurement. If an Interval is defined, the <nibpIntervalDuration> and <nibpCountdownInterval> are defined and the <nibpOneSecondTimer> is started. Additionally, the Icon is toggled and the Modal closed.

Parameters:
    interval - Defines the Interval for the NIBP. (Contains values from 1 to 5 if specified.) Default value is -1 which indicated that no interval is chosen and a singletime NIBP is requested.
*/
function getNIBP(interval = -1) {

    switch (interval) {
        case 1:
        case 2:
        case 5:
            if (!soundManagement.isNIBPSoundRunning) {
                nibpCountdownInterval = interval;
                nibpIntervalDuration = interval * 60;
                nibpOneSecondTimer = setInterval(nibpRepetitionTimer, 1000);
                $("#toggleRepeatNIBP").attr("src", "assets/img/pause.svg");
                $("#dropdownToggle").removeClass("btn-light");
                $("#dropdownToggle").addClass("btn-success");
                $("#dropdownToggle").attr("data-toggle", "");
                $("#dropDownModalID").hide();

                saveComment("NIBP-Measurement started (Interval: " + interval + "min).");
                soundManagement.playNIBPSound();
            }
            break;
        default:
            stopNIBPInterval();
            soundManagement.playNIBPSound();

            if (soundManagement.isNIBPSoundRunning) {
                $("#singleNIBPButton").removeClass("btn-light");
                $("#singleNIBPButton").addClass("btn-success");
            } else {
                $("#singleNIBPButton").removeClass("btn-success");
                $("#singleNIBPButton").addClass("btn-light");
            }

            saveComment("NIBP-Measurement started.");
    }

}

/* Function: nibpRepetitionTimer
    When called, this function decreases the <nibpIntervalDuration> by 1 and 
    eventually stops the <nibpOneSecondTimer> if <nibpIntervalDuration> is 0. Then, the 
    NIBP Measurement (Soundfile) is restarted again. The function also updates the Label for the NIBP-Countdown using th function <formatTime>.

    See Also: <getNIBP>
*/
function nibpRepetitionTimer() {
    nibpIntervalDuration--;

    if (nibpIntervalDuration === 0) {
        clearInterval(nibpOneSecondTimer);
        getNIBP(nibpCountdownInterval);
    } else {
        $("#nibpCountdownLabel").html(formatTime(nibpIntervalDuration));
    }

}

/* Function: stopNIBPInterval 
    When called, this function stops clears the <nibpOneSecondTimer> timer and 
    resets the corresponding UI-Elements. 
*/
function stopNIBPInterval() {
    if ($("#toggleRepeatNIBP").attr("src") === "assets/img/pause.svg") {
        clearInterval(nibpOneSecondTimer);
        $("#toggleRepeatNIBP").attr("src", "assets/img/retweet.svg");
        $("#dropdownToggle").removeClass("btn-success");
        $("#dropdownToggle").addClass("btn-light");
        $("#dropDownModalID").show();
        $("#dropdownToggle").attr("data-toggle", "dropdown");
        $("#nibpCountdownLabel").empty();
    }
}

/* Function: addNIBPHistory
    This function is used to add the latest measurement value to the NIBP History.

    Parameters:
        nibpValue - Contains most recent the NIBP Value.
*/
function addNIBPHistory(nibpValue) {

    var oldscrollHeight = $("#nibpHistoryDiv").attr("scrollHeight") - 20;
    var commentNode = document.createElement('P');
    commentNode.style.color = "white";
    var textNode = document.createTextNode(new Date().toLocaleTimeString() + ": " + nibpValue);
    commentNode.appendChild(textNode);
    var messagesNode = document.getElementById("nibpHistoryDiv");

    if (messagesNode.contains(document.getElementById("defaultHistoryLabel"))) {
        messagesNode.removeChild(messagesNode.firstElementChild);
    }

    if (messagesNode.childNodes.length > 0) {

        var firstElement = (messagesNode.firstElementChild || messagesNode.firstChild)
        messagesNode.insertBefore(commentNode, firstElement);

    } else {
        messagesNode.appendChild(commentNode);
    }
    var newscrollHeight = $("#nibpHistoryDiv").attr("scrollHeight") - 20;
    if (newscrollHeight > oldscrollHeight) {
        $("#nibpHistoryDiv").animate({
            scrollTop: newscrollHeight
        }, 'normal');
    }
}



// ********************** Alarm Management ********************** //

/* In this section, the alarm sound is activated and deactivated, depending on the current 
existing alarms. If an alarm occurs and the "MUTE-Button" is not activated, the alarm sound 
is activated repeatingly. If the "MUTE-Button" is currently active and the Mute Timer is 
running, it is important what kind of alarm occurs. If a new/different alarm occurs, 
the Sound is activated and the "MUTE-Button" and Mute Timer is resetted. When an alarm is 
muted and the Mute Button is pressed again, the sound gets activated again. */

/* Function: getAlarmLevels
    When called, the RangeSliders are initialized (in <initIonRangeSlider>) 
    and the AlarmLevels are updated for each slider. 
    This function is called as soons as the Icon for opening the Settings-Modal 
    is clicked.
*/
function getAlarmLevels() {

    initIonRangeSlider();

    $("#hrSlider").data("ionRangeSlider").update({
        from: ecgAlarm.lowerLimit,
        to: ecgAlarm.upperLimit
    });
    $("#spo2Slider").data("ionRangeSlider").update({
        from: spo2Alarm.lowerLimit
    });
    $("#etcoSlider").data("ionRangeSlider").update({
        from: etco2Alarm.lowerLimit,
        to: etco2Alarm.upperLimit
    });
    $("#rrSlider").data("ionRangeSlider").update({
        from: rrAlarm.lowerLimit,
        to: rrAlarm.upperLimit
    });
    $("#sysSlider").data("ionRangeSlider").update({
        from: sysAlarm.lowerLimit,
        to: sysAlarm.upperLimit
    });
    $("#diaSlider").data("ionRangeSlider").update({
        from: diaAlarm.lowerLimit,
        to: diaAlarm.upperLimit
    });
}

/* Function: setAlarmLevels

    This function is used to save the chosen Alarm-Values in the Datamodel. It is called as
    soon as the "check" Button on the Settings-Modal is pressed. 
*/
function setAlarmLevels() {
    ecgAlarm.lowerLimit = $("#hrSlider").data().from;
    ecgAlarm.upperLimit = $("#hrSlider").data().to;

    spo2Alarm.lowerLimit = $("#spo2Slider").data().from;

    etco2Alarm.lowerLimit = $("#etcoSlider").data().from;
    etco2Alarm.upperLimit = $("#etcoSlider").data().to;

    rrAlarm.lowerLimit = $("#rrSlider").data().from;
    rrAlarm.upperLimit = $("#rrSlider").data().to;

    sysAlarm.lowerLimit = $("#sysSlider").data().from;
    sysAlarm.upperLimit = $("#sysSlider").data().to;

    diaAlarm.lowerLimit = $("#diaSlider").data().from;
    diaAlarm.upperLimit = $("#diaSlider").data().to;
}

var ecgAlarm = new ECGAlarm(function (state) {
    createAlarmSound("ecgAlarm", state);
});

var spo2Alarm = new SPO2Alarm(function (state) {
    createAlarmSound("spo2Alarm", state);
});

var etco2Alarm = new ETCO2Alarm(function (state) {
    createAlarmSound("etco2Alarm", state);
});

var rrAlarm = new RRAlarm(function (state) {
    createAlarmSound("rrAlarm", state);
});

var sysAlarm = new SYSAlarm(function (state) {
    createAlarmSound("sysAlarm", state);
});

var diaAlarm = new DIAAlarm(function (state) {
    createAlarmSound("diaAlarm", state);
});

/* Variable: knownAlarms
    Saves the currently known Alarms. */
var knownAlarms = [];

/* Variable: alarmMuteDuration
    Stores the duration of the alarm mute time. Needs to be mutatable */
var alarmMuteDuration = 120;

/* Variable: alarmMuteInterval
    Stores the timer of the alarm mute during runtime. */
var alarmMuteInterval;

/* Function: toggleAlarmSound
    Toggles the Alarm Sound. If alarms are active and sound is playing, the sound is muted. 
    If sounds are muted, button is clicked and alarms are active, the sound is unmuted. */
function toggleAlarmSound() {
    var currentAlarmCount = 0;
    if (Object.keys(knownAlarms).length > 0) {
        for (var aType in knownAlarms) {
            if (knownAlarms[aType] === AlarmState.AboveLimit ||
                knownAlarms[aType] === AlarmState.BelowLimit) {
                currentAlarmCount++;
                break;
            }
        }
    }

    if (currentAlarmCount > 0) soundManagement.toggleAlarmSound();

    toggleAlarmSoundIcon();
}


function alarmMuteTimer() {
    alarmMuteDuration--;
    if (alarmMuteDuration === 0) {
        toggleAlarmSound();
    } else {
        $("#alarmMuteTimer").html(formatTime(alarmMuteDuration));
    }
}

function toggleAlarmSoundIcon(changeToOn = false) {
    if ($("#toggleAlarmSoundIcon").attr("src") === "assets/img/bell.svg") {
        $("#toggleAlarmSoundIcon").attr("src", "assets/img/bell-slash.svg");
        $("#alarmMuteButton").removeClass("btn-success");
        $("#alarmMuteButton").addClass("btn-light");
        
        $("#alarmMuteTimer").empty();
        clearInterval(alarmMuteInterval);
        alarmMuteDuration = 120;
    } else if (!changeToOn) {
        $("#toggleAlarmSoundIcon").attr("src", "assets/img/bell.svg");
        $("#alarmMuteButton").removeClass("btn-light");
        $("#alarmMuteButton").addClass("btn-success");
        $("#alarmMuteTimer").html("2:00");
        alarmMuteInterval = setInterval(alarmMuteTimer, 1000);
    }
}


function createAlarmSound(alarmType, state) {
    var needsAlarmValitidyCheck = false;
    var currentAlarmCount = -1;

    /* In This Condition, the currently changing alarmType is analyzed. If the Alarm was not 
        active already (not part of knownAlarms), it is saved together with its alarmstate
        in knownAlarms. When the alarmType was however already saved in knownAlarms, it's state 
        is updated. In both cases, the sound will restart to play, as a NEW or updated alarm 
        was generated. */
    if (!(alarmType in knownAlarms)) {
        // For Initialization:
        knownAlarms[alarmType] = state;
        switch (state) {
            // Fallthrough is intended!
            case AlarmState.AboveLimit:
            case AlarmState.BelowLimit:
                if (soundManagement.isRepeatedAlarmSoundRunning()) 
                    soundManagement.playNewAlarmSound();

                soundManagement.playAlarmSoundRepeatedly();
                toggleAlarmSoundIcon(true);
                break;
            case AlarmState.None:
                break;
        }
    } else if (knownAlarms[alarmType] !== state) {
        knownAlarms[alarmType] = state;
        switch (state) {
            // Fallthrough is intended!
            case AlarmState.AboveLimit:
            case AlarmState.BelowLimit:
                if (soundManagement.isRepeatedAlarmSoundRunning()) 
                    soundManagement.playNewAlarmSound();

                soundManagement.playAlarmSoundRepeatedly();
                toggleAlarmSoundIcon(true);
                break;
            case AlarmState.None:
                needsAlarmValitidyCheck = true;
                break;
        }
    }

    /* If an AlarmState changed to None, it must be checked, whether there are more alarms active.
        In case none of the alarms are active anymore, the sound is stopped. */
    if (needsAlarmValitidyCheck) {
        /* The knownAlarms List must be checked if some alarms are still valid, 
            so the sound keeps on playing */
        currentAlarmCount = 0;
        for (var aType in knownAlarms) {
            if (knownAlarms[aType] === AlarmState.AboveLimit ||
                knownAlarms[aType] === AlarmState.BelowLimit) {
                currentAlarmCount++;
                break;
            }
        }
    }

    if (currentAlarmCount === 0) soundManagement.stopAlarmSound();
}

// *******************  END ALARM MANAGEMENT ********************** //

var soundManagement = new SoundManagement(function (soundState) {
    switch (soundState) {
        case SoundState.NIBP:

            $("#singleNIBPButton").removeClass("btn-success");
            $("#singleNIBPButton").addClass("btn-light");

            if (simConfig.simState.displayNIBP) {
                var sysVal = simConfig.vitalSigns.systolic;
                var diaVal = simConfig.vitalSigns.diastolic;
                $('#sysLabel').html(sysVal);
                $('#diaLabel').html(diaVal);
				
				addNIBPHistory(sysVal+'/'+diaVal+" (" + Math.round(diaVal + 1 / 2 * (sysVal - diaVal)) + ")");
                // MAD = diastolic pressure + 1/2 * (systolic pressure - diastolic pressure)
                $("#madLabel").html("(" + Math.round(diaVal + 1 / 2 * (sysVal - diaVal)) + ")");

                sysAlarm.testMeasurementValueForAlarm(sysVal);
                diaAlarm.testMeasurementValueForAlarm(diaVal);
            }
            break;
        case SoundState.DEFI_LOAD:
            defiManagement.defiFullyCharged();
            break;
    }
});

var ecgMeasurement = new ECGMeasurement(function (hrValue) {
    if (!simConfig.simState.showHR) return;

    $("#hrCaptionLabel").html("HR<br> bpm");

    $('#hrLabel').html((hrValue===0) ? "--" : hrValue);
    ecgAlarm.testMeasurementValueForAlarm(hrValue);

    if (ecgMeasurement.isOverMaxIdleTime()) {
        defiManagement.deactivateDefiSync();
    }

}, function() {
    // Peak Found -> Play Sound!
    if (spo2Measurement.isOverMaxIdleTime() || (Math.abs(spo2Measurement.globalIdleTimeCounter - ecgMeasurement.globalIdleTimeCounter) >= spo2Measurement.maxIdleTime)) {
        soundManagement.playRPeakNoise();
    }

    if (defiManagement.isShowingECGPeaks()) {
        ecgGraph.drawECGPeak();
        if (defiManagement.shockPending()) {
            defiManagement.performSyncShock();
        }
    }

});

var spo2Measurement = new SpO2Measurement(function (spo2Value) {
    if (!simConfig.simState.showSPO2) return;

    if (!simConfig.simState.showHR) {
        $("#hrCaptionLabel").html("HR<br> bpm (Pleth)");
        const avgHR = spo2Measurement.getAvgHRFromSPO2();
        $("#hrLabel").html((avgHR === 0) ? "--" : avgHR);
        ecgAlarm.testMeasurementValueForAlarm(avgHR);
    }

    $('#spo2Label').html((spo2Value===0) ? "--" : spo2Value);
    spo2Alarm.testMeasurementValueForAlarm(spo2Value);
}, function () {
    // Real Time SpO2 Peak callback
    soundManagement.playSpO2PeakNoise(spo2Measurement.getAvgMax());
    ecgMeasurement.globalIdleTimeCounter = spo2Measurement.globalIdleTimeCounter;

});

var etco2Measurement = new ETCO2Measurement(function (etco2Value, rfValue) {
    if (simConfig.simState.displayETCO2) {
        $('#etco2Label').html((etco2Value===0) ? "--" : etco2Value);
        etco2Alarm.testMeasurementValueForAlarm(etco2Value);
    }

    if (simConfig.simState.displayRR) {
        $('#rrLabel').html((rfValue===0) ? "--" : rfValue);
        rrAlarm.testMeasurementValueForAlarm(rfValue);
    }
});

var ecgGraph = new ECGGraph(function () {
    var ecgValue;

    if (pacerManagement.isEnabled) {
        pacerManagement.pacedDeltaX += timestep;
        if (pacerManagement.pacedDeltaX >= 60/pacerManagement.getFrequency()) {
            pacerManagement.pacedDeltaX = 0;
            if (!pacerManagement.isThresholdReached() 
            || simConfig.vitalSigns.hr >= pacerManagement.getFrequency())
                ecgGraph.drawPacerPeak();
        }

        if (pacerManagement.isThresholdReached()
        && simConfig.vitalSigns.hr < pacerManagement.getFrequency()) {
            ecgValue = pacerManagement.performFixedPacing();
        } else {
            ecgValue = ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
        }
    } else {
        ecgValue = ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
    }

    ecgMeasurement.addECGValue(ecgValue);
    return ecgValue;
});

var spo2Graph = new Graph("spo2Canvas", "yellow", 50, 150, function () {
    // If HR is deactivated, HR changes should still be possible.
    if (!simConfig.simState.showHR) {
        // Just calculate for dynamic HR change.
        ecgCalculation.calc(simConfig.vitalSigns, changeDuration);
    }
    var spo2Value;
    
    if(pacerManagement.isEnabled && pacerManagement.isThresholdReached()
    && simConfig.vitalSigns.hr < pacerManagement.getFrequency()) {
        spo2Value = pacerManagement.getAccordingSPO2();
    } else {
        spo2Value = spo2Calculation.calc(simConfig.vitalSigns.hr,
            {sys: simConfig.vitalSigns.systolic, dia: simConfig.vitalSigns.diastolic}, changeDuration);
    }

    spo2Measurement.addSpO2Value(spo2Value, {sys: simConfig.vitalSigns.systolic, dia: simConfig.vitalSigns.diastolic});
    return spo2Value;
});


var etco2Graph = new ETCO2Graph("etco2Canvas", "rgb(27, 213, 238)", 0, 50, function () {
    var etco2Value = etco2Calculation.calc(simConfig.vitalSigns.rr, simConfig.vitalSigns.etco2, changeDuration);

    etco2Measurement.addETCO2Value(etco2Value);
    return etco2Value;
});

//when everything is loaded....
$(document).ready(function () {
    screenOnOff();
    //...load every 1000ms all current values from database-->stored in config
    setInterval(function () {
        getLesson(initControls);
    }, 1000);
});