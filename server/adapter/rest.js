var request = require('request');

class Rest {

  constructor() {

    // check if the baseUrl doesn't exist then assign the value
    if (!this.baseUrl) {
      this.baseUrl = 'https://manage.built.io/';
    }

    this.header = {
      'application_api_key': 'blt8e85ae90546b5e4a',
      'Content-Type': 'application/json'
    }
    this.todoUrl = 'v1/classes/todo/objects/';
  }

  // get all the records using the request query to be fired
  getRecords(accessToken, getParams) {

    // set the header token in the header
    this.header.access_token = accessToken;
    return this.request(this.header, 'GET', this.todoUrl, getParams)
      .then((result) => {
        return result.objects;
      })
  }

  // make the select query for selecting the particular data
  makeSelQuery(getParams) {
    return {
      only: {
        BASE: getParams
      }
    }
  }

  // make the adapter body for sending the post data
  makeBody(objectParams) {
    return {
      object: objectParams
    }
  }

  // save the record to the particular object
  saveRecord(accessToken, insertObject) {

    // set the header token in the header
    this.header.access_token = accessToken;
    return this.request(this.header, 'POST', this.todoUrl, '', insertObject);
  }

  // update the record from the API
  updateRecord(accessToken, updateObject, id) {

    // set the header token in the header
    this.header.access_token = accessToken;
    return this.request(this.header, 'PUT', this.todoUrl, '', updateObject, id);
  }

  // delete record for the particular uid
  deleteRecord(accessToken, id) {
    // set the header token in the header
    this.header.access_token = accessToken;
    return this.request(this.header, 'DELETE', this.todoUrl, '', '', id);
  }

  // make the share record request from the API
  shareRecord(accessToken, roleId, todoId) {

    var aclPostQuery = this.makeShareAcl(roleId);

    // set the header token in the header
    this.header.access_token = accessToken;
    return this.request(this.header, 'PUT', this.todoUrl, '', aclPostQuery, todoId);
  }

  // make the share ACL object for the sharing option
  makeShareAcl(roleId) {
    return this.makeBody({
      'ACL': {
        'roles': [{
          'uid': roleId,
          'read': true,
          'update': true,
          'delete': false
        }]
      }
    });
  }

  // method to make the user login
  userLogin(loginData) {

    loginData = {
      application_user: loginData
    };

    var urlSuffix = 'v5/application/users/login/';
    return this.request(this.header, 'POST', urlSuffix, '', loginData)
      .then((result) => {
        return result.application_user
      });
  }

  // add users for the roles as well as add roles
  addRoles(accessToken, postBody) {

    // set the header token in the header
    this.header.access_token = accessToken;
    var roleUrl = 'v1/classes/built_io_application_user_role/objects';

    postBody = this.makeBody(postBody);

    return this.request(this.header, 'POST', roleUrl, '', postBody)
      .then((result) => {
        return result.object;
      });
  }

  // get the list of the users for which the todo is being shared
  getTodoSharedUsers(accessToken, todoId) {

    this.header.access_token = accessToken;

    return this.request(this.header, 'GET', this.todoUrl, '', '', todoId)
      .then((result) => {

        // check if the roles property is not present then send the reject promise
        if (!result.object.ACL.roles) {
          return Promise.reject('No users available for this todo');
        }

        // fetch the roles in one variable and then pass it to the get the list of the users.
        var roles = result.object.ACL.roles;
        return this.getUsersList(roles);
      })
  }

  // method to get the list of the users which satisfy the criteria for roles
  getUsersList(roles) {

    // role map url
    var roleMapUrl = 'v1/classes/built_io_application_user_role_mapper/objects?include[]=user_uid';

    // define an array and add elements to it
    var users = [];
    roles.forEach(element => {
      users.push(element.uid);
    });

    // specify the query parameters for selecting the type of response
    var getQuery = {
      'query': {
        'role_uid': {
          '$in': users
        }
      },
      'only': {
        'BASE': ['user_uid'],
        'user_uid': ["email"]
      }
    };
    return this.request(this.header, 'GET', roleMapUrl, getQuery)
      .then((result) => {
        if (result.objects.length === 0) {
          return Promise.reject('No users available for this todo');
        }
        return Promise.resolve(result.objects);
      });
  }

  // Upload files on the server
  uploadFile(accessToken, file, todoId) {

    var urlSuffix = 'v1/uploads';

    // change the header content from the header array
    this.header['Content-Type'] = 'multipart/form-data';
    this.header.access_token = accessToken;

    // create the upload object and pass it in the body of the request call
    var formObject = {
      'upload': {
        'upload': file.path
      }
    };

    return this.request(this.header, 'POST', urlSuffix, '', '', '', formObject);
  }

  // request method for sending the request call
  request(headers, method, urlSuffix, getBody = '', postbody = '', id = '', formData = '') {

    var uri = `${this.baseUrl}${urlSuffix}`;

    // check if the id is present and accordingly use the url
    if (id) {
      uri = `${this.baseUrl}${urlSuffix}${id}`;
    }

    // set the request parameters
    var requestParams = this.getRequestParams(headers, uri, postbody, getBody, method);

    // check if the form data is present then only add the form object
    if (formData) {
      requestParams.form = formData ? formData : {};
    }

    // return the promise in the reject and resolve cases
    return new Promise((resolve, reject) => {
      request(requestParams, (err, res, body) => {
        if (body.error_code) {
          reject(body.error_message);
        }
        resolve(body);
      });
    });
  }

  // return the array for the request parameters
  getRequestParams(headers, uri, postbody, getBody, method) {
    return {
      headers,
      uri,
      body: postbody ? postbody : {},
      qs: getBody ? getBody : {},
      json: true,
      method
    };
  }
}

module.exports = Rest;