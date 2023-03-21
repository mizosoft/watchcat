import { Router } from 'express';
import passport from 'passport';
import { Check } from '../check/check.model.js';
import { Monitor } from '../monitor/monitor.js';
import { generateReport } from './generator.js';

export const router = new Router();

router.use('/reports', passport.authenticate('jwt', { session: false }));

router.get('/reports/:checkId', async (req, res) => {
  const check = await Check.findOne({ _id: req.params.checkId, userId: req.user.id });
  if (check) {
    const report = await generateReport(check, Date.now(), req.query.history);
    res.status(200).send({ status: 'ok', report });
  } else {
    res.status(404).send({ status: 'failed', message: "Couldn't find a check with the given ID." });
  }
});

router.get('/reports', async (req, res) => {
  let query = Check.find({ userId: req.user.id });
  if (req.query.url) {
    query = query.where({ url: req.query.url });
  }
  if (req.query.tag) {
    query = query.where({ tags: { $all: [req.query.tag].flat().map(s => s.toLowerCase()) } });
  }

  const checks = await query;
  const reports = await Promise.all(checks.map(
    check => generateReport(check, Date.now(), req.query.history)));
  res.status(200).send({ status: 'ok', reports });
});
