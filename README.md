# gatsby-source-onlinesales

Downloads posts data from [OnlineSales backend](https://github.com/peterliapin/onlinesales.core) And saves them to be processed later with `gatsby-transformer-remark`


# Install

    npm install gatsby-source-onlinesales

# How to setup

{
	resolve:  'gatsby-source-onlinesales',
	options: {
			prepareUrl: (url) => (url.startsWith('http') ? url : `${process.env.GATSBY_URL}${url}`),
			url:  `${process.env.GATSBY_API_POSTS}`,
		},
},

# Options
`postUrl` : url to query posts for example: `https://onlinesales.test/api/posts`
`prepareUrl`: method to process images link with

# Supported versions

|                |ASCII                          
|----------------|-------------------------------
|Gatsby 5|`Unknown`            
|Gatsby 4         |`Supported`            
|Gatsby 3         |`Unknown`