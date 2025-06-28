require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0x183418434e48b16a2d424498b16ac9462401b7ba83ec79b17c23716579b4d2e0" // paste from Ganache
      ]
    }
  }
};
