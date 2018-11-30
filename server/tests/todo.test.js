const expect = require('expect');
const supertest = require('supertest');
var fs = require('fs');

var app = require('../../server');

var request = supertest(app);

var insertObject = {
  'email': 'test@test.com',
  'password': 'test'
};

var token;
before((done) => {
  request
    .post('/user/login')
    .send(insertObject)
    .end((error, res) => {
      if (res.body.status === false) {
        return done(new Error(res.body.message));
      }
      token = res.body.response.auth.access_token;
      return done();
    });
});


// Get the list of todos assertion test
describe('GET /todos', function () {

  // no todos should be listed when there is no access token passed
  it('should need authentication to view todos', (done) => {
    request
      .get('/todo')
      .set({
        access_token: ''
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done();
      });
  });

  // list all the todos
  it('should list all the todos', (done) => {
    request
      .get('/todo')
      .set({
        'access_token': token
      })
      .expect(200)
      .end((err, res) => {

        // check if the length of the response is strictly equal to 0
        if (res.body.response.length === 0) {
          expect(res.body.response.length).toEqual(0);
          expect(res.body.status).toBe(true);
          return done();
        }
        expect(res.body.status).toBe(true);
        expect(res.body.response.length).toBeGreaterThan(0);
        done();
      });
  });
});

// Post todos describe block with all the necessary conditions and validations
describe('POST /todos/:id', () => {

  var insertTodo = {
    'title': 'Tester todo',
    'description': 'This is a tester todo description.'
  };

  // Assertion for access token authentication
  it('should need authentication to post todos', (done) => {
    request
      .post('/todo')
      .set({
        'access_token': ''
      })
      .send(insertTodo)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion for empty post data validation
  it('should not post todo if the post data is empty', (done) => {
    request
      .post('/todo')
      .set({
        'access_token': token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion for creating a new todo
  it('should post a todo', (done) => {
    request
      .post('/todo')
      .set({
        'access_token': token
      })
      .send(insertTodo)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe(true);
        done()
      });
  });
});

// Update todos describe block with all the assertions
describe('UPDATE /todos', () => {

  var id = 'blt452ec227e7aefaba';
  var updateTodo = {
    'title': 'new updation',
    'description': 'This todo is being updated.'
  };

  // Assertion for access token authentication
  it('should need authentication to update todos', (done) => {
    request
      .patch(`/todo/${id}`)
      .set({
        'access_token': ''
      })
      .send(updateTodo)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion for empty post data validation
  it('should not update todo if the update data is empty', (done) => {
    request
      .patch(`/todo/${id}`)
      .set({
        'access_token': token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion for updating the todo when the user is authenticated and the post data is valid
  it('should update the todo', (done) => {
    request
      .patch(`/todo/${id}`)
      .set({
        'access_token': token
      })
      .send(updateTodo)
      .expect(200)
      .end((err, res) => {
        if (res.body.status === false) {
          expect(res.body.status).toBe(false);
          return done(new Error(res.body.message));
        }
        expect(res.body.status).toBe(true);
        return done();
      });
  });
});

// Delete todos describe block with all the assertions
describe('DELETE /todos/:id', () => {

  var id = 'blt1d7b44780c8d3872';

  // Assertion for access token authentication
  it('should need authentication to delete todos', (done) => {
    request
      .delete(`/todo/${id}`)
      .set({
        'access_token': {}
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion for deleting a todo
  it('should delete a todo', (done) => {

    request
      .delete(`/todo/${id}`)
      .set({
        'access_token': token
      })
      .expect(200)
      .end((err, res) => {
        if (res.body.status === false) {
          expect(res.body.status).toBe(false);
          done(new Error(res.body.message));
        }
        expect(res.body.status).toBe(true);
        done();
      });
  });
});

// Share the todos with the other users
describe('Share Todo /share', () => {

  var queryParams = {
    roleId: 'blt417393160dac39f8',
    todoId: 'blt452ec227e7aefaba'
  };

  // assertion for authentication for the todos
  it('should be authenticated to share the todos', (done) => {
    request
      .get('/todo/share')
      .set({
        'access_token': ''
      })
      .query(queryParams)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // assertion if the query params are not present
  it('should not be processed if the query params are not present', (done) => {
    request
      .get('/todo/share')
      .set({
        'access_token': token
      })
      .query({})
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done()
      });
  });

  // test case for sharing the todo
  it('should share todo', (done) => {

    request
      .get('/todo/share')
      .set({
        'access_token': token
      })
      .query(queryParams)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe(true);
        done();
      })
  });
});

// Get the list of the users through which the todo is being shared
describe('GET todo shared users', () => {

  var todoId = 'blt452ec227e7aefaba';

  // assertion for authentication to list the shared users
  it('should be authenticated to list the shared users', (done) => {
    request
      .get(`/todo/users/${todoId}`)
      .set({
        'access_token': ''
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done();
      });
  });

  // get call for listing all the users for which the todo is being saved
  it('should list all the users with whom the todo is shared', (done) => {

    request
      .get(`/todo/users/${todoId}`)
      .set({
        'access_token': token
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe(true);
        expect(res.body.response.length).toBeGreaterThan(0);
        done();
      });
  });
});

// UPLOAD a file for a todo
describe('UPLOAD file for todo', () => {

  var todoId = 'blt452ec227e7aefaba';

  var file = fs.createReadStream('/home/akash/Pictures/new.png');

  // assertion for authentication to upload file for todo
  it('should be authenticated to upload any file for a todo', (done) => {
    request
      .post(`/todo/upload/${todoId}`)
      .set({
        'access_token': ''
      })
      .attach('image', file.path)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done();
      });
  });

  // assertion for file validation
  it('should not upload if the file is not present', (done) => {
    request
      .post(`/todo/upload/${todoId}`)
      .set({
        'access_token': token
      })
      .attach('image', '')
      .expect(400)
      .end((err, res) => {
        expect(res.body.status).toBe(false);
        done();
      });
  });

  // assertion for uploading any file for a todo
  it('should upload a file for a particular todo', (done) => {
    request
      .post(`/todo/upload/${todoId}`)
      .set({
        'access_token': token,
        'Content-Type': 'multipart/form-data'
      })
      .attach('image', file.path)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe(true);
        done();
      });
  });
});