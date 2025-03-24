const fs = require("fs-extra");
const path = require("path");

const { createRemoteFileNode } = require("gatsby-source-filesystem");

const processRemoteImage = async (url, scope, nodePluginArgs) => {
  const {
    actions: { createNode },
    createNodeId,
    getCache,
    cache,
  } = nodePluginArgs;

  const fileNode = await createRemoteFileNode({
    url,
    getCache,
    createNode,
    createNodeId,
    cache,
  });

  const fileName = `${fileNode.name}${fileNode.ext}`;
  const outputPath = path.join(process.cwd(), "public", "static", scope);
  const filePath = path.join(outputPath, fileName);
  await fs.ensureDir(outputPath);
  await fs.copy(fileNode.absolutePath, filePath);
  const readyPath = `/static/${scope}/${fileName}`;

  console.log(`Created ${fileName} file at ${readyPath}`);

  return { readyPath, fileNode };
};

module.exports = { processRemoteImage };
