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

/* Constant: ViewType
    Used to indicate, whether a specific part of the code should run. */
const ViewType = {
    Trainee: 1,
    Trainer: 2
};

/* Constant: PName
    In this constant, the Pathologynames are stored so that no strings need to be typed
    throughout the code. */
const PName = {
    SinusRhythm: "Sinus Rhythm",
    Asystole: "Asystole",
    JuncRhythm: "Junctional Rhythm",
    VentTach: "Ventricular Tachycardia",
    VentFib: "Ventricular Fibrillation",
    AtrialFib: "Atrial Fibrillation",
    AVBlock3: "AV Block 3",
    STElevation: "ST Elevation"
};

/* Function: getLesson
    In this function, a call to <getLessonJson> is performed. In it, the database is read and the 
    data returned. The data is returned as a JSON and parsed to an object structure.
    Finally, the callback function is called. 
    
    Parameters: 
        callback - The callback is calling the <initControls> function in TraineeView or 
        TrainerView respectively. */
function getLesson(callback) {
    //post: sends request to server in applicationcontroller.php
    $.post("php/applicationcontroller.php", {
        callMethod: 'getLessonJson' //send parameter 'callMethod' with value 'getLessonJson'->
    }, function (data) {
        if (!data.startsWith("{")) {
            // If no or a malformed JSON String was found in the Data.
            console.log(data);
            window.location.href = 'login.html';
        } else {
            // Parses JSON to Object structure.
            var config = JSON.parse(data);
            var vitalSigns = JSON.parse(config.vitalSigns);
            config.vitalSigns = vitalSigns;
            var simState = JSON.parse(config.simState);
            config.simState = simState;
            var changeDuration = JSON.parse(config.changeDuration);
            config.changeDuration = changeDuration;
            
            callback(config);
        }
    });
}

/* Function: saveLesson
    In this function, the current <simConfig> is saved. For that purpose, the <saveLessonFromJson>
    Method is called.

    Parameters: 
        simConfig - Most current simulation config. */
function saveLesson(simConfig) {
    $.post("./php/applicationcontroller.php", {
        callMethod: 'saveLessonFromJson',
        parameters: simConfig //send parameter 'callMethod' with value 'getLessonJson'->
    }, function (data) {});
}

/* Function: saveComment
    In this function, a comment from the TrainerView is saved using the <saveComment> function in
    the <applicationcontroller.php>.

    Parameters: 
        comment - Containing the latest comment. */
function saveComment(comment) {
    $.post("./php/applicationcontroller.php", {
        callMethod: 'saveComment',
        parameters: comment
    }, function (data) {});
}

/* Function: saveTime
    In this function, the current time from the TrainerView is saved using the <saveTime> 
    function in the <applicationcontroller.php>.

    Parameters: 
        newTime - Containing the current time. */
function saveTime(newTime){
    $.post("./php/applicationcontroller.php", {
        callMethod: 'saveTime',
        parameters: newTime 
    }, function (data) {});
}


/* Function: getVitalSignParameters 
    In this function, the default vitalSignParameters are pulled from the database.

    Parameters: 
        callback - Will contain the vitalSignParameters. */
function getVitalSignParameters(callback) {
    $.post("./php/applicationcontroller.php", {
        callMethod: 'getVitalSignParametersJson',
    }, function (data) {
        if (data) {
            vitalSignParameters = JSON.parse(data);
            callback(vitalSignParameters);
        }
    });
}

//TODO: Unify the look and feel of the functions. Get rid of Ajax

/* Function: logout
    This function invokes the logout operation from the <applicationcontroller.php>. */
function logout() {
    // call backendLogout function in controller php script with an synchronous AJAX call 
    // this method allows data exchange with server without reloading the full html file                
    $.ajax({
        type: 'POST',
        async: false, // important to assure that first the php script is executed
        url: './php/applicationcontroller.php',
        data: ({
            // parameter a determines which functions should be executed in controller
            a: 'logout'
        })
    });
    // jump back to login page
    window.location.href = 'login.html';
}

/* Function: postValueChange
    Used to save value changes in the database.
    
    Parameters:
        label - Contains the value describtion that was changed.
        value - Contains the value that was changed. */
function postValueChange(label, value) {
    addComment(label + ": " + value);
}

/* Function: addComment
    This function is used to save comments for the session in the database.
    
    Parameters:
        comment - Contains the comment to be saved. */
function addComment(comment) {
    if (comment && comment != "") {
        var oldscrollHeight = $("#messages").attr("scrollHeight") - 20;
        var commentNode = document.createElement('P');
        commentNode.style.color = "white";
        commentNode.style.fontSize = "2.5vmin";
        var textNode = document.createTextNode(new Date().toLocaleTimeString() + ": " + comment);
        commentNode.appendChild(textNode);
        var messagesNode = document.getElementById("messages");

        if (messagesNode.childNodes.length > 0) {

            var firstElemenent = (messagesNode.firstElementChild || messagesNode.firstChild)
            messagesNode.insertBefore(commentNode, firstElemenent);

        } else {
            messagesNode.appendChild(commentNode);
        }

        var newscrollHeight = $("#messages").attr("scrollHeight") - 20;
        if (newscrollHeight > oldscrollHeight) {
            $("#messages").animate({
                scrollTop: newscrollHeight
            }, 'normal');
        }
        $("#message").val("");
    }
    saveComment(comment);
}

/* Variable: popup
    Stores a reference to the printPDF popup. */
var popup;

/* Function: openPrintPopUp
    Opens the print Popup Dialog in a new window. */
function openPrintPopUp() {
    popup = createPopup();
    popup.location = './php/print_pdf.php';
}

/* Function: createPopup
    Creates a new popup containing the printPDF dialog. 
        
    Returns: 
        Returns the created Popup. */
function createPopup() {
    if (popup && !popup.closed) {} else {
        var height = screen.availHeight / 1.5;
        var width = screen.availWidth / 2;
        popup = window.open('about:blank', 'popup', 'height=' + height + ',' + 'width=' + width + 
        ',scrollbars=1, resizable=1');
        popup.moveTo(0, 0);
    }
    popup.focus();
    return popup;
}
