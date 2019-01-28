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

const RespRatio = {
    Normal: 0,
    HyperVent: 1,
    HypoVent: 2
};

/* Function: ETCO2Calculation
    Performs all necessary calculations for the ECG. */
var ETCO2Calculation = function() {
    
    /* Variable: simTime
        This counter contains the current point in time. */
    var simTime = 0;

    /* Variable: oldRR
        Contains the old respiratory-rate used in the dynamic change process. */
    var oldRR;

    /* Variable: oldETCO2
        Contains the old etco2-value used in the dynamic change process. */
    var oldETCO2;

    /* Variable: timeSinceRRChange
        Contains the time since last respiratory-rate config change. */
    var timeSinceRRChange = 0;

    /* Variable: timeSinceETCO2Change
        Contains the time since last etco2-value config change. */
    var timeSinceETCO2Change = 0;

    /* Variable: timeSinceIntermediateRRChange
        Contains the duration since last dynamic respiratory-rate adaption using the logistic 
        function. Used to adapt the frequency only at specific points. */
    var timeSinceIntermediateRRChange = 0;

    /* Variable: timeSinceIntermediateETCO2Change
        Contains the duration since last dynamic etco2 adaption using the logistic 
        function. Used to adapt the frequency only at specific points. */
    var timeSinceIntermediateETCO2Change = 0;

    /* Variable: currentRR
        Contains the current respiratory-rate. */
    var currentRR;

    /* Variable: latestReachedRR
        Contains the old "currentRR" after a config change. It is used to react to changes 
        to the <currentRR> while an old change is still in process. */
    var latestReachedRR;

    /* Variable: randomizedRR
        Stores the randomized respiratory-rate to give more realistic values. */
    var randomizedRR;

    /* Variable: currentETCO2
        Contains the current etco2-value. */
    var currentETCO2;

    /* Variable: latestReachedETCO2
        Contains the old "currentETCO2" after a config change. It is used to react to changes 
        to the <currentETCO2> while an old change is still in process. */
    var latestReachedETCO2;

    /* Variable: randomizedETCO2
        Stores the randomized etco2-value to give more realistic values. */
    var randomizedETCO2;

    /* Variable: recentETCO2
        Contains the two most recent y-values used to find the correct point for the 
        dynamic change. */
    var recentETCO2 = {old: 0, new: 0};

    /* Variable: hasCOPD
        Locally saves the current flag if the patient has copd. It is saved locally so that
        changes are only performed at fixed points in time. */
    var hasCOPD = false;

    /* Variable: respRatio
        Locally saves the current resp ratio so that changes are only performed at fixed points 
        in time. */
    var respRatio = RespRatio.Normal;

    /* Function: getGradient
        Calculates and returns the gradient between two values. */
    function getGradient(yNew, yOld) {
        return (yNew - yOld)/timestep;
    }

    /* Function: setCurrentValues
        Changes the current resp-rate and etco2 max to the provided values. */
    this.setCurrentValues = function(rr, etco2) {
        currentRR = rr;
        randomizedRR = rr;
        currentETCO2 = etco2;
        randomizedETCO2 = etco2;
    }

    /* Function: calculateCurrentETCO2
        Used to calculate dynamic changing values for the etco2 max value.

        Parameters: 
            newETCO2 - Contains the etco2-max value to which a change is performed.
            changeDuration - Contains the time, how long a change is taking.
        
        Returns:
            returns the currently calculated etco2-value.
        */
    function calculateCurrentETCO2(newETCO2, changeDuration) {
        if (timeSinceETCO2Change === 0 && currentETCO2 !== undefined) {
            // Aha, change was performed:
            latestReachedETCO2 = currentETCO2;
            
            // Blocks the etco2 from performing changes when the capnogram is near the baseline.
            if (getGradient(recentETCO2.new, recentETCO2.old) <= -0.1) {
                return currentETCO2;
            } else if (recentETCO2.new > 0.1 && recentETCO2.old > 0.1) {
                return currentETCO2;
            }
            
            // A rising part is reached... perform changes NOW.
        }
        
        timeSinceETCO2Change += timestep;
        
        var tempETCO2;
        
        /* The latest reached etco2 has the highest priority. 
            It gives the ability for continuous changes of the rate even if multiple changes are 
            performed in quick succession. Search (Strg+F) "latestReachedRR" for further 
            information.
        */
        if (latestReachedETCO2 !== undefined) {
            tempETCO2 = latestReachedETCO2;
        } else if (currentETCO2 !== undefined) {
            tempETCO2 = currentETCO2;
        } else {
            tempETCO2 = newETCO2;
        }
        
        var L = newETCO2 - tempETCO2;
        
        /* t0 of the logistic function defines the duration to reach the mid point, with the 
        steepest slope. */
        var t0 = changeDuration.isAuto ? (Math.abs(L)/2) : (changeDuration.value / 2);
        
        /* k is the steepness of the curve. The adaptibility through the dependency on t0 is 
        chosen to make k more adaptable to different speeds and heights of changes.*/
        var k = 5/t0;
        var t = timeSinceETCO2Change;
        
        /* Based on the characteristic of the logistic function, the end-value (max OR min) 
        is approximately reached at 2*t0. */
        if (timeSinceETCO2Change > 2*t0 || newETCO2 == tempETCO2 || tempETCO2 <= 4) {
            timeSinceIntermediateETCO2Change = 0;
            return newETCO2;
        }
        
        timeSinceIntermediateETCO2Change += timestep;
        
        if (timeSinceIntermediateETCO2Change > 60/currentETCO2) {
            timeSinceIntermediateETCO2Change = 0;
            // With the logistic function, the current respiratory-rate is calculated.
            currentETCO2 = Math.round(tempETCO2 + L/(1+(Math.exp(-k*(t-t0)))));
        }
        
        return currentETCO2;
    }

    /* Function: calculateCurrentRR
        This function is used to calculated the current rr-value. It is used for the dynamic 
        change.

        Parameters: 
            newRR - Contains the new respiratory-rate.
            changeDuration - Contains a reference to the <changeDuration> object.

        Returns: 
            The current calculated respiratory-rate value.
         */
    function calculateCurrentRR(newRR, changeDuration) {
        
        if (timeSinceRRChange === 0 && currentRR !== undefined) {
            // Aha, change was performed:
            // When a change is performed in the config, the latest reached resp-rate is updated.
            latestReachedRR = currentRR;
            
            // Blocks the etco2 from performing changes when the capnogram is near the baseline.
            if (getGradient(recentETCO2.new, recentETCO2.old) <= -0.1) {
                return currentRR;
            } else if (recentETCO2.new > 0.1 && recentETCO2.old > 0.1) {
                return currentRR;
            }
            
            // A rising part is reached... perform changes NOW.
        }
        
        timeSinceRRChange += timestep;
        
        var tempRR;
        
        /* The latest reached resp-rate has the highest priority. 
            It gives the ability for continuous changes of the rate even if multiple changes are 
            performed in quick succession. E.g. changing from 15 -> 20 and changing back to 12
            before the 20 was reached. Therefore, the 17 or 18 is used as a new "latestReachedRR"
            to perform further changes from there.
        */
        if (latestReachedRR !== undefined) {
            tempRR = latestReachedRR;
        } else if (currentRR !== undefined) {
            tempRR = currentRR;
        } else {
            tempRR = newRR;
        }
        
        var L = newRR - tempRR;
        
        /* t0 of the logistic function defines the duration to reach the mid point, with the 
        steepest slope. */
        var t0 = changeDuration.isAuto ? (Math.abs(L)/2) : (changeDuration.value / 2);
        
        /* k is the steepness of the curve. The adaptibility through the dependency on t0 is 
        chosen to make k more adaptable to different speeds and heights of changes.*/
        var k = 5/t0;
        var t = timeSinceRRChange;
        
        /* Based on the characteristic of the logistic function, the end-value (max OR min) 
        is approximately reached at 2*t0. */
        if (timeSinceRRChange > 2*t0 || newRR == tempRR || tempRR <= 2) {
            timeSinceIntermediateRRChange = 0;
            return newRR;
        }
        
        timeSinceIntermediateRRChange += timestep;
        
        if (timeSinceIntermediateRRChange > 60/currentRR) {
            timeSinceIntermediateRRChange = 0;
            // With the logistic function, the current respiratory-rate is calculated.
            currentRR = Math.round(tempRR + L/(1+(Math.exp(-k*(t-t0)))));
        }
        
        return currentRR;
    };


    /* Function: randomizeETCO2
        Generates randomized values around a defined interval for the etco2.

        Parameters:
            val - Contains the value around which the randomized values are produced.
            simTime - Contains the current point in time.  */
    function randomizeETCO2(val, simTime) {
        // Uses the current randomized resp-rate which might get overwitten later.
        var randVal = randomizedETCO2;

        /* Random values are generated at certain points in time. 
            Only applied if the transmitted value is above 5.
        */
        if (simTime===0 && val > 5) {
            randVal = Math.round((Math.random()-0.5) * val * 0.15 + val);
        }  else if (val <= 5) {
            randVal = val;
        }

        if (isNaN(randVal)) return val;

        return randVal
    }

    /* Function: randomizeRR
        Generates randomized values around a defined interval for the resp-rate.

        Parameters:
            val - Contains the value around which the randomized values are produced.
            simTime - Contains the current point in time.  */
    function randomizeRR(val, simTime) {
        // Uses the current randomized resp-rate which might get overwitten later.
        var randVal = randomizedRR;

        /* Random values are generated at certain points in time. 
            Only applied if the transmitted value is above 5.
        */
        if (simTime===0 && val > 5) {
            randVal = Math.round((Math.random()-0.5) * val * 0.15 + val);
        } else if (val <= 5) {
            randVal = val;
        }

        if (isNaN(randVal)) return val;

        return randVal
    }

    /* Function: calcNormal
        With this function, the normal ~(1:2) ratio breathing curve is generated.

        Parameters:
            simTime - Contains the current simulation time.
            period - Contains the current period of the breath.
            randETCO2 - Contains the randomized etco2-max-value.

        Returns:
            Returns the calculated current etco2-curve value.
    */
    function calcNormal(simTime, period, randETCO2) {

        var t = simTime;

        // t0 and k are parameters used in the logistic-function.
        var y, t0, k;
        
        // If the expiratory duration is to long, the plateau-phase is skipped.
        const expDuration = hasCOPD ? 4 : 2;

        /* Segment AB: 
        In this Segment, a logistic function is used to reach approx. 90% of the defined 
        randETCO2. It t0 is chosen, so that the 90% is not actually reached, so that the 
        change from B to C looks more smooth. */
        if (t < (expDuration / 7) * period) {
            t0 = ((expDuration / (hasCOPD ? 7 : 4.5)) * period)/2;
            k = (hasCOPD ? 6 : 15) / t0;
            y = (hasCOPD ? 1 : 0.9)*randETCO2/(1+(Math.exp(-k*(t-t0))));
        } 

        /* Segment BC: 
        In this Segment, a linear function is used to reach 100% of the defined randETCO2. */
        if (t >= (expDuration / 7) * period && t < (5.5 / 7) * period) {
            if (hasCOPD) {
                y = randETCO2;
            } else {
                y = 0.9*randETCO2 + (0.1*randETCO2) * (t - ((2.2 / 7) * period))/((3.5 / 7) * period);
            }
        }
        
        /* Segment CD: 
        In this Segment, a logistic function is used to decrease the randETCO2 to 0%. 
        This stage models the Inspiration phase. */
        if (t >= (5.5 / 7) * period && t < (6.5 / 7) * period) {
            t0 = (5.5 / 7) * period + ((1 / 7) * period) / 2;
            k = 60/t0;
            y = randETCO2 - randETCO2 / (1+(Math.exp(-k*(t-t0))));
        } 
        
        /* Segment DE: 
        No Carbon-Dioxid flow in this phase. */
        if (t >= (6.5 / 7) * period) {
            y = 0;
        }

        return y;
    }

    /* Function: calcHyper
        With this function, the exerted or hyperventilation ~(1:1) ratio breathing curve 
        is generated.

        Parameters:
            simTime - Contains the current simulation time.
            period - Contains the current period of the breath.
            randETCO2 - Contains the randomized etco2-max-value.

        Returns:
            Returns the calculated current etco2-curve value.
    */
    function calcHyper(simTime, period, randETCO2) {
        var t = simTime;

        // t0 and k are parameters used in the logistic-function.
        var y, t0, k;
        
        // If the expiratory duration is to long, the plateau-phase is skipped.
        const expDuration = hasCOPD ? 4 : 2;

        /* Segment AB: 
        In this Segment, a logistic function is used to reach approx. 90% of the defined 
        randETCO2. It t0 is chosen, so that the 90% is not actually reached, so that the 
        change from B to C looks more smooth. */
        if (t < (expDuration / 7) * period) {
            t0 = ((expDuration / (hasCOPD ? 7 : 4.5)) * period)/2;
            k = (hasCOPD ? 6 : 17) / t0;
            y = (hasCOPD ? 1 : 0.9)*randETCO2/(1+(Math.exp(-k*(t-t0))));
        } 

        /* Segment BC: 
        In this Segment, a linear function is used to reach 100% of the defined randETCO2. */
        if (t >= (expDuration / 7) * period && t < (4 / 7) * period) {
            if (hasCOPD) {
                y = randETCO2;
            } else {
                y = 0.9*randETCO2 + (0.1*randETCO2) * (t - ((2 / 7) * period))/((2 / 7) * period);
            }
        }
        
        /* Segment CD: 
        In this Segment, a logistic function is used to decrease the randETCO2 to 0%. 
        This stage models the Inspiration phase. */
        if (t >= (4 / 7) * period && t < (7 / 7) * period) {
            t0 = (4 / 7) * period + ((1.5 / 7) * period) / 2;
            k = 60/t0;
            y = randETCO2 - randETCO2 / (1+(Math.exp(-k*(t-t0))));
        }

        return y;
    }

    /* Function: calcHypo
        With this function, the sleep or hypoventilation ~(1:4) ratio breathing curve 
        is generated.

        Parameters:
            simTime - Contains the current simulation time.
            period - Contains the current period of the breath.
            randETCO2 - Contains the randomized etco2-max-value.

        Returns:
            Returns the calculated current etco2-curve value.
    */
    function calcHypo(simTime, period, randETCO2) {
        var t = simTime;

        // t0 and k are parameters used in the logistic-function.
        var y, t0, k;
        
        // If the expiratory duration is to long, the plateau-phase is skipped.
        const expDuration = hasCOPD ? 4 : 2;

        /* Segment AB: 
        In this Segment, a logistic function is used to reach approx. 90% of the defined 
        randETCO2. It t0 is chosen, so that the 90% is not actually reached, so that the 
        change from B to C looks more smooth. */
        if (t < (expDuration / 7) * period) {
            t0 = ((expDuration / (hasCOPD ? 7 : 4.5)) * period)/2;
            k = (hasCOPD ? 6 : 17) / t0;
            y = (hasCOPD ? 1 : 0.9)*randETCO2/(1+(Math.exp(-k*(t-t0))));
        } 

        /* Segment BC: 
        In this Segment, a linear function is used to reach 100% of the defined randETCO2. */
        if (t >= (expDuration / 7) * period && t < (6 / 7) * period) {
            if (hasCOPD) {
                y = randETCO2;
            } else {
                y = 0.9*randETCO2 + (0.1*randETCO2) * (t - ((2 / 7) * period))/((4 / 7) * period);
            }
        }
        
        /* Segment CD: 
        In this Segment, a logistic function is used to decrease the randETCO2 to 0%. 
        This stage models the Inspiration phase. */
        if (t >= (6 / 7) * period && t < (7 / 7) * period) {
            t0 = (6 / 7) * period + ((1 / 7) * period) / 2;
            k = 70/t0;
            y = randETCO2 - randETCO2 / (1+(Math.exp(-k*(t-t0))));
        }

        return y;
    }

    /* Function: calc
        Calculates the etco2-curve values based on the resp-rate. 

        Parameters:
            rr - Contains the current resp-rate.
            etco2MaxValue - Contains the maximum etco2 value.
            changeDuration - Contains a reference to the <changeDuration> object.
            
        Returns:
             Returns the current value in the etco2-curve.
        */
    this.calc = function(rr, etco2MaxValue, changeDuration) {

        // Set initial values:
        if (!oldRR) oldRR = rr;
        if (!oldETCO2) oldETCO2 = etco2MaxValue;

        if (parseInt(oldRR) !== parseInt(rr)) {
            // Aha, the respiratory-rate was changed.
            oldRR = rr;
            timeSinceRRChange = 0;
        }

        if (parseInt(oldETCO2) !== parseInt(etco2MaxValue)) {
            // Aha, the respiratory-rate was changed.
            oldETCO2 = etco2MaxValue;
            timeSinceETCO2Change = 0;
        }

        currentRR = calculateCurrentRR(rr, changeDuration);
        currentETCO2 = calculateCurrentETCO2(etco2MaxValue, changeDuration);
        
        var randRR = randomizeRR(currentRR, simTime);
        // Saves the new randomized resp-rate.
        randomizedRR = randRR;

        var randETCO2 = randomizeETCO2(currentETCO2, simTime);
        // Saves the new randomized etco2-max-value.
        randomizedETCO2 = randETCO2;

        if(randETCO2 === 0 || randRR === 0) {
            simTime = 0;
            if (simConfig.simState.hasCPR) return etco2CPR.calcCPR();

            /* Necessary for the dynamic respiratory-rate change. */
            recentETCO2.old = 0;
            recentETCO2.new = 0;

            return 0;
        }
        
        /* Necessary for the dynamic respiratory-rate change. */
        recentETCO2.old = recentETCO2.new;

        var period = 60 / randRR; 

        var t = simTime;
        var y;

        switch(respRatio) {
            case RespRatio.Normal: /* I:E = ~1:2 */
                y = calcNormal(t, period, randETCO2);
            break;
            case RespRatio.HypoVent: /* I:E = ~1:3 */
                y = calcHypo(t, period, randETCO2);
            break;
            case RespRatio.HyperVent: /* I:E = ~1:1 */
                y = calcHyper(t, period, randETCO2);
            break;
        }
        
        simTime += timestep;
        if (simTime > 60 / randRR) {
            // Resets the simulation time once per period:
            simTime = 0;
            // Updates the copd flag once per period:
            hasCOPD = simConfig.simState.hasCOPD;
            // Updates the ratio once per period:
            respRatio = simConfig.simState.respRatio;
        }
        
        recentETCO2.new = y;

        if (simConfig.simState.hasCPR) {
            y += etco2CPR.calcCPR();
        }

        return y;
    }
}