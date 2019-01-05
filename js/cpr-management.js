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



/* Constant: CPRType
    Contains the CPR-Types indicating the type of the curve for which the artifacts 
    are calculated. */
const CPRType = {
    ECG: 0,
    SPO2: 1,
    ETCO2: 2
};

/* Function: CPRManagement
    In this class-function, the cardiopulmonary resuscitation-artifacts are calculated based 
    on the curve-type.
    
    Parameters:
        cprAmplitude - Contains a value for the amplitude of the cpr-artifacts.
        cprPressRate - Contains the default simulated press-rate for the cpr.
        cprType - Contains the type of the cpr, indicating the curve for which the cpr is 
        calculated.
        */
var CPRManagement = function(cprAmplitude, cprPressRate, cprType) {
    // Randomized Press Rate
    var randPressRate = cprPressRate;
    // Randomized Amplitude
    var randAmplitude = cprAmplitude;
    var time = 0;

    /* Function: calcCPR
        In this function, the cardiopulmonary resuscitation-artifacts are calculated based on the 
        previously defined 
        curve-type.

        Returns:
            Returns the calculated cardiopulmonary resuscitation value.
         */
    this.calcCPR = function() {
        
        time += timestep;

        if (time > 60/randPressRate) {
            randPressRate = (Math.random()-0.5)*cprPressRate*0.2+cprPressRate;
            randAmplitude = (Math.random()-0.5)*cprAmplitude*0.4+cprAmplitude;
            time = 0;
        }

        switch(cprType) {
            case CPRType.ECG:
                return Math.abs(randAmplitude*Math.sin(
                    Math.PI*randPressRate/60*((Math.random()-0.5)*0.02+time))) - 0.4;
            case CPRType.SPO2:
                return Math.abs(randAmplitude*Math.sin(
                    Math.PI*randPressRate/60*((Math.random()-0.5)*0.02+time)));
            case CPRType.ETCO2:
                return randAmplitude*Math.sin(2*Math.PI*randPressRate/60*((
                    Math.random()-0.5)*0.02+time)) + randAmplitude*1.2;
        }
    }
}