// starting the server
require("./server");

// connecting to the database
require("./src/middleware/database");

// using all the middlewares
require("./src/middleware/config");