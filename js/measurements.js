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


/* Function: Measurement
    This function is used as a parent class. It is not meant to be initialized directly but 
    through its inherited functions. This function is used to store and calculate the 
    measurement data for hr, spo2, etco2 and rr.

    Parameters: 
        dataCallback - This callback function returns the expected data
        as soon as it is calculated (asynchronic).
        avgArraySize - Defines the size of the array that stores the average values.
        dataArraySize - Storesthe size of the data array for each measurement circle.
        maxIdleTime - defines the maximum time in seconds that is allowed before an 
        asystolie is diagnosed and the corresponding measurement value is updated.
 */
function Measurement(avgArraySize, dataArraySize, maxIdleTime = 3) {

    /* Variable: dataArray 
        This variable is used to store all data-points from the graphs. */
    this.dataArray = [];

    this.dataMaxArray = [];
    this.dataMinArray = [];
    this.avgArraySize = avgArraySize;
    this.dataArraySize = dataArraySize;
    
    /* Variable: maxIdleTime
        This value defines the maximum time in seconds, that is allowed before an asystolie 
        is diagnosed and the corresponding measurement value is updated. */
    this.maxIdleTime = maxIdleTime;

    /* Variable: currentIdleTime
        This variable is used as a counter to store the current idle time if no or low 
        measurement values are acquired. */
    this.currentIdleTime = 0;

    /* Variable: globalIdleTimeCounter
        This variable is used to compare ECG and SPO2 to e.g. react on deactivation of the ECG */
    this.globalIdleTimeCounter = 0;
    
    /* Function: isOverMaxIdleTime
        This function checks if the <currentIdleTime> is higher then <maxIdleTime>.

        Returns:
            Indicator, whether <currentIdleTime> is higher then <maxIdleTime>.
         */
    this.isOverMaxIdleTime = function() {
        return (this.currentIdleTime >= this.maxIdleTime);
    };
    
    /* Function: findMinMax
        Used to to find the min and max values of the latest measurement cycle.
        
        Parameters:
            divider - Used to adapt the flexibility of the algorithm. A higher divider means
            that less values are found to be malformed and discarded for measurments.
    
        Returns:
            Returns an object, containing the minimum and maximum values.
    */
    this.findMinMax = function() {
        var max = -Infinity;
        var min = +Infinity;
        
        /* In this step, the maximum and minimum values of whole <dataArray> are searched. */
        for (var i = 0; i < this.dataArraySize; i++) {
            if(this.dataArray[i] > max) {
                max = this.dataArray[i];
            }
            if(this.dataArray[i] < min) {
                min = this.dataArray[i];
            }
        }

        return {min: min, max: max};
    };

    /* Function: saveMinMax
        Stores the min and max values in the corresponding arrays. */
    this.saveMinMax = function(min, max) {

        // Checks average Array size and shifts it.
        if (this.dataMaxArray.length >= this.avgArraySize) this.dataMaxArray.shift();

        // The current min value is saved.
        this.dataMaxArray.push(max);

        // Checks average Array size and shifts it.
        if (this.dataMinArray.length >= this.avgArraySize) this.dataMinArray.shift();

        // The current min value is saved.
        this.dataMinArray.push(min);
    };

    /* Function: getGradient
        Calculates and returns the gradient between two values. */
    this.getGradient = function(yNew, yOld) {
        return (yNew - yOld) / timestep;
    }
    
    /* Function: getAvgMax
        Calculates and returns the average max-value. */
    this.getAvgMax = function() {
        var sum = 0;
        for (var i = 0; i < this.dataMaxArray.length; i++) {
            sum += this.dataMaxArray[i];
        }
        var avgMax = sum / this.dataMaxArray.length;
        return avgMax;
    };
    
    /* Function: getAvgMin
        Calculates and returns the average min-value. */
    this.getAvgMin = function() {
        var sum = 0;
        for (var i = 0; i < this.dataMinArray.length; i++) {
            sum += this.dataMinArray[i];
        }
        var avgMin = sum / this.dataMinArray.length;
        return avgMin;
    };
    
};

function ECGMeasurement(dataCallback, realTimePeakCallback) {
    Measurement.call(this, 4, 200);
    
    var peakArray = [];
    var self = this;
    
    
    /* Variable: lastPeakIndex
        Stores the last known Peak Index to have some robustness against quick repeating 
        above-gradient-threshold ECG values. A peak is expected to occur only after 
        lastPeakIndex + 0.2s. So a maximum of 300bpm can be detected.
        See also: <checkForECGPeak>
    */
    var lastPeakIndex = 0;

    /* Variable: expectsNegativeGradient
        Indicates, whether a negative gradient is expected before a new peak can be detected.
        This is used for the peak detection algorithm to gain some robustness against two 
        successing positive peaks over the gradient threshold.
        This is also used to draw the synchronization indicators on the "falling edge" 
        of the peak.
    */
    var expectsNegativeGradient = false;

    /* Function: checkForECGPeak
        Used for the Real Time Peak Search of the ECG. 
    */
    function checkForECGPeak() {
        
        var currentSize = self.dataArray.length;
        if (currentSize > 1) {

            /* If more then 0 elements are available, the gradient is calculated. The gradient 
            is used for the peak detection algorithm. The algorithm is nowhere near robust 
            enough to perform well for noisy environments. */
            var oldVal = self.dataArray[currentSize-2];
            var newVal = self.dataArray[currentSize-1];
            var gradient = self.getGradient(newVal, oldVal);

            if (!expectsNegativeGradient && gradient > 20 && 
                (lastPeakIndex === 0 || currentSize - 1 > lastPeakIndex + 10)) {
                    expectsNegativeGradient = true;
            } else if (expectsNegativeGradient && gradient < -20) {
                expectsNegativeGradient = false;
                lastPeakIndex = currentSize - 1;
                self.currentIdleTime = 0;
                realTimePeakCallback();
            } else {
                // If no peak is detected, the currentIdleTime gets counted up.
                self.currentIdleTime += timestep;
            }
        } else {
            // If the size of the dataArray is 0, the lastPeakIndex is also resetted.
            lastPeakIndex = 0;
        }
    }
    
    /* Function: addECGValue
        Adds a single value to the <dataArray> and performs all necessary calculations to 
        acquire the measurement values.

        Parameters:
            ecgValue - Contains the latest captured value added to the ecg.
    */
    this.addECGValue = function(ecgValue) {

        self.dataArray.push(ecgValue);
        
        self.globalIdleTimeCounter += timestep;
        
        checkForECGPeak();
        
        // After 0.02 * dataArraySize seconds...
        if (self.dataArray.length >= self.dataArraySize) {

            // Return a measured Asystolie if the currentIdleTime is to high.
            if(self.currentIdleTime >= self.maxIdleTime) {
                dataCallback(0);
                
                // Clears peak array to restart without previous average:
                peakArray = [];

                // Clear data Array
                self.dataArray = [];
                
                return;
            }

            // A divider of 4 means, the 
            const minmax = self.findMinMax();
            const min = minmax.min;
            const max = minmax.max;
            self.saveMinMax(min, max);
            
            // Algorithm for finding the count of peaks in the latest measurement interval:
            
            var peakCount = 0;
            
            var lastMaxIndex = 0;

            // All values in dataArray are analyzed
            for (var i = 0; i < self.dataArray.length; i++) {

                // A peak must be higher than this calculated threshold:
                var m = min + Math.abs(min-max) / 1.25;

                // The peaks must be at least 0.2s apart from each other. (max 300 bpm)
                if (self.dataArray[i] > m 
                    && (lastMaxIndex===0 || i > (lastMaxIndex + 10))) {
                    peakCount++;
                    lastMaxIndex = i;
                }
            }
            
            if (peakArray.length >= self.avgArraySize) {
                // After a defined amount of time, the first value gets pushed out.
                peakArray.shift();
            }
            peakArray.push(peakCount);
            
            // Clears data array
            self.dataArray = [];
            
            dataCallback(avgHR(peakArray));
        }
    };
    
    /* Function: getAvgHR
        Calculates and returns the current average Heart-Rate.
        Median did not work properly.
        
        Returns:
            Average HR. 
    */
    function avgHR(values) {
        var sum = 0;
        for (var i = 0; i < values.length; i++) {
            sum += values[i];
        }
        var avgHR = sum / values.length * 60 / (self.dataArraySize * 0.02);
        return Math.round(avgHR);
    };
};

/* Function: SpO2Measurement 
    For the SpO2Measurement, only the height of the function is of interest, the frequency 
    is (normally) paired with the ECG.

    Parameters:
        dataCallback - Hands the current measured value back to the function, where the 
        measurement-value is needed, e.g. <AlarmManagement>.
        realTimePeakCallback - Indicates, that a peak was found on the current data point.
        This is used e.g. in the <SoundManagement> to play the peak sounds.
*/
function SpO2Measurement(dataCallback, realTimePeakCallback) {
    // Contains the default avg min and max, the 
    Measurement.call(this, 2, 200);
    
    var peakArray = [];
    var self = this;
    
    var lastPeakIndex = 0;
    
    var expectsNegativeGrad = false;
    
    /* Function: checkForSpo2Peak
        Used for the Real Time Peak Search of the SPO2. 
    */
    function checkForSpo2Peak() {
        
        var currentSize = self.dataArray.length;
        if (currentSize > 1) {

            /* If more then 0 elements are available, the gradient is calculated. The gradient
                is used for the peak detection algorithm. The algorithm is nowhere near robust 
                enough to perform well for noisy environments.
            */

            var oldVal = self.dataArray[currentSize-2];
            var newVal = self.dataArray[currentSize-1];
            var gradient = self.getGradient(newVal, oldVal);

            // The peaks must be at least 0.2s apart from each other. (max 300 bpm)

            if (gradient > 50 && !expectsNegativeGrad
                && (lastPeakIndex === 0 || currentSize - 1 > lastPeakIndex + 10)) {
                lastPeakIndex = currentSize - 1;
                self.currentIdleTime = 0;
                expectsNegativeGrad = true;

                // The callback happens on the rising slope.

                realTimePeakCallback();
            } else if (gradient < 0) {
                expectsNegativeGrad = false;
            } else {
                // If no peak is detected, the currentIdleTime gets counted up.
                self.currentIdleTime += timestep;
            }
        } else {
            // If the size of the dataArray is 0, the lastPeakIndex is also resetted.
            lastPeakIndex = 0;
        }
    }
    
    /* Function: addSpO2Value
        Adds a single value to the <dataArray> and performs all necessary calculations to 
        acquire the measurement values.

        Parameters:
            spo2Value - Contains the latest captured value added to the <SPO2Graph>.
    */
    this.addSpO2Value = function(spo2Value, nibp) {
        
        self.dataArray.push(spo2Value);
        
        self.globalIdleTimeCounter += timestep;
        
        checkForSpo2Peak();
        
        if (self.dataArray.length >= self.dataArraySize) {
            
            if(self.currentIdleTime >= self.maxIdleTime) {
                // Return a measured asystolie
                dataCallback(0);
                
                // Clear Peak Array to restart without previous average
                peakArray = [];
                
                // Clear data Array
                self.dataArray = [];

                self.saveMinMax(0, 0);
                
                return;
            }

            /* This is no measurement data, because there is no way to simulate the measurement 
            of nibp here. */
            if (nibp.sys > 70 && nibp.dia <= nibp.sys) {
                self.saveMinMax(0, simConfig.vitalSigns.spo2);
            } else {
                self.saveMinMax(0, 0);
            }

            // Algorithm for finding the count of peaks in the latest measurement interval:

            var peakCount = 0;
            var lastMaxIndex = 0;
            var expectsNegativeGrad = false;
            for (var i = 1; i < self.dataArray.length; i++) {

                // Finds the gradient: 
                var oldVal = self.dataArray[i-1];
                var newVal = self.dataArray[i];
                var gradient = self.getGradient(newVal, oldVal);

                if (gradient > 50 && !expectsNegativeGrad && 
                    (lastMaxIndex===0 || i > lastMaxIndex + 10)) {
                    peakCount++;
                    lastMaxIndex = i;
                    expectsNegativeGrad = true;
                } else if (gradient < 0) {
                    expectsNegativeGrad = false;
                }
            }
            
            if (peakArray.length >= self.avgArraySize) {
                // After a defined amount of time, the first value gets pushed out.
                peakArray.shift();
            }
            peakArray.push(peakCount);
            
            // Clear data Array
            self.dataArray = [];

            var spo2Avg = self.getAvgMax();
            // If the average is below 40, we assume that no measurement is possible atm.
            if (spo2Avg <= 40) {
                spo2Avg = 0;
            }

            dataCallback(Math.round(spo2Avg));
        }
    };

    /* Function: getAvgHRFromSPO2
        Calculates and returns the latest average heartrate based on the SPO2-measurement.
    */
    this.getAvgHRFromSPO2 = function() {
        var sum = 0;
        for (var i = 0; i < peakArray.length; i++) {
            sum += peakArray[i];
        }

        if (peakArray.length === 0 || self.dataArraySize === 0) return 0;

        var avgFrequency = sum / peakArray.length * 60 / (self.dataArraySize * 0.02);
        return Math.round(avgFrequency);
    };
};


/* Function: ETCO2Measurement
    Responsible for everything relating to the measurement of etco2 values.

    Parameters:
        datacallback - returns a function containing multiple parameters.
*/
function ETCO2Measurement(dataCallback) {
    Measurement.call(this, 2, 800, 10);
    
    var rrArray = [];
    var expectsNegativeGradient = false;
    var self = this;
    
    /* Function: checkForIdle
        This function is working like an peak finding algorithm put its mere purpose is 
        to check if the SPO2 is already slow.

        See also: <checkForECGPeak>
    */
    function checkForIdle() {
        
        var currentSize = self.dataArray.length;
        if (currentSize > 1) {

            // Finds the gradient:
            var oldVal = self.dataArray[currentSize-2];
            var newVal = self.dataArray[currentSize-1];
            var gradient = self.getGradient(newVal, oldVal);
            
            if (gradient > 5 && !expectsNegativeGradient) {
                expectsNegativeGradient = true;
                self.currentIdleTime = 0;
            } else if (gradient < -5) {
                expectsNegativeGradient = false;
            } else {
                self.currentIdleTime += timestep;
            }
        }
    }
    
    /* Function: addETCO2Value
        Adds a single value to the <dataArray> and performs all necessary calculations to 
        acquire the measurement values.

        Parameters:
            etco2Value - Contains the latest captured value added to the <ETCO2Graph>.
    */
    this.addETCO2Value = function(etco2Value) {
        
        self.dataArray.push(etco2Value);
        
        // self.globalIdleTimeCounter += timestep;
        
        checkForIdle();
        
        if (self.dataArray.length >= self.dataArraySize) {
        
            // If no breathing is captured:
            if(self.currentIdleTime >= self.maxIdleTime) {
                /* Returns a function containing the parameters indicating a measured 
                    breathing zero-line. */
                dataCallback(0,0);
                
                // Clears the dataArray:
                self.dataArray = [];
                
                return;
            }
            
            const minmax = self.findMinMax();
            self.saveMinMax(minmax.min, minmax.max);
            
            var freqCount = 0;

            // Algorithm for finding the count of peaks in the latest measurement interval:
            
            for (var i = 0; i < self.dataArray.length - 1; i++) {
            
                // Calculates the gradient for slope detection:

                var newVal = self.dataArray[i+1];
                var oldVal = self.dataArray[i];
                var gradient = self.getGradient(newVal, oldVal);
                const threshold = 4;

                if (gradient > 5 && newVal > threshold && !expectsNegativeGradient) {
                    freqCount++;
                    expectsNegativeGradient = true;
                } else if (gradient < -5 && newVal < threshold) {
                    expectsNegativeGradient = false;
                }
            }
            
            if (rrArray.length >= self.avgArraySize) {
                // After 40sec, the first value gets pushed out.
                rrArray.shift();
            }
            
            rrArray.push(freqCount);

            // Clear data Array
            self.dataArray = [];
            
            dataCallback(Math.round(self.getAvgMax()), Math.round(getAvgRR()));
        }
    };
    
    /* Function: getAvgRR
        Calculates and returns the latest average respiratory rate.
    */
    function getAvgRR() {
        var sum = 0;
        for (var i = 0; i < rrArray.length; i++) {
            sum += rrArray[i];
        }
        var avgRF = sum / rrArray.length * 60 / (self.dataArraySize * 0.02);
        return Math.round(avgRF);
    };
};