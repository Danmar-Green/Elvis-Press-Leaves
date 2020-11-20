document.addEventListener('DOMContentLoaded', getUser);

hideError();
hideNoUser();

function hideError() {
    var errDiv = document.getElementById('loginError');
    errDiv.style.display = "none";
}

function showError() {
    var errDiv = document.getElementById('loginError');
    errDiv.style.display = "block";
}

function hideNoUser() {
    var errDiv = document.getElementById('noUser');
    errDiv.style.display = "none";
}

function showNoUser() {
    var errDiv = document.getElementById('noUser');
    errDiv.style.display = "block";
}


/* Function to submit user login data for the database table */
function getUser(){
	document.getElementById('userLogin').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        
        // Create JSON data to send with new user info and no id set
        var userData = {
            username : document.getElementById("username").value,
            password : document.getElementById("password").value,
        };
        req.open("POST", "/login", true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
              var response = JSON.parse(req.responseText);
              if (response.userInfo.length == 0) {
                showNoUser();
              } else {
                var user = response.userInfo[0].id;
                var link = "/" + user + "/account";
                window.location.href = link;                
              }
            } else {
                showError();
            }
        });
        req.send(JSON.stringify(userData));
        event.preventDefault();
    });
}
