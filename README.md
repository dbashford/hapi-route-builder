![Build Status](https://travis-ci.org/dbashford/hapi-route-builder.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/dbashford/hapi-route-builder/badge.svg?branch=master)](https://coveralls.io/r/dbashford/hapi-route-builder?branch=master)
# Overview

hapi-route-builder is a library for building routes in [Hapi](http://hapijs.com/). The goal of this library is to allow for dynamic and terse route building while isolating an application's routes from possible breakages when updating Hapi versions.

hapi-route-builder uses the [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create route configuration. The library's [fluent API](https://en.wikipedia.org/wiki/Fluent_interface#JavaScript) makes route configuration readable.

To help reduce duplication in the configuration the library includes the ability to set default configuration and to constrain those defaults to certain routes or route patterns.

# Example

### Before

```javascript
server.route({
  method: "POST",
  path: "/foo/{foo_id}/bar/{bar_id}/",
  handler: handle,
  config: {
    validate: {
      payload: {
        keywords: validateKeywords
      }
    },
    pre: [
      [
        {
          assign: "userData",
          method: shared.loadUserData
        },
        {
          assign: "contextData",
          method: shared.loadFooData
        }
      ],
      shared.authorizeForCreate
    ]
  }
});
```

Here is a simple POST route which creates a `bar` resource.  It includes some validation for some payload data.  It also includes `pre` processing which retrieves, in parallel, user data and some information about the parent `foo` resource before ensuring the user has the ability to create the given resource.

### After

```javascript
var config = new RouteBuilder()
  .post("/foo/{foo_id}/bar/{bar_id}/", handle)
  .validatePayloadKey("keywords", validateKeywords)
  .preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
  .preSerial(shared.authorizeForCreate)
  .build()
server.route(config);
```

This cuts 24 lines down to 7, while making some of what Hapi is doing more clear, rather than implied via the object structure.  For instance, `preParallel`, which takes n Arrays as input, executes each of the items it is passed in parallel.

### With Defaults

Using the example above, imagine that for every call to `/foo/{foo_id}/bar` user and context data must be loaded into the request before making a judgement regarding whether or not the user is allowed to access the `bar` resource. Using defaults that behavior can be defined across all the `/foo/{foo_id}/bar` routes using the same `pre` config.

```javascript
var def = new RBDefault(function(rb) {
  rb.preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
    .preSerial(shared.authorizeForCreate)
  })
  .applyAtBuild()
  .only("/foo/{foo_id}/bar/");

RouteBuilder.addDefault(def);
```

Now the route config for all the `/foo/{foo_id}/bar` routes need not create that configuration.

```javascript
var config =
  new RouteBuilder()
    .post("/foo/{foo_id}/bar/", handle)
    .validatePayloadKey("keywords", validateKeywords)
    .build()

server.route(config);
```

But the output is the same.

# Install and Usage

`npm install --save hapi-route-builder`

# Usage

```javascript
var hrb = require("hapi-route-builder");
var RouteBuilder =  hrb.RouteBuilder;
var RBDefault = hrb.RBDefault;
```

## Route Building

Use the `RouteBuilder` by instantiating a new instance and then chaining its functions. Calling the `build` function will return the Hapi route configuration object.

```javascript
var config =
  new RouteBuilder()
    .post()
    .path("/api/foo")
    .build();
```

## Route Defaults

To utilize default configuration across routes instantiate an `RBDefault`.  It takes as part of its constructor a function that takes a `RouteBuilder` instance.  Any of the `RouteBuilder` functions can then be chained.

Add the `RBDefault` instance to the RouteBuilder staticly using `RouteBuilder.addDefault`.

```javascript
var def = new RBDefault(function(rb) {
    rb.preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
      .preSerial(shared.authorizeForCreate)
  })
  .applyAtBuild()
  .only("/foo/{foo_id}/bar");

RouteBuilder.addDefault(def);
```

### When defaults are applied

A `RBDefault` can either be applied when `RouteBuilder` is constructed or when `build` is called.  By default it is applied when `RouteBuilder` is constructed. This sets up defaults before any other configuration is applied.  This means a default can be overridden by future calls.

```javascript
var def = new RBDefault(function(rb) {
    rb.path("/api/foo")
  });

RouteBuilder.addDefault(def);

new RouteBuilder()
  .path("/api/bar")
  .build();
```

This applies the default before `path` is called.  `path` overrides the default so that the output contains `path:"/api/bar"`.

`RBDefault`s can also be applied when `build` is called.  This is best used when default overriding is not needed.  A default will be applied at `build` when the `applyAtBuild` function is called on the RBDefault object.

```javascript
var def = new RBDefault(function(rb) {
    rb.path("/api/foo")
  }.applyAtBuild());

RouteBuilder.addDefault(def);

new RouteBuilder()
  .path("/api/bar")
  .build();
```

In this case the default overrides the configuration and `path` would be set to `/api/foo`.

## Configuration Replacements & Forced Replacements

When `build` is called on a route, the RouteBuilder performs several tasks upon the assembled configuration.  

First it applies defaults that have indicated they need to be applied duringt he build.

Next it will address any replacements registered for the routes using the `replace` function.  This allows for default config to be overridden, or possibly any external configuration to be used to update route config.

Last it will check the entire configuration to see if any values, either object values or values of Arrays, are set to a string that both begins and ends with `%`.  If any such string exists anywhere in the configuration, an Error will be thrown.  Strings surrounded with percent signs must be replaced using the `replace` function.  This forced replacement functionality allows a default to be applied that must be implemented by all, or a subset, of routes.

As a naive example, assume all routes must have a `path`.

```javascript
RouteBuilder.addDefault(new RBDefault(function(rb) {
  rb.path("%replaceme%")
}));
```

Now, when `build`ing a route, if the `path` hasn't been set, `build` will throw an error.

```javascript
new RouteBuilder()
  .post()
  .build() // throws error because path not set.
```

To replace it, use the `replace` function.

```javascript
new RouteBuilder()
  .post()
  .replace("%replaceme%", "/api/foo")
  .build() // does not throw error
```

# API

* [RouteBuilder](#routebuilder)
  * [new RouteBuilder()](#constructor)
  * [RouteBuilder.addDefault()](#routebuilderadddefault)
  * [RouteBuilder.clearDefaults()](#routebuildercleardefaults)
  * [RouteBuilder.setRootPath()](#routebuildersetdefaultpath)
  * [app()](#app)
  * [build()](#build)
  * [cache()](#cache)
  * [cachePrivate()](#cacheprivate)
  * [cachePublic()](#cachepublic)
  * [delete()](#delete)
  * [get()](#get)
  * [handler()](#handler)
  * [method()](#method)
  * [options()](#options)
  * [patch()](#patch)
  * [path()](#path)
  * [post()](#post)
  * [pre()](#pre)
  * [preParallel()](#preparallel)
  * [preSerial()](#preserial)
  * [put()](#put)
  * [replace()](#replace)
  * [validatePayload()](#validatepayload)
  * [validatePayloadKey()](#validatepayloadkey)
  * [vhost()](#vhost)
* [RBDefault](#rbdefault)
  * [new RBDefault()](#constructor-1)
  * [applyAtBuild()](#applyatbuild)
  * [not()](#not)
  * [only()](#only)

## RouteBuilder

For details about the config being set up by the RouteBuilder, check the hapi route documentation for [route configuration](http://hapijs.com/api#route-configuration) and [additional route options](http://hapijs.com/api#route-options).

#### `constructor`
The RouteBuilder constructor is the first call that begins the fluid API chain.

```javascript
new RouteBuilder()
```

#### `RouteBuilder.addDefault`
This static function adds defaults to all RouteBuilder instances.  This function takes a `RBDefault` object as input. If something other than an RBDefault is passed in, an Error will be thrown.

```javascript
RouteBuilder.addDefault(new RBDefault(function(rb){
  rb.post(); // this would make all routes POSTs, here as short example only
}));
```

#### `RouteBuilder.clearDefaults`
This static function clears all defaults out of the RouteBuilder so future routes do not contain any configured defaults.  Important to note that this does not effect any routes created prior to clearing the defaults.

This function is handy for clearing defaults after creating a group of routes, prior to adding new defaults for another group.

```javascript
RouteBuilder.clearDefaults();
```

#### `RouteBuilder.setRootPath`
This static function sets a root path for all paths created after `setRootPath` is called.  So if `path('/profile')` is called on a RouteBuilder after `setRootPath('/api')` is called, then the resulting route path would be `/api/profile`.

To clear the root path, simply call `setRootPath` with no parameters.

```javascript
RouteBuilder.setRootPath("/api");

... build a route

RouteBuilder.setRootPath();
```

#### `app`
Sets the `config.app` property.

```javascript

var appConfig = {
  foo:"bar",
  baz: false
};

new RouteBuilder().app(appConfig).build();
```

#### `build`
Creates a configuration object and returns it. When `build` is called is also when any defaults that are to be applied during build are applied.

```javascript
new RouteBuilder()  
  .post()
  .path("/api/foo")
  .handler(function(request, reply) {
    reply("foo");
  })
  .build();
```

#### `cache`
Configures the `config.cache` parameter. `cache` can take 3 different parameter types.

1. It can take the full `cache` configuration object as a parameter.

```javascript
new RouteBuilder().cache({
  privacy: "private",
  expiresIn: 1000 * 60 * 60
});
```

2. It can take a string in the form `HH:MM`, which sets the cache `privacy` to `default` and `expiresAt` to the value provided.

```javascript
new RouteBuilder().cache("12:00");
```

3. It can take a number of milliseconds until the cache is invalidated.  The `expiresIn` setting.  This also uses the `default` `privacy`.

```javascript
new RouteBuilder().cache(1000 * 60 * 60);
```

#### `cachePrivate`
Configures cache with the `privacy` setting set to `private`. Takes one parameter, either `expiresIn` or `expiresAt`.  `expiresIn` is a number expressed in millis, `expiresAt` is a string in `HH:MM` format.

```javascript
new RouteBuilder().cachePrivate(1000 * 60 * 60);
```

```javascript
new RouteBuilder().cachePrivate("12:00");
```

#### `cachePublic`
Configures cache with the `privacy` setting set to `public`. Takes one parameter, either `expiresIn` or `expiresAt`.  `expiresIn` is a number expressed in millis, `expiresAt` is a string in `HH:MM` format.

```javascript
new RouteBuilder().cachePublic(1000 * 60 * 60);
```

```javascript
new RouteBuilder().cachePublic("12:00");
```

#### `delete`
Expresses a route is a DELETE.

```javascript
new RouteBuilder().delete()
```

The `delete` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .delete("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `get`
Expresses a route is a GET.

```javascript
new RouteBuilder().get()
```

The `get` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .get("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `handler`
Sets the `handler` property for a Hapi route.

```javascript
new RouteBuilder().handler(function(request, reply) {
  reply();
});
```

#### `method`
This function configures a Hapi route's `method` parameter. It takes a string, normally one of 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', or 'OPTIONS'.  The convenience functions below are terser ways to express an HTTP method.

```javascript
new RouteBuilder().method('POST')
```

#### `options`
Expresses a route is an OPTIONS.

```javascript
new RouteBuilder().options()
```

The `options` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .options("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `patch`
Expresses a route is a PATCH.

```javascript
new RouteBuilder().patch()
```

The `patch` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .patch("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `path`
Sets the `path` property for a Hapi route.

```javascript
new RouteBuilder().path("/foo/{foo_id}/bar/{bar_id}/")
```

#### `post`
Expresses a route is a POST.

```javascript
new RouteBuilder().post()
```

The `post` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .post("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `pre`
Sets the entire [`pre`](http://hapijs.com/api#route-prerequisites) config.

```javascript
var pre = [
  [
    {
      assign: "foo",
      method: fooFunc
    },
    {
      assign: "bar",
      method: barFunc
    }
  ],
  bazFunction
]

new RouteBuilder().pre(pre);
```

#### `preParallel`
`preParallel` works like `preSerial` except it takes multiple arrays of `preSerial` inputs. Each array represents a `pre` to execute in parallel with the other arrays of inputs.

```javascript
new RouteBuilder()
  .preParallel(
    ["foo", fooFunc],
    ["bar", barFunc]
  )
  .preSerial("baz", bazFunc)
```

The above would execute `fooFunc` and `barFunc` in parallel, and after both are finished, execute `bazFunc`.

All the `preSerial` input variations are honored, including using an `index` integer.

```javascript
new RouteBuilder()
  .preSerial("baz", bazFunc)
  .preParallel(
    0,
    ["foo", fooFunc],
    ["bar", barFunc]
  )
```

#### `preSerial`
Hapi's `pre` configuration is an array. `preSerial` pushes a new entry to that array.  `preSerial` can be called multiple times, adding more entries to the `pre` array.

`preSerial` can take all of the 3 types of inputs that Hapi's [`pre` config](http://hapijs.com/api#route-prerequisites) can take: 1) an object with keys of `assign`, `method`, and `failAction`, 2) a function (same as just providing a `method` and 3) a string which invokes a `server.method`.

```javascript
new RouteBuilder()
  .preSerial({assign:"foo", method:fooFunc})
  .preSerial(barFunc)
  .preSerial("serverMethod(params.id)")
```

`preSerial` has two alternative convenience signatures. `preSerial` called be called with two parameters for `assign` and `method`, and with three paramters for `assign`, `method`, and `failAction`.

```javascript
new RouteBuilder()
  .preSerial("foo", fooFunc)
  .preSerial("bar", barFunc, "ignore")
```

All argument signatures have a variation that takes an `index` integer as the first parameter.  This allows for placing the `preSerial` to be placed into a specific position in the `pre` array rather than pushed to the end.

```javascript
new RouteBuilder()
  .preSerial("foo", fooFunc)
  .preSerial(0, "bar", barFunc, "ignore")
```

Add `0` in the example above would, in this case, reverse the order of the two `preSerial`s.

#### `put`
Expresses a route is a PUT.

```javascript
new RouteBuilder().put()
```

The `put` function can also take the `path` and a `handler` as 1st and 2nd arguments.  Both arguments do not need to be provided.

```javascript
new RouteBuilder()
  .put("/api/foo", function(request, reply) {
    reply("foo")
  })
```

#### `replace`
This function will replace specified portions of the config with the provided data when `build` is called.  The replacement is the last thing that happens before the configuration is returned.

```javascript
new RouteBuilder()
  .pre([{assign:"__placeholder", method:aFunction}])
  .replace("__placeholder", "formData");
```

The above will replace `__placeholder` in the created configuration with `formData`.

`replace` will work with any type of value, including things in arrays. It will not work with object keys, though.

```javascript
{
  path:"/foo/{id}",
  pre: [
    {
      assign:"foo",
      method:bar
    }
  ]
}
```

So if the above was configuration that would be generated by `build`, if the following `replace` functions were called...

```javascript
  .replace("/foo/{id}", "foo/{foo_id}")
  .replace({
    assign:"foo",
    method:bar
  }, bar)
```

...the generated config would become

```javascript
{
  method:"POST",
  path:"/foo/{foo_id}",
  pre: [ bar ]
}
```

Notice that `replace` can be chained like the other chainable functions.

#### `validatePayload`
Sets the `config.validate.payload` property of a route configuration.

```javascript
var validate = {
  ids: Joi.array().items(
    Joi.string().required()
  ).required()
};
new RouteBuilder().validatePayload(validate);
```

#### `validatePayloadKey`
A convenience function to set a specific `config.validate.payload` key.

```javascript
var validate = Joi.array().items(
    Joi.string().required()
  ).required();
new RouteBuilder().validatePayload("ids", validate);
```

#### `vhost`
Sets the `vhost` property for a Hapi route.

```javascript
new RouteBuilder().vhost("foo")
```

## RBDefault

#### `constructor`
The `RBDefault` constructor takes a function as a parameter.  The function should take an instance of `RouteBuilder` as input.  Inside the function the RouteBuilder instance should be used to apply configuration to be used across all routes.

The `RBDefault` instance is then passed to `RouteBuilder.addDefault`.

```javascript
RouteBuilder.addDefault(
  new RBDefault(function(rb) {
    rb.preSerial("auth", authFunction)
  });
);
```

By default, `RBDefault`s are applied when a `RouteBuilder` is instantiated.

#### `applyAtBuild`
This function takes no parameters and indicates that a given `RBDefault` is to be applied when the configuration is built rather than when `RouteBuilder` is instantiated.  

```javascript
RouteBuilder.addDefault(
  new RBDefault(function(rb) {
    rb.preSerial("auth", authFunction)
  })
  .applyAtBuild();
);
```

#### `only`
`only` can be chained onto a `RBDefault` instance only if `applyAtBuild` has first been called. `only` allows for a default to be scoped to certain routes. `only` can take a RegExp or a string, each of which is used to match any routes the RBDefault may be applied to.

`only` itself can be chained.

```javascript
RouteBuilder.addDefault(
  new RBDefault(function(rb) {
    rb.preSerial("auth", authFunction)
  })
  .applyAtBuild()
  .only(/account/)
  .only("/logout");
);
```

`only` cannot be used with `not`.

#### `not`
`not` can be chained onto a `RBDefault` instance only if `applyAtBuild` has first been called. `not` and allows for specific routes to be eliminated from having the default applied. `not` can take a RegExp or a string, each of which is used to eliminate routes from having the RBDefault applied.

`not` itself can be chained.

```javascript
RouteBuilder.addDefault(
  new RBDefault(function(rb) {
    rb.preSerial("auth", authFunction)
  })
  .applyAtBuild()
  .not(/profile/)
  .not("/login");
);
```

`not` cannot be used with `only`.

