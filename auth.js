
// TODO handle if the user is already regisitered/authenticated.
app.post('/users', async (req, res) => {
    console.log('POST users: ' + JSON.stringify(req.body));
    const user = new User(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    res.sendStatus(201);
  });
  
  app.get('/users', (req, res) => {
    User.find().then(result => res.send(result));
  });
  
  const jwtSecret = 'secret'; // TODO config.
  
  // console.log(jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDE1ZWI0MDUwY2ZhNzgwNWVmMDc2Y2YiLCJpYXQiOjE2NzkxNTk0NDZ9.QA4bU0Qoa-B94JXTDNABA_RN_yOPQlOIaHZ31oa0Z7s',
  // jwtSecret));
  
  // Login authentication.
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        const user = await User.findOne({ email });
        console.log('On login: ', email, password, user);
        const passwordsMatch = await bcrypt.compare("" + password, user.password); // Thsi fails when passowrd isn't a string.
        if (!user || !passwordsMatch) {
          done(null, false);
        } else {
          done(null, user);
        }
      }
    )
  );
  
  app.post('/users/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
      console.log('Login result: ', err, user, info);
      if (err) {
        return next(err);
      }
      if (user) {
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.json({ status: 'ok', token });
      } else {
        res.json({ status: 'failed', reason: 'Invalid email or password.' });
      }
    })(req, res, next);
  });
  
  const passportOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
    // issuer: 'mizosoft.github.io',
    // audience: 'yoursite.net',
  }
  passport.use(
    new JwtStrategy(passportOptions, async (token, done) => {
      console.log('Request JWT token: ', token)
      const user = await User.findOne({ _id: token.userId });
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    }));
  app.get('/secure', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.send(`Hello, ${req.user.email}`);
  });