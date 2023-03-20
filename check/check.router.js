import { Router } from 'express';
import passport from 'passport';
import { Check } from './check.model.js';
import { Monitor } from '../monitor/monitor.js'

export const router = new Router();

router.post(
  '/checks',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    console.log(req.body);
    const check = new Check(req.body);
    check.userId = req.user.id;
    try {
      check.url = resolveUrl(check);
    } catch (err) { // Provided URL may be incorrect.
      res.status(400).send({ status: 'failed', message: err.message });
      return;
    }

    await check.save();
    console.log('Inserted check: ', check);

    Monitor.register(check);

    res.status(201).json({ status: 'ok', id: check.id });
  }
);

function resolveUrl(check) {
  const checkUrl = new URL(check.url);
  if (check.protocol) {
    checkUrl.protocol = check.protocol;
  }
  if (check.path) {
    checkUrl.pathname = check.path;
  }
  if (check.port >= 0) {
    checkUrl.port = check.port;
  }
  return checkUrl.toString();
}
