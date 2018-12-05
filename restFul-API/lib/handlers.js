/*
 * Request Handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Define all the handlers
var handlers = {};

// Ping
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found
handlers.notFound = function(data,callback){
  callback(404);
};

// Users
handlers.users = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users  = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    // Make sure the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._users.get = function(data,callback){
  //Chek the that the phone number exists
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    //Lookup the user
    _data.read('users', phone,(err,data) => {
        if(!err){
            //Remove the hash password from the user object before returning it to the request
            delete data.hashedPassword;
            callback(200, data);
        }
        else{
            callback(404);
        }
    });
  }
  else{
    callback(400, {'Error': 'Missing required field'});
  }
};

// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = function(data,callback){
  //Check the required filed
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false; 
  
  //Check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  //Error if the phone is invalid
  if(phone){
    if(firstName || lastName || password){
        //Lookup for the user
        _data.read('users',phone, (err,userData) =>{
            if(!err && userData){
              //Update the fields
                if(firstName){
                    userData.firstName = firstName;
                }
                if(lastName){
                    userData.lastName = lastName;
                }
                if(password){
                    userData.hashedPassword = helpers.hash(password);
                }
                //Store the new updates
                _data.update('users', phone, userData, (err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        console.log(err);
                        callback(500, {'Error':'Could not update the user'});
                    }
                });      
            }
            else{
                callback(400, {'Error':'This speciefied user does not exists'});
            }
        });
    }
    else{
        callback(400, {'Error': 'Missing field to update'});
    }
  }
  else{
      callback(400, {'Error': 'Missing required field'});
  }

};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function(data,callback){
  //Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    //Lookup the user
    _data.read('users', phone,(err,data) => {
        if(!err){
            _data.delete('users',phone, (err)=>{
                if(!err){
                    callback(200);
                }
                else{
                    callback(500,{'Error':'Could not delete the specidfied user'})
                }
            });
        }
        else{
            callback(400,{'Error': 'Could not find the specidfied user'});
        }
    });
  }
  else{
    callback(400, {'Error': 'Missing required field'});
  }
};


// Tokens
handlers.tokens = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

//Conteiner for all the tokens
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data,callback){
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if(phone && password){
    // Lookup the user who matches that phone number
    _data.read('users',phone,(err,userData)=>{
      if(!err && userData){
        // Hash the sent password, and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password);
        if(hashedPassword == userData.hashedPassword){
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          };

          // Store the token
          _data.create('tokens',tokenId,tokenObject,function(err){
            if(!err){
              callback(200,tokenObject);
            } else {
              callback(500,{'Error' : 'Could not create the new token'});
            }
          });
        } else {
          callback(400,{'Error' : 'Password did not match the specified user\'s stored password'});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field(s).'})
  }
};

//Tokens - get
//Required data : id
//Optional data : none
handlers._tokens.get = function(data,callback){
  //Chek the that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    //Lookup the user
    _data.read('tokens', id,(err,tokenData) => {
        if(!err && tokenData){
            callback(200, tokenData);
        }
        else{
            callback(404);
        }
    });
  }
  else{
    callback(400, {'Error': 'Missing required field'});
  }
};

//Tokens - put
//Required data: id , extend
//Optional data: none
handlers._tokens.put = function(data,callback){
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){
    _data.read('tokens', id, (err,tokenData) =>{
      if(!err && tokenData){
        //Check to make sure the token ins't already expired
        if(tokenData.expires > Date.now()){
          //Set the expiration and hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          //Store the new updates
          _data.update('tokens', id, tokenData, (err)=>{
            if(!err){
              callback(200);
            }else{
              callback(500, {'Error':'Could not update the tokens expiration'});
            }
          });
        }else{
          callback(400, {'Error':'The token already expired, and can not be extended'});
        }
      }else{
        callback(400,{'Error':'Espified token does not exist'});
      }
    });
  }else{
    callback(400, {'Error':'Missing required fields or fields are invalid'});
  }
};

//Tokens - delete
//Required data: id
//Optional data: none
handlers._tokens.delete = function(data,callback){
  //Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    //Lookup the token
    _data.read('tokens', id,(err,data) => {
        if(!err){
            _data.delete('tokens',id, (err)=>{
                if(!err){
                    callback(200);
                }else{
                  callback(500,{'Error':'Could not delete the specidfied token'})
                }
            });
        }else{
          callback(400,{'Error': 'Could not find the specidfied token'});
        }
    });
  }else{
    callback(400, {'Error': 'Missing required field'});
  }
};



// Export the handlers
module.exports = handlers;