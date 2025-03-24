const axios = require("axios");

class OnlineSalesApiClient {
  constructor(options) {
    this.options = options;
  }

  async fetchPosts() {
    const allData = [];
    const postsUrl = new URL(this.options.postUrl);

    postsUrl.searchParams.set("filter[limit]", 100);

    if (this.options.language) {
      postsUrl.searchParams.set("filter[where][language][like]", this.options.language);
    }

    while (true) {
      postsUrl.searchParams.set("filter[skip]", allData.length);
      const response = await axios.get(postsUrl.toString());
      const totalCount
        = response.headers["x-total-count"] || response.data.length;
      allData.push(...response.data);
      console.log(`Loaded ${allData.length} posts of ${totalCount}`);
      if (totalCount == allData.length) {
        break;
      }
    }

    return allData;
  }

  prepareMediaUrl(url) {
    if (url.startsWith("/api/")) {
      return this.options.prepareUrl(url);
    }
    return url;
  }
}

module.exports = { OnlineSalesApiClient };
