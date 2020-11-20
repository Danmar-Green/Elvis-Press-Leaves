document.addEventListener('DOMContentLoaded', newUser);

hideError();

function hideError() {
    var errDiv = document.getElementById('signUpError');
    errDiv.style.display = "none";
}

function showError() {
    var errDiv = document.getElementById('signUpError');
    errDiv.style.display = "block";
}

/* Function to create new user and login */
function newUser(){
	document.getElementById('userLogin').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        
        // Create JSON data to send with new user info and no id set
        var userData = {
            firstName : document.getElementById("fname").value,
            lastName  : document.getElementById("lname").value,
            email     : document.getElementById("email").value,
            username  : document.getElementById("username").value,
            password  : document.getElementById("password").value,
            street    : document.getElementById("street").value,
            city      : document.getElementById("city").value,
            state     : document.getElementById("state").value,
            zipCode   : document.getElementById("zipCode").value,
        };
        req.open("POST", "/createUser", true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
              var response = JSON.parse(req.responseText);
                var user = response.userInfo[0].id;
                var link = "/" + user + "/account";
                window.location.href = link;                
            } else {
                showError();
            }
        });
        req.send(JSON.stringify(userData));
        event.preventDefault();
    });
}
