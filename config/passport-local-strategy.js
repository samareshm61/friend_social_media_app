const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

// authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {
        const user = await User.findOne({ email: email });

        if (!user || user.password !== password) {
          req.flash("error", "Invalid Username/Password");
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        req.flash("error", err);
        return done(err);
      }
    }
  )
);

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  try {
    done(null, user.id);
  } catch (err) {
    console.error("Error in serializing user --> Passport", err);
    done(err);
  }
});

passport.deserializeUser(function (id, done) {
  try {
    User.findById(id, function (err, user) {
      if (err) {
        console.error("Error in finding user --> Passport", err);
        return done(err);
      }

      return done(null, user);
    });
  } catch (err) {
    console.error("Error in deserializing user --> Passport", err);
    done(err);
  }
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return res.redirect("/users/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }

  next();
};
module.exports = passport;
