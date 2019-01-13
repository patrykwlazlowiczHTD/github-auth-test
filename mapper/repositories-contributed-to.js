const _ = require('lodash');

module.exports = (repositoryContributedTo) => {
    return {
        name: repositoryContributedTo.node.name,
        commits: _.map(repositoryContributedTo.node.ref.target.history.edges, 'node.messageHeadline')
    };
};
