const axios = require('axios');
const matter = require('gray-matter');
const { createRemoteFileNode  } = require(`gatsby-source-filesystem`)

exports.onPreInit = () => console.log("Loaded gatsby-source-onlinesales plugin")

const POST_NODE_TYPE = `Post`

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getCache,
  cache,

}, options) => {
  const { createNode } = actions
  const response = await axios.get(options.postUrl);
  console.log(`Loaded ${response.data.length} posts`);

  // loop through data and create Gatsby nodes
  await Promise.all(response.data.map(async post => {
    //Put post information in frontmatter
    const content = matter(post.content);
    Object.assign(content.data, post);
    delete content.data.content;

    const nodeId = createNodeId(`${POST_NODE_TYPE}-${post.id}`);
    try {
    if (post.coverImageUrl){
      await createRemoteFileNode({
        url: options.prepareUrl(post.coverImageUrl),
        parentNodeId: nodeId,
        getCache,
        createNode,
        createNodeId,
        cache,
      });
      console.log(`Created ${post.coverImageUrl} file`);
    }
    if (content.data.avatar){
      await createRemoteFileNode({
        url: options.prepareUrl(content.data.avatar),
        parentNodeId: nodeId,
        getCache,
        createNode,
        createNodeId,
        cache,
      });
      console.log(`Created ${content.data.avatar} file`);
    }

    createNode({
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        contentDigest: createContentDigest(post.content),
        mediaType: 'text/markdown',
        content: matter.stringify(content.content, content.data),
      },
    })
  }
  catch(e){
    console.log(e);
  }
    console.log(`Created ${post.title} node`);
}));
  return
}