import express from 'express';
import url from 'node:url';
import nodemailer from 'nodemailer';

const app = express();
app.get('/', (req, res) => {
    console.log('Getting request');
    res.sendStatus(200);
});

app.listen(55557, () => console.log('Listening at 55557'));
