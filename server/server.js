const express = require('express');
const path = require('path');
const config = require('./config');
const port = process.env.PORT || config.PORT;
const app = express();

app.use(express.static(__dirname));


app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.post('/addArea', function(req, res) {
  require('./addArea.js')(req, res);
});

app.post('/editArea', function(req, res) {
  require('./editArea.js')(req, res);
});

app.post('/deleteArea', (req, res) => {
  require('./deleteArea.js')(req, res);
});

app.post('/defineKPI', function(req, res) {
  require('./defineKPI.js')(req, res);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
