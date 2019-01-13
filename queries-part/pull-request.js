module.exports = `pullRequests(first: 100) {
                    edges {
                        node {
                            title
                            bodyText
                            createdAt
                            publishedAt
                            additions
                            deletions
                            changedFiles
                            repository {
                                name
                            }
                        }
                    }
                }`;
