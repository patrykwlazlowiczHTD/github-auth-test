const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const morgan = require('morgan');
const _ = require('lodash');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
const port = 4100;
const GITHUB_CLIENT_ID = '0271694887d9a608dcd4';
const GITHUB_CLIENT_SECRET = 'ba947565ddd4833aeb1a3830a0a3b65abd12c9ad';
let user = {
    token: null,
    githubProfile: null
};

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:4100/auth/github/callback"
    },
    (accessToken, refreshToken, profile, cb) => {
        user.token = accessToken;
        user.githubProfile = _.omit(profile, ['_raw', '_json']);
        return cb(null, profile);
    }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.get('/', (req, res) => {
    if (req.user) {
        res.json(user);
    } else {
        res.redirect('/auth/github');
    }
});
app.get('/loginFailure', (req, res) => res.status(403).json({status: 403}));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/loginFailure' }), (req, res) => res.redirect('/'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
