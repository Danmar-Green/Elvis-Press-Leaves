let apiProfile = '';

// ALL API Calls
function getProfile() {
	$.ajax
	({
		type: "GET",
		url: "/api/profile",
		dataType: 'json',
		headers: {
			'x-access-token': user.accessToken
		},
		success: function (data) {
			apiProfile = data.profile;
			showProfile();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function saveProfileApi(profile) {
	$.ajax({
		url: `/api/profile`,
		type: 'patch',
		data: profile,
		headers: {
			'x-access-token': user.accessToken
		},
		success: function () {
			getProfile();
		},
		error: function (error) {
			alert(error.responseJSON.message);
		}
	});
}

function editProfile() {
	resetForm();
	$('#modalTitle').html('Edit Profile');
	//set pieces
	$('#address01').val(apiProfile.address01);
	$('#address02').val(apiProfile.address02);
	$('#city').val(apiProfile.city);
	$('#state').val(apiProfile.state);
	$('#zip').val(apiProfile.zip);
	$('#editProfile').modal('show');
}

function validateProfile() {
	const validator = $("#saveProfileForm").validate();
	if(validator.form()){
		$('#editProfile').modal('hide');
		saveProfile();
	}
}

function saveProfile() {
	console.log('here');

	//get all the pieces from the form
	const address01 = $('#address01').val();
	const address02 = $('#address02').val();
	const city = $('#city').val();
	const state = $('#state').val();
	const zip = $('#zip').val();

	const profile = {
		address01,
		address02,
		city,
		state,
		zip
	}

	saveProfileApi(profile);
}

function resetForm() {
	$('#modalTitle').html('');
	//set pieces
	$('#address01').val('');
	$('#address02').val('');
	$('#city').val('');
	$('#state').val('');
	$('#zip').val('');
}

function showProfile(){
	const verifiedClass = apiProfile.user.verified ? 'verified' : 'unverified';
	const verifiedWording = apiProfile.user.verified ? '(verified)' : '(not verified)';

	$('#usernameText').html(user.username);
	$('#emailText').html(apiProfile.user.email);
	$('#pointsText').html(apiProfile.points);

	$('#address01Text').html(apiProfile.address01);
	$('#address02Text').html(apiProfile.address02);

	$('#cityText').html(apiProfile.city);
	$('#stateText').html(apiProfile.state);
	$('#zipText').html(apiProfile.zip);

	$('#verified').html(`<i class="fas fa-check-square ${verifiedClass}"></i> <span class="verify-text">${verifiedWording}</span>`)
}

$("form[name='saveProfileForm']").validate({
	rules: {
		address01: "required",
		city: "required",
		state: "required",
		zip: "required"
	},

	messages: {
		address01: "Please enter your address",
		city: "Please enter your city",
		state: "Please enter your state",
		zip: "Please enter your zip",
	}
});


getProfile();

$('#editProfileButton').click(function (e) {
	e.preventDefault();
	editProfile();
});

$('#saveProfile').click(function (e) {
	e.preventDefault();
	validateProfile();
});


