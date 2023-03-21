import { Status } from '../status/status.model.js';
import { Report } from './report.model.js';

/* Generates report for statuses upto a certain date, optionally including the full history of statuses. */
export function generateReport(check, when = null, includeHistory = false) {
  // TODO we can optimize this by storing the last generated report (perhaps generate reports hourly/daily)
  // and only accumulate statuses after the time the last report was changed.
  return Status.find({ checkId: check.id, when: { $lte: when || Date.now() } })
    .sort('when')
    .then(statuses => {
      const report = new Report({ checkId: check.id });
      report.populate(statuses);
      const plainReport = report.toObject();
      plainReport.ok = report.ok;
      if (includeHistory) {
        plainReport.history = statuses;
      }
      return plainReport;
    });
}
