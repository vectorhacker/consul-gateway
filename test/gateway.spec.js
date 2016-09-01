let Gateway = require("../gateway");
const EventEmiter = require("events");
const async = require("asyncawait/async");
const await = require("asyncawait/await");
const assert = require("assert");

let nodes = [];
let catalogError = null;
let events = null;

let consul = {
  catalog: {
    service: {
      nodes(options, callback) {
        if (callback) {
          if (catalogError) {
            return callback(catalogError, null);
          }
          return callback(nodes);
        }

        return catalogError ? Promise.reject(catalogError) : Promise.resolve(nodes);
      }
    }
  }
};

let rpcError = null;
let results = null;

function rpc(args) {
  return new Promise((resolve, reject) => {
    if (rpcError) {
      return reject(rpcErr);
    }

    resolve(results);
  });
}

describe("Gateway", () => {
  let gateway = null;

  beforeEach(done => {
    events = new EventEmiter();
    nodes = [{
        "Node": "node1",
        "Address": "127.0.0.1",
        "ServiceID": "test",
        "ServiceName": "test",
        "ServiceTags": [
              "1.0"
            ],
        "ServicePort": 8080
      }];

      Gateway({ consul, rpc, service: "test", version: "1.0" })
          .then(_gateway => {
            gateway = _gateway;
            done();
          }, done);
  });

  describe("#addressList", () => {
    it("should get address list", done => {
      let address = gateway.addressList[0];
      assert.equal(address, "http://127.0.0.1:8080");
      done();
    });
  });

  describe("#get", () => {
    it("should get json from test service", done => {
      results = [{test: "test1"}, {test: "test2"}];

      gateway.get("/test")
        .then(res => {
          assert.notEqual(res, null);
          assert.deepEqual(res, results);
          done();
        }, done);
    });
  });

  describe("#post", () => {
    it("should post json to test service", done => {
      results = [{test: "test1"}, {test: "test2"}, {test: "test3"}];

      gateway.post("/test", { test: "test3" })
        .then(res => {
          assert.notEqual(res, null);
          assert.deepEqual(res, results);
          done();
        }, done);
    });
  });

  describe("#delete", () => {
    it("should delete json to test service", done => {
      results = [{test: "test1"}];

      gateway.delete("/test/test2")
        .then(res => {
          assert.notEqual(res, null);
          assert.deepEqual(res, results);
          done();
        }, done);
    });
  });  

  describe("#put", () => {
    it("should put json to test service", done => {
      results = [{test: "testB"}];

      gateway.put("/test/test1", { test: "testB" })
        .then(res => {
          assert.deepEqual(res, results);
          done();
        });
    });
  });
});
