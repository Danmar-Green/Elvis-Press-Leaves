

document.getElementById("Swap-History").addEventListener("click", function() {
  var x = document.getElementById("header-table-3");
  var y = document.getElementById("inner-table");
  if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "none";
  }else if(x.style.display === "block"){
      x.style.display = "block";
  }

});
document.getElementById("User-Profile").addEventListener("click", function() {
  var x = document.getElementById("header-table-3");
  var y = document.getElementById("inner-table");
  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.display = "block";
  }else if(x.style.display === "block"){
      x.style.display = "block";
  }

});
