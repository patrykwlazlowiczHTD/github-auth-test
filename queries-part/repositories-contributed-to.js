module.exports = `repositoriesContributedTo(first: 100) {
                    edges {
                        node {
                            name
                            ref(qualifiedName: "master") {
                                target {
                                    ... on Commit {
                                        history(first: 100) {
                                            edges {
                                                node {
                                                    messageHeadline
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`;
