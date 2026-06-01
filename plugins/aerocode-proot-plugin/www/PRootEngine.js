var exec = require('cordova/exec');

exports.executeCode = function(language, code, success, error) {
    exec(success, error, 'AeroPRoot', 'executeCode', [language, code]);
};

exports.initialize = function(success, error) {
    exec(success, error, 'AeroPRoot', 'initialize', []);
};
