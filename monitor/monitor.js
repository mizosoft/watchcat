import { catchError, delay, EMPTY, empty, timer } from 'rxjs'
import axios from 'axios'
import {
  from, map, concatMap, repeat, tap, of, defer, retry, switchMap,
  finalize, takeUntil, pairwise, mergeMap, share, startWith
} from 'rxjs'
import { Subject } from 'rxjs'
import { Status } from '../status/status.model.js'

function poll(check, signal) {
  const start = Date.now();
  console.log('Check url: ', check.url);
  return defer(async () => {
    const start = Date.now();
    const response = await axios.request({
      url: check.url,
      method: check.method,
      headers: check.headers,
      timeout: check.timeoutSeconds * 1000,
      signal
    })
    response.responseTimeMillis = Date.now() - start
    return response;
  }).pipe(
    map(response => validate(check, response, response.responseTimeMillis)),
    retry({
      count: check.retries,
      delay: check.retryDelaySeconds * 1000
    }),
    catchError(err => of(Status.error(check._id, err))),
    concatMap(status => status.save()),
    tap(status => console.log('Status: ', status)));
}

function validate(check, response, responseTime) {
  // Currently supported validation is with resposne status.
  return response.status == check.validation.status
    ? Status.ok(check._id, responseTime)
    : Status.invalid(`Invalid status code ${response.status}`, responseTime);
}

export class Monitor {
  static active = new Map();

  constructor(check) {
    this.check = check;
    this.startNotifier = new Subject();
    this.stopNotifier = new Subject();
    this.poller = this.startNotifier.pipe(
      switchMap(() => {
        console.log('Starting...');
        const abortController = new AbortController();
        return poll(check, abortController.signal).pipe(
          repeat({ delay: check.intervalSeconds * 1000 }),
          takeUntil(this.stopNotifier),
          tap(status => this.lastStatus = status), // Save last status for creating incidents() sources based on current state.
          finalize(() => abortController.abort()))
      }),
      share() // Make sure only one poller is active.
    );

    // Note that poller is never completed normally as startNotifier isn't.
    this.poller.subscribe({ error: console.error });
  }

  start() {
    console.log('Starting monitor...');
    this.startNotifier.next(0);
    Monitor.active[this.check.id] = this;
  }

  stop() {
    console.log('Stopping monitor...');
    this.stopNotifier.next(0);
    delete active[this.check.id];
  }

  incidents() {
    // Generate incidents.
    return this.poller.pipe(
      startWith(this.lastStatus),
      pairwise(),
      mergeMap(([prevStatus, currStatus]) => {
        // Emit a report if status changes.
        const next = prevStatus && prevStatus.ok() != currStatus.ok()
          ? this.generateReport(currStatus.when)
          : EMPTY;
        return next;
      }));
  }

  // Generates report for statuses upto a certain date.
  generateReport(when = null, includeHistory = false) {
    if (!when) {
      when = Date.now();
    }

    // TODO we can optimize this by storing the last generated report (perhaps generate reports hourly/daily)
    // and only accumulate statuses after the time that report was generated.
    return Status.find({ checkId: this.check.id, when: { $lte: when } })
      .sort('when')
      .then(statuses => {
        const report = {
          checkId: this.check.id,
          status: 'unknown',
          modified: false,
          availability: 0,
          outages: 0,
          uptimeSeconds: 0,
          downtimeSeconds: 0,
          averageResponseTimeMillis: 0
        };

        for (const status of statuses) {
          console.log('Examining: ', status);
          if (status.ok() != (report.status == 'ok')) { // A change in availability has occured.
            report.modified = true;
            if (!status.ok()) {
              report.outages++;
            }
          }

          report.status = status.status;
          report.reason = status.reason;
          report.averageResponseTimeMillis += status.responseTimeMillis;

          if (report.when) {
            const time = status.when - report.when; // Convert to seconds later.
            if (status.ok()) {
              report.uptimeSeconds += time;
            } else {
              report.downtimeSeconds += time;
            }
          } 
          report.when = status.when;
        }

        report.uptimeSeconds = Math.round(report.uptimeSeconds / 1000);
        report.downtimeSeconds = Math.round(report.downtimeSeconds / 1000);
        report.availability = Math.round(100 * report.uptimeSeconds / (report.uptimeSeconds + report.downtimeSeconds)) / 100;
        if (includeHistory) {
          report.history = statuses;
        }
        return report;
      });
  }
}
