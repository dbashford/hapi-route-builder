describe("building config", function() {
  afterEach(function(done) {
    RouteBuilder.clearDefaults();
    done();
  });

  it("applies defaults", function(done) {
    RouteBuilder.addDefault(new RBDefault(function(rb) {
      // will time out if not called
      expect(true).to.be.true;
      done();
    }));

    new RouteBuilder()
      .method("POST")
      .build();
  });

  it("applies replaces", function(done) {
    var bar = function() {
      return "foo";
    };

    var config = new RouteBuilder()
      .method("POST")
      .path("/foo/{id}")
      .pre([{
        assign:"foo",
        method:bar
      }])
      .replace("/foo/{id}", "foo/{foo_id}")
      .replace({
        assign:"foo",
        method:bar
      }, bar)
      .build()

    expect(config.path).to.equal("foo/{foo_id}");
    expect(config.config.pre[0]).to.equal(bar);
    done();
  });

  it("throws error replace when %% syntax not replaced", function(done) {
    var run = function() {
      new RouteBuilder()
        .path("%replaceme%")
        .build()
    };

    expect(run).to.throw(Error);
    done();
  });

  it("will not throw error if %% replaced", function(done) {
    var run = function() {
      new RouteBuilder()
        .path("%replaceme")
        .replace("%replaceme%", "/api/foo")
        .build()
    };

    expect(run).to.not.throw();
    done();
  });

});