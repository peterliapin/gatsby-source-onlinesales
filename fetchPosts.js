const axios = require("axios");

const fetchPosts = async (pluginOptions) => {
  let allData = [];
  const postsUrl = new URL(pluginOptions.postUrl);
  postsUrl.searchParams.set("filter[limit]", 100);
  while (true) {
    postsUrl.searchParams.set("filter[skip]", allData.length);
    const response = await axios.get(postsUrl.toString());
    const totalCount =
      response.headers["x-total-count"] || response.data.length; // fallback in case of old backend and pagination not available
    allData.push(...response.data);
    console.log(`Loaded ${allData.length} posts of ${totalCount}`);
    if (totalCount == allData.length) {
      break;
    }
  }

  return allData;
};

module.exports = { fetchPosts };
