import express from 'express';

const app = express();
app.get('/:id', (req, res) => {
    console.log('Getting request');
    console.log(req.query);
    console.log(req.params);
    res.sendStatus(200);
});

app.listen(56565, () => console.log('Listening at 56565'));
