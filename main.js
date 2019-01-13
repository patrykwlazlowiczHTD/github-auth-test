const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const morgan = require('morgan');
const _ = require('lodash');
const graphql = require('@octokit/graphql');
const util = require('util');

const passport = require('./auth/passport');

const pullRequestQueryPart = require('./queries-part/pull-request');
const repositoriesContributedToQueryPart = require('./queries-part/repositories-contributed-to');
const repositoriesQueryPart = require('./queries-part/repositories');

const repositoriesContributedToMapper = require('./mapper/repositories-contributed-to');
const repositoriesMapper = require('./mapper/repositories');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (req.user) {
        graphql(`{
            viewer {
                ${pullRequestQueryPart}
                ${repositoriesContributedToQueryPart}
                ${repositoriesQueryPart}
            }
        }`, {
            headers: {
                authorization: `token ${req.user.token}`
            }
        }).then((data) => {
            console.log(util.inspect(data, { showHidden: true, depth: null }));
            req.user.pullRequests = _.map(data.viewer.pullRequests.edges, 'node');
            req.user.repositoriesContributedTo = _.map(data.viewer.repositoriesContributedTo.edges, repositoriesContributedToMapper);
            req.user.repositories = _.map(data.viewer.repositories.edges, repositoriesMapper);
            res.json(req.user);
        });
    } else {
        res.redirect('/auth/github');
    }
})
;
app.get('/loginFailure', (req, res) => res.status(403).json({status: 403}));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/loginFailure'}), (req, res) => res.redirect('/'));
app.listen(process.env.PORT || 4100, '0.0.0.0', () => console.log(`Application started!`));
