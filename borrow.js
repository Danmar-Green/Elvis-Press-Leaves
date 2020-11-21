//get our list of books
const book_limit = 10;

let books = [];
let count = 0;
let page = 1;
let search = '';

let selectedBook = 0;
let selectedBookOwner = 0;

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
		type: "post",
		url: "/api/book/search",
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

function borrowBook(e) {
	if (!e || !e.currentTarget || !e.currentTarget.id){
		return;
	}

	//make sure the user is verified
	if (apiUser.verified == 0){
		verificationPopup();
		return;
	}

	const button = $(e.currentTarget);

	selectedBook = e.currentTarget.id;
	selectedBookOwner = button.data('owner');
	const bookTitle = button.data('title');
	const bookISBN = button.data('isbn');

	$('#book-info').html(`${bookTitle} - ${bookISBN}`);
	$('#request').modal('show');


	//TODO compensate for requested books???

	//set book to not available, reduce points
	//

	//add pagination to profile page

	//add return book to profile page

	//add author to book model


	//send request to the backend
}

function requestBook(){
	$.ajax
	({
		type: "post",
		url: "/api/request",
		data: {
			bookId: selectedBook,
			ownerId: selectedBookOwner,
			borrower: apiUser.id,
		},
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			selectedBook = 0;
			selectedBookOwner = 0;
			$('#request').modal('hide');

			$('#successfulRequest').modal('show');
			//TODO get list of my unapproved requests,
			//TODO remove book from list of books based on requests, update totals
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function verificationPopup(){
	$('#verification').modal('show');
}

function displayBooks(){
	$('#books tbody').empty();
	books.forEach(book => {
		let row = `<tr><td>${book.title}</td><td>${book.isbn}</td><td>${book.condition.type}</td><td>${book.book_status.type}</td><td><button data-owner="${book.userId}" data-title="${book.title}" data-isbn="${book.isbn}" type="button" id="${book.id}" class="btn btn-primary borrowBook"><i class="fas fa-book"></i></button></td></tr>`
		$('#books tbody').append(row);
	});

	//handle pagination
	handlePagination();
}

function declineBook(){
	//close the modal, nothing else to do
	selectedBook = 0;
	selectedBookOwner = 0;
	$('#request').modal('hide');
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

$('#search').keyup((e) => {
	if (!e || !e.target){
		return;
	}
	search = e.target.value;
	getAllBooks();
});

$(document).on("click", "#borrow-yes", function(){
	requestBook();
});

$(document).on("click", "#borrow-no", function(){
	declineBook();
});

$(document).on("click",".borrowBook", function(e){
	borrowBook(e);
});

