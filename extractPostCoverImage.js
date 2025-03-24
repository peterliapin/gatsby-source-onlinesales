const { createOnlineSalesImage } = require("./createOnlineSalesImage");
const { getNodeId, getNodeType } = require("./utils");
const { POST_NODE_TYPE } = require("./constants");

const extractPostCoverImage = async (meta, provider, nodePluginArgs) => {
  if (getNodeType(meta) !== POST_NODE_TYPE || !meta.coverImageUrl) {
    return { coverImageNodeId: null };
  }

  const nodeId = getNodeId(meta, nodePluginArgs);
  const { readyPath: staticUrl, fileNode } = await provider.fetchMedia(
    meta.coverImageUrl,
    `${nodeId}/cover`,
    nodePluginArgs,
  );

  meta.coverImageUrl = staticUrl;

  const coverImageNodeId = await createOnlineSalesImage(
    fileNode,
    staticUrl,
    nodePluginArgs,
  );

  return { coverImageNodeId };
};

module.exports = { extractPostCoverImage };
