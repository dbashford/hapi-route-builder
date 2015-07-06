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
});