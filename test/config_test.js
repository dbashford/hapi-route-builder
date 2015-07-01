describe("building config", function() {

  afterEach(function() {
    RouteBuilder.clearDefaults();
  })

  it("runs config entries", function(done) {
    new RouteBuilder()
      .method("POST")
      .config(function() {
        // will time out if it fails.
        expect(true).to.be.true;
        done()
      })
      .build();
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