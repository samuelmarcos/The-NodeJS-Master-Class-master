/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


 // Instantiate the HTTP server
var httpServer = http.createServer(function(req,resp){
  unifiedServer(req,resp);
});

// Start the server
httpServer.listen(config.httpPort, function(){
  console.log("The server is listening on port " + config.httpPort + " now " + " in config " + config.envName + " mode" );
});

//Instantiate de HTTPS server 
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req,resp){
  unifiedServer(req,resp);
});

//Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
  console.log("The server is listening on port " + config.httpsPort + " now " + " in config " + config.envName + " mode" );
});

//All the server logic for both de http and https createServer
var unifiedServer = (req, resp) => {

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  //Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  })
  req.on('end' , () => {
    buffer += decoder.end();

    //Chose de handler this request should go to. If one is not found, use the not found handler.
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //Construc the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject': queryStringObject,
      'method' : method,
      'headers':headers,
      'payload': helpers.parseJSONToObject(buffer)
    };

    //Router the request to the handler specified in the router
    chosenHandler(data , (statuCode, payload) => {
      //Use the status code called by the handler, or default to the 300
      statuCode = typeof(statuCode) == 'number' ? statuCode : 200;

      //Use the payload called back by the handler or default to 200
      payload = typeof(payload) == 'object' ? payload : {};

      //Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      //Return the response
      resp.setHeader('Content-Type', 'application/json');//specify the type of the answer
      resp.writeHead(statuCode);
      resp.end(payloadString);

      console.log("Returning this response :", statuCode, payloadString);
    });
    
  // Log the request/response
  // console.log('Request received on path: '+trimmedPath+' with method: '+method+' and this query string: ',queryStringObject)
  });
};



//Define request router 
var router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens':handlers.tokens,
  'checks':handlers.checks
};