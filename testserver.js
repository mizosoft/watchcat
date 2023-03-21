import axios from 'axios';
import express from 'express';

const app = express();
app.get('/', (req, res) => {
    console.log('Getting request');
    res.status(200).send();
});

app.listen(56565, () => console.log('Listening at 56565'));
