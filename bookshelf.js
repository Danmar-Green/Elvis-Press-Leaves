//get the books the person already has
//we need the token

const book_limit = 10;

let books = [];
let conditions = [];
let apiUser = '';
let count = 0;
let page = 1;
let search = '';

// ALL API Calls
function getUser() {
	$.ajax
	({
		type: "GET",
		url: "/api/user",
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			apiUser = data.user;
			displayUser();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function getAllBooks() {
	$.ajax
	({
		type: "POST",
		url: "/api/book",
		data: {
			search: search,
			limit: book_limit,
			page: page,
		},
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			books = data.books;
			count = data.total;
			displayBooks();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function getSingleBook(id){
	$.ajax
	({
		type: "GET",
		url: `/api/book/${id}`,
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			editBook(data.book)
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function getAllConditions() {
	$.ajax
	({
		type: "GET",
		url: "/api/list/conditions",
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			conditions = data.conditions;

			//populate the dropdown
			conditions.forEach(function(e, i){
				$('#bookCondition').append($('<option></option>').val(e.id).text(e.type));
			});
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function saveBookApi(book){
	$.ajax({
		url  : "/api/book/add",
		type : 'post',
		data : book,
		headers: {
			'x-access-token': user.accessToken
		},
		success: function () {
			$('#addeditbook').modal('hide');
			getAllBooks();
			getUser();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function editBookApi(id, book){
	$.ajax({
		url  : `/api/book/${id}`,
		type : 'patch',
		data : book,
		headers: {
			'x-access-token': user.accessToken
		},
		success: function () {
			$('#addeditbook').modal('hide');
			getAllBooks();
			getUser();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function deleteBookApi(id){
	$.ajax({
		url  : `/api/book/${id}`,
		type : 'delete',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function () {
			getAllBooks();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function resetForm() {
	$('#modalTitle').html('');
	$('#bookId').val('');
	$('#bookTitle').val('');
	$('#bookISBN').val('');
	$('#bookAuthor').val('');
}

function addBook(){
	if (apiUser.verified == 0){
		verificationPopup();
		return;
	}

	resetForm();
	$('#modalTitle').html('Add New Book');
	//display the modal
	$('#addeditbook').modal('show');
}

function verificationPopup(){
	$('#verification').modal('show');
}

function getBook(e){
	if (!e || !e.currentTarget || !e.currentTarget.id){
		return;
	}

	getSingleBook(e.currentTarget.id);
}

function editBook(book){
	resetForm();
	$('#modalTitle').html('Edit Book');
	//set pieces
	$('#bookId').val(book.id);
	$('#bookTitle').val(book.title);
	$('#bookISBN').val(book.isbn);
	$('#bookAuthor').val(book.author);
	$('#bookCondition').val(book.condition.id);
	$('#addeditbook').modal('show');
}

function saveBook(){
	//get all the pieces from the form
	const bookId = $('#bookId').val();
	const bookTitle = $('#bookTitle').val();
	const bookISBN = $('#bookISBN').val();
	const bookAuthor = $('#bookAuthor').val();
	const bookCondition = $('#bookCondition').val();

	const book = {
		title: bookTitle,
		isbn: bookISBN,
		author: bookAuthor,
		condition: bookCondition
	}

	if (bookId){
		editBookApi(bookId, book);
	}else{
		saveBookApi(book);
	}
}

function deleteBook(e){
	if (!e || !e.currentTarget || !e.currentTarget.id){
		return;
	}
	deleteBookApi(e.currentTarget.id);
}


function displayBooks(){
	$('#books tbody').empty();
	books.forEach(book => {
		let row = `<tr>
					<td>${book.title}</td>
					<td>${book.isbn}</td>
					<td>${book.author}</td>
					<td>${book.condition.type}</td>
					<td>${book.book_status.type}</td>
					<td><button type="button" id="${book.id}" class="btn btn-primary editBook"><i class="fas fa-edit"></i></button></td>
					<td><button type="button" id="${book.id}" class="btn btn-danger deleteBook"><i class="fas fa-trash-alt"></i></button></td>
				</tr>`
		$('#books tbody').append(row);
	});

	//handle pagination
	handlePagination();
}

function handlePagination() {
	if (count <= book_limit) {
		$('#pagination').hide();
		return;
	}

	$('#pagination').pagination('updateItems', count);
	$('#pagination').pagination('redraw');
}

function displayUser() {
	$('#userEmail').html(apiUser.email);
	$('#userPoints').html(apiUser.profile.points);
}

getUser();
getAllBooks();
getAllConditions();

$(function() {
	$('#pagination').pagination({
		items: count,
		itemsOnPage: book_limit,
		cssStyle: 'light-theme',
		onPageClick: function (pageNumber) {
			page = pageNumber;
			getAllBooks();
		}
	});
});


$("#addBook").click(function(e) {
	e.preventDefault();
	addBook();
});

$("#saveBook").click(function(e){
	e.preventDefault();
	saveBook();
});

$('#search').keyup((e) => {
	if (!e || !e.target){
		return;
	}
	search = e.target.value;
	getAllBooks();
});

$(document).on("click",".editBook", function(e){
	getBook(e);
});

$(document).on("click",".deleteBook", function(e){
	deleteBook(e);
});
