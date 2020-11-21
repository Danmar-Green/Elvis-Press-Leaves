const request_limit = 10;

let requests = [];
let count = 0;
let page = 1;
let filter = ''

function getAllRequests() {
	$.ajax
	({
		type: "post",
		url: "/api/request/filter",
		data: {
			filter: filter,
			limit: request_limit,
			page: page,
		},
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data){
			requests = data.requests;
			count = data.total;
			displayRequests();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	},'json');
}

function approveRequestApi(requestId) {
	$.ajax
	({
		type: "post",
		url: "/api/request/approve",
		data: {
			request: requestId,
		},
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (){
			getAllRequests();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	},"json");
}

function declineRequestApi(requestId) {
	$.ajax
	({
		type: "post",
		url: "/api/request/decline",
		data: {
			request: requestId,
		},
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (){
			getAllRequests();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	},"json");
}

function displayRequests(){
	$('#requests tbody').empty();
	requests.forEach(request => {
		let status = 'Un-Approved';
		let approveButton = `<button class="approve-request btn btn-success btn-sm" data-request="${request.id}">Approve</button>`;
		let declineButton = `<button class="decline-request btn btn-danger btn-sm" data-request="${request.id}">Decline</button>`;
		if (request.approvalStatusId != 1){
			approveButton = '';
			declineButton = '';
		}
		if (request.approvalStatusId == 2){
			status = 'Approved';
		}
		if (request.approvalStatusId == 3){
			status = 'Declined';
		}

		//let's do the date
		// Apply each element to the Date function
		var d = new Date(request.createdAt);
		let row = `<tr><td>${request.book.title}</td><td>${request.book.isbn}</td><td>${request.user.email}</td><td>${status}</td><td>${d.toDateString()}</td><td>${approveButton}</td><td>${declineButton}</td></tr>`;
		$('#requests tbody').append(row);
	});

	//handle pagination
	handlePagination();
}

function approveRequest(e){
	if (!e || !e.target){
		return;
	}

	const button = $(e.target);
	const requestId = button.data('request');
	approveRequestApi(requestId);
}

function declineRequest(e){
	if (!e || !e.target){
		return;
	}

	const button = $(e.target);
	const requestId = button.data('request');
	declineRequestApi(requestId);
}

function handlePagination() {
	if (count <= request_limit) {
		$('#pagination').hide();
		return;
	}

	$('#pagination').pagination('updateItems', count);
	$('#pagination').pagination('redraw');
}

getAllRequests();

$(function() {
	$('#pagination').pagination({
		items: count,
		itemsOnPage: request_limit,
		cssStyle: 'light-theme',
		onPageClick: function (pageNumber) {
			page = pageNumber;
			getAllRequests();
		}
	});
});

$(document).on('click','.approve-request', (e) => {
	approveRequest(e);
});

$(document).on('click','.decline-request', (e) => {
	declineRequest(e);
});
