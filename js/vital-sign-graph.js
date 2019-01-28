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



/* Function: Graph
    This function handles the drawing of the curves. Inspired by <HTML5: High Performance Real Time Graphing using Canvas and requestAnimationFrame: http://theblogofpeterchen.blogspot.de/2015/02/html5-high-performance-real-time.html>

    Parameters:
        canvasId - Contains the id of the HTML-Canvas, 
        where the Graph is drawn in.
        lineColor - Contains the correct lineColor for 
        the Graph. This color is based on the VitalSign type.
        yMin - Contains the minimum yValue of the Graph.
        yMax - Contains the maximum yValue of the Graph.
        dataCallback - Contains an Object-Reference that will
        start the corresponding dataCallback method to calculate the
        current VitalSigns values.
        sampleIncrement - Is used to change the count of periods that are shown.
*/
function Graph(canvasId, lineColor, yMin, yMax, dataCallback, sampleIncrement = 3) {
    
    const fps = 60;
    const interval = 1000 / fps;

    /* Variable: self
        Contains a reference to "this". */
    var self = this;

    /* Variable: canvas 
        This variable contains a reference to the canvas. */
    this.canvas = document.getElementById(canvasId);

    /* Variable: context
        This variable stors the context of the canvas. */
    this.context = this.canvas.getContext("2d");

    /* Variable: xValue
        Contains the current xValue in the chart. */
    this.xValue = 0;

    /* Variable: yValue
        Containt the current yValue in the chart. */
    this.yValue;

    /* Variable: valueDifference
        Stores the maximal difference for normalization of the curve heights. */
    var valueDifference = yMax - yMin;

    /* Variable: play
        Indicates, is the chart is playing. */
    var play = false;


    /* Variable: requestScaleUpdate
        Indicates, if a scale update is requested (Currently not used!). */
    var requestScaleUpdate = false;

    /* Variable: pauseGraph
        Indicates, if the current chart is paused. Charts are paused together. */
    var pauseGraph = false;

    /* Variable: needsReset
        Indicates, if a reset of the chart is required. This is the case after the freeze of the 
        graphs is revoked. */
    var needsReset = false;

    /* Variable: shouldClearGraph
        Indicates, if the graph needs to be cleared. */
    var shouldClearGraph = false;

    /* Variable: now
        Contains the current date in milliseconds. */
    var now = Date.now();

    /* Variable: then
        Stores the previous time point?!  */
    var then = now;

    /* Variable: elapsed
        Stores the elapsed time. */
    var elapsed;

    /* Variable: minmax
        This variable contains yMin and ymax value of the Graph. It is used in combination 
        with <updateScale> and therefore not used currently. */
    var yMinMax;

    var initCanvas = function (containerWidth, containerHeight) {
        var margin = 5;
        self.canvas.width = containerWidth;
        self.canvas.height = containerHeight - margin;

        self.context.isimageSmoothingEnabled = false;

        self.context.lineJoin = "round";
        self.context.lineCap = "round";
        self.context.lineWidth = 4;
        self.context.strokeStyle = lineColor;
    };

    $(document).ready(function () {
        var container = $('#' + canvasId).parent();
        //Run function when browser resizes
        function resizeCanvas() {
            var container_width = $(container).width();
            var container_height = $(container).height();
            initCanvas(container_width, container_height);
        }
        $(window).resize(resizeCanvas);
        //Initial call
        resizeCanvas();
    });

    window.requestAnimationFrame = function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.onRequestAnimationFrame;
    }();
    
    this.togglePauseGraph = function() {
        pauseGraph = !pauseGraph;
        if (!pauseGraph) {
            needsReset = true;
        }
    };
    
    this.isGraphPaused = function() {
        return pauseGraph;
    };

    this.isGraphRunning = function () {
        return play;
    }
    
    /* Function: updateScale
        This function is used to rescale the curves to fit into the drawing area. It is 
        however currently not in use, because there is no adaption necessary. */
    this.updateScale = function(minVal, maxVal, isActive) {
        if (!isActive) return; 
        
        yMinMax = {yMin: minVal + minVal*0.1, yMax: maxVal + maxVal*0.1};
        requestScaleUpdate = true;
    };
    
    /* Function: normalizeY
        This function is used to normalizeY the transmitted yValue.
    
        Parameters:
            yValue - This value contrains the yValue to be normalized.

        Returns: 
            The normalized yValue is returned.
    */
    this.normalizeY = function (yValue) {
        var normalized = (yValue - yMin) / valueDifference;
        return self.canvas.height * -normalized + self.canvas.height;
    };

    /* Function: draw
        This function is used to draw the curves/pixels. It handels a lot of the necessary 
        computations to draw the graphs. */
    var draw = function () {

        // Used for measuring redraws per seconds
        now = Date.now(); 
        elapsed = now - then;

        // Chart speed is independent from processor speed
        if (elapsed > interval) { 
            /* Just `then = now` is not enough. Lets say we set fps at 10 which means each 
            frame must take 100ms. Now frame executes in 16ms (60fps) so the loop iterates 7 times 
            (16*7 = 112ms) until delta > interval === true Eventually this lowers down the FPS as 
            112*10 = 1120ms (NOT 1000ms). So we have to get rid of that extra 12ms by subtracting 
            delta (112) % interval (100). Hope that makes sense. */


            /* Get ready for next frame by setting then=now, but also adjust for your 
            specified fpsInterval not being a multiple of RAF's interval (16.7ms) */
            then = now - (elapsed % interval);

            if (self.xValue > self.canvas.width - sampleIncrement) {
                self.xValue = 0;
            }
            
            if(!pauseGraph && !shouldClearGraph) {
                shouldClearGraph = false;
                
                if (needsReset) {
                    needsReset = false;
                    self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
                    self.xValue = 0;
                }

                self.context.clearRect(self.xValue + 1, 0, 10, self.canvas.height);

                // With this check, the 0-xValue in canvas height, can also be deleted.
                if (self.xValue===0) {
                    self.context.clearRect(self.xValue, 0, 10, self.canvas.height);
                    
                    if (requestScaleUpdate) {
                        // This is currently never executed.
                        yMin = yMinMax.yMin;
                        yMax = yMinMax.yMax;
                        valueDifference = yMax - yMin;
                        requestScaleUpdate = false;
                    }
                }

                var value = dataCallback();
                self.context.beginPath();
                self.context.moveTo(self.xValue, self.yValue);
                self.xValue = self.xValue + sampleIncrement;
                self.yValue = self.normalizeY(value);
                self.context.lineTo(self.xValue, self.yValue);
                self.context.stroke();
                self.context.closePath();
            } else {
                /* If the graph is paused, the values are still calculated but no showns. */
                dataCallback();
                
            }
        }

        if (play) {
            /* draw is called again. Using this, changes of vitalSigns are taken into account 
            quickly */
            window.requestAnimationFrame(draw);
        } 
    };

    /* Function: start
        This function is used to start the drawing of the charts and
        therefore the calculation of the corresponding vitalSign. */
    this.start = function () {
        pauseGraph = false;
        shouldClearGraph = false;
        play = true;
        draw();
    };

    /* Function: stop 
        This function stops the repeated execution of the <draw> function. */
    this.stop = function () {
        play = false;
    };

    /* Function: pause
        This function is used to pause the drawing of the graph. 
        The calculation of the current vitalSigns is however not paused. */
    this.pause = function() {
        pauseGraph = true;
        play = false;
        self.xValue = 0;
        self.yValue = 0;
        if (self.context) {
            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
        }
    }
    
    /* Function: clear
        This function is used to clear the Graph. */
    this.clear = function () {
        shouldClearGraph = true;
        play = false;
        self.xValue = 0;
        self.yValue = 0;
        if (self.context) {
            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
        }
    };

    /* this.changeTimeScale = function() {
        if (sampleIncrement === 3) {
            sampleIncrement = 1;
        } else if(sampleIncrement == 2) {
            sampleIncrement = 3;
        } else {
            sampleIncrement = 2;
        }
        needsReset = true;
    } */

}

/* Function: ETCO2Graph
    Used to initialize a ETCO2-specific Graph. See <Graph> for more information. */
function ETCO2Graph(canvasId, lineColor, yMin, yMax, dataCallback) {
    Graph.call(this, canvasId, lineColor, yMin, yMax, dataCallback, 1);
}


/* Function: ECGGraph
    Used to initialize a ECG-specific Graph. See <Graph> for more information. */
function ECGGraph(dataCallback) {
    Graph.call(this, "ecgCanvas", "rgb(41, 235, 41)", -2, 0.3, dataCallback);

    /* Function: drawECGPeak
        Draws the synchronization triangle over the ECG peak. */
    this.drawECGPeak = function () {
        const yValueMax = this.normalizeY(0.3);
        const yTrianglePeak = this.normalizeY(0.1);
        this.context.beginPath();
        this.context.moveTo(this.xValue - 6, yValueMax);
        this.context.lineTo(this.xValue, yTrianglePeak);
        this.context.lineTo(this.xValue + 6, yValueMax);
        this.context.closePath();
        //context.stroke();
        this.context.fillStyle = "rgb(41, 235, 41)";
        this.context.fill();
    }


    /* Function: drawPacerPeak
        Draws the vertical pacer line in the ECG. */
    this.drawPacerPeak = function() {
        var norm;
        if(viewType === ViewType.Trainee) {
            norm = pacerManagement.getNormalizedEnergy()*20;
        } else {
            norm = simConfig.simState.pacer.energy/150*20;
        }
        const yGroundValue = this.yValue + norm;
        const yTopValue = this.yValue - norm;

        this.context.beginPath();
        this.context.moveTo(this.xValue, yGroundValue);
        this.context.lineTo(this.xValue, yTopValue);
        this.context.closePath();
        this.context.stroke();
        this.context.fillStyle = "rgb(41, 235, 41)";
        this.context.fill();
    }

}

