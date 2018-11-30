const fs = require('fs');
var Built = require('built.io');

class Sdk {

  // initialize the variables
  constructor() {

    if (!this.app) {
      this.app = Built.App('blt8e85ae90546b5e4a');
    }
    this.Class = this.app.Class('todo');
    this.query = this.Class.Query();
    this.dbObject = this.Class.Object;
  }

  // make the select query for selecting the particular data
  makeSelQuery(onlyArray) {
    return this.query.only(onlyArray);
  }

  // get all the listing of the records
  getRecords(accessToken) {

    this.query = this.query.setHeader('access_token', accessToken);
    this.query = this.query.only(['title', 'description']);
    return this.query.exec();
  }

  // make the adapter body for sending the post data
  makeBody(objectParams) {
    return objectParams;
  }

  // method to save the data from the API 
  saveRecord(accessToken, insertObject) {

    var acl = insertObject.ACL;
    delete insertObject.ACL;

    var saveObject = this.dbObject(insertObject);
    // set the header
    saveObject = saveObject.setHeader('access_token', accessToken);

    // set the ACL and delete the ACL from the insertObject array
    acl = Built.ACL(acl);
    saveObject = saveObject.setACL(acl);
    return saveObject.save();
  }

  // update the record from the API
  updateRecord(accessToken, updateData, id) {

    updateData.uid = id;

    var updateObject = this.dbObject(updateData);
    updateObject = updateObject.setHeader('access_token', accessToken);
    return this.makePromise(updateObject.save());
  }

  // delete the record
  deleteRecord(accessToken, id) {

    var deleteObject = this.dbObject(id);
    deleteObject = deleteObject.setHeader('access_token', accessToken);
    return this.makePromise(deleteObject.delete());
  }

  // method to share the object for the particular users 
  shareRecord(accessToken, roleId, todoId) {

    var acl = this.makeShareAcl(roleId);
    acl = Built.ACL(acl);

    var updateObject = this.dbObject({
      'uid': todoId
    });
    updateObject = updateObject.setHeader('access_token', accessToken);
    updateObject = updateObject.setACL(acl);
    return this.makePromise(updateObject.save());
  }

  // make the share ACL object for the sharing option
  makeShareAcl(roleId) {
    return {
      'roles': [{
        'uid': roleId,
        'read': true,
        'update': true,
        'delete': false
      }]
    }
  }

  // method to make the user login using username and password
  userLogin(loginData) {

    var user = this.app.User();
    var loginRequest = user.login(loginData.email, loginData.password);
    return this.makePromise(loginRequest);
  }

  // add users for the roles as well as add roles
  addRoles(accessToken, postBody) {

    var role = this.app.Role();
    role = role
      .setName(postBody.name)
      .addUsers(postBody.users)
      .setHeader('access_token', accessToken);
    return this.makePromise(role.save());
  }

  // method for returning the promise with the help of resolve and reject block
  makePromise(promiseMethod) {

    return new Promise((resolve, reject) => {
      return promiseMethod
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error.entity.error_message);
        });
    })
  }

  // get the list of the todos shared by the users
  getTodoSharedUsers(accessToken, todoId) {

    var todo = this.Class.Object(todoId);

    return todo.fetch()
      .then((result) => {
        var rolesObject = result.getACL().toJSON();
        return this.getUsersList(rolesObject.roles);
      });
  }

  // get the list of the users matching the role
  getUsersList(role) {

    var roles = [];
    role.forEach(element => {
      roles.push(element.uid);
    });

    var query = this.app.Class('built_io_application_user_role_mapper').Query();
    query = query.containedIn('role_uid', roles)
      .include(['user_uid'])
      .only(['user_uid'])
      .onlyReference('user_uid', ['email']);

    return query
      .toJSON()
      .exec()
      .then((result) => {
        return Promise.resolve(result);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  // upload files on the server
  uploadFile(accessToken, file, todoId) {

    var upload = this.app.Upload();
    upload = upload.setFile(file.path);
    return upload
      .save()
      .then((result) => {

        fs.unlink(file.path);
        // fetch the uploaded object and then save the uid for the particular todo
        var uploadId = result.toJSON().uid;
        var updateObject = this.dbObject({
          'uid': todoId
        })
          .pushValue('uploads', uploadId);
        updateObject = updateObject.setHeader('access_token', accessToken);
        return this.makePromise(updateObject.save());
      });
  }

}

module.exports = Sdk;