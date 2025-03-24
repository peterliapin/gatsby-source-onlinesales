class BaseDataProvider {
  constructor(options) {
    this.options = options;
  }

  // Should return an array of content items
  async fetchContent() {
    throw new Error('Method fetchContent() must be implemented');
  }
  
  // Should process and fetch a remote image
  async fetchMedia(url, scope, nodePluginArgs) {
    throw new Error('Method fetchMedia() must be implemented');
  }

  // Process media URL if needed
  prepareMediaUrl(url) {
    throw new Error('Method prepareMediaUrl() must be implemented');
  }
}

module.exports = { BaseDataProvider };
