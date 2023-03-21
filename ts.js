import axios from 'axios';
import express from 'express';

// const app = express();
// app.get('/', (req, res) => {
//     console.log('Getting request');
//     console.log(req.query);
//     console.log(req.params);
//     res.status(200).send(req.query);
// });

// app.listen(56565, () => console.log('Listening at 56565'));
const res = await axios.get('https://example.com')
console.log(res.status);
