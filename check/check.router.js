import express from 'express'

const router = express.Router();

CheckModel.clear().then(() => CheckModel.list().then(all => console.log(all)));

app.post('/checks', [
  CheckController.insert,
  (req, res) => {
    new Monitor(res.locals.check).start();
    res.send(req.body._id);
  }
]);

app.get('/checks', [
  CheckController.list
]);

export default router;
