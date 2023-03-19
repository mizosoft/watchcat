import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import CheckController from './check/check.controller.js'
import mongoose from 'mongoose'
import { timer, tap, interval, take, concatMap, repeat } from 'rxjs'
import axios from 'axios'
import { Monitor } from './monitor/monitor.js'
import { Check } from './check/check.model.js'
import { Status } from './status/status.model.js'
import passport from 'passport'
import userRouter from './user/user.router.js'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import { User } from './user/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express();

app.use(express.json());

// app.use(helmet());

// app.use(cors());

// app.use(morgan('combined'));

mongoose.connect("mongodb://localhost:55554")
  .then(() => console.log('Connectione establisehd to MongoDB'));

// User.deleteMany({}).then(result => console.log('Deleted: ', result))
Check.deleteMany().exec();

app.post('/checks', (req, res) => {
  const check = new Check(req.body);
  check.save()
    .then(() => {
      const monitor = new Monitor(check);
      monitor.incidents().subscribe(report => console.log('Report: ', report));
      monitor.start();
      res.status(201).json({ id: check._id });
    })
});

app.listen(55555, () => console.log('listening to requests'));
