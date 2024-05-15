const express = require('express');
const routes = require('./routes/index');
import bodyParser from 'body-parser';

const app = express();
const port = process.env.port || 5000;

const app = express();
app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
