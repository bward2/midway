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
var Utils = require('./../utils/common-utils');
var SessionManager = require('./../session-manager/session-manager');
var SessionInfo = require('./../session-manager/session-info');
var Logger = require('testarmada-midway-logger');
var Constants = require('../constants');
var config = {
  tags: ['api']
};

module.exports = {

  setMockId: {
    id: 'Midway-SetMockId',
    label: 'Midway - Set Mock Id',
    path: Constants.MIDWAY_API_PATH + '/setMockId/{mockid}/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var mockid = req.params.mockid;
      var sessionId = getSessionIdFromRequest(req);

      Utils.setMockId(mockid, sessionId);
      var currentMockId = Utils.getMockId(sessionId);
      reply({'mockId': currentMockId}).code(200);
    }
  },

  getMockId: {
    id: 'Midway-GetMockId',
    label: 'Midway - Get Mock Id',
    path: Constants.MIDWAY_API_PATH + '/getMockId/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionId = getSessionIdFromRequest(req);
      var currentMockId = Utils.getMockId(sessionId);
      //var currentMockId = getMockId(sessionId);
      reply({'mockId': currentMockId}).code(200);
    }
  },

  resetMockId: {
    id: 'Midway-ResetMockId',
    label: 'Midway - Reset Mock Id',
    path: Constants.MIDWAY_API_PATH + '/resetMockId/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionId = getSessionIdFromRequest(req);
      Utils.resetMockId(sessionId);
      var currentMockId = Utils.getMockId(sessionId);
      reply({'mockId': currentMockId}).code(200);
    }
  },

  resetURLCount: {
    id: 'Midway-ResetURLCount',
    label: 'Midway - Reset URL Count',
    path: Constants.MIDWAY_API_PATH + '/resetURLCount/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionId = getSessionIdFromRequest(req);
      Utils.resetURLCount(sessionId);
      var urlCounts = Utils.getURLCount(sessionId);
      reply(urlCounts).code(200);
    }
  },

  getURLCount: {
    id: 'Midway-GetURLCount',
    label: 'Midway - Get URL Count',
    path: Constants.MIDWAY_API_PATH + '/getURLCount/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionId = getSessionIdFromRequest(req);
      var urlCounts = Utils.getURLCount(sessionId);
      reply(urlCounts).code(200);
    }
  },

  checkSession: {
    id: 'Midway-CheckSession',
    label: 'Midway - Check Session',
    path: Constants.MIDWAY_API_PATH + '/checkSession/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionid = req.params.sessionid;
      var result = SessionManager.checkSession(sessionid);
      reply({'session-status': result}).code(200);
    }
  },

  getSessions: {
    id: 'Midway-GetSessions',
    label: 'Midway - Get Sessions',
    path: Constants.MIDWAY_API_PATH + '/getSessions',
    config: config,
    handler: function (req, reply) {
      var result = SessionInfo.getSessions();
      reply({'sessions': result}).code(200);
    }
  },

  registerSession: {
    id: 'Midway-RegisterSession',
    label: 'Midway - Register Session',
    path: Constants.MIDWAY_API_PATH + '/registerSession',
    config: config,
    handler: function (req, reply) {
      var result = SessionManager.registerSession();
      reply({'session': result}).code(200);
    }
  },

  closeSession: {
    id: 'Midway-CloseSession',
    label: 'Midway - Close Session',
    path: Constants.MIDWAY_API_PATH + '/closeSession/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      var sessionId = req.params.sessionid;
      var mocksPort = req.query.mocksPort;
      var setPort = Utils.getPortInfo()[Constants.HTTP_PORT];

      function isHttpPortSet() {
        return setPort && setPort !== Constants.NOT_AVAILABLE;
      }

      // Set mocksPort, if not already set
      if (!isHttpPortSet() && mocksPort && parseInt(mocksPort) > 0) {
        Logger.info('Setting HTTP port to ', mocksPort);
        Utils.setHttpPort(parseInt(mocksPort));
      }

      SessionManager.closeSession(sessionId, function (result) {
        reply({'session': result}).code(200);
      });
    }
  },

  setLogLevel: {
    id: 'Midway-SetLogLevel',
    label: 'Midway - Set Log Level',
    path: Constants.MIDWAY_API_PATH + '/setloglevel/{loglevel}',
    config: config,
    handler: function (req, reply) {
      var loglevel = req.params.loglevel;
      Logger.setLogLevel(loglevel);
      reply({'loglevel': Logger.getLogLevel()}).code(200);
    }
  },

  getLogLevel: {
    id: 'Midway-GetLogLevel',
    label: 'Midway - Get Log Level',
    path: Constants.MIDWAY_API_PATH + '/getloglevel',
    config: config,
    handler: function (req, reply) {
      var result = Logger.getLogLevel();
      reply({'loglevel': result}).code(200);
    }
  },

  resetLogLevel: {
    id: 'Midway-ResetLogLevel',
    label: 'Midway - Reset Log Level',
    path: Constants.MIDWAY_API_PATH + '/resetloglevel',
    config: config,
    handler: function (req, reply) {
      Logger.resetLogLevel();
      reply({'loglevel': Logger.getLogLevel()}).code(200);
    }
  },

  wildCardSupport: {
    id: 'wildcard',
    method: '*',
    path: '/{p*}',
    label: 'Midway - Wildcard',
    handler: function (req, reply) {
      reply('No route defined for this path')
        .code(404)
        .header(Constants.MOCKED_RESPONSE, false);
    }
  },

  adminRedirect: {
    id: 'admin-redirect',
    method: '*',
    path: '/_admin/{apiPath*}',
    label: 'Midway - Redirect',
    handler: function (req, reply) {
      Logger.info('Received /_admin request. Redirecting to /midway/' + req.params.apiPath);
      reply.redirect('/midway/' + req.params.apiPath);
    }
  }

};

function getSessionIdFromRequest(req) {
  var sessionId = req.params.sessionid;
  Logger.debug('Session id from request :' + sessionId);
  if (!sessionId || sessionId === Constants.SESSIONID) {
    sessionId = Constants.DEFAULT_SESSION;
  }
  Logger.debug('Setting session id to ' + sessionId);
  return sessionId;
}
