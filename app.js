import express from 'express';
import { router as userRouter } from './user/user.router.js';
import { router as checkRouter } from './check/check.router.js';
import { router as reportRouter } from './report/report.router.js';
import { fromEnv } from './setup/config.js';
import { Status } from './status/status.model.js';
import { User } from './user/user.model.js';
import { Check } from './check/check.model.js';
import * as auth from './setup/auth.js';
import mongoose from 'mongoose';
import { Monitor } from './monitor/monitor.js';

const config = fromEnv();
console.log('Config: ', config);

auth.setup(config);

export async function start() {
  await mongoose.connect(config.mongodbUrl, config.mongooseOptions);

  console.log('Connected to MongoDB');

  console.log('Restoring checks from last session.');
  const cursor = Check.find({ active: true }).cursor(); // Only interested in active checks.
  for (let check = await cursor.next(); check != null; check = await cursor.next()) {
    Monitor.registerIfActive(check);
  }

  const app = express();

  app.use(express.json());

  app.use((_, res, next) => {
    res.locals.jwtSecret = config.jwtSecret;
    next();
  });

  app.use(userRouter);
  app.use(checkRouter);
  app.use(reportRouter);

  const server = app.listen(config.port, () => console.log('Listening at ', config.port));
  app.locals.server = server;
  return app;
}
