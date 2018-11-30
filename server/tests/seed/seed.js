var request = require('../../request');

var userUrl = 'v5/application/users/login/';

var configHeader = {
  'application_api_key': 'blt8e85ae90546b5e4a',
  'Content-Type': 'application/json'
};

var insertObject = {
  application_user: {
    'email': 'test@test.com',
    'password': 'test'
  }
};

var loginCall = request
  .requestCall(configHeader, 'POST', '', insertObject, '', userUrl)
  .then((result) => {
    if (result.errors) {
      throw new Error('Email and password do not match.');
    }
    return result.application_user.auth.access_token;
  });

module.exports = loginCall;