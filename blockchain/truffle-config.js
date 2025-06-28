module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Ganache RPC host
      port: 7545,            // Ganache RPC port
      network_id: "5777",       // Any network
    },
  },
  compilers: {
    solc: {
      version: "0.8.18",      // Match your contract version
    },
  },
};
