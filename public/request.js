var validReq = document.getElementById('proceed');

// If user has enough points, activate listener for button click
if (validReq.style.display == "block") {
    document.addEventListener('DOMContentLoaded', requestSwap);
} else {
    document.getElementById('blocked').style.display = "block";
}

// Create a variable with the current date
var today = new Date();
var day = today.getDate();
var month = today.getMonth()+1;
var year = today.getFullYear();
var dateFormat = year + "-" + month + "-" + day

function showSuccess() {
    var successDiv = document.getElementById('requestSuccess');
    successDiv.style.display = "block";
}

function showError() {
    var errDiv = document.getElementById('requestError');
    errDiv.style.display = "block";
}

/* Function to request a swap and add to pending in the database table */
function requestSwap(){
	document.getElementById('confirmReq').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("proceed").style.display = 'none';
        // Create JSON data to send for query
        var requestData = {
            sender : document.getElementById("sender").value,
            recipient : document.getElementById("user").value,
            book : document.getElementById("book").value,
            pointAmt : document.getElementById("pts").value,
            swapDate : dateFormat,
        };
        req.open("POST", "/confirm_request", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Show success or error message
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var response = JSON.parse(req.responseText);

                // Add book owner's name to success message
                var addOwner = document.getElementById("ownerName");
                addOwner.textContent = response.owner[0].username;
                showSuccess();
            }
            else {
                showError();
            }});
        req.send(JSON.stringify(requestData));
        event.preventDefault();
    })
}
