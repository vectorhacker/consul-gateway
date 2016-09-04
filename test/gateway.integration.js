const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http");
const consul = require("consul")({ promisify: true });
const assert = require("assert");
const Gateway = require("../gateway");

let results = [{ test: "test1" }];

app
  .get("/test", (req, res) => {
    console.log("[INFO] Request made to /test");
    res.send(results);
  })
  .post("/test", bodyParser.json(), (req, res) => {
    let test = req.body.test;
    results.push({ test });

    res.send(results);
  })
  .put("/test/:test", bodyParser.json(), (req, res) => {
    results.forEach((test, index) => {
      if (req.params.test === test) {
        results[indezx] = req.body.test;
      }
    });

    res.send(results);
  })
  .delete("/test/:test", bodyParser.json(), (req, res) => {
    results = results.filter(test => {
      return test !== req.params.test;
    });

    res.send(results);
  })
  .get("/check", (req, res) => res.send("OK"));


let gateway = null;

let server = http.createServer(app);

describe("Gateway", () => {
  beforeEach((done) => {
    server.listen(3000);
    consul.agent.service.register({
      name: "test",
      id: "test1",
      tags: ["1.0"],
      port: 3000,
      address: "10.211.55.30",
      check: {
        http: "/check",
        interval: "15s"
      }
    })
    .then(() => {
      return Gateway({ service: "test", version: "1.0" });
    })
    .then(_gateway => {
      gateway = _gateway;
      done();
    }, done);
  });

  afterEach((done) => {
    gateway = null;
    consul.agent.service.deregister("test1")
      .then(() => { 
        server.close(error => {
          if (error) {
            return done(error);
          }
          done();
        }); 
      }, done);
  });

  describe("#addressList: string[]", () => {
    it("should list one address", done => {
      assert.equal(gateway.addressList.length, 1);
      assert.equal(gateway.addressList[0], "http://10.211.55.30:3000");
      done();
    });
  });

  describe("#get", () => {
    it("should get list", function (done) {
      this.timeout(5000);
      gateway.get("/test")
        .then(res => {
          assert.deepEqual(res, results);
          done();
        })
        .catch(error => {
          done(error);
        });
      });
  });

  describe("#post", () => {
    it("should get list", function (done) {
      this.timeout(5000);
      gateway.post("/test", { test: "test2" })
        .then(res => {
          assert.deepEqual(res, results);
          done();
        })
        .catch(error => {
          done(error);
        });
      });
  });

  describe("#delete", () => {
    it("should get list", function (done) {
      this.timeout(5000);
      gateway.delete("/test/:test2")
        .then(res => {
          assert.deepEqual(res, results);
          done();
        })
        .catch(error => {
          done(error);
        });
      });
  });

  describe("#put", () => {
    it("should get list", function (done) {
      this.timeout(5000);
      gateway.delete("/test/:test1", { test: "testB" })
        .then(res => {
          assert.deepEqual(res, results);
          done();
        })
        .catch(error => {
          done(error);
        });
      });
  });
});
