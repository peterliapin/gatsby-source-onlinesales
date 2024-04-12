const { IMAGE_FILE_TYPE } = require("./constants");

const createOnlineSalesImage = async (fileNode, staticPath, nodePluginArgs) => {
  const {
    actions: { createNode },
  } = nodePluginArgs;

  const imageNodeId = `${IMAGE_FILE_TYPE}-${fileNode.id}`;

  await createNode({
    id: imageNodeId,
    staticPath, // will be used as a fallback
    parent: null,
    children: [],
    file: fileNode.id,
    internal: {
      type: IMAGE_FILE_TYPE,
      content: fileNode.internal.content,
      contentDigest: fileNode.internal.contentDigest,
    },
  });

  return imageNodeId;
};

module.exports = { createOnlineSalesImage };
