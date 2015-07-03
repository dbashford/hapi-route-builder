var Hapi = require("hapi")
  , request = require('supertest')
  ;

function TestServer (routeConfig, done) {
  this.done = done;

  this.server = new Hapi.Server();
  this.server.connection({port: 3000});
  this.server.route(routeConfig);

  var that = this;
  this.server.start(function(){
    process.nextTick(that.runTest.bind(that));
  });
}

TestServer.prototype.andTest = function(cb) {
  this.test = cb;
};

TestServer.prototype.runTest = function() {
  if (this.test) {
    this.test(request(this.server.listener), this.stop.bind(this));
  } else {
    console.log("No test registered");
    this.stop();
  }
};

TestServer.prototype.stop = function(err) {
  this.server.stop(function() {
    this.done(err);
  }.bind(this));
};

exports.TestServer = TestServer;