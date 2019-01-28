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

/* Function: SPO2Calculation
    Performs all necessary calculations for the SPO2. Get some background-information about the
    waveforms from here <Normal arterial line waveforms: https://derangedphysiology.com/main/cicm-primary-exam/required-reading/cardiovascular-system/Chapter%207.6.0/normal-arterial-line-waveforms>  */
var SPO2Calculation = function() {

    /* Variable: self
        Used to be able to adress the <currentNIBP> property from within other functions 
        in <SPO2Calculation>. */
    var self = this;

    /* Variable: currentNIBP
        Contains the current systolic and diastolic-values. */
    this.currentNIBP = {sys: undefined, dia: undefined};

    /* Variable: currentTime 
        Contains the currentTime of the nibp-simulation. */
    var currentTime = 0;

    /* Variable: timeSinceNIBPChange 
        Contains the time since last <currentNIBP> change to calculate the value dynamically. */
    var timeSinceNIBPChange = {sys: 0, dia: 0};

    /* Variable: oldNIBP
        Contains the old systolic and diastolic nibp, which is used in the dynamic 
        changing process. */
    var oldNIBP;

    /* Variable: timeSinceIntermediateNIBPChange
        Contains the time since the last intermediate nibp change. Is used to perform changes 
        to the <currentNIBP> only at the end of the current period. */
    var timeSinceIntermediateNIBPChange = {sys: 0, dia: 0};

    /* Variable: latestReachedNIBP
        Contains the old "currentNIBP" after a config change. It is used to react to changes 
        to the <currentNIBP> while an old change is still in process. */
    var latestReachedNIBP = {sys: undefined, dia: undefined};

    /* Variable: lastDeltaX
        When the ecgCalculation gets deactivated, the ecgCalculation.simTime is not counted up 
        anymore. Therefore, the old simTime Value gets saved in each step to adress this problem. 
    */
    var lastDeltaX;

    /* Variable: hfIdleCount
        Is used to count up the time without ecg. If the time is higher then <maxHFIdleCount>,
        The spo2 curve is simulated on its own. */
    var hfIdleCount;

    /* Constant: maxHFIdleCount
        Contains the max amount of steps that are tolerable for an ecg signal to be missing.
        4 steps equal to 4*0.02 seconds */
    const maxHFIdleCount = 4;

    /* Function: errorFunction
        This function is used to build up the shape of the spo2-curve. It is used twice in 
        the process for the first and the second peak. Even if the function is called 
        errorFunction, it is solemnly used to *simulate the correct shape* of the spo2-curve.

        Parameters: 
            x - Used to calcuate the "error" for.

        See also: 
            This implementation is based on an article: 
            <Stand-alone error function errorFunction(x): https://www.johndcook.com/blog/2009/01/19/stand-alone-error-function-erf/>
            using the <Mathematical Simulation: https://www.desmos.com/calculator/t1v4bdpske> 
            of the error-Function. Theory: <Wikipedia: https://en.wikipedia.org/wiki/Error_function#Approximation_with_elementary_functions> 
        */
    function errorFunction(x) {
        // For theoretical description, see above given links.
        var sign = Math.sign(x);
        x = Math.abs(x);

        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var p = 0.3275911;

        var t = 1.0 / (1.0 + p * x);
        var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
    }

    /* Function: getCurrentSysValue
        This function is used to calculated the current nibp sys-value. It was needed to 
        have and dynamic change for the maximal nibp sys-value after a change.
        
        Parameters:
            newSys - Contains the new sys-maximum value.
            period - Contains the period of the sys-curve. This value is based on the hr.
            nibpChangeDuration - Contains an object which contains an boolean, indicating if 
            the duration for an adaption is automatically chosen and an value, if a manual 
            duration is chosen.

        Returns:
            The calculated current sys-max.

        See also: 
            This function uses an implementation of the <Logistic Function: https://en.wikipedia.org/wiki/Logistic_function> to perform the dynamic changes.
        */
    function getCurrentSysValue(newSys, period, nibpChangeDuration) {
        
        var tempSys;

        if (timeSinceNIBPChange.sys === 0 && self.currentNIBP.sys !== undefined) {
            // Aha, change was performed:
            latestReachedNIBP.sys = self.currentNIBP.sys;
        }

        timeSinceNIBPChange.sys += timestep;
        
        if (latestReachedNIBP.sys) {
            tempSys = latestReachedNIBP.sys;
        } else if (!isNaN(self.currentNIBP.sys) && self.currentNIBP.sys !== 0) {
            tempSys = self.currentNIBP.sys;
        } else {
            tempSys = newSys;
        }
        
        var L = newSys - tempSys;
        
        /* t0 of the logistic function defines the duration to reach 
        the mid point, with the steepest slope. */
        var t0 = nibpChangeDuration.isAuto ? (Math.abs(L)/2) : (nibpChangeDuration.value / 2);
        /* k is the steepness of the curve. The adaptibility through the dependency on t0 is 
        chosen to make k more adaptable to different speeds and heights of changes.*/
        var k = 5/t0;
        var t = timeSinceNIBPChange.sys;
        
        /* Based on the characteristic of the logistic function, the end-value (max OR min) 
        is approximately reached at 2*t0. */
        if (timeSinceNIBPChange.sys > 2*t0 || newSys == tempSys) {
            timeSinceIntermediateNIBPChange.sys = 0;
            return newSys;
        }
        
        timeSinceIntermediateNIBPChange.sys += timestep;
        
        if (timeSinceIntermediateNIBPChange.sys > period) {
            timeSinceIntermediateNIBPChange.sys = 0;
            // With the logistic function, the current hr is calculated.
            self.currentNIBP.sys = Math.round(tempSys + L/(1+(Math.exp(-k*(t-t0)))));
        }
        
        return self.currentNIBP.sys;
    }

    /* Function: getCurrentDiaValue
        This function is used to calculated the current nibp dia-value. It was needed to 
        have and dynamic change for the maximal nibp dia-value after a change.
        
        Parameters:
            newDia - Contains the new dia-maximum value.
            period - Contains the period of the dia-curve. This value is based on the hr.
            nibpChangeDuration - Contains an object which contains an boolean, indicating if 
            the duration for an adaption is automatically chosen and an value, if a manual 
            duration is chosen.

        Returns:
            The calculated current dia-max.
        */
    function getCurrentDiaValue(newDia, period, nibpChangeDuration) {
        
        var tempDia;

        if (timeSinceNIBPChange.dia === 0 && self.currentNIBP.dia !== undefined) {
            // Aha, change was performed:
            latestReachedNIBP.dia = self.currentNIBP.dia;
        }

        timeSinceNIBPChange.dia += timestep;
        
        if (latestReachedNIBP.dia) {
            tempDia = latestReachedNIBP.dia;
        } else if (!isNaN(self.currentNIBP.dia) && self.currentNIBP.dia !== 0) {
            tempDia = self.currentNIBP.dia;
        } else {
            tempDia = newDia;
        }
        
        var L = newDia - tempDia;
        
        /* t0 of the logistic function defines the duration to reach 
        the mid point, with the steepest slope. */
        var t0 = nibpChangeDuration.isAuto ? (Math.abs(L)/2) : (nibpChangeDuration.value / 2);
        /* k is the steepness of the curve. The adaptibility through the dependency on t0 is 
        chosen to make k more adaptable to different speeds and heights of changes.*/
        var k = 5/t0;
        var t = timeSinceNIBPChange.dia;
        
        /* Based on the characteristic of the logistic function, the end-value (max OR min) 
        is approximately reached at 2*t0. */
        if (timeSinceNIBPChange.dia > 2*t0 || newDia == tempDia) {
            timeSinceIntermediateNIBPChange.dia = 0;
            return newDia;
        }
        
        timeSinceIntermediateNIBPChange.dia += timestep;
        
        if (timeSinceIntermediateNIBPChange.dia > period) {
            timeSinceIntermediateNIBPChange.dia = 0;
            // With the logistic function, the current hr is calculated.
            self.currentNIBP.dia = Math.round(tempDia + L/(1+(Math.exp(-k*(t-t0)))));
        }
        
        return self.currentNIBP.dia;
    }

    /* Function: calcFullSpo2
        This function calculates the full spo2-curve-value for the given point in time.
        "full" in this case means, that it calculates the second "spo2-curve-peak" 
        and adds it to the first. 
        
        Parameters: 
            firstY - Contains the first calculated spo2-curve value.
            currentNIBP - Contains the current spo2-max.
            t0 - Contains the t0-parameter from the first spo2-curve-peak.
            sigma - Contains the sigma-parameter from the first spo2-curve-peak.
            M - Contains the M-constant for normalization
            t - Contains the value for which the spo2-curve is calculated.

        Returns:
            The calculated f(t).
        */
    function calcFullSpo2(firstY, currentNIBP, t0, sigma, M, t) {
        
        var val = (currentNIBP.normSys-currentNIBP.normDia)/1.6;
        var alpha = 1;
        var t0 = t0 + 5.5 * t0;
        var sigma = sigma/1.5;
        
        var y = firstY + val / M * Math.exp(-Math.pow(t - t0, 2) / 
                (2 * Math.pow(sigma, 2))) * (1 + errorFunction(alpha * (t - t0) / 
                (Math.sqrt(2) * sigma)));
        
        return y;
    }
    
    /* Function: calc
        This function is used to calculate the current f(t)
    
        Parameters:
        hr - Contains the current heart-rate.
        newNIBP - Contains the systolic and diastolic bloodpressure max-values.
        nibpChangeDuration - Contains an object which contains an boolean, indicating if 
            the duration for an adaption is automatically chosen and an value, if a manual 
            duration is chosen.
        */
    this.calc = function(hr, newNIBP, nibpChangeDuration, isPacerUsed = false) {

        // sigma, alpha and t0 are parameters of the skew normal distribution
        var alpha = 5;
        var tempHR;
        if (isPacerUsed) {
            tempHR = hr;
        } else {
            tempHR = ((ecgCalculation.currentRandHR!==0) ? ecgCalculation.currentRandHR :  hr)
        }
        
        if (tempHR === 0) {
            if (simConfig.simState.hasCPR) return 50 + spo2CPR.calcCPR();
            return 50;
        }
        
        var period = 60 / tempHR;

        /* This is used to draw the curve of low-bpm wave in the same timeframe as a 60bpm wave. 
        After the waveform, it is zero, until the next wave starts. */
        if (tempHR < 60) {
            tempHR = 60;
        }

        var t0 = 5 / tempHR;
        var sigma = 15 / tempHR;      
        
        /* The normalization factor M is dependent on the simulation of  the spo2-curve. 
        If the parameters t0 or alpha are changed, the M value needs to be adapted. 
        It garantees, that the configured value is reached. Therefore, M must be 
        recalculated if t0 or alpha are changed! */
        var M = 1.80835783; 

        var t = currentTime;
        
        if (oldNIBP == undefined) oldNIBP = JSON.parse(JSON.stringify(newNIBP));
        if (parseInt(oldNIBP.sys) !== parseInt(newNIBP.sys)) {
            // Aha, the systolic pressure was changed.
            oldNIBP.sys = newNIBP.sys;
            timeSinceNIBPChange.sys = 0;
        }

        if (parseInt(oldNIBP.dia) !== parseInt(newNIBP.dia)) {
            // Aha, the systolic pressure was changed.
            oldNIBP.dia = newNIBP.dia;
            timeSinceNIBPChange.dia = 0;
        }

        self.currentNIBP.sys = getCurrentSysValue(newNIBP.sys, period, nibpChangeDuration);
        self.currentNIBP.dia = getCurrentDiaValue(newNIBP.dia, period, nibpChangeDuration);

        const lowerBounds = 70;
        const upperBounds = 120;
        
        const normSys = lowerBounds + (upperBounds - lowerBounds)/(1+Math.exp(-(5/15) *
            (self.currentNIBP.sys-85)));

        const normDia = lowerBounds + (upperBounds - lowerBounds)/(1+Math.exp(-(5/15) *
        (self.currentNIBP.dia-85)));

        var y = normDia + (normSys - normDia) / M * Math.exp(-Math.pow(t - t0, 2) /
                (2 * Math.pow(sigma, 2))) * (1 + errorFunction(alpha * (t - t0) /
                (Math.sqrt(2) * sigma)));
        
        y = calcFullSpo2(y, {normSys, normDia}, t0, sigma, M, t);

        currentTime += timestep;
        
        var simTime = ecgCalculation.hasAVBlock ? ecgCalculation.avBlockCounter : ecgCalculation.simTime;
        /* This check is used to find out, if the ecg is not visible anymore but the spo2 is 
        still actively measured. */
        if (Math.abs(lastDeltaX-simTime) < timestep) {
            hfIdleCount++;
        } else {
            hfIdleCount = 0;
        }
        
        /* A problem occurred, when the variable ecgCalculation.simTime was used directly. 
        Often, multiple steps where skipped (i.e. going from 0.02 to 0.06 directly) and the 
        curve therefore became blocky. This probably origins from different execution times 
        of the methods or some prioritization when using the asynchronous callback functions.
        
        HOWEVER: As a synchronization of the SpO2 and ECG is mandatory and the simTime value 
        couldn't be trusted for each t-value, a separat counter variable "currentTime" is used 
        aditionally. This variable is however resetted as soon as simTime reaches 0. */
        if (currentTime >= period && hfIdleCount < maxHFIdleCount) {
            currentTime -= timestep;
        }

        /* This condition is used to check if the currentTime needs to be synchronized with 
        ecgCalculation.simTime. */
        if (lastDeltaX-simTime > 0 && currentTime > 0 
        && hfIdleCount < maxHFIdleCount) {
            currentTime = simTime;
        }
        
        if ((lastDeltaX-simTime > 0 && hfIdleCount < maxHFIdleCount) 
        || (currentTime >= period && hfIdleCount >= maxHFIdleCount)) {
            currentTime = 0;
        }

        lastDeltaX = simTime;


        if (simConfig.simState.hasCPR) {
            y += spo2CPR.calcCPR();
        }
        
        return y;
    }

}