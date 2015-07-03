var Joi = require("joi")
  ;

var assemblingOutputTests = function(outputType){
  it("runs config entries", function(done) {
    new RouteBuilder()
      .method("POST")
      .config(function() {
        // will time out if it fails.
        expect(true).to.be.true;
        done()
      })[outputType]();
  });

  it("applies defaults", function(done) {
    RouteBuilder.addDefault(function(rb) {
      // will time out if not called
      expect(true).to.be.true;
      done();
    });

    new RouteBuilder()
      .method("POST")[outputType]();
  });
};

describe("building config", function() {
  afterEach(function() {
    RouteBuilder.clearDefaults();
  });
  assemblingOutputTests("build")
});

describe("printing config", function() {
  afterEach(function() {
    RouteBuilder.clearDefaults();
  });
  assemblingOutputTests("print")
});

describe("configs", function() {
  it("will be executed", function(done) {
    var count = 0;
    var executed = function() {
      if (++count === 2) {
        expect(true).to.be.true;
        done();
      }
    };

    new RouteBuilder()
      .config(function() {
        executed();
      })
      .config(function() {
        executed();
      })
      .build();
  });
});

describe("method tests", function() {

  describe("using method directly", function() {
    it("will set method", function() {
      expect(new RouteBuilder().method("POST").build()).to.eql({method:"POST"});
      expect(new RouteBuilder().method("GET").build()).to.eql({method:"GET"});
    });

    it("will throw error if bad method used", function() {
      expect(function(){ new RouteBuilder().method("FOO").build() }).to.throw(Error);
    })
  });

  describe("utility functions", function(){
    it("will build a POST", function() {
      expect(new RouteBuilder().post().build()).to.eql({method:"POST"});
    });

    it("will build a GET", function() {
      expect(new RouteBuilder().get().build()).to.eql({method:"GET"});
    });

    it("will build a PUT", function() {
      expect(new RouteBuilder().put().build()).to.eql({method:"PUT"});
    });

    it("will build a DELETE", function() {
      expect(new RouteBuilder().delete().build()).to.eql({method:"DELETE"});
    });

    it("will build a PATCH", function() {
      expect(new RouteBuilder().patch().build()).to.eql({method:"PATCH"});
    });

    it("will build a OPTIONS", function() {
      expect(new RouteBuilder().options().build()).to.eql({method:"OPTIONS"});
    });
  });
});

describe("url tests", function() {
  it("will build a url config", function() {
    expect(new RouteBuilder().url("/foo/bar/baz").build()).to.eql({path:"/foo/bar/baz"});
  })
});

describe("handler tests", function() {
  it("will build a handler config", function() {
    var handler = function(){};
    expect(new RouteBuilder().handler(handler).build().handler).to.eql(handler);
  });
});

describe("defaults", function() {

  afterEach(function() {
    RouteBuilder.clearDefaults();
  });

  describe("will be called", function() {
    it("when added directly", function(done) {
      RouteBuilder.addDefault(function(rb) {
        // will time out if not called
        expect(true).to.be.true;
        done();
      });

      new RouteBuilder().build();
    });

    it("when added as RBDefault", function(done) {
      RouteBuilder.addDefault(new RBDefaults(function(rb) {
        // will time out if not called
        expect(true).to.be.true;
        done();
      }));

      new RouteBuilder().build();
    });

  });

  it("can be added directly", function() {
    RouteBuilder.addDefault(function(rb) {});
    expect(RouteBuilder.defaultsArray.length).to.eql(1);
  });

  it("can be added as RBDefault", function() {
    RouteBuilder.addDefault(new RBDefaults(function(rb) {}));
    expect(RouteBuilder.defaultsArray.length).to.eql(1);
  });

  it("can be cleared", function() {
    RouteBuilder.addDefault(function(rb) {});
    expect(RouteBuilder.defaultsArray.length).to.eql(1);
    RouteBuilder.clearDefaults();
    expect(RouteBuilder.defaultsArray.length).to.eql(0);
  });

  var withNot = function(type, called, matcher, matcher2) {
    it("when url is excluded via " + type, function(done) {
      var def = new RBDefaults(function(rb) {
        expect(called).to.be.true;
        if (called) {
          done();
        }
      }).not(matcher);
      if (matcher2) {
        def.not(matcher2);
      }
      RouteBuilder.addDefault(def);

      new RouteBuilder().url("/url/ignore").build();
      if (!called) {
        setTimeout(function() {
          done();
        }, 25);
      }
    });
  };

  var withOnly = function(type, called, matcher, matcher2) {
    it("when url is included via " + type, function(done) {
      var def = new RBDefaults(function(rb) {
        expect(called).to.be.true;
        if (called) {
          done();
        }
      }).only(matcher);
      if (matcher2) {
        def.only(matcher2);
      }
      RouteBuilder.addDefault(def);

      new RouteBuilder().url("/url/ignore").build();
      if(!called) {
        setTimeout(function() {
          done();
        },25);
      }
    });
  };

  describe("only/not tests", function() {

    describe("will not be called", function() {
      withNot("string", false, "/url/ignore");
      withNot("regex", false, /ignore/);
      withNot("multiple strings", false, "foo", "/url/ignore");
      withNot("multiple regexs", false, "foo", /ignore/);

      withOnly("string", false, "/url/somethingelse");
      withOnly("regex", false, /somethingelse/);
      withOnly("multiple strings", false, "/url/foo", "/url/bar");
      withOnly("multiple regexs", false, /somethingelse/, /foo/);
    });

    describe("will be called", function() {
      withNot("string", true, "/url/bar");
      withNot("regex", true, /foo/);
      withNot("multiple strings", true, "foo", "/url/ignor");
      withNot("multiple regexs", true, "foo", /ignre/);

      withOnly("string", true, "/url/ignore");
      withOnly("regex", true, /ignore/);
      withOnly("multiple strings", true, "/url/foo", "/url/ignore");
      withOnly("multiple regexs", true, /somethingelse/, /ignore/);
    });
  });

  describe("will throw", function() {
    it("if only called after not", function(done) {
      try {
        new RBDefaults(function(rb) {}).not("foo").only("bar");
      } catch(err) {
        expect(err.message).to.eql("Used only and not on same default, this is not allowed");
        done();
      }
    });

    it("if not called after only", function(done) {
      try {
        new RBDefaults(function(rb) {}).only("bar").not("foo");
      } catch(err) {
        expect(err.message).to.eql("Used only and not on same default, this is not allowed");
        done();
      }
    });
  });

});

describe("validate tests", function() {

  it("will set the validate block", function() {
    var validate = { name: Joi.string().required() };
    var config = new RouteBuilder().validatePayload(validate).build();
    expect(config.config.validate.payload).to.eql(validate);
  });

  it("will set the a specific payload key", function() {
    var validate = Joi.string().required();
    var config = new RouteBuilder().validatePayloadKey("name", validate).build();
    expect(config.config.validate.payload.name).to.eql(validate);
  });


});
