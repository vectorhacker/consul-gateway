const _consul = require("consul")({ promisify: true });
const _rpc = require("request-promise");
const async = require("asyncawait/async");
const await = require("asyncawait/await");

const seconds = 1000;

let Gateway = async(({ consul = null, rpc = null, version, service, 
    dc = null, refreshDelay = 15 * seconds }) => {

  if (!consul) {
    consul = _consul;
  }

  if (!rpc) {
    rpc = _rpc;
  }

  let addressList = [];
  let options = { service, tag: version };
  let nodes = await (consul.catalog.service.nodes(options));

  let map = (node) => { return "http://" + node.Address + ":" + node.ServicePort; };
  let i = 0;

  function roundRobin() {
    let address = addressList[Math.floor(Math.random() * addressList.length) % addressList.length];
    
    console.log("[INFO] Requesting", address);

    return address;
  }

  addressList = nodes.map(map);

  let refreshAddressList = async (function () {
    let nodes = await (consul.catalog.service.nodes(options));
    addressList = nodes.map(map);

    console.log("[INFO] Refreshing");
    setTimeout(refreshAddressList, refreshDelay);
  });

  refreshAddressList();

  let get = async(function (endpoint, options = null) {
    let address = roundRobin();
    console.log("[INFO] getting", address, endpoint);
    let requestOptions = {
      uri: address + endpoint,
      method: "GET",
      json: true
    };

    if (options) {
      requestOptions = Object.assign(requestOptions, options || {});
    }

    try {
      let result = await (rpc(requestOptions));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  });

  let post = async(function (endpoint, body, options = null) {
    let address = roundRobin();
    console.log("[INFO] post", address, endpoint);
    let requestOptions = {
      uri: address + endpoint,
      method: "POST",
      body,
      json: true
    };

    requestOptions = Object.assign(requestOptions, options || {});

    try {
      let result = await (rpc(requestOptions));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  });

  let put = async(function (endpoint, body, options = null) {
    let address = roundRobin();
    console.log("[INFO] put", address, endpoint);
    let requestOptions = {
      uri: address + endpoint,
      method: "PUT",
      body,
      json: true
    };

    requestOptions = Object.assign(requestOptions, options || {});

    try {
      let result = await (rpc(requestOptions));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  });

  let del = async(function (endpoint, options = null) {
    let address = roundRobin();
    console.log("[INFO] deleting", address, endpoint);
    let requestOptions = {
      uri: address + endpoint,
      method: "DELETE",
      json: true
    };

    requestOptions = Object.assign(requestOptions, options || {});

    try {
      let result = await (rpc(requestOptions));
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  });

  return {
    get,
    post,
    delete: del,
    put,
    get addressList() {
      return addressList;
    }
  };
});

module.exports = Gateway;
