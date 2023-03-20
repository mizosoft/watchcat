import { Router } from 'express';
import passport from 'passport';
import { User } from './user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const router = new Router();

router.post(
  '/users',
  (req, res, next) => {
    passport.authenticate('register', { session: false }, async (err, user) => {
      if (err) {
        return next(err);
      }

      if (user) {
        console.log('User already exists');
        res.status(409).send({ status: 'failed', message: 'User already exists.' });
      } else {
        console.log('Creating new user: ' + JSON.stringify(req.body));
        const user = new User(req.body);
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        res.status(201).send({ status: 'ok' });
      }
    })(req, res, next);
  });

router.post('/users/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (user) {
      const options = {};
      if (res.locals.jwtExpiry) {
        options.expiresIn = res.locals.jwtExpiry;
      }
      const token = jwt.sign({ userId: user.id }, res.locals.jwtSecret, options);
      res.json({ status: 'ok', token });
    } else {
      res.json({ status: 'failed', message: 'Invalid email or password.' });
    }
  })(req, res, next);
});
