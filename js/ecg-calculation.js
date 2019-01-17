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

/* About: ECG Algorithm
    This file uses a <MATLAB Implementation: https://de.mathworks.com/matlabcentral/fileexchange/10858-ecg-simulation-using-matlab> 
    of a real time ECG-Calculation, by <Karthik Raviprakash: https://de.mathworks.com/matlabcentral/profile/authors/452217-karthik-raviprakash>. 
    Some of the calculations performed in this document are based on the 
    Principle of Fourier Series as descriped in the documentation of his work 
    (can be found in the decompressed download file). The licence file for his code can be 
    found in the ./thirdpartylicences directory. All functions, which use parts of his code 
    are marked as such in the documentation of the function.
*/

/* Constant: timestep
    Stepsize for one simulation. */
const timestep = 0.02;

/* Function: ECGCalculation
    Performs all necessary calculations for the ECG. */
var ECGCalculation = function() {

    /* Variable: simTime 
        Contains the current simulation time (ranging from 0 to 60/currentHR). */
    this.simTime = 0;

    /* Variable: timeSinceConfigChange
        Stores the time since last config change. */
    this.timeSinceConfigChange = 0;

    /* Variable: currentHR
        Contains the current calculated heart-rate. */
    this.currentHR = 0;

    this.currentRandHR;

    /* Variable hasAVBlock: 
       Indicates if an AV Block is simulated. */
    this.hasAVBlock = false;

    /* Variable hasSTElevation: 
       Indicates if an STElevation is simulated. */
    this.hasSTElevation = false;

    /* Variable: self
        Necessary to talk to the correct "this". Inner Functions provide their own "this". */
    var self = this;

    /* Variable: timeSinceIntermediateHFChange
        This duration is saved to keep track when to change the currentHR to another value. 
        This is important to make changes always synchronized at the same time. */
    var timeSinceIntermediateHFChange = 0;

    /* Variable: latestReachedHR
        Stores the latest reached heart-rate to be used for a dynamic change beginning at a 
        time, where the new value is not yet reached. */
    var latestReachedHR;

    /* Variable: expectsPacerPeak
        Indicates, if a pacer peak is expected. This flag is resetted once per period. */
    var expectsPacerPeak = false;


    /* Variable: avBlockCounter
        This is used for an alternative counter value used for the AV Block. */
    this.avBlockCounter = 0;

    /* Variable: isOffsetCalculation
        Stores, if the Offset calculation is currently in progress. Used for calculating 
        the P-Wave in the AV-Block. */
    var isOffsetCalculation = false;

    /* Variable: baselineValue
        Used to store the intermediate baseline value to draw low bpm pqrstu-complexes and a 
        corresponding baseline on the correct height. This is necessary, because the baseline is 
        dependent on the bpm of the ecg. The value is therefore not constant. */
    var baselineValue = 0.65;

    /* Variable: isNewMode
        This value is used locally as a flag to see if a new mode was started. It is used to 
        calculate the correct "offset-ecg" for the first value after a mode-change.  */
    var isNewMode = false;

    /* Variable: hasNewMode
        This value is stored as an open property to be accessed and primarily set from outside.
        Is workes in combination with <isNewMode>. Because it is possible to set this value, while a calculation is still ongoing, a double semaphore is used.  */
    this.hasNewMode = false;

    /* Function: calculatePWave
        Used to calculate the pWaveValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current pWaveValue.
    */
    function calculatePWave(simTime, pWaveAmplitude, pWaveDuration, pWaveStartTime, hr, 
        pWaveFactor) {

        if (hr===0) return 0;

        const n = 100;
        var period = 30 / hr,
            x = simTime + pWaveStartTime,
            b = (2 * period) / pWaveDuration,
            p1 = 1 / period,
            p2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            const harm1 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + 
                    (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))) * (2 / Math.PI)
                    ) * Math.cos((i * Math.PI * x) / period);
            p2 = p2 + harm1;
        }

        var pWaveValue = pWaveAmplitude * (p1 + p2);

        return pWaveValue * pWaveFactor;
    }
    
    /* Function: calculateQWave
        Used to calculate the qWaveValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current qWaveValue.
    */
    function calculateQWave(simTime, qWaveAmplitude, qWaveDuration, qWaveStartTime, hr, 
        qWaveFactor) {
        const n = 100;
        var period = 30 / hr,
            a = qWaveAmplitude,
            x = simTime + qWaveStartTime,
            b = (2 * period) / qWaveDuration,
            q1 = (a / (2 * b)) * (2 - b),
            q2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            const harm5 = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / period);
            q2 = q2 + harm5;
        }

        var qWaveValue = (-1) * (q1 + q2);

        return (qWaveValue * qWaveFactor);
    }

    /* Function: calculateQRSWave
        Used to calculate the qrsComplexValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current qrsComplexValue.
    */        
    function calculateQRSWave(simTime, qrsComplexAmplitude, qrsComplexDuration, hr, qrsComplexFactor, 
        qrsAmplitudeOffset) {
        const n = 100;
        var period = 30 / hr,
            a = qrsComplexAmplitude,
            x = simTime,
            b = (2 * period) / qrsComplexDuration,
            qrs1 = (a / (2 * b)) * (2 - b),
            qrs2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            var harm = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / period);
            qrs2 = qrs2 + harm;
            
        }

        var qrsComplexValue =  ((qrs1 + qrs2) * qrsComplexFactor) + qrsAmplitudeOffset;
            
        return qrsComplexValue;
    }

    /* var sArray = [];
    function getMeanOf(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }; */

    /* Function: calculateSWave
        Used to calculate the sWaveValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current sWaveValue.
    */ 
    function calculateSWave(simTime, sWaveAmplitude, sWaveDuration, sWaveStartTime, hr, 
        sWaveFactor) {
        const n = 100;
        var period = 30 / hr,
            x = simTime - sWaveStartTime,
            a = sWaveAmplitude,
            b = (2 * period) / sWaveDuration,
            s1 = (a / (2 * b)) * (2 - b),
            s2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            var harm3 = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / period);
            s2 = s2 + harm3;
        }

        var sWaveValue = ((-1) * (s1 + s2)) * sWaveFactor;


        if (self.hasSTElevation && !isOffsetCalculation) {

            if (simTime >= sWaveStartTime && simTime <= sWaveStartTime + sWaveDuration) {
                sWaveValue=0.5;
            }
        } 

        return sWaveValue;
    }
    
    /* Function: calculateTWave
        Used to calculate the tWaveValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current tWaveValue.
    */ 
    function calculateTWave(simTime, tWaveAmplitude, tWaveDuration, tWaveStartTime, 
        tsWaveSeparationDuration, hr, tWaveFactor) {
        const n = 100;
        var period = 30 / hr,
            a = tWaveAmplitude,
            x = simTime - tWaveStartTime - tsWaveSeparationDuration,
            b = (2 * period) / tWaveDuration,
            t1 = 1 / period,
            t2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            var harm2 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + 
                    (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))
                    ) * (2 / Math.PI)) * Math.cos((i * Math.PI * x) / period);
            t2 = t2 + harm2;
        }

        var tWaveValue = (a * (t1 + t2)) * tWaveFactor;

        if (self.hasSTElevation && !isOffsetCalculation) {

            if (simTime >= tWaveStartTime - tsWaveSeparationDuration*2  && simTime <= tWaveStartTime + tWaveDuration) {
                // Iterative value tuning:
                tWaveValue += 0.25 - (simTime - tWaveStartTime - tsWaveSeparationDuration)/(tWaveStartTime + tsWaveSeparationDuration*7 + tWaveDuration);
            }
        } 


        return tWaveValue;
    }

    /* Function: calculateUWave
        Used to calculate the uWaveValue for the current ECG value. 
        
        - Copyright (c) 2006, karthik raviprakash All rights reserved.
        - Modified by Christian Bauer, Serena Glass.

        Returns:
            Current uWaveValue.
    */
    function calculateUWave(simTime, uWaveAmplitude, uWaveDuration, uWaveStartTime, hr, 
        uWaveFactor) {
        const n = 100;
        var period = 30 / hr,
            a = uWaveAmplitude,
            x = simTime - uWaveStartTime,
            b = (2 * period) / uWaveDuration,
            u1 = 1 / period,
            u2 = 0;

        for (var i = 1; i < n + 1; i += 1) {
            var harm4 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))) * (2 / Math.PI)) * Math.cos((i * Math.PI * x) / period);
            u2 = u2 + harm4;
        }

        var uWaveValue = a * (u1 + u2);

        return (uWaveValue * uWaveFactor);
    }

    /* Function: calculateWaveSum
        Uses all provided parameters to calculate the current sum. */
    function calculateWaveSum(p, q, qrs, s, t, u, pWavePreFactor, noise) {
        
        const E = pWavePreFactor * p + q + qrs + s + t + u;

        return E * (Math.random() * noise + 1);
    }

    /* Function: randomize
        Used to randomize the provided heart-rate. */
    function randomize(hr, simTime, vitalSigns = undefined) {
        var randHR = (!self.hasAVBlock) ? self.currentRandHR : hr;

        const pacer = simConfig.simState.pacer;

        if (simTime===0 && hr >= 10 && (!isOffsetCalculation || isNewMode)) {
            var maxRandFactor
            
            if (vitalSigns != undefined && vitalSigns.name == "Atrial Fibrillation") {
                maxRandFactor = 0.7;
            } else {
                maxRandFactor = 0.15 - 0.14/(1+(Math.exp(-5/60*(hr-120))));
            }
            randHR = Math.round((Math.random()-0.5) * hr*maxRandFactor + hr);
        } else if (randHR != hr && randHR <= 10 && !isOffsetCalculation) {
            randHR = hr;
        } else if (hr < 10) {
            randHR = hr;
        } else if (pacer.isEnabled && pacer.frequency >= hr && pacer.energy >= pacer.energyThreshold) {
            // So no randomization happens, when pacing is performed.
            randHR = hr;
        }


        // Fallback to restart again from 0 on.
        if (randHR == 0 || randHR == undefined) {
            randHR = hr;
        }

        return randHR
    }

    /* Function: calculateCurrentHFValue
        In this function, the currently simulated heart-rate value is calculated.
        This function contains most of the steps necessary to simulate the dynamic change 
        of the ECG. The calculation of the change is done with the <Logistic Function: https://en.wikipedia.org/wiki/Logistic_function>

        Parameters: 
            vitalSigns - Contains a reference to the vital parameters from the <simConfig>.

        Returns:
            Current calculated heart-rate.
    */
    function calculateCurrentHFValue(vitalSigns, changeDuration) {
        
        if (self.timeSinceConfigChange === 0 && self.currentHR !== undefined) {
            // Change was performed:
            latestReachedHR = self.currentHR;
        }
        
        /* timeSinceConfigChange is increased by timestep/2 because this function is called twice 
        for each ECG calculation step. */
        self.timeSinceConfigChange += timestep/2;
        
        var tempHR;
        
        if (latestReachedHR) {
            tempHR = parseInt(latestReachedHR);
        } else if(self.currentHR!==0) {
            tempHR = parseInt(self.currentHR);
        } else if (oldConfig.hr==0 && vitalSigns.hr!=0) {
            self.currentHR = 5;
        } else {
            tempHR = parseInt(oldConfig.hr);
        }
        
        var L = vitalSigns.hr - tempHR;
        
        /* x0 of the logistic function defines the duration to reach 
            the mid point, with the steepest slope. */
        
        var x0 = changeDuration.isAuto ? (Math.abs(L)/2) : (changeDuration.value / 2);
        /* k is the steepness of the curve. The adaptibility through the 
            dependency on x0 is chosen to make k more adaptable to different 
            speeds and heights of changes.*/
        var k = 5/x0;
        var x = self.timeSinceConfigChange;
        
        /* Based on the characteristic of the logistic function, 
            the end-value (max OR min) is approximately reached at 2*x0. */
        if (self.timeSinceConfigChange > 2*x0 || vitalSigns.hr == oldConfig.hr) {
            timeSinceIntermediateHFChange = 0;
            return vitalSigns.hr;
        }
        
        timeSinceIntermediateHFChange += timestep/2;
        
        if (timeSinceIntermediateHFChange > 60/self.currentHR) {
            timeSinceIntermediateHFChange = 0;
            // With the logistic function, the current HR is calculated.
            self.currentHR = Math.round(tempHR + L/(1+(Math.exp(-k*(x-x0)))));
        }
        
        return self.currentHR;
    }


    /* Function: getTimeForParameter

        Used to calculate the starting point and duration for the different ecg parts. 
        This function is used to calculated improved ECG-curves by incorperating the 
        current heart-rate. The algorithm uses a logistic function (with offset) to 
        calculate the values.
        
        Parameters: 
            hr - Contains the current heart-rate.
            param - Contains the parameter to be adapted depending on the hr.

        Returns:
            Adapted Parameter for the 
        */
    function getTimeForParameter(hr, param) {
        // These parameters are superb for the whole range of hr. (Based on Tests in Excel)
        var normalHF = 60;
        var halfValueDif = 70; 
        var k = 6/halfValueDif;
        return param - (param*0.6)/(1+(Math.exp(-k*((hr-normalHF)-halfValueDif))));
    }
    /* Function: calculateECGValue
        In this function, the different compartments of the ECG signal are calculated.
        Every signal-part is afterwards summed up to build one point of the ECG. The ECG is 
        calculated every <timestep> seconds. 

        Parameters:
            vitalSigns - Contains a reference to the vital parameters from the <simConfig>.
            simTime - Contains 0 or the current simulation time for calculating the ECG value.
            hasPacerPeak - Contains a flag, whether a pacer is currently used.
        Returns:
            One part of the calculated ECG value.
    */
    function calculateECGValue(vitalSigns, simTime, changeDuration, hasPacerPeak) {
        
        self.currentHR = calculateCurrentHFValue(vitalSigns, changeDuration);
        randHR = randomize(self.currentHR, simTime, vitalSigns);

        var tempHR = randHR;

        /* This is used to draw the curve of low-bpm ecg in the same timeframe as a 60bpm 
            ecg. After the waveform, is is zero, until the next wave starts. */
        if (tempHR < 35 && vitalSigns.name == "Sinus Rhythm") {
            /* below 35bpm, the curve is stiched together by a 60bpm "baseline" and a 
            "pqrstu"-complex. */
            tempHR = 60;
            if (!isOffsetCalculation && simTime > 60/randHR - 0.4) {
                simTime = simTime - 60/randHR; 
            }
        }

        // Variables for the P-Wave:
        var pWaveAmplitude = 0.25, 
            pWaveDuration = getTimeForParameter(randHR, 0.09), 
            pWaveStartTime = getTimeForParameter(randHR, 0.16);

        // calculate first value of the chosen frequency to eliminate offset
        var pWaveValue = calculatePWave(
            simTime + vitalSigns.xValOffset, pWaveAmplitude, pWaveDuration, pWaveStartTime, 
            tempHR, vitalSigns.pWaveFactor);


        if (self.hasAVBlock) {
            if (hasPacerPeak) {
                const pacer = simConfig.simState.pacer;
                if (!(pacer.isEnabled && pacer.energy >= pacer.energyThreshold 
                    && pacer.frequency > 40)) {
                    randHR = randomize(40, self.avBlockCounter);
                    tempHR = randHR;
                    if (!isOffsetCalculation) self.avBlockCounter += timestep;
                    if (self.avBlockCounter > 30 / randHR * 2) self.avBlockCounter = 0;
                    if (!isOffsetCalculation) simTime = self.avBlockCounter;
                }
            } else {
                randHR = randomize(40, self.avBlockCounter);
                tempHR = randHR;
                if (!isOffsetCalculation) self.avBlockCounter += timestep;
                if (self.avBlockCounter > 60 / randHR) self.avBlockCounter = 0;
                if (!isOffsetCalculation) simTime = self.avBlockCounter;
            }
        }
        self.currentRandHR = randHR;

        // Variables for the Q-Wave:
        var qWaveAmplitude = 0.07, 
            qWaveDuration = getTimeForParameter(randHR, 0.066), 
            qWaveStartTime = getTimeForParameter(randHR, 0.036);
        // Variables for the QRS-Wave:
        var qrsComplexAmplitude = 1.6, 
            qrsComplexDuration = getTimeForParameter(randHR, (0.07 + vitalSigns.qrsDurationOffset));
        // Variables for the S-Wave:
        var sWaveAmplitude = 0.25,
            sWaveDuration = getTimeForParameter(randHR, 0.066), 
            sWaveStartTime = getTimeForParameter(randHR, 0.04);
        // Variables for the T-Wave:
        var tWaveAmplitude = 0.35, 
            tWaveDuration = getTimeForParameter(randHR, 0.199), 
            tWaveStartTime = getTimeForParameter(randHR, 0.2),
            // Separation of S- and T-Wave
            tsWaveSeparationDuration = getTimeForParameter(randHR, 0.045); 

        // Variables for the U-Wave:
        var uWaveAmplitude = 0.035, 
            uWaveDuration = getTimeForParameter(randHR, 0.0476), 
            uWaveStartTime = getTimeForParameter(randHR, 0.433);

        var qWaveValue = calculateQWave(
            simTime, qWaveAmplitude, qWaveDuration, qWaveStartTime, 
            tempHR, vitalSigns.qWaveFactor);
            
        var qrsComplexValue = calculateQRSWave(
            simTime, qrsComplexAmplitude, qrsComplexDuration, tempHR, 
            vitalSigns.qrsComplexFactor, vitalSigns.qrsAmplitudeOffset);
        
        var sWaveValue = calculateSWave(
            simTime, sWaveAmplitude, sWaveDuration, sWaveStartTime, 
            tempHR, vitalSigns.sWaveFactor);
        
        var tWaveValue = calculateTWave(
            simTime + vitalSigns.xValOffset, tWaveAmplitude, tWaveDuration, tWaveStartTime, 
            tsWaveSeparationDuration, tempHR, vitalSigns.tWaveFactor);
        
        var uWaveValue = calculateUWave(
            simTime, uWaveAmplitude, uWaveDuration, uWaveStartTime, 
            tempHR, vitalSigns.uWaveFactor);


        /* This is used to draw the curve of low-bpm ecg in the same timeframe as a 60bpm 
            ecg. After the waveform, the baseline value will be drawn, until the next wave 
            starts. */
        if (!isOffsetCalculation && simTime < 60/randHR - 0.4 && simTime > 0.5 && randHR < 35 
            && vitalSigns.name == "Sinus Rhythm")
            return baselineValue;

        if (!isOffsetCalculation) baselineValue = calculateWaveSum(
            pWaveValue, qWaveValue, qrsComplexValue, sWaveValue, 
            tWaveValue, uWaveValue, vitalSigns.pWavePreFactor, vitalSigns.Noise);

        return calculateWaveSum(
            pWaveValue, qWaveValue, qrsComplexValue, sWaveValue, 
            tWaveValue, uWaveValue, vitalSigns.pWavePreFactor, vitalSigns.Noise);
    }

    /* Function: calc
        In this function, the current ECG-value is initiated. 

        Parameters:
            vitalSigns - Contains a reference to the vital parameters from the <simConfig>.
            changeDuration - Contains a reference to the <changeDuration> object.
            hasPacerPeak - Contains a flag, whether a pacer is currently used.

        Returns: 
            Full calculated ECG value.
     */
    this.calc = function(vitalSigns, changeDuration, hasPacerPeak = false) {

        isOffsetCalculation = true;
        isNewMode = self.hasNewMode;

        /* An ecgOffset is necessary, because the baseline (ecg after u wave and before p) is 
            dependent on the bpm. A lower bpm has a lower offset. (can reach negative values).
            In order to understand this property, use the MATLAB script from Karthik Raviprakash. 
            (See Documentation) */
        var ecgOffset = calculateECGValue(vitalSigns, 0, changeDuration, hasPacerPeak); 

        // check if first value has to be added or substracted
        if (ecgOffset < 0) ecgOffset = ecgOffset * (-1);

        isOffsetCalculation = false;
        var ecgValue = calculateECGValue(vitalSigns, self.simTime, changeDuration, hasPacerPeak);

        ecgValue -= ecgOffset;
        
        self.simTime += timestep;

        if (self.currentRandHR !== 0 && self.simTime >= 60/((self.hasAVBlock) ? self.currentHR : self.currentRandHR)){
            self.simTime = 0;
            expectsPacerPeak = true;
        } else if (self.currentRandHR === 0 && !self.hasAVBlock) {
            // Used to draw a noisy baseline.
            ecgValue = -1.565*((Math.random()-0.5) * vitalSigns.Noise + 1)
        }

        if (simConfig.simState.hasCPR) {
            ecgValue += ecgCPR.calcCPR();
        }
        
        // Used to adapt the position of the pacer peak in the paced ECG.
        const pacerPeakPositionFactor = 0.9;

        if (hasPacerPeak && expectsPacerPeak && 
            self.simTime >= 60/self.currentHR * pacerPeakPositionFactor) {
            expectsPacerPeak = false;
            ecgGraph.drawPacerPeak();
        }

        if (isNewMode === self.hasNewMode) {
            isNewMode = false;
            self.hasNewMode = false;
        } 

        return ecgValue;
    }
}