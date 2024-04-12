const { app, express } = require("../../../server");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require('helmet');
const xss = require('xss-clean');

// setup all the middleware connections
app.use(express.json(true));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(morgan('dev'));

// logging the current environment server
if (process.env.SERVER === 'development') {
  app.use(morgan('dev'));
  console.log('-' + process.env.SERVER + '-');
} else {
  console.log('-' + process.env.SERVER.trim() + '-');
}

// calling all the routes
require("../../routes");