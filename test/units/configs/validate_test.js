var Joi = require("joi")
  ;

describe("validate tests", function() {

  it("will set the validate block", function(done) {
    var validate = { name: Joi.string().required() };
    var config = new RouteBuilder().validatePayload(validate).build();
    expect(config.config.validate.payload).to.equal(validate);
    done();
  });

  it("will set the a specific payload key", function(done) {
    var validate = Joi.string().required();
    var config = new RouteBuilder().validatePayloadKey("name", validate).build();
    expect(config.config.validate.payload.name).to.equal(validate);
    done();
  });
});