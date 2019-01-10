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

function getLesson(callback) {
    //load data from database in json format (see file applicationcontroller.php)
    $.post("php/applicationcontroller.php", //post: request to server on applicationcontroller.php
        {
            callMethod: 'getLessonJson' //send parameter 'callMethod' with value 'getLessonJson'->
        },
        function (data) {

            if (!data.startsWith("{")) {
                // No Json found, log Error and redirect to login view.
                console.log(data);
                window.location.href = 'login.html';
            } else {
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

function saveLesson(simConfig) {
    $.post("./php/applicationcontroller.php", //post: request to server on applicationcontroller.php
        {
            callMethod: 'saveLessonFromJson',
            parameters: simConfig //send parameter 'callMethod' with value 'getLessonJson'->
        },
        function (data) {});
}

function saveComment(comment) {
    $.post("./php/applicationcontroller.php", //post: request to server on applicationcontroller.php
        {
            callMethod: 'saveComment',
            parameters: comment //send parameter 'callMethod' with value 'getLessonJson'->
        },
        function (data) {});
}

function saveTime(newTime){
             $.post("./php/applicationcontroller.php", //post: request to server on applicationcontroller.php
        {
            callMethod: 'saveTime',
            parameters: newTime //send parameter 'callMethod' with value 'getLessonJson'->
        },
        function (data) {});
		}


function getVitalSignParameters(callback) {
    $.post("./php/applicationcontroller.php", //post: request to server on applicationcontroller.php
        {
            callMethod: 'getVitalSignParametersJson',
        },
        function (data) {
            if (data) {
                vitalSignParameters = JSON.parse(data);
                callback(vitalSignParameters);
            }
        });
}


// handler for action of logout button on backend
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

function postValueChange(label, value) {
    addComment(label + ": " + value);
}


//comment input
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
        // $("#messages").scrollTop(12);
        //  document.contact-form.reset();
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

var popup;

function openPrintPopUp() {
    popup = createPopup();
    popup.location = './php/print_pdf.php';
}

function createPopup() {
    if (popup && !popup.closed) {} else {
        var height = screen.availHeight / 1.5;
        var width = screen.availWidth / 2;
        popup = window.open('about:blank', 'popup', 'height=' + height + ',' + 'width=' + width + ',scrollbars=1, resizable=1');
        popup.moveTo(0, 0);
    }
    popup.focus();
    return (popup);
}
