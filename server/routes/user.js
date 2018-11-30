const express = require('express');

var router = express.Router();

var helper = require('../helper/helper');

global.userUrl = 'v5/application/users/login/';
request = '';

router.post('/login', (req, res) => {

  // check if the body is empty
  var emptyBody = helper.isEmpty(req.body);

  // post input validations
  if (emptyBody || req.body.email == '' || req.body.password == '' || req.body.owner == '') {
    return helper.makeResponse(res, false, 400, 'All inputs are mandatory.');
  }

  var loginData = {
    'email': req.body.email,
    'password': req.body.password
  };

  adapter
    .userLogin(loginData)
    .then((result) => {
      return helper.makeArrayResponse(res, true, 200, 'Logged in successfully', result);
    })
    .catch((error) => {
      return helper.makeResponse(res, false, 400, error);
    });
});

router.post('/add/role', (req, res) => {

  // check if the access token is not present
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 200, 'Please provide a valid access token.');
  }

  // check if the body is empty
  var emptyBody = helper.isEmpty(req.body);

  // post input validations
  if (emptyBody || req.body.users == '' || req.body.name == '') {
    return helper.makeResponse(res, false, 400, 'All inputs are mandatory.');
  }

  var postBody = {
    'users': req.body.users,
    'name': req.body.name
  };

  // call the add roles method and handle the response accordingly
  adapter
    .addRoles(req.headers.access_token, postBody)
    .then((result) => {
      return helper.makeArrayResponse(res, true, 200, 'Role created successfully.', result);
    })
    .catch((error) => {
      return helper.makeResponse(res, false, 400, error);
    })
});

module.exports = router;