const _ = require('lodash');

module.exports = (repository) => {
    return {
        name: repository.node.name,
        commits: _.map(repository.node.ref.target.history.edges, 'node.messageHeadline')
    };
};
