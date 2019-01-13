module.exports = `repositoriesContributedTo(first: 100, includeUserRepositories: true) {
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
