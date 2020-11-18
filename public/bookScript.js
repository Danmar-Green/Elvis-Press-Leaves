function deleteBook(bookID, points) {
    var req = new XMLHttpRequest();
        
    // Create JSON data to send with book info
    var delBookData = {
        user : document.getElementById("user").value,
        book : bookID,
        pointAmt : points,
    };

    req.open("POST", "/removebook", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
         if(req.status >= 200 && req.status < 400){
            location.reload();
          }
    });
    req.send(JSON.stringify(delBookData));
}

function addBook() {
    var checkTitle = document.getElementById("book_name").value;
    var checkAuthor = document.getElementById("book_author").value;
    var checkISBN = document.getElementById("book_ISBN").value;

    if (checkISBN == "") {
        checkISBN = null;
    } 

    if (checkTitle == "" || checkAuthor == "") {
        console.log("no data entered");
        return false;
    } else {
        var req = new XMLHttpRequest();
        
        // Create JSON data to send with book info
        var newBookData = {
            user : document.getElementById("user").value,
            title : document.getElementById("book_name").value,
            author : document.getElementById("book_author").value,
            isbn : checkISBN,
            condition : document.getElementById("book_condition").value,
            username : document.getElementById("username").value,
        };

        req.open("POST", "/addbook", true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
             if(req.status >= 200 && req.status < 400){
                location.reload();
              }
        });
        req.send(JSON.stringify(newBookData));
    }
}

function AddEditFormDefaults() {
    $('#modalTitle').html('Add New Book')
    $('#modalHeader').css('background-color', '#90ee90');
    $('#saveButton').show();
}

function DisplayAddBook() {
    const form = $('#addForm').html();
    AddEditFormDefaults();
    $('#modalBody').html(`<form id="bookForm">${form}</form>`);
    $('#bookModal').modal('show')
}
