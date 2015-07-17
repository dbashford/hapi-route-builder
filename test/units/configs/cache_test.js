describe("cache config", function() {

  it("with full object", function(done) {
    var setting = {
      privacy:"private",
      expiresIn: 1000 * 60 * 60
    };
    var config = new RouteBuilder().cache(setting).build();
    expect(config.config.cache).to.deep.equal(setting);
    done();
  });

  describe("privacy default", function() {
    it("with expiresAt", function(done){
      var config = new RouteBuilder().cache("12:00").build();
      expect(config.config.cache).to.deep.equal({expiresAt:"12:00"});
      done();
    });
    it("with expiresIn", function(done){
      var config = new RouteBuilder().cache(1000 * 60 * 60).build();
      expect(config.config.cache).to.deep.equal({expiresIn:1000 * 60 * 60});
      done();
    });
    it("with bad value will throw", function(done){
      var func = function() {
        new RouteBuilder().cache([]).build();
      };
      expect(func).to.throw(Error);
      done();
    });
  });

  describe("privacy public", function() {
    it("with expiresIn", function(done){
      var config = new RouteBuilder().cachePublic(1000 * 60 * 60).build();
      expect(config.config.cache).to.deep.equal({expiresIn:1000 * 60 * 60, privacy:"public"});
      done();
    });
    it("with expiresAt", function(done){
      var config = new RouteBuilder().cachePublic("12:00").build();
      expect(config.config.cache).to.deep.equal({expiresAt:"12:00", privacy:"public"});
      done();
    });
    it("with bad value will throw", function(done){
      var func = function() {
        new RouteBuilder().cachePublic({}).build();
      };
      expect(func).to.throw(Error);
      done();
    });
  });

  describe("privacy private", function() {
    it("with expiresIn", function(done){
      var config = new RouteBuilder().cachePrivate(1000 * 60 * 60).build();
      expect(config.config.cache).to.deep.equal({expiresIn:1000 * 60 * 60, privacy:"private"});
      done();
    });
    it("with expiresAt", function(done){
      var config = new RouteBuilder().cachePrivate("12:00").build();
      expect(config.config.cache).to.deep.equal({expiresAt:"12:00", privacy:"private"});
      done();
    });
    it("with bad value will throw", function(done){
      var func = function() {
        new RouteBuilder().cachePrivate({}).build();
      };
      expect(func).to.throw(Error);
      done();
    });
  });

});