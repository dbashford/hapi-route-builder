describe("building config", function() {
  afterEach(function() {
    RouteBuilder.clearDefaults();
  });

  it("applies defaults", function(done) {
    RouteBuilder.addDefault(function(rb) {
      // will time out if not called
      expect(true).to.be.true;
      done();
    });

    new RouteBuilder()
      .method("POST")
      .build();
  });

  it("applies replaces", function() {
    var bar = function() {
      return "foo";
    };

    var config = new RouteBuilder()
      .method("POST")
      .url("/foo/{id}")
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

    expect(config.path).to.eql("foo/{foo_id}");
    expect(config.config.pre[0]).to.eql(bar);
  });
});