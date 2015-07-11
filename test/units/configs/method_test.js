describe("method tests", function() {

  describe("using method directly", function() {
    it("will set method", function(done) {
      expect(new RouteBuilder().method("POST").build()).to.deep.equal({method:"POST"});
      expect(new RouteBuilder().method("GET").build()).to.deep.equal({method:"GET"});
      done();
    });

  });

  describe("utility functions", function(){
    it("will build a POST", function(done) {
      expect(new RouteBuilder().post().build()).to.deep.equal({method:"POST"});
      done();
    });

    it("will build a GET", function(done) {
      expect(new RouteBuilder().get().build()).to.deep.equal({method:"GET"});
      done();
    });

    it("will build a PUT", function(done) {
      expect(new RouteBuilder().put().build()).to.deep.equal({method:"PUT"});
      done();
    });

    it("will build a DELETE", function(done) {
      expect(new RouteBuilder().delete().build()).to.deep.equal({method:"DELETE"});
      done();
    });

    it("will build a PATCH", function(done) {
      expect(new RouteBuilder().patch().build()).to.deep.equal({method:"PATCH"});
      done();
    });

    it("will build a OPTIONS", function(done) {
      expect(new RouteBuilder().options().build()).to.deep.equal({method:"OPTIONS"});
      done();
    });
  });
});