
document.getElementById("Swap-History").addEventListener("click", function() {
  var x = document.getElementById("header-table-3");
  var y = document.getElementById("inner-table");
  var z = document.getElementById("account-update-form");

  if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "none";
    z.style.display = "none";

  }else if(x.style.display === "block"){
      x.style.display = "block";

  }
  var i = 0;
  while (i < 10){
  var v = document.getElementById('points').value;
  var v1 = document.getElementById('points');
console.log(v);
  if(v > 0)
    v1.style.color = "green";

  else {
    v1.style.color = "blue";
  }
i++;
}

});
document.getElementById("User-Profile").addEventListener("click", function() {
  var x = document.getElementById("header-table-3");
  var y = document.getElementById("inner-table");
  var z = document.getElementById("account-update-form");
  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.display = "block";
    z.style.display = "block";
  }else if(x.style.display === "block"){
      x.style.display = "block";
  }

});
