const express    = require('express');
const bodyParser = require('body-parser');

var app = express();

var port = process.env.port || 3000;

// use the json body parser
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// specify the adapter type i.e. 'rest' or 'sdk' and create a new instance of the adapter and then store it in the global variable to access it everywhere
var adapterType = 'sdk';
var adapter = require(`./server/adapter/${adapterType}`);
adapter = new adapter();
global.adapter = adapter;

var todo = require('./server/routes/todo');
var user = require('./server/routes/user');

app.use('/todo', todo);
app.use('/user', user);

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});

module.exports = app;