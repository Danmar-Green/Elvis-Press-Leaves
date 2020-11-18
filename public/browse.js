var pageDiv = document.getElementById("preReq");
var confirmDiv = document.getElementById("postReq");
confirmDiv.style.display = "none";

// Set current date variable
var today = new Date();
var day = today.getDate();
var month = today.getMonth()+1;
var year = today.getFullYear();
var dateFormat = year + "-" + month + "-" + day

function requestBook(bk, pts, usrnm, uid) {
    var req = new XMLHttpRequest();
            
    // Create JSON data to send book data for request
    var reqBookData = {
        sender : uid,
        recipient : document.getElementById("user").value,
        book : bk,
        pointAmt : pts,
        swapDate : dateFormat,
    };

    req.open("POST", "/request", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
         if(req.status >= 200 && req.status < 400){
            document.getElementById("confirmName").textContent = usrnm;
            pageDiv.style.display = "none";
            confirmDiv.style.display = "block";
          }
    });
    req.send(JSON.stringify(reqBookData));
}