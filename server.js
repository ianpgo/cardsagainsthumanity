var express = require('express'),
    morgan  = require('morgan'),
    app = express();
    http = require('http').Server(app),
    path = require('path');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(morgan('dev'));  // Log requests

app.use(express.static(path.join(__dirname, 'public'))); // Process static files

var io = require('socket.io').listen(http);

http.listen(server_port, server_ip_address);
console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), server_ip_address, server_port);

var gameSockets = require('./routes/serverSocket.js');
gameSockets.init(io);


// // var gameSockets = require('./routes/serverSocket.js');

// // Create a class that will be our main application
// var SimpleStaticServer = function() {

//   // set self to the scope of the class
//   var self = this;  
  
//   /*  ================================================================  */
//   /*  App server functions (main app logic here).                       */
//   /*  ================================================================  */

//   self.app = express();
//   //	self.app.use(connect(connect.basicAuth('j', 'jmjm')))
//   self.app.use(morgan('dev'));	// Log requests
//   self.app.use(express.static(path.join(__dirname, 'public')));	// Process static files

//   //configure sockets
//   var httpServer = http.Server(self.app);
//   var io = require('socket.io').listen(httpServer);



//   // Start the server
//   self.start = function() {
//     /*
//      * OpenShift will provide environment variables indicating the IP 
//      * address and PORT to use.  If those variables are not available
//      * (e.g. when you are testing the application on your laptop) then
//      * use default values of localhost (127.0.0.1) and 33333 (arbitrary).
//      */
//     self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
//     self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

//     //  Start listening on the specific IP and PORT
//     self.app.listen(self.port, self.ipaddress, function() {
//       console.log('%s: Node server started on %s:%d ...',
//                         Date(Date.now() ), self.ipaddress, self.port);
//     });
//   };

//   // gameSockets.init(io);

// }; 


// /**
//  *  main():  Main code.
//  */
// var sss = new SimpleStaticServer();
// sss.start();

