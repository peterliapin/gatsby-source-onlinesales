const remark = require("remark");
const esmRequire = require("./esmRequire");

const { visit } = esmRequire("unist-util-visit");

const { processRemoteImage } = require("./processRemoteImage");
const { createOnlineSalesImage } = require("./createOnlineSalesImage");

const remarkProcessor = remark();

const matchCMSImage = (mdNode) => {
  if (mdNode.url) {
    return mdNode.url.match("/api/media/(.*)/(.*)");
  }

  if (mdNode.attributes.src) {
    return mdNode.attributes.src.match("/api/media/(.*)/(.*)");
  }

  return undefined;
};

const updateImageNode = (mdNode, staticPath) => {
  if (mdNode.url) {
    mdNode.url = staticPath;
  } else if (mdNode.attributes.src) {
    mdNode.attributes.src = staticPath;
    mdNode.data.hProperties.src = staticPath;
  }
};

const getImageNodes = (MDTree) => {
  const imageNodes = [];

  visit(MDTree, (node) => {
    if (
      node.type !== "image"
      && node.type !== "leafDirective"
      && node.name !== "img"
    ) {
      return;
    }
    imageNodes.push(node);
  });

  return imageNodes;
};

const processImage = async (imageNode, apiUrl, nodePluginArgs) => {
  const imageMatch = matchCMSImage(imageNode);

  if (!imageMatch) {
    return;
  }

  const imageUrl = `${apiUrl}${imageMatch[0]}`;
  const scope = imageMatch[1];

  const { fileNode, readyPath } = await processRemoteImage(
    imageUrl,
    scope,
    nodePluginArgs,
  );

  updateImageNode(imageNode, readyPath);

  const imageNodeId = await createOnlineSalesImage(
    fileNode,
    readyPath,
    nodePluginArgs,
  );

  return imageNodeId;
};

const extractImages = async (postBody, pluginOptions, nodePluginArgs) => {
  const MDTree = remarkProcessor.parse(postBody);

  const imageNodes = getImageNodes(MDTree);

  const imageFileNodes = await Promise.all(
    imageNodes.map((node) => processImage(node, pluginOptions.apiUrl, nodePluginArgs)),
  );

  return {
    imageFileNodes: imageFileNodes.filter((nodeId) => nodeId != null),
    modifiedBody: remarkProcessor.stringify(MDTree),
  };
};

module.exports = { extractImages };
