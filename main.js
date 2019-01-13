const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const morgan = require('morgan');
const _ = require('lodash');
const graphql = require('@octokit/graphql');
const util = require('util');

const pullRequestQueryPart = require('./queries-part/pull-request');
const repositoriesContributedTo = require('./queries-part/repositories-contributed-to');

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
const APP_PORT = process.env.PORT || 4100;
const APP_URL = process.env.APP_URL || 'http://127.0.0.1';
const GITHUB_CLIENT_CALLBACK = process.env.APP_URL ? `${APP_URL}auth/github/callback` : `${APP_URL}:${APP_PORT}/auth/github/callback`;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '46cd8365e525e9c25d44';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '9ae7aad707674bf89e08f201529b3ec63b6f0513';

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CLIENT_CALLBACK
    },
    (accessToken, refreshToken, profile, cb) => {
        const user = {
            token: null,
            githubProfile: null
        };
        user.token = accessToken;
        user.githubProfile = _.omit(profile, ['_raw', '_json']);
        return cb(null, user);
    }
));
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get('/', (req, res) => {
    if (req.user) {
        graphql(`{
            viewer {
                ${pullRequestQueryPart}
                ${repositoriesContributedTo}
            }
        }`, {
            headers: {
                authorization: `token ${req.user.token}`
            }
        }).then((data) => {
            console.log(util.inspect(data, { showHidden: true, depth: null }));
            req.user.pullRequests = _.map(data.viewer.pullRequests.edges, 'node');
            req.user.repositories = _.map(data.viewer.repositoriesContributedTo.edges, (repository) => {
                return {
                    name: repository.node.name,
                    commits: _.map(repository.node.ref.target.history.edges, 'node.messageHeadline')
                };
            });

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
app.listen(APP_PORT, '0.0.0.0', () => console.log(`Example app listening on port ${APP_PORT}!`));
