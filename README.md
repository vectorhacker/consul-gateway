Consul Gateway
=========

A consul connected load balancing http client gateway for microservice
applications. Loosely based on Martin Fowlers slides on [ Testing Strategies in a Microservice Architecture ](http://martinfowler.com/articles/microservice-testing/).

It uses Consul to get the list of addresses to load balance across and makes
requests using the request-promise library. It can also automatically update
the address list in the background.

Usage:

```javascript
const Gateway = require("consul-gateway");

let serviceGateway = null;

Gateway({ service: "name", version: "1.0" })
  .then(_gateway => {
    gateway = _gateway;
  })
  .catch(console.error);

function test() {
  gateway.get("/test", { json: false }) // json is true by default
    .then(response => {
    });
}
```

Methods:

`Gateway({ consul?: object <consul instance>, rpc?: fn() -> promise, name: string, version: string, refreshDelay?: number }) -> Promise<gateway>`

`gateway.get(endpoint: string, options: request-promise options) -> Promise<any>`

`gateway.get(endpoint: string, options: request-promise options) -> Promise<any>`

`gateway.put(endpoint: string, body: any, options: request-promise options) -> Promise<any>`

`gateway.post(endpoint: string, body: any, options: request-promise options) -> Promise<any>`
