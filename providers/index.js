const { OnlineSalesAPIProvider } = require("./onlinesales-api");

const createDataProvider = (type, options) => {
  switch (type) {
    case "onlinesales":
    default:
      return new OnlineSalesAPIProvider(options);
  }
};

module.exports = { createDataProvider, OnlineSalesAPIProvider };
