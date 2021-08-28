const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        console.log("Authenticating user")
        const user = getUserByEmail(email)
        if (user == null){
            console.log("No user")
            return done(null, false, { message: 'No user with that email'})
        };

        try {
            if(await bcrypt.compare(password, user.password)) {
                console.log("User authenticated.")
                return done(null, user)
            } else {
                console.log("Wrong password")
                return done(null, false, { message: 'Password incorrect'})
            };
        } catch (e) {   
            return done(e)
        };
    };
    

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
       return done(null, getUserById(id))
    })};


module.exports = initialize