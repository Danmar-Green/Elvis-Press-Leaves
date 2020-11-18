document.addEventListener('DOMContentLoaded', findSelect);

// Check which receive option is being selected - received or never received
function findSelect() {
    var rec = document.getElementById('receiveSwap');
    var nev = document.getElementById('neverSwap');
    var recSuccess = document.getElementById('receiptSuccess');
    var nevSuccess = document.getElementById('neverSuccess');
    var recErr = document.getElementById('receiptError');
    var nevErr = document.getElementById('neverError');

// If on received page, load received API function and hide areas not intended for initial page load
    if (rec) {
        hideSuccess(recSuccess);
        hideError(recErr);
        receiveSwap(rec);
    } else {
// If on never received page, load never received API function and hide areas not intended for initial page load
        hideSuccess(nevSuccess);
        hideError(nevErr);
        neverSwap(nev);
    }
}

function hideSuccess(el) {
    el.style.display = "none";
}

function showSuccess(el) {
    el.style.display = "block";
}

function hideError(el) {
    el.style.display = "none";
}

function showError(el) {
    el.style.display = "block";
}

/* Function to mark swap/book as received in the database table */
function receiveSwap(el){
	el.addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("receiptPrompt").style.display = 'none';
        // Create JSON data to send for query
        var receiveData = {
            swapID : document.getElementById("swapID").value,
            recipient : document.getElementById("recID").value,
            sender : document.getElementById("sendID").value,
            pointsTraded : document.getElementById("ptsAmt").value,
        };
        req.open("POST", "/postReceipt", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Show success or error message
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var recDiv = document.getElementById("receiptSuccess");
                showSuccess(recDiv);
            }
            else {
                var errDiv = document.getElementById("receiptError");
                showError(errDiv);
            }});
        req.send(JSON.stringify(receiveData));
        event.preventDefault();
    })
}

/* Function to remove swap/book and mark as never received in the database table */
function neverSwap(el){
	el.addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("neverPrompt").style.display = 'none';
        // Create JSON data to send for query
        var neverData = {
            swapID : document.getElementById("swapID").value,
            recipient : document.getElementById("recID").value,
            sender : document.getElementById("sendID").value,
            pointsTraded : document.getElementById("ptsAmt").value,
            book : document.getElementById("bookID").value,
        };
        req.open("POST", "/postNever", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Show success or error message
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var nevDiv = document.getElementById("neverSuccess");
                showSuccess(nevDiv);
            }
            else {
                var errDiv = document.getElementById("neverError");
                showError(errDiv);
            }});
        req.send(JSON.stringify(neverData));
        event.preventDefault();
    })
}
