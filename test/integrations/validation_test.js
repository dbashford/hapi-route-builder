var Joi = require("joi")
  , TestServer = new require("../util").TestServer
  ;

describe("validation", function() {
  var test= function(done, func, payload) {
    var builder = new RouteBuilder()
      .path("/api/foo")
      .post()

    var config = builder[func].apply(builder, payload)
      .handler(function(request, reply) {
        reply();
      })
      .build();

    new TestServer({routeConfig: config, done: done}).andTest(function(server, stop) {
      server.inject({
        method: "POST",
        url: "/api/foo",
        payload: {name:5}
      }, function(res) {
        expect(res.statusCode).to.equal(400);
        expect(res.result.message).to.equal("child \"name\" fails because [\"name\" must be a string]");
        stop();
      });
    });
  };


  it("will be executed via payload", function(done) {
    test(done, "validatePayload", [{ name: Joi.string().required() }]);
  });

  it("will be executed via payload key", function(done){
    test(done, "validatePayloadKey", ["name", Joi.string().required()]);
  });

});