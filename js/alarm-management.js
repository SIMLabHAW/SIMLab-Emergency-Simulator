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



/* Constant: AlarmState
   Contains the state of the alarm, none, below or above limits.
*/
const AlarmState = {
  None: 0,
  BelowLimit: 1,
  AboveLimit: 2
};

/* Function: AlarmManagement
    This function is used to test the measurement values and 
    to return the <AlarmState> in form of a callback function.
    NOTE: Dont instanciate this function directly. Instead use the 
    inhereted functions.

    Parameters:
    alarmCallback - Callback function that returns the <AlarmState>.
    lowerLimit - Contains a predefined lower alarm level.
    upperLimit - Contains a predefined upper alarm level.
 */
function AlarmManagement(alarmCallback, lowerLimit, upperLimit, borderID) {
    this.upperLimit = upperLimit;
    this.lowerLimit = lowerLimit;
    
    this.currentAlarmState = AlarmState.None;
    
    /* Function: testMeasurementValueForAlarm 
        This function checks the parameter value for its limits and 
        invokes the callback with the current <AlarmState>. 
    
        Parameters:
        value - This parameter is the currently tested value.
    */
    this.testMeasurementValueForAlarm = function(value) {
        if (value > this.upperLimit) {
            if (this.currentAlarmState !== AlarmState.AboveLimit) {
                this.currentAlarmState = AlarmState.AboveLimit;
                performUIAdaption(AlarmState.AboveLimit);
            }
        } else if (value < this.lowerLimit) {
            if (this.currentAlarmState !== AlarmState.BelowLimit) {
                this.currentAlarmState = AlarmState.BelowLimit;
                performUIAdaption(AlarmState.BelowLimit);
            }
        } else {
            if (this.currentAlarmState !== AlarmState.None) {
                this.currentAlarmState = AlarmState.None;
                performUIAdaption(AlarmState.None);
            }
        }
    }

    /* Function: performUIAdaption
        Performs the UI changes to visually indicate alarms.
        
        Parameters: 
            state - Contains the <AlarmState>.*/
    function performUIAdaption(state) {
        switch(state) {
            case AlarmState.None:
                if($(borderID).hasClass("alarm-border"))
                    $(borderID).removeClass("alarm-border");
                break;
            case AlarmState.AboveLimit:
            case AlarmState.BelowLimit:
                if(!$(borderID).hasClass("alarm-border"))
                    $(borderID).addClass("alarm-border");
                break;
        }
        alarmCallback(state);
    }
};


/* Function: ECGAlarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function ECGAlarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 50, 120, "#ecgBorderDiv");
};

/* Function: SPO2Alarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function SPO2Alarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 90, 101, "#spo2BorderDiv");
};

/* Function: ETCO2Alarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function ETCO2Alarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 30, 50, "#etco2BorderDiv");
};

/* Function: RRAlarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function RRAlarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 4, 25, "#rrBorderDiv");
};

/* Function: SYSAlarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function SYSAlarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 100, 160, "#nibpBorderDiv");
};

/* Function: DIAAlarm 
    This inherited function provides corresponding default lower and upper bounds for the alarm.

    See also: <AlarmManagement>.
*/
function DIAAlarm(alarmCallback) {
    AlarmManagement.call(this, alarmCallback, 40, 100, "#nibpBorderDiv");
};