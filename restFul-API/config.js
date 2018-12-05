/* 
*
*Create a export configuration
*
*/
//Container for all the environments
var environments = {};

//Staging (default) evironment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret':'thisIsASecret'
};
//Production evironment
environments.production = {
    'httpPort': 5000,
    'httpsPort':5001,
    'envName': 'production',
    'hashingSecret':'thisIsAlsoASecret'
};
//Determine witch environment was passed as command-line agument 
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check that the current environment is one of the environments above, if not default staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module
module.exports = environmentToExport;