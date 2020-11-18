// Default to show pending accept/reject tab on page load
document.addEventListener('DOMContentLoaded', pndClick);
document.getElementById('pndBttn').style.color = "black";
document.getElementById('recBttn').style.color = "black";

// Show pending accept/reject and hide pending received when clicked
function pndClick() {
    document.getElementById('recCell').style.display = 'none';
    document.getElementById('pndCell').style.display = 'block';
    document.getElementById('pndBttn').style.backgroundColor = "lightsalmon";
    document.getElementById('recBttn').style.backgroundColor = "white";
}

// Show pending received and hide pending accept/reject when clicked
function recClick() {
    document.getElementById('pndCell').style.display = 'none';
    document.getElementById('recCell').style.display = 'block';
    document.getElementById('pndBttn').style.backgroundColor = "white";
    document.getElementById('recBttn').style.backgroundColor = "lightsalmon";
}
