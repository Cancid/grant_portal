const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt')
require('dotenv').config();

function initialize(passport, getUserByEmail, getUserById) {
    // TODO: Make login work with DB
    const authenticateUser = async (email, password, done) => {
        console.log(email)
        let user = null
        user = await getUserByEmail(email)
        console.log(user)
        if (user == null){
            console.log("No user")
            return done(null, false, { message: 'No user with that email'})
        };
        try {
            if(await bcrypt.compare(password, user.password)) {
                console.log("User authenticated.")
                const body = { id: user.id,  email: user.email };
                return done(null, user)
            } else {
                console.log("Wrong password")
                return done(null, false, { message: 'Password incorrect'})
            };
        } catch (e) {   
            return done(e)
        };
    };
     
    
    console.log("Passport.use")
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => {
        console.log("Serializing:", user.user_id)
        done(null, user.user_id)});
    passport.deserializeUser((id, done) => {
        console.log(id);
        return done(null, getUserById(id));
    });


 
    // Use the GoogleStrategy within Passport.
    //   Strategies in passport require a `verify` function, which accept
    //   credentials (in this case, a token, tokenSecret, and Google profile), and
    //   invoke a callback with a user object.
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        consumerSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/grants"
    },
    function(token, tokenSecret, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
    ));
};


module.exports = initialize