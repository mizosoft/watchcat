import CheckModel from './check.model.js'

export default {
  insert(req, res, next) {
    console.log('Request body: ' + JSON.stringify(req.body));
    CheckModel.create(req.body)
      .then(check => {
        console.log("Added to DB: " + check);
        res.locals.check = check;
        next();
      });
  },

  list(_, res) {
    CheckModel.list()
      .then(result => res.status(200).send(result));
  }
}
