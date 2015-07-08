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
    it("when path is excluded via " + type, function(done) {
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

      new RouteBuilder().path("/path/ignore").build();
      if (!called) {
        setTimeout(function() {
          done();
        }, 25);
      }
    });
  };

  var withOnly = function(type, called, matcher, matcher2) {
    it("when path is included via " + type, function(done) {
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

      new RouteBuilder().path("/path/ignore").build();
      if(!called) {
        setTimeout(function() {
          done();
        },25);
      }
    });
  };

  describe("only/not tests", function() {

    describe("will not be called", function() {
      withNot("string", false, "/path/ignore");
      withNot("regex", false, /ignore/);
      withNot("multiple strings", false, "foo", "/path/ignore");
      withNot("multiple regexs", false, "foo", /ignore/);

      withOnly("string", false, "/path/somethingelse");
      withOnly("regex", false, /somethingelse/);
      withOnly("multiple strings", false, "/path/foo", "/path/bar");
      withOnly("multiple regexs", false, /somethingelse/, /foo/);
    });

    describe("will be called", function() {
      withNot("string", true, "/path/bar");
      withNot("regex", true, /foo/);
      withNot("multiple strings", true, "foo", "/path/ignor");
      withNot("multiple regexs", true, "foo", /ignre/);

      withOnly("string", true, "/path/ignore");
      withOnly("regex", true, /ignore/);
      withOnly("multiple strings", true, "/path/foo", "/path/ignore");
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