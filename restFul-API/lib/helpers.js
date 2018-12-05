//Hepers for varius tasks
/*
Dependencies
*/
var crypto = require('crypto');
var config = require('../config')
//Conteiner for all the helpers
var helpers = {};

//Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else{
        return false;
    }
};

//Parse a JSON string to an object in all case , without throwing
helpers.parseJSONToObject = (str) =>{
    try{
        var obj = JSON.parse(str);
        return obj;
    }
    catch(e){
        return {};
    }
};

//Crete a string of a random alphanumeric characters, of a given lenght
helpers.createRandomString = (strLenght) =>{
    strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
    if(strLenght){
        //Define all characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvxyz0123456789';

        //Start the string as a empty string
        var str = '';
        for (i =1; i <= strLenght; i++){
            //Get random character from the possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
            //Append this character to the final string
            str += randomCharacter;
        }
        //Return the final string
        return str;   
    }
    else{
        return false;
    }
};


//Export the module 
module.exports = helpers;