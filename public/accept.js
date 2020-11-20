document.addEventListener('DOMContentLoaded', acceptSwap);

hideSuccess()
hideError();
hideValues();

var today = new Date();
var day = today.getDate();
var month = today.getMonth()+1;
var year = today.getFullYear();
var dateFormat = year + "-" + month + "-" + day

function hidePrompt() {
    var prompt = document.getElementById('acceptPrompt');

    prompt.style.display = "none";
}

function hideSuccess() {
    var successDiv = document.getElementById('acceptSuccess');
    successDiv.style.display = "none";
}

function showSuccess() {
    var successDiv = document.getElementById('acceptSuccess');
    successDiv.style.display = "block";
}

function hideError() {
    var errDiv = document.getElementById('acceptError');
    errDiv.style.display = "none";
}

function showError() {
    var errDiv = document.getElementById('acceptError');
    errDiv.style.display = "block";
}

function hideValues() {
    var vals = document.getElementById('hiddenValues');
    vals.style.display = "none";
}

/* Function to mark pending swap as accepted in the database table */
function acceptSwap(){
	document.getElementById('acceptSwap').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("acceptPrompt").style.display = 'none';
        // Create JSON data to send for query
        var acceptData = {
            swapID : document.getElementById("swap").textContent,
            senderID : document.getElementById("sender").textContent,
            receiverID : document.getElementById("receiver").textContent,
            bookID : document.getElementById("book").textContent,
            pointsTraded : document.getElementById("points").textContent,
            swapDate : dateFormat,
        };
        req.open("POST", "/postAccept", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Show recipient info or error message
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var response = JSON.parse(req.responseText);
                var spanID = document.getElementById("recipientName");
                var mail1 = document.getElementById("mailingName");
                var mail2 = document.getElementById("mailingStreet");
                var mail3 = document.getElementById("mailingState");

                spanID.textContent = response.shipping[0].firstName;
                mail1.textContent = response.shipping[0].firstName + " " + response.shipping[0].lastName;
                mail2.textContent = response.shipping[0].street;
                mail3.textContent = response.shipping[0].city +  ", "  + response.shipping[0].state + ", " + response.shipping[0].zipCode;
                showSuccess();
            }
            else {
                showError();
            }});
        req.send(JSON.stringify(acceptData));
        event.preventDefault();
    })
}
