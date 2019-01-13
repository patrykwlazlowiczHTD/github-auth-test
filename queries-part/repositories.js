module.exports = `repositories(first: 100,
                               privacy: PRIVATE,
                               affiliations: [ORGANIZATION_MEMBER, COLLABORATOR, OWNER],
                               ownerAffiliations: [ORGANIZATION_MEMBER, COLLABORATOR, OWNER]) {
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
