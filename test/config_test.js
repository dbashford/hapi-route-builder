var Joi = require("joi")
  , noop = function(){};
  ;

var assemblingOutputTests = function(outputType){

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
    expect(new RouteBuilder().handler(noop).build().handler).to.eql(noop);
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
      RouteBuilder.addDefault(new RBDefault(function(rb) {
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
    RouteBuilder.addDefault(new RBDefault(function(rb) {}));
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
      var def = new RBDefault(function(rb) {
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
      var def = new RBDefault(function(rb) {
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
        new RBDefault(function(rb) {}).not("foo").only("bar");
      } catch(err) {
        expect(err.message).to.eql("Used only and not on same default, this is not allowed");
        done();
      }
    });

    it("if not called after only", function(done) {
      try {
        new RBDefault(function(rb) {}).only("bar").not("foo");
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

describe("pre tests", function() {

  it("pre config will be set whole", function() {
    var config = new RouteBuilder().pre(["foo", "bar"]).build();
    expect(config).to.eql({config: { pre:["foo", "bar"]}});
  });

  describe("pre builder", function() {
    it("0 arguments", function() {
      var func = function(){
        RouteBuilder._buildPre();
      };
      expect(func).to.throw(Error);
    });

    it("1 argument, array", function() {
      var arr = ["foo", "bar"];
      expect(RouteBuilder._buildPre(arr)).to.eql(arr);
    });

    it("1 argument, function", function() {
      var func = function(){return "foo";};
      expect(RouteBuilder._buildPre(func)).to.eql({method:func});
    });

    it("1 argument, string", function() {
      expect(RouteBuilder._buildPre("foo")).to.eql("foo");
    });

    it("1 argument, object", function() {
      expect(RouteBuilder._buildPre({bar:"foo"})).to.eql({bar:"foo"});
    });

    it("2 arguments", function() {
      expect(RouteBuilder._buildPre("foo", noop)).to.eql({assign:"foo", method:noop});
    });

    it("3 arguments", function() {
      expect(RouteBuilder._buildPre("foo", noop, "bar")).to.eql({assign:"foo", method:noop, failAction:"bar"});
    });

    it("4 arguments", function() {
      var func = function(){
        RouteBuilder._buildPre("foo", "func", "bar", "baz")
      };
      expect(func).to.throw(Error);
    });
  });

  describe("serial pre", function() {
    it("0 arguments", function() {
      var func = function() {
        new RouteBuilder().preSerial().build();
      }
      expect(func).to.throw(Error);
    });

    it("1 argument, array", function() {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preSerial(arr).build();
      expect(config.config.pre).to.eql([arr]);
    });

    it("1 argument, function", function() {
      var config = new RouteBuilder().preSerial(noop).build();
      expect(config.config.pre).to.eql([{method:noop}]);
    });

    it("1 argument, string", function() {
      var config = new RouteBuilder().preSerial("foo").build();
      expect(config.config.pre).to.eql(["foo"]);
    });

    it("1 argument, object", function() {
      var config = new RouteBuilder().preSerial({bar:"foo"}).build();
      expect(config.config.pre).to.eql([{bar:"foo"}]);
    });

    it("2 arguments", function() {
      var config = new RouteBuilder().preSerial("foo", noop).build();
      expect(config.config.pre).to.eql([{assign:"foo", method:noop}]);
    });

    it("3 arguments", function() {
      var config = new RouteBuilder().preSerial("foo", noop, "bar").build();
      expect(config.config.pre).to.eql([{assign:"foo", method:noop, failAction:"bar"}]);
    });

    it("4 arguments", function() {
      var func = function(){
        new RouteBuilder().preSerial("foo", func, "bar", "baz").build();
      };
      expect(func).to.throw(Error);
    });

    it("can place the pre into the array at the correct place", function() {
      var config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(0, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.eql("baz");
      expect(config.config.pre[1].assign).to.eql("foo");
      expect(config.config.pre[2].assign).to.eql("bar");

      config = new RouteBuilder()
        .preSerial("foo", noop)
        .preSerial("bar", noop)
        .preSerial(1, "baz", noop)
        .build();

      expect(config.config.pre[0].assign).to.eql("foo");
      expect(config.config.pre[1].assign).to.eql("baz");
      expect(config.config.pre[2].assign).to.eql("bar");
    });
  });

  describe("parallel pre", function() {
    it("0 arguments", function() {
      var func = function() {
        new RouteBuilder().preParallel().build();
      }
      expect(func).to.throw(Error);
    });

    it("1 argument, array with array", function() {
      var arr = ["foo", "bar"];
      var config = new RouteBuilder().preParallel([arr]).build();
      expect(config.config.pre).to.eql([[arr]]);
    });

    it("1 argument, array with function", function() {
      var config = new RouteBuilder().preParallel([noop]).build();
      expect(config.config.pre).to.eql([[{method:noop}]]);
    });

    it("1 argument, array with string", function() {
      var config = new RouteBuilder().preParallel(["foo"]).build();
      expect(config.config.pre).to.eql([["foo"]]);
    });

    it("1 argument, array with object", function() {
      var config = new RouteBuilder().preParallel([{bar:"foo"}]).build();
      expect(config.config.pre).to.eql([[{bar:"foo"}]]);
    });

    it("2 argument array", function() {
      var config = new RouteBuilder().preParallel(["foo", noop]).build();
      expect(config.config.pre).to.eql([[{assign:"foo", method:noop}]]);
    });

    it("3 argument array", function() {
      var config = new RouteBuilder().preParallel(["foo", noop, "bar"]).build();
      expect(config.config.pre).to.eql([[{assign:"foo", method:noop, failAction:"bar"}]]);
    });

    it("4 argument array", function() {
      var func = function(){
        new RouteBuilder().preParallel(["foo", func, "bar", "baz"]).build();
      };
      expect(func).to.throw(Error);
    });

    it("multiple arrays", function() {
      var config = new RouteBuilder().preParallel(
        [noop], ["foo"], ["foo", noop]).build();
      expect(config.config.pre).to.eql([[{method:noop}, "foo", {assign:"foo", method:noop}]]);
    });

    it("can place the pre into the array at the correct place", function() {
      var config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(0, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.eql("baz");
      expect(config.config.pre[1][0].assign).to.eql("foo");
      expect(config.config.pre[2][0].assign).to.eql("bar");

      config = new RouteBuilder()
        .preParallel(["foo", noop])
        .preParallel(["bar", noop])
        .preParallel(1, ["baz", noop])
        .build();

      expect(config.config.pre[0][0].assign).to.eql("foo");
      expect(config.config.pre[1][0].assign).to.eql("baz");
      expect(config.config.pre[2][0].assign).to.eql("bar");
    });
  });

});
