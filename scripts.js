const cellCount = 7
let books = [];

$(document).ready(function(){
    InitApp();
    $(document).on('click', "#add_Book", ()=> addBookFromDialog())
    $(document).on('click','#addBook',() => DisplayAddBook());
    $(document).on('click','.delete-row',(e) => DeleteBook(e));
    $(document).on('click','.edit-row',(e) => EditBook(e));
    $(document).on('click','#saveButton',() => SaveBook());
});

function InitApp() {
   RefreshTable();
}

function ApiGetBooks() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/addbooks`,
            type: 'get',
            dataType: 'json',
            success: (data) => {
                books = data;
                resolve();
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

function ApiGetBooks(bookId){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/addbooks/${bookId}`,
            type: 'get',
            dataType: 'json',
            success: (data) => {
                resolve(data);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

function ApiSaveBook(book, bookId) {
    const url = bookId ? `/addbooks/${bookId}` : `/addbooks`;
    const type = bookId ? 'patch' : 'post';
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: type,
            data: books,
            dataType: 'json',
            success: () => {
                resolve();
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

function ApiDeleteBook(bookId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/addbooks/${bookId}`,
            type: 'delete',
            dataType: 'json',
            success: () => {
                resolve();
            },
            error: (error) => {
                reject(error);
            },
        })
    })
}

function DisplayBook() {
    if (!books || books.length === 0){
        ShowEmptyTable();
        return;
    }

    ClearTable();
    const bookTable = books.map(x => {
       return `
        <tr>
            <td scope="col">${x.title}</td>
            <td scope="col">${x.author}</td>
            <td scope="col">${x.points}</td>
            <td scope="col">${x.ISBN}</td>
            <td scope="col">${x.condition}</td>
			<td scope="col"><input data-id="${x.id}" data-points="${x.points}" type="checkbox" class="selectBook" value="true"></td>
            <td title="Edit" scope="col" class="pointer edit-row" data-id="${x.id}"><i class="fas fa-edit fa-2x"></i></td>
            <td title="Delete" scope="col" class="pointer delete-row" data-id="${x.id}"><i class="fas fa-trash-alt fa-2x"></i></td>
        </tr>`;
    });
    $('#tableBody').html(bookTable);
}

function getCheckedBooks() { //trigged on a button click
	var selectedBooks = [];
	var pointTotal = 0;
	$('input:checkbox.selectBook').each(function () {
		if (this.checked){
			var points = parseInt(this.data('points')); //turn into integer
			pointTotal += points;
			var bookId = this.data('id');
			selectedBooks.push(bookId);
		}
	});

	//check to see if the pointTotal is greater than the points the person has

	//send the list of selected books to the backend if they have enough points

	//wait for the response and update the list of available books

}

function ShowEmptyTable() {
    ClearTable();
    const emptyRow = `<tr><td colspan="${cellCount}">No Books Available</td></tr>`;
    $('#tableBody').html(emptyRow);
}

function ClearTable() {
    $('#tableBody').html('');
}

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
    const bookId = books[0];
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
        const bookObj =  formArray.find(x => x.name === 'bookid');
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
    //get book id
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
