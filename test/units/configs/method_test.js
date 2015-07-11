describe("method tests", function() {

  describe("using method directly", function() {
    it("will set method", function(done) {
      expect(new RouteBuilder().method("POST").build()).to.deep.equal({method:"POST"});
      expect(new RouteBuilder().method("GET").build()).to.deep.equal({method:"GET"});
      done();
    });

  });

  describe("utility functions", function(){

    var path = "/api/foo";

    describe("no parameters", function() {

      var test = function(meth, done) {
        expect(new RouteBuilder()[meth]().build()).to.deep.equal({method:meth.toUpperCase()});
        done();
      };

      it("will build a POST", function(done) {
        test("post", done);
      });

      it("will build a GET", function(done) {
        test("get", done);
      });

      it("will build a PUT", function(done) {
        test("put", done);
      });

      it("will build a DELETE", function(done) {
        test("delete", done);
      });

      it("will build a PATCH", function(done) {
        test("patch", done);
      });

      it("will build a OPTIONS", function(done) {
        test("options", done);
      });
    });

    describe("passing path", function() {

      var test = function(meth, done) {
        expect(new RouteBuilder()[meth](path).build())
          .to.deep.equal({method:meth.toUpperCase(),path:path});
        done();
      };

      it("will build a POST", function(done) {
        test("post", done);
      });

      it("will build a GET", function(done) {
        test("get", done);
      });

      it("will build a PUT", function(done) {
        test("put", done);
      });

      it("will build a DELETE", function(done) {
        test("delete", done);
      });

      it("will build a PATCH", function(done) {
        test("patch", done);
      });

      it("will build a OPTIONS", function(done) {
        test("options", done);
      });
    });

    describe("passing path and handler", function() {
      var func = function(){return "foo";}
      var test = function(meth, done) {
        expect(new RouteBuilder()[meth](path, func).build())
          .to.deep.equal({
            method:meth.toUpperCase(),
            path:path,
            handler:func
          });
        done();
      };

      it("will build a POST", function(done) {
        test("post", done);
      });

      it("will build a GET", function(done) {
        test("get", done);
      });

      it("will build a PUT", function(done) {
        test("put", done);
      });

      it("will build a DELETE", function(done) {
        test("delete", done);
      });

      it("will build a PATCH", function(done) {
        test("patch", done);
      });

      it("will build a OPTIONS", function(done) {
        test("options", done);
      });
    });
  });
});