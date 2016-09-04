const _consul = require("consul")({ promisify: true });
const _rpc = require("request-promise");
const async = require("asyncawait/async");
const await = require("asyncawait/await");

const seconds = 1000;

let Gateway = async(({ consul = null, rpc = null, version, service, dc = null, 
    refreshDelay = 15 * seconds }) => {

  if (!consul) {
    consul = _consul;
  }

  if (!rpc) {
    rpc = _rpc;
  }

  let options = { service, tag: version };
  let nodes = await (consul.catalog.service.nodes(options));
  let addressList = nodes.map(mapAddress);

  function mapAddress(node) { 
    return `http://${node.Address}:${node.ServicePort}`; 
  }

  function roundRobin() {
    let address = addressList.pop();
    addressList.unshift(address);

    return address;
  }


  function refreshAddressList() {
    return async (function () {
      let nodes = await (consul.catalog.service.nodes(options));
      addressList = nodes.map(mapAddress);

      console.log("[INFO] Refreshing");

      setTimeout(refreshAddressList, refreshDelay);
    })();
  }

  refreshAddressList();

  return {
    get: async(function (endpoint, options = null) {
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
    }),
    put: async(function (endpoint, body, options = null) {
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
    }),
    delete: async(function (endpoint, options = null) {
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
    }),
    post: async(function (endpoint, body, options = null) {
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
    }),
    get addressList() {
      return addressList;
    }
  };
});

module.exports = Gateway;
