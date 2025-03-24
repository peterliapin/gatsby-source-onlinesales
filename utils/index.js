const matter = require("gray-matter");
const { POST_NODE_TYPE, PAGE_NODE_TYPE } = require("../constants");

const getNodeType = (meta) => (meta.type === "post" ? POST_NODE_TYPE : PAGE_NODE_TYPE);

const getNodeId = (meta, nodePluginArgs) => {
  const { createNodeId } = nodePluginArgs;

  return createNodeId(`${getNodeType(meta)}-${meta.id}`);
};

const getNodeLanguage = (
  languageCode, /* assuming ISO 639-1 or BCP 47 language code string format */
) => (typeof languageCode === "string" && !!languageCode
  ? languageCode.replace(/\//g, "").toLowerCase().split("-")[0]
  : "en");

const getNodeSlug = (slug) => (slug != null ? slug.split("/").reverse()[0] : "");

const parsePost = ({ body, ...attrs }) => {
  const { content, data } = matter(body);

  return { body: content, meta: { ...attrs, ...data } };
};

const stringifyPost = ({ meta, body }) => matter.stringify(body, meta);

module.exports = {
  getNodeId,
  getNodeLanguage,
  getNodeSlug,
  getNodeType,
  parsePost,
  stringifyPost,
};
