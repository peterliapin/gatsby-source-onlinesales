const { BaseDataProvider } = require("../base/provider");
const { OnlineSalesApiClient } = require("./api-client");
const { processRemoteImage } = require("../../processRemoteImage");

class OnlineSalesAPIProvider extends BaseDataProvider {
  constructor(options) {
    super(options);
    this.apiClient = new OnlineSalesApiClient(options);
  }

  async fetchContent() {
    return this.apiClient.fetchPosts();
  }

  async fetchMedia(url, scope, nodePluginArgs) {
    const preparedUrl = this.prepareMediaUrl(url);
    return processRemoteImage(preparedUrl, scope, nodePluginArgs);
  }

  prepareMediaUrl(url) {
    return this.apiClient.prepareMediaUrl(url);
  }
}

module.exports = { OnlineSalesAPIProvider };
