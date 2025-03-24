const { createOnlineSalesImage } = require("./createOnlineSalesImage");
const { processRemoteImage } = require("./processRemoteImage");
const { getNodeId, getNodeType } = require("./utils");
const { POST_NODE_TYPE } = require("./constants");

const extractPostCoverImage = async (meta, pluginOptions, nodePluginArgs) => {
  if (getNodeType(meta) !== POST_NODE_TYPE || !meta.coverImageUrl) {
    return { coverImageNodeId: null };
  }

  const { readyPath: staticUrl, fileNode } = await processRemoteImage(
    meta.coverImageUrl.startsWith("/api/")
      ? pluginOptions.prepareUrl(meta.coverImageUrl)
      : meta.coverImageUrl,
    `${getNodeId(meta, nodePluginArgs)}/cover`,
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
