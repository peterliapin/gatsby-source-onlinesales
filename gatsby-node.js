const axios = require('axios');
const matter = require('gray-matter');
const fs = require('fs-extra');
const path = require('path');

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
  const processRemoteImage = async (url, folder) => {
    const nodeId = createNodeId(`RemoteImage-${url}`);
    const fileNode = await createRemoteFileNode({
        url,
        parentNodeId: nodeId,
        getCache,
        createNode,
        createNodeId,
        cache,
    });
    const fileName = `${fileNode.name}${fileNode.ext}`;
    const outputPath = path.join(process.cwd(), 'public', 'static', folder);
    const filePath = path.join(outputPath, fileName);
    await fs.ensureDir(outputPath);
    await fs.copy(fileNode.absolutePath, filePath);
    const readyPath = `/static/${folder}/${fileName}`;
    return readyPath;
  };
  let allData = []; 
  while(true){
    const response = await axios.get(options.postUrl);
    const totalCount = response.headers['x-total-count'] || response.data.length; // fallback in case of old backend and pagination not available
    allData.push(...response.data);
    console.log(`Loaded ${allData.length} posts of ${totalCount}`);
    if (allData.length >= totalCount) {
      break;
    }
  }

  // loop through data and create Gatsby nodes
  await Promise.all(allData.map(async post => {
    //Put post information in frontmatter
    const content = matter(post.body);
    Object.assign(post, content.data);
    delete post.body;

    const nodeId = createNodeId(`${POST_NODE_TYPE}-${post.id}`);
    try {
    if (post.coverImageUrl){
      if (post.coverImageUrl.startsWith('/api/')) {
        const staticUrl = await processRemoteImage(options.prepareUrl(post.coverImageUrl), post.slug);
        console.log(`Created ${staticUrl} image`);
        post.coverImageUrl = staticUrl;
      }
    }
    if (post.avatar){
      if (post.avatar.startsWith('/api/')) {
        const staticUrl = await processRemoteImage(options.prepareUrl(post.avatar), post.slug);
        console.log(`Created ${staticUrl} image`);
        post.avatar = staticUrl;
      }
    }

    createNode({
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        contentDigest: createContentDigest(content.content),
        mediaType: 'text/markdown',
        content: matter.stringify(content.content, post),
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
