document.addEventListener('DOMContentLoaded', rejectSwap);

hideSuccess()
hideError();
hideValues();

function hidePrompt() {
    var prompt = document.getElementById('rejectPrompt');
    prompt.style.display = "none";
}

function hideSuccess() {
    var successDiv = document.getElementById('rejectSuccess');
    successDiv.style.display = "none";
}

function showSuccess() {
    var successDiv = document.getElementById('rejectSuccess');
    successDiv.style.display = "block";
}

function hideError() {
    var errDiv = document.getElementById('rejectError');
    errDiv.style.display = "none";
}

function showError() {
    var errDiv = document.getElementById('rejectError');
    errDiv.style.display = "block";
}

function hideValues() {
    var vals = document.getElementById('hiddenValues');
    vals.style.display = "none";
}

/* Function to mark pending swap as rejected in the database table */
function rejectSwap(){
	document.getElementById('rejectSwap').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("rejectPrompt").style.display = 'none';
        // Create JSON data to send for query
        var rejectData = {
            swapID : document.getElementById("swap").textContent,
            senderID : document.getElementById("sender").textContent,
            receiverID : document.getElementById("receiver").textContent,
            bookID : document.getElementById("book").textContent,
            pointsTraded : document.getElementById("points").textContent,
        };
        req.open("POST", "/postReject", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Show recipient info or error message
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                showSuccess();
            }
            else {
                showError();
            }});
        req.send(JSON.stringify(rejectData));
        event.preventDefault();
    })
}
