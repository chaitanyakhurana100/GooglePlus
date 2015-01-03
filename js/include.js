/**
 * jQuery initialization
 */
$(document).ready(function() {
  $('#disconnect').click(helper.disconnect);
  $('#loaderror').hide();
});

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult); //Calls onSignInCallback function of helper (Defined at Ln:18 in this file)
}

var helper = (function() {
  var BASE_API_PATH = 'plus/v1/';

  return {

  onSignInCallback: function(authResult) {
      gapi.client.load('plus','v1').then(function() {
        $('#authResult').html('Auth Result:<br/>');
        for (var field in authResult) {
          $('#authResult').append(' ' + field + ': ' +
              authResult[field] + '<br/>');
        }
        if (authResult['access_token']) {
          $('#authOps').show('slow');
          $('#googlePlusButton').hide();
          helper.profile();
          helper.people();
        } else if (authResult['error']) {
          // There was an error, which means the user is not signed in.
          console.log('There was an error: ' + authResult['error']);
          $('#authResult').append('Logged out');
          $('#authOps').hide('slow');
          $('#googlePlusButton').show();
        }
        console.log('authResult', authResult);
      });
    },

    disconnect: function() {
      // Revoke the access token.
      $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
            gapi.auth.getToken().access_token,
        async: false,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(result) {
          console.log('revoke response: ' + result);
          $('#authOps').hide();
          $('#profile').empty();
          $('#visiblePeople').empty();
          $('#authResult').empty();
          $('#googlePlusButton').show();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },

    people: function() {
      gapi.client.plus.people.list({
        'userId': 'me',
        'collection': 'visible'
      }).then(function(res) {
        var people = res.result;
        $('#visiblePeople').empty();
        $('#visiblePeople').append('Number of people visible to this app: ' +
            people.totalItems + '<br/>');
        for (var personIndex in people.items) {
          person = people.items[personIndex];
          $('#visiblePeople').append('<img src="' + person.image.url + '">');
        }
      });
    },

    profile: function(){
      gapi.client.plus.people.get({
        'userId': 'me'
      }).then(function(res) {
        var profile = res.result;
        $('#profile').empty();
        $('#profile').append(
            $('<p><img src=\"' + profile.image.url + '\"></p>'));
        $('#profile').append(
            $('<p>Hello ' + profile.displayName + '!<br />Tagline: ' +
            profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
        if (profile.cover && profile.coverPhoto) {
          $('#profile').append(
              $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
        }
      }, function(err) {
        var error = err.result;
        $('#profile').empty();
        $('#profile').append(error.message);
      });
    }
  };
})();

