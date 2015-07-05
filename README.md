![Build Status](https://travis-ci.org/dbashford/hapi-route-builder.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/dbashford/hapi-route-builder/badge.svg?branch=master)](https://coveralls.io/r/dbashford/hapi-route-builder?branch=master)
# Overview

hapi-route-builder is a library for building routes in [Hapi](http://hapijs.com/). The goal of this library is to allow for dynamic and terse route building while isolating your application's routes from possible breakages when updating Hapi versions.

hapi-route-builder uses the [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create route configuration. The library's[fluent API](https://en.wikipedia.org/wiki/Fluent_interface#JavaScript) makes your route configuration readable.

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

Here we have a simple POST route which creates a `bar` resource.  It includes some validation for some payload data.  It also includes `pre` processing which retrieves, in parallel, some user data and some information about the parent `foo` resource before ensuring the user has the ability to create the given resource.

### After

```javascript
var config =
  new RouteBuilder()
    .post()
    .url("/foo/{foo_id}/bar/{bar_id}/")
    .handler(handle)
    .validatePayloadKey("keywords", validateKeywords)
    .preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
    .preSerial(shared.authorizeForCreate)
    .build()

server.route(config);
```

This cuts 24 lines down to 10 (with a few extra lines tossed in for readability), while making some of what Hapi is doing more clear, rather than implied via the object structure.  For instance, `preParallel`, which takes n Arrays as input, executes each of the items it is passed in parallel.

### With Defaults

Using the example above, imagine that for every call to `/foo/{foo_id}/bar` that you needed to load user and context data into the request before making a judgement regarding whether or not the user is allowed to access the `bar` resource.

Using defaults you could define that behavior across all the `/foo/{foo_id}/bar` routes using the same `pre` config.

```javascript
var def = new RBDefault(function(rb) {
  rb.preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
    .preSerial(shared.authorizeForCreate)
}).only("/foo/{foo_id}/bar");

RouteBuilder.addDefault(def);
```

Now the route config for all the `/foo/{foo_id}/bar` routes need not create that configuration.

```javascript
var config =
  new RouteBuilder()
    .post()
    .url("/foo/{foo_id}/bar/{bar_id}/")
    .handler(handle)
    .validatePayloadKey("keywords", validateKeywords)
    .build()

server.route(config);
```

But the output is the same.

# Install and Usage

`npm install --save hapi-route-builder`

```javascript
var hrb = require("hapi-route-builder");
var RouteBuilder =  hrb.RouteBuilder;
var RBDefault = hrb.RBDefault;
```

## `RouteBuilder`

Use the RouteBuilder by instantiating a new instance and then chaining its functions. Calling the `build` function will return the Hapi route configuration object.

```javascript
var config =
  new RouteBuilder()
    .post()
    .url("/api/foo")
    .build();
```

## `RBDefault`

To utilize default configuration across routes instantiate an `RBDefault`.  It takes as part of its constructor a function that takes a `RouteBuilder` instance.  You can then chain any of the `RouteBuilder` functions.

Add the `RBDefault` instance to the RouteBuilder staticly using `RouteBuilder.addDefault`.

```javascript
var def = new RBDefault(function(rb) {
  rb.preParallel(["userData", shared.loadUserData], ["contextData", shared.loadFooData])
    .preSerial(shared.authorizeForCreate)
}).only("/foo/{foo_id}/bar");

RouteBuilder.addDefault(def);
```

Defaults are applied to a route when you call an output function (`build` or `print` for instance).  That is important to keep in mind for those `RouteBuilder` functions for which call order matters.  A call to `preSerial` as part of a RBDefault will result in that added `pre` being the last in the `pre` array.  The `preSerial` function takes an optional `index` parameter to handle this case.

# API

## RouteBuilder

#### `constructor`

#### `RouteBuilder.addDefault`
#### `RouteBuilder.clearDefaults`

#### `method`
#### `post`
#### `get`
#### `put`
#### `delete`
#### `patch`
#### `options`

#### `url`

#### `handler`

#### `validatePayload`
#### `validatePayloadKey`

#### `pre`
#### `preSerial`
#### `preParallel`

#### `build`

## RBDefault

#### `RBDefault()`

#### `only`

#### `not`
