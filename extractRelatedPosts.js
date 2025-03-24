const { POST_NODE_TYPE } = require("./constants");

const extractRelatedPosts = (meta, { createNodeId }) => {
  const relatedPostIds = (meta.postList || []).map(({ id }) => createNodeId(`${POST_NODE_TYPE}-${id}`));

  return { relatedPostIds };
};

module.exports = { extractRelatedPosts };
