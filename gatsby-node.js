const axios = require("axios");
const matter = require("gray-matter");

const extractImages = require("./extractImages");
const processRemoteImage = require("./processRemoteImage");
const {
  PAGE_NODE_TYPE,
  POST_NODE_TYPE,
  IMAGE_FILE_TYPE,
} = require("./constants");

exports.onPreInit = () =>
  console.log("Loaded gatsby-source-onlinesales plugin");

const getNodeType = (type) =>
  type === "post" ? POST_NODE_TYPE : PAGE_NODE_TYPE;

const getNodeLanguage = (
  languageCode /* assuming ISO 639-1 or BCP 47 language code string format */
) =>
  typeof languageCode === "string" && !!languageCode
    ? languageCode.toLowerCase().split("-")[0]
    : "en";

const getNodeSlug = (slug) =>
  slug != null ? slug.split("/").reverse()[0] : "";

const parsePost = ({ body, ...attrs }) => {
  const { content, data } = matter(body);

  return { body: content, meta: { ...attrs, ...data } };
};

exports.sourceNodes = async (nodePluginArgs, options) => {
  const { actions, createContentDigest, createNodeId, getCache, cache } =
    nodePluginArgs;
  const { createNode } = actions;

  let allData = [];
  const postsUrl = new URL(options.postUrl);
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

  // loop through data and create Gatsby nodes
  await Promise.all(
    allData.map(async (post) => {
      const { body, meta } = parsePost(post);

      const nodeType = getNodeType(meta.type);
      const nodeId = createNodeId(`${nodeType}-${meta.id}`);

      try {
        if (meta.coverImageUrl) {
          if (meta.coverImageUrl.startsWith("/api/")) {
            const { readyPath: staticUrl } = await processRemoteImage(
              options.prepareUrl(meta.coverImageUrl),
              nodeId,
              nodePluginArgs
            );
            console.log(`Created ${staticUrl} cover image`);
            meta.coverImageUrl = staticUrl;
          }
        }

        if (meta.avatar) {
          if (meta.avatar.startsWith("/api/")) {
            const { readyPath: staticUrl } = await processRemoteImage(
              options.prepareUrl(meta.avatar),
              nodeId,
              nodePluginArgs
            );
            console.log(`Created ${staticUrl} avatar image`);
            meta.avatar = staticUrl;
          }
        }

        const { modifiedBody, imageFileNodes } = await extractImages(
          body,
          options.apiUrl,
          nodePluginArgs
        );

        createNode({
          id: nodeId,
          language: getNodeLanguage(meta.language),
          slug: getNodeSlug(meta.slug),
          parent: null,
          children: [],
          images: imageFileNodes,
          internal: {
            type: nodeType,
            contentDigest: createContentDigest(modifiedBody),
            mediaType: "text/markdown",
            content: matter.stringify(modifiedBody, meta),
          },
        });
      } catch (e) {
        console.log(e);
      }
      console.log(`Created ${post.title} node ${nodeType}`);
    })
  );
  return;
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
    }

    type ${PAGE_NODE_TYPE} implements Node {
      images: [${IMAGE_FILE_TYPE}] @link
    }
  `);
};
