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
along with SIMLab-Emergency-Simulator.  If not, see <http://www.gnu.org/licenses/>. 

Notice: Some of the used Sound files are currently not licenced under the GNU.
*/


/* Constant: SoundState
    Contains the sound states used in the callback to the traineeview. */
const SoundState = {
    NIBP: 0,
    DEFI_LOAD: 1
};

/* Function: SoundManagement
    In this function, all sound releated functionality is included.

    Parameters:
        soundCallback - This callback is executed, when a soundfile ends.
*/
function SoundManagement(soundCallback) {

    /* Constant: alarmVolumeBounds
        Contains the max and min bounds for the alarm volume. */
    const alarmVolumeBounds = {max: 1.0, min: 0.1};

    /* Constant: peakSoundVolumeBounds
        Contains the max and min bounds for the peak sound volume. */
    const peakSoundVolumeBounds = {max: 1.0, min: 0.0};

    /* Variable: self
        Contains a reference to "this". */
    var self = this;

    /* Variable: isNIBPSoundInitialized
        Indicates, if the nibp sound is initialized. */
    var isNIBPSoundInitialized = false;

    /* Variable: isAlarmSoundInitialized
        Indicates, if the alarm sound is initialized. */
    var isAlarmSoundInitialized = false;

    var nibpAudio = new Audio("assets/audio/NIBPSound.mp3");
    var nibpAudioShort = new Audio("assets/audio/NIBPSoundShort.mp3");
	var defiLoadAudio = new Audio("assets/audio/defi_load.mp3");
	var defiFullyLoadAudio = new Audio("assets/audio/defi_fully_loaded.mp3");
    var defiShockAudio = new Audio("assets/audio/defi_shock.mp3");
    
    /* Variable: alarmAudio
        Is played repeatedly, when an alarm occurs.
        
        See also: 
        "<ding.wav: https://freesound.org/people/tim.kahn/sounds/91926/>" by <tim.kahn: https://freesound.org/people/tim.kahn/> is licensed under <CC BY 3.0: https://creativecommons.org/licenses/by/3.0/> 
    */
    var alarmAudio = new Audio("assets/audio/ding_sound.wav");

    /* Variable: context
        Contains the context to be used to play sounds. */
    var context = new(window.AudioContext || window.webkitAudioContext)();

    /* Variable: peakSoundVolume
        Stores the current peak sound volume. */
    var peakSoundVolume = 0.0;

    /* Variable: isAlarmMuted
        Indicates, if the alarm is muted. */
    var isAlarmMuted = false;


    /* Variable: isNIBPSoundRunning
        Indicates, if the nibp sound is running. */
    this.isNIBPSoundRunning = false;

    /* Function: defiLoadAudio.onended
        Is called when the defi sound ended. */
    defiLoadAudio.onended = function() {
        defiFullyLoadAudio.loop = false;
        defiFullyLoadAudio.volume = 0.7;
        defiFullyLoadAudio.play();
        soundCallback(SoundState.DEFI_LOAD);
    };

    /* Function: nibpAudio.onended
        Is called when the nibp audio ended. */
    nibpAudio.onended = function() {
        self.isNIBPSoundRunning = false;
        soundCallback(SoundState.NIBP);
    };

    /* Function: nibpAudioShort.onended
        Is called when the nibp audio ended. */
    nibpAudioShort.onended = function() {
        self.isNIBPSoundRunning = false;
        soundCallback(SoundState.NIBP);
    }
    
    /* Function: playDefiLoadSound
        Plays the defi load sound. */
	this.playDefiLoadSound = function () {
        defiLoadAudio.loop = false;
		defiLoadAudio.volume = 0.7;
		defiLoadAudio.play();
    };
    
    /* Function: playDefiShockSound
        Plays the defi shock sound. */
	this.playDefiShockSound = function () {
        defiShockAudio.play();
        defiShockAudio.volume = 0.7;
    };
    
    /* Function: playNIBPSound
        Randomly chooses and plays the nibp sound. */
    this.playNIBPSound = function () {
        if (!isNIBPSoundInitialized) initNIBPSounds();

        Math.random() > 0.5 ? playNormalNIBP() : playShortNIBP();
    };

    /* Function: initNIBPSounds
        Initializes the NIBP Sounds (normal and short). */
    function initNIBPSounds() {
        nibpAudio.loop = false;
        nibpAudio.volume = 0.7;
        nibpAudioShort.loop = false;
        nibpAudioShort.volume = 0.7;
        isNIBPSoundInitialized = true;
    }

    /* Function: playNormalNIBP
        plays the normal NIBP sound. */
    function playNormalNIBP() {
        if (!self.isNIBPSoundRunning) {
            nibpAudio.play();
            self.isNIBPSoundRunning = true;
        }
    }


    /* Function: playShortNIBP
        plays the short NIBP sound. */
    function playShortNIBP() {
        if (!self.isNIBPSoundRunning) {
            nibpAudioShort.play();
            self.isNIBPSoundRunning = true;
        }
    }

    /* Function: peakSoundVolumeUp
        Increases the peak sound volume and changes the UI. */
    this.peakSoundVolumeUp = function() {
        if (peakSoundVolume + 0.1 <= peakSoundVolumeBounds.max) {
            peakSoundVolume += 0.1;
            $("#peakSoundVolumeLabel").html(Math.round(peakSoundVolume * 100) + "<br>%");
        }
    }
    /* Function: peakSoundVolumeDown
        Decreases the peak sound volume and changes the UI. */
    this.peakSoundVolumeDown = function() {
        if (peakSoundVolume - 0.1 >= peakSoundVolumeBounds.min) {
            peakSoundVolume -= 0.1;
            $("#peakSoundVolumeLabel").html(Math.round(peakSoundVolume * 100) + "<br>%");
        }
    }

    /* Function: playRPeakNoise
        Creates the beeping sound for the R-Peak of the ECG. */
    this.playRPeakNoise = function () {
        var oscillator = context.createOscillator();
        var volume = context.createGain();
        volume.gain.value = peakSoundVolume * 0.05;
        var now = context.currentTime;
        oscillator.type = 'sine';
        oscillator.frequency.value = 450;
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    };
    
    /* Function: playSpO2PeakNoise
        Creates the beeping sound for the SpO2-peak. */
    this.playSpO2PeakNoise = function (spo2Value) {
        var oscillator = context.createOscillator();
        var volume = context.createGain();
        volume.gain.value = peakSoundVolume * 0.05;
        var now = context.currentTime;
        oscillator.type = 'sine';
        var freq = 400;
        if (spo2Value >= 90) {
            freq = 400 + 10*(spo2Value-90);
        }
        oscillator.frequency.value = freq;
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    };

    /* Function: playAlarmSoundRepeatedly
        Plays the alarm sound repeatedly. */
    this.playAlarmSoundRepeatedly = function(volume) {
        if (!isAlarmSoundInitialized || alarmAudio.ended) {
            alarmAudio.loop = true;
            alarmAudio.volume = volume;
            alarmAudio.play();
            isAlarmSoundInitialized = true;
        }
    };
    
    /* Function: stopAlarmSound
        stops the alarm sound from playing. */
    this.stopAlarmSound = function() {
        alarmAudio.loop = false;
    };
    
    /* Function: toggleAlarmSound
        Toggles the alarm sound. */
    this.toggleAlarmSound = function() {
        // Only makes sense after initialization.
        if (isAlarmSoundInitialized) {
            if (!alarmAudio.loop) {
                alarmAudio.loop = true;
                alarmAudio.play();
            } else {
                alarmAudio.loop = false;
            }
            isAlarmMuted = !isAlarmMuted;
        }
    };

}
