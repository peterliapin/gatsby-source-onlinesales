const { extractImages } = require("./extractImages");
const { extractRelatedPosts } = require("./extractRelatedPosts");
const { extractPostCoverImage } = require("./extractPostCoverImage");
const {
  getNodeType,
  getNodeId,
  parsePost,
  getNodeLanguage,
  getNodeSlug,
  stringifyPost,
} = require("./utils");
const { fetchPosts } = require("./fetchPosts");
const {
  PAGE_NODE_TYPE,
  POST_NODE_TYPE,
  IMAGE_FILE_TYPE,
} = require("./constants");

exports.onPreInit = () => console.log("Loaded gatsby-source-onlinesales plugin");

exports.sourceNodes = async (nodePluginArgs, pluginOptions) => {
  const {
    actions: { createNode },
    createContentDigest,
  } = nodePluginArgs;

  const postsData = await fetchPosts(pluginOptions);

  // loop through data and create Gatsby nodes
  await Promise.all(
    postsData.map(async (post) => {
      const { body, meta } = parsePost(post);
      const nodeType = getNodeType(meta);
      const nodeId = getNodeId(meta, nodePluginArgs);

      try {
        const { coverImageNodeId } = await extractPostCoverImage(
          meta,
          pluginOptions,
          nodePluginArgs,
        );

        const { modifiedBody, imageFileNodes } = await extractImages(
          body,
          pluginOptions,
          nodePluginArgs,
        );

        const { relatedPostIds } = extractRelatedPosts(meta, nodePluginArgs);

        await createNode({
          id: nodeId,
          language: getNodeLanguage(meta.language),
          slug: getNodeSlug(meta.slug),
          parent: null,
          children: [],
          images: imageFileNodes,
          coverImage: coverImageNodeId,
          relatedPosts: relatedPostIds,
          internal: {
            type: nodeType,
            contentDigest: createContentDigest(modifiedBody),
            mediaType: "text/markdown",
            content: stringifyPost({ body: modifiedBody, meta }),
          },
        });

        console.log(`Created ${post.title} node ${nodeType}`);
      } catch (e) {
        console.log(e);
      }
    }),
  );
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type ${IMAGE_FILE_TYPE} implements Node {
      staticPath: String
      file: File @link
    }
    
    type ${POST_NODE_TYPE} implements Node {
      images: [${IMAGE_FILE_TYPE}] @link
      relatedPosts: [${POST_NODE_TYPE}] @link
      coverImage: ${IMAGE_FILE_TYPE} @link
    }
    
    type ${PAGE_NODE_TYPE} implements Node {
      images: [${IMAGE_FILE_TYPE}] @link
      relatedPosts: [${POST_NODE_TYPE}] @link
    }
  `);
};
