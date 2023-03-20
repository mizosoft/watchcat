import passport from 'passport';
import { User } from '../user/user.model.js';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare("" + password, user.password))) { // This fails when passowrd isn't a string.
      done(null, false);
    } else {
      done(null, user);
    }
  }
);

export function setup(config) {
  // Register & login authentication.
  passport.use('register', localStrategy);
  passport.use('login', localStrategy);

  // JWT authentication for API calls.
  passport.use(
    new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
      // issuer: '??',
      // audience: '??',
    }, async (token, done) => {
      const user = await User.findOne({ _id: token.userId });
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    }));
};
