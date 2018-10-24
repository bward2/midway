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
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var Expect = require('chai').expect;
var midway = require('../../lib/index');
var Constants = require('../../lib/constants');
var servers = MidwayServer.getServers();
var Logger = require('testarmada-midway-logger');

servers.forEach(function (server) {
  describe('midway-system-routes-tests - ' + server.app, function () {

    it('check rest API setMockID exists and id can be set', function (done) {
      try {
        server
        .get(Constants.MIDWAY_API_PATH + '/setMockId/id1')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.mockId).to.equal('id1');
          done();
        });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API setMockID exists and id can be set with sessions', function (done) {
      try {
        var sessionId = midway.registerSession();
        server
          .get(Constants.MIDWAY_API_PATH + '/setMockId/id1/' + sessionId)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal('id1');
            server
              .get(Constants.MIDWAY_API_PATH + '/getMockId/' + sessionId)
              .expect('Content-type', /json/)
              .end(function (err, res) {
                Expect(err).to.equal(null);
                Expect(res.status).to.equal(200);
                Expect(res.body.mockId).to.equal('id1');
                closeSession(sessionId, done);
              });
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API setMockID exists and id is set with default if sessionid is passed instead of actual session', function (done) {
      try {
        var sessionId = midway.registerSession();
        server
          .get(Constants.MIDWAY_API_PATH + '/setMockId/id1/sessionid')
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal('id1');
            server
              .get(Constants.MIDWAY_API_PATH + '/getMockId/sessionid')
              .expect('Content-type', /json/)
              .end(function (err, res) {
                Expect(err).to.equal(null);
                Expect(res.status).to.equal(200);
                Expect(res.body.mockId).to.equal('id1');
                closeSession(sessionId, done);
              });
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });


    it('check rest API resetMockID exists and id can be reset to none', function (done) {
      try {
        server
          .get(Constants.MIDWAY_API_PATH + '/resetMockId')
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal(undefined);
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API resetMockID exists and id can be reset to none with session', function (done) {
      try {
        var sessionId = midway.registerSession();
        server
          .get(Constants.MIDWAY_API_PATH + '/resetMockId/' + sessionId)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal(undefined);
            server
              .get(Constants.MIDWAY_API_PATH + '/getMockId/' + sessionId)
              .expect('Content-type', /json/)
              .end(function (err, res) {
                Expect(err).to.equal(null);
                Expect(res.status).to.equal(200);
                Expect(res.body.mockId).to.equal(undefined);
                closeSession(sessionId, done);
              });
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API getMockID exists', function (done) {
      try {
        server
          .get(Constants.MIDWAY_API_PATH + '/getMockId')
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal(undefined);
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API getMockID exists with session', function (done) {
      try {
        var sessionId = midway.registerSession();
        server
          .get(Constants.MIDWAY_API_PATH + '/getMockId/' + sessionId)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.mockId).to.equal(undefined);
            closeSession(sessionId, done);
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check redirect /_admin to /midway works', function (done) {
      try {
        server
          .get('/_admin/api/getMockId')
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(res.status).to.equal(302);
            Expect('Location', '/midway/api/getMockId');
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check if getMockID returns correct value after setting mockId', function (done) {
      midway.setMockId('123');
      try {
        server
        .get(Constants.MIDWAY_API_PATH + '/getMockId')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.mockId).to.equal('123');
          Expect(midway.getMockId()).to.equal('123');
          done();
        });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check if getMockID returns correct value after setting mockId and sesssionId', function (done) {
      var sessionId = midway.registerSession();
      midway.setMockId('123', sessionId);
      try {
        server
            .get(Constants.MIDWAY_API_PATH + '/getMockId/' + sessionId)
            .expect('Content-type', /json/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.body.mockId).to.equal('123');
              Expect(midway.getMockId(sessionId)).to.equal('123');
              closeSession(sessionId, done);
            });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API getURLCount exists', function (done) {
      try {
        server
        .get(Constants.MIDWAY_API_PATH + '/getURLCount')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.count).to.equal(undefined);
          done();
        });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API getURLCount exists with sessionId', function (done) {
      var sessionId = midway.registerSession();
      try {
        server
            .get(Constants.MIDWAY_API_PATH + '/getURLCount/' + sessionId)
            .expect('Content-type', /json/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.body.count).to.equal(undefined);
              closeSession(sessionId, done);
            });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check rest API resetURLCount exists', function (done) {
      try {
        server
        .get(Constants.MIDWAY_API_PATH + '/resetURLCount')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.count).to.equal(undefined);
          done();
        });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });


    it('check rest API resetURLCount exists with parallel sessions', function (done) {
      try {
        var sessionId = midway.registerSession();
        server
          .get(Constants.MIDWAY_API_PATH + '/resetURLCount/' + sessionId)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.body.count).to.equal(undefined);
            closeSession(sessionId, done);
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check non mocked route - should return friendly message ', function (done) {
      try {
        server
            .get('/xyz')
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(404);
              Expect(res.text).to.equal('No route defined for this path');
              done();
            });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('check non mocked route - should set mocked-response header to false', function (done) {
      try {
        server
          .get('/xyz')
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(404);
            Expect(res.text).to.equal('No route defined for this path');
            Expect(res.header[Constants.MOCKED_RESPONSE]).to.equal('false');
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });


    it('Verify log level can be set', function (done) {
      try {
        server
          .get(Constants.MIDWAY_API_PATH + '/setloglevel/DEBUG')
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            var result = Logger.getLogLevel();
            Expect(res.text).to.equal('{"loglevel":"debug"}');
            Expect(result).to.equal('debug');
            Logger.setLogLevel('info');
            var result = Logger.getLogLevel();
            Expect(result).to.equal('info');
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('Verify log level can be retrieved', function (done) {
      try {
        server
          .get(Constants.MIDWAY_API_PATH + '/getloglevel')
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            Expect(res.text).to.equal('{"loglevel":"info"}');
            done();
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

    it('Verify log level can be re-set', function (done) {
      try {
        server
          .get(Constants.MIDWAY_API_PATH + '/setloglevel/DEBUG')
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res.status).to.equal(200);
            var result = Logger.getLogLevel();
            Expect(res.text).to.equal('{"loglevel":"debug"}');
            Expect(result).to.equal('debug');
            server
              .get(Constants.MIDWAY_API_PATH + '/resetloglevel')
              .end(function (err, res) {
                Expect(err).to.equal(null);
                Expect(res.status).to.equal(200);
                Expect(res.text).to.equal('{"loglevel":"info"}');
                var result = Logger.getLogLevel();
                Expect(result).to.equal('info');
                done();
              });
          });
      } catch (err) {
        Logger.error(err);
        done();
      }
    });

  });
});


function closeSession(sessionId, done) {
  midway.closeSession(sessionId, function () {
    done();
  });
}
