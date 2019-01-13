const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const _ = require('lodash');

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

module.exports = passport;
