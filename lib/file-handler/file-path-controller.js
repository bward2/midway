/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
var Path = require('path');
var Fs = require('fs');
var FileUtils = require('./file-handler-utils');
var Utils = require('./../utils/common-utils');
var Logger = require('testarmada-midway-logger');

var internals = {};

/**
 *
 * Provides the core functionality for file-handler related
 * file path logic.
 *
 */

internals.getFilePath = function (data, base, callback) {
  var defaultFileName = this.getDefaultFileName(data);
  var nextValue = FileUtils.getNextValue(data, defaultFileName);
  var sessionId = Utils.getSessionId(data);
  var sessionMockId = Utils.getSessionMockIds();
  var mockId = sessionMockId[sessionId];

  if (mockId !== undefined) {
    Logger.debug('Creating file path based on mockId');

    var directory = Path.join(base, mockId);
    var fileNameByURLCount = defaultFileName + '-' + nextValue;
    var fileNameByURLCountAndCode = new RegExp(defaultFileName + '-' + nextValue + '-code-\\d+', 'i');

    internals.findCodeSpecificFile(directory, fileNameByURLCountAndCode, data, function (codeFilePath) {
      if (codeFilePath) {
        return callback(codeFilePath);
      } else {
        internals.findCountSpecificFile(directory, fileNameByURLCount, data, function (countFilePath) {
          if (countFilePath) {
            return callback(countFilePath);
          } else {
            internals.findDefaultFile(defaultFileName, directory, data, function (defaultFilePath) {
              if (defaultFilePath) {
                return callback(defaultFilePath);
              } else {
                Logger.warn('No file found to respond with for directory: ' + directory);
              }
            });
          }
        });
      }
    });

  } else if (data.options.filePath) {
    var resolvedPath = internals.createCustomLocationFilePath(base, data.options.filePath);
    return callback(resolvedPath);
  } else {
    Logger.debug('Creating file path based on URL');
    internals.createFilePath(data, base, callback);
  }
};

internals.findCodeSpecificFile = function (directory, fileNameByURLCountAndCode, data, callback) {
  Logger.debug('>>>>> Trying to find code specific file');
  FileUtils.selectFileFromDirectory(directory, fileNameByURLCountAndCode, function (filePath) {
    Utils.checkFileExists(filePath, function (exists) {
      if (exists) {
        FileUtils.handleCodeFile('count specific', filePath, data);
        return callback(filePath);
      } else {
        return callback();
      }
    });
  });
};

internals.findCountSpecificFile = function (directory, fileNameByURLCount, data, callback) {
  Logger.debug('>>>>> Trying to find count specific file');
  FileUtils.selectFileFromDirectory(directory, fileNameByURLCount, function (filePath) {
    Utils.checkFileExists(filePath, function (exists) {
      if (exists) {
        Logger.info('Found count specific file without code and returning that as response: ' + filePath);
        return callback(filePath);
      } else {
        return callback();
      }
    });
  });
};

internals.findDefaultFile = function (defaultFileName, directory, data, callback) {
  Logger.debug('>>>>> Returning default file');
  var defaultFileNameWithCode = new RegExp(defaultFileName + '-code-\\d+', 'i');
  Logger.info('Count specific file NOT found. Looking for default file response with ' +
    'code: ' + defaultFileNameWithCode);
  FileUtils.selectFileFromDirectory(directory, defaultFileNameWithCode, function (filePath) {
    Utils.checkFileExists(filePath, function (exists) {
      if (exists) {
        FileUtils.handleCodeFile('default', filePath, data);
        return callback(filePath);
      } else {
        Logger.info('Code specific default file NOT found. Returning default file ' +
          'response: ' + defaultFileName);
        FileUtils.selectFileFromDirectory(directory, defaultFileName, function (defaultFilePath) {
          Utils.checkFileExists(defaultFilePath, function (defaultExists) {
            if (defaultExists) {
              return callback(defaultFilePath);
            } else {
              return callback();
            }
          });
        });
      }
    });
  });
};

internals.createCustomLocationFilePath = function (base, filepath) {
  Logger.debug('Creating file path based on custom file location');
  return Fs.existsSync(filepath) ? filepath : Path.join(base, filepath);
};

internals.createFilePath = function (data, base, callback) {
  var routeMethod = FileUtils.getRouteMethod(data);
  var path = Utils.getPathWithoutSessionIdFromData(data);
  var variant = data.variant;
  FileUtils.selectFileFromDirectory(Path.join(base, path, routeMethod), (variant.id && variant.id()) || variant, callback);
};

internals.getDefaultFileName = function (data) {
  // Get the filename for the url to respond
  var fileFromPath = Utils.getPathWithoutSessionIdFromData(data).replace(/\//g, '-');
  var defaultFileName = fileFromPath.indexOf('-') === 0 ? fileFromPath.substring(1) : fileFromPath;
  if (defaultFileName) {
    defaultFileName = defaultFileName + '-' + FileUtils.getRouteMethod(data);
  } else {
    defaultFileName = FileUtils.getRouteMethod(data);
  }
  Logger.debug('Default file name: ' + defaultFileName);
  return defaultFileName;
};


module.exports = internals;
