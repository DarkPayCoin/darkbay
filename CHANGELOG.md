# Changelog

## M3

### SEO optimizations

It’s essential for any storefrontging platform or a social network to be indexed by the search engines so other people could find your storefronts or products through a web search.

- Integration with Next.js for server-side rendering of read-only parts: view storefront, product, comment, and public user’s profile.
- Server-side rendering of a storefront.
- Server-side rendering of a product.
- Server-side rendering of every comment.
- Server-side rendering of a user profile. (Profiles should be optional)

### Full-text search

Currently, it’s hard to build a full-text search service in a decentralized way because we don’t have a proper incentivization model for technology that is not built on blockchain (as a full-text search is). That's why we will implement it as a centralized service built on the open-source technology: [ElasticSearch](https://www.elastic.co/).

- Full-text search for storefronts.
- Full-text search for products.

## M2

### Rating and reputation

- Update a comment rating after the comment upvoted/downvoted.
- Update a product rating after it has been upvoted/downvoted.
- Update a storefront rating after its product has been upvoted/downvoted.
- Update an account/member reputation after their product/comment upvoted/downvoted.

### Activity stream

- Follow an account.
- List storefronts you follow.
- List accounts you follow.
- List account followers.
- Render an activity stream based on the storefronts you follow.
- Render an activity stream based on the accounts you follow.
- Share a product with your followers (the product will be included in their activity stream).

## M1

### IPFS integration

Currently we store all text content onchain. And in this milestone we want to refactor Darkdot module to store text content of storefronts, products and comments on IPFS.

- Store storefronts on IPFS (name, description, cover image, etc.).
- Store products on IPFS (title, body, summary, tags, cover image, publishing date, etc.)
- Store comments on IPFS.
- Store public member profiles on IPFS (username, avatar, about, links to other social networks).

### Edit history

Store an edit history on IPFS + list of CIDs in Substrate storage in a corresponding struct: storefront, product, comment or profile.

- Save and view an edit history of a product.
- Save and view an edit history of a storefront.
- Save and view an edit history of a comment.
- Save and view an edit history of a member profile.
