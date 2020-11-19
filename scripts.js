function DisplayAddBook() {
    const form = $('#addForm').html();
    AddEditFormDefaults();
    $('#modalBody').html(`<form id="bookForm">${form}</form>`);
    $('#bookModal').modal('show')
}

function DisplayEditBook(books) {
    if (!books || books.length == 0){
        return;
    }
    AddEditFormDefaults();
    const workout = books[0];
    //add an id
    const form = $('#addForm').html();
    const formId = `<input type="hidden" name="bookid" value="${book.id}">`;
    $('#modalBody').html(`<form id="bookForm">${formId}${form}</form>`);

    for (const [key, value] of Object.entries(book)) {
        if (key != 'id') {
            $(`#book_${key}`).val(value);
        }
    }

    $('#bookModal').modal('show')
}

function AddEditFormDefaults() {
    $('#modalTitle').html('Add New Book')
    $('#modalHeader').css('background-color', '#90ee90');
    $('#saveButton').show();
}

function SaveBook() {
    let bookId = '';

    let formArray = $('#bookForm').serializeArray();
    //is this a new form
    const isEdit = formArray.some(x => x.name == 'bookid');
    if (isEdit){
        //pull out the id
        const workoutObj =  formArray.find(x => x.name === 'bookid');
        bookId = bookObj.value;
    }

    let formPost = $('#bookForm').serialize();
    ApiSaveBook(formPost, bookId)
        .then(() => {
            $('#bookModal').modal('hide')
            RefreshTable();
        })
        .catch((error) => DisplayError(error));
}

function EditBook(e) {
    const deleteTarget = e.currentTarget;
    const workoutId = $(deleteTarget).data('id');
    if (!bookId) {
        return;
    }
    ApiGetBook(bookId)
        .then((selectedBook) => {DisplayEditBook(selectedBook)})
        .catch((error) => DisplayError(error))
}

function DeleteBook(e) {
    //get workout id
    const deleteTarget = e.currentTarget;
    const bookId = $(deleteTarget).data('id');
    if (!bookId) {
        return;
    }

    ApiDeleteBook(bookId)
        .then(() => {RefreshTable()})
        .catch((error) => DisplayError(error))
}

function RefreshTable() {
    ApiGetBooks()
        .then(() => DisplayBooks())
        .catch((error) => {
            DisplayError(error);
            ShowEmptyTable();
        });
}

function DisplayError(error) {
    //setup everything
    $('#modalTitle').html('Error!')
    $('#modalHeader').css('background-color', '#f08080');
    $('#modalBody').html(error.responseText);
    $('#saveButton').hide();
    $('#workoutModal').modal('show')
