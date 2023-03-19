import express from 'express';

const app = express();
app.get('/', (req, res) => {
    console.log('Getting request');
    res.sendStatus(200);
});

app.listen(55556, () => console.log('Listening at 55556'));
