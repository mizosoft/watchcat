import { Router } from 'express';
import passport from 'passport';
import { Check } from './check.model.js';
import { Monitor } from '../monitor/monitor.js'

export const router = new Router();

router.use('/checks', passport.authenticate('jwt', { session: false }));

router.post('/checks', async (req, res) => {
  const check = new Check(req.body);
  check.userId = req.user.id;
  check.tags = [check.tags].flat().map(s => s.toLowerCase());

  // Check that the url is resolvable.
  try {
    check.resolveUrl();
  } catch (err) {
    res.status(400).send({ status: 'failed', message: err.message });
    return;
  }

  await check.save();
  console.log('Inserted check: ', check);

  Monitor.registerIfActive(check);

  res.status(201).json({ status: 'ok', id: check.id });
});

router.get('/checks/:id', async (req, res) => {
  const check = await Check.findOne({ _id: req.params.id, userId: req.user.id });
  if (check) {
    res.status(200).send({ status: 'ok', check: check.toObject() });
  } else {
    res.status(404).send({ status: 'failed', message: "Coudln't find a check with the given ID for the user." });
  }
});

router.get('/checks', async (req, res) => {
  let query = Check.find({ userId: req.user.id });
  if (req.query.url) {
    query = query.where({ url: req.query.url });
  }
  if (req.query.tag) {
    query = query.where({ tags: { $all: [req.query.tag].flat().map(s => s.toLowerCase()) } });
  }
  
  const checks = await query;
  res.status(200).send({ status: 'ok', checks: checks.map(check => check.toObject()) });
});

router.patch('/checks/:id', async (req, res) => {
  const check = await Check.findOneAndUpdate({
    _id: req.params.id, userId: req.user.id
  }, req.body, { new: true });
  if (check) {
    if (check.active) {
      Monitor.registerIfActive(check);
    } else {
      Monitor.active[check.id]?.stop();
    }
    res.status(200).send({ status: 'ok', check: check.toObject() });
  } else {
    res.status(404).send({ status: 'failed', message: "Coudln't find a check with the given ID." });
  }
});

router.delete('/checks', async (req, res) => {
  let deletedCount = 0;
  for (const check of await Check.find({ userId: req.user.id })) {
    await check.deleteOne();
    deletedCount++;
    Monitor.active[check.id]?.stop();
  }
  res.status(200).send({ status: 'ok', deletedCount });
});

router.delete('/checks/:id', async (req, res) => {
  const result = await Check.deleteOne({ _id: req.params.id });
  if (result.deletedCount) {
    Monitor.active[req.params.id]?.stop();
    res.status(200).send({ status: 'ok' });
  } else {
    res.status(404).send({ status: 'failed', message: "Couldn't find a check with the given ID." });
  }
});
