/*

Library for staring and editing data

*/
//Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require('./helpers');
//Conteiner for the module (to be exported)
var lib = {};

//Base directory of the data
lib.baseDir = path.join(__dirname,'/../.data/');

//Write data to a file
lib.create = (dir, file, data, callback) =>{
    //Open the file to writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            //Covert data to string
            var stringData = JSON.stringify(data);
            //Write to a file and close it
            fs.writeFile(fileDescriptor,stringData, err => {
                if(!err){
                    fs.close(fileDescriptor, err =>{
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing new file');
                        }
                    });
                }
                else{
                    callback('Error writing to a new file');
                }
            });
        }
        else{
            callback('Could not create new file, it may already exists');
        }
    });
};


//Read data from a file
lib.read = (dir, file,callback) =>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', (err,data) =>{
        if(!err && data){
            var parsedData = helpers.parseJSONToObject(data);
            callback(false,parsedData);
        }
        else{
            callback(err,data);
        }
    });
};

//Update file inside the file
lib.update = (dir,file,data, callback) =>{
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+', (err,fileDescriptor) => {
        if(!err && fileDescriptor){
            //Covert data to string
            var stringData = JSON.stringify(data);
            //Truncate the file
            fs.ftruncate(fileDescriptor, err=>{
                if(!err){
                    //Write the file and close it
                    fs.writeFile(fileDescriptor, stringData , err =>{
                        if(!err){
                            fs.close(fileDescriptor,err =>{
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback('Error closing existing file');
                                }
                            });
                        }
                        else{
                            callback('Error writing to existing file');
                        }
                    });
                }
                else{
                    callback('Error trucating file');
                }
            });
        }
        else{
            callback('Error, could not open the file, it may not exist');
        }
    });
};

//Delete a file 
lib.delete = (dir,file,callback) =>{
    //Unlink the file from the file system
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err) =>{
        if(!err){
            callback(false);
        }
        else{
            callback('Error deleting file');
        }
    });

};




//Export the module
module.exports = lib;