import { Check } from '../check/check.model.js';
import axios from 'axios';

export const hook = async (report) => {
  const check = await Check.findById(report.checkId, 'webhook');
  if (check && check.webhook) {
    const res = axios.post(check.webhook, {
      event: 'incident',
      payload: report
    });
    console.log(`Sent report to ${check.webhook}: ${res.status}`);
  }
};
