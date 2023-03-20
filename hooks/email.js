import nodemailer from 'nodemailer';
import { User } from '../user/user.model.js';
import  { Check } from '../check/check.model.js';

// TODO use a trap temporarily for lack of an actual account.
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

export const hook = async (report) => {
  const check = await Check.findById(report.checkId, ['name', 'url', 'userId']);
  const user = await User.findById(check.userId, 'email');
  if (check && user) {
    // TODO this probably needs better email formating with HTML.
    const info = await transporter.sendMail({
      from: '"Watchcat 🐱" <foo@example.com>',
      to: user.email,
      subject: `${check.name} is ${report.ok() ? 'up' : 'down'}`,
      text: `
      ${check.name} at ${check.url} is ${report.ok() ? 'up again' : 'down'}!
      
      - Availability: ${report.availability * 100}%
      - Outages: ${report.outages}
      - Uptime: ${report.uptimeSeconds} seconds
      - Downtime: ${report.downtimeSeconds} seconds
      - Average resposne time: ${report.averageResponseTimeMillis} millis
      `,
    });

    console.log("Incident email sent: %s", nodemailer.getTestMessageUrl(info));
  }
};
