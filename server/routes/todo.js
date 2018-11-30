const express     = require('express');
const multer      = require('multer');
const fs          = require('fs');
var helper        = require('../helper/helper');
var router        = express.Router();
const path        = require('path');
const uploadPath  = path.join(__dirname, '../../public/uploads/');
var upload        = multer({ dest: uploadPath });

// Get the list of all the todos
router.get('/', (req, res) => {
  
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Authentication required');
  }

  // select the parameters which needs to be returned from the API
  var selQuery = adapter.makeSelQuery(['title', 'description']);

  // call the adapter method to get the records
  adapter
    .getRecords(req.headers.access_token, selQuery)
    .then((objects) => {
      // check for errors
      if (objects.length === 0) {
        return helper.makeArrayResponse(res, false, 400, 'Records not found', []);
      }
      return helper.makeArrayResponse(res, true, 200, 'Records found', objects);
    });
});

// Add a new todo
router.post('/', (req, res) => {

  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Authentication required');
  }

  // check if the body is empty
  var emptyBody = helper.isEmpty(req.body);

  // post input validations
  if (emptyBody || req.body.title == '' || req.body.description == '') {
    return helper.makeResponse(res, false, 400, 'All inputs are mandatory.');
  }

  var insertObject = {
    'title': req.body.title,
    'description': req.body.description,
    "ACL": {
      "others": {
        'read': false,
        'update': false,
        'delete': false
      }
    }
  };

  // make the desired format required for the array
  insertObject = adapter.makeBody(insertObject);

  adapter
    .saveRecord(req.headers.access_token, insertObject)
    .then((result) => {
      if (result.errors) {
        return helper.makeResponse(res, false, 500, 'Unable to save the data');
      }
      return helper.makeResponse(res, true, 200, 'Saved successfully');
    });
});

// update a todo using the id
router.patch('/:id', (req, res) => {

  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Authentication required');
  }

  var id = req.params.id;

  // check if the body is empty
  var emptyBody = helper.isEmpty(req.body);

  // post input validations
  if (emptyBody || req.body.title == '' || req.body.description == '') {
    return helper.makeResponse(res, false, 400, 'All inputs are mandatory.');
  }

  var updateObject = {
    'title': req.body.title,
    'description': req.body.description
  };
  // make the desired format required for the array
  updateObject = adapter.makeBody(updateObject);

  // fire the request and set the operation
  adapter
    .updateRecord(req.headers.access_token, updateObject, id)
    .then((result) => {
      return helper.makeResponse(res, true, 200, 'Updated successfully.');
    })
    .catch((err) => {
      return helper.makeResponse(res, false, 400, err);
    })
});

// delete a todo
router.delete('/:id', (req, res) => {

  // check if the access token is not present then set the validation else run the following code
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Authentication required');
  }

  var id = req.params.id;

  // delete request
  adapter
    .deleteRecord(req.headers.access_token, id)
    .then((result) => {
      return helper.makeResponse(res, true, 200, 'Deleted todo successfully.');
    })
    .catch((err) => {
      return helper.makeResponse(res, false, 400, err);
    })
});

// share the todo with the users
router.get('/share', (req, res) => {

  var roleId = req.query.roleId;
  var todoId = req.query.todoId;

  // check if the access token is not present
  if (!roleId || !todoId) {
    return helper.makeResponse(res, false, 400, 'Please provide a valid data.');
  }

  // check if the access token is not present
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Please provide a valid access token.');
  }

  // fire the request and set the operation
  adapter
    .shareRecord(req.headers.access_token, roleId, todoId)
    .then((result) => {
      return helper.makeResponse(res, true, 200, 'Permission granted successfully.');
    })
    .catch((error) => {
      return helper.makeResponse(res, false, 200, error);
    })
});

// Method to get the list of the users for which the todo is been shared
router.get('/users/:todoId', (req, res) => {

  // check if the access token is not present
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Please provide a valid access token.');
  }
  var todoId = req.params.todoId;

  adapter
    .getTodoSharedUsers(req.headers.access_token, todoId)
    .then((result) => {
      return helper.makeArrayResponse(res, true, 200, 'Records listed successfully.', result);
    })
    .catch((error) => {
      return helper.makeArrayResponse(res, false, 400, error, []);
    })
});

// upload a file from here
router.post('/upload/:todoId', upload.single('image'), (req, res) => {

  var todoId = req.params.todoId;

  // check if the access token is not present
  if (!req.headers.access_token) {
    return helper.makeResponse(res, false, 400, 'Please provide a valid access token.');
  }

  // check if the request file is not present then return the error response
  if (!req.file) {
    return helper.makeResponse(res, false, 400, 'Please provide a file to upload.');
  }

  var file = fs.createReadStream(req.file.path);
  adapter
    .uploadFile(req.headers.access_token, file, todoId)
    .then((result) => {
      return helper.makeResponse(res, true, 200, 'Uploaded successfully.');
    })
    .catch((error) => {
      return helper.makeResponse(res, false, 400, error);
    })
});

module.exports = router;