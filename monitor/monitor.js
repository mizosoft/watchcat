import {
  map, repeat, switchMap, finalize, takeUntil, pairwise, mergeMap, share, EMPTY, startWith
} from 'rxjs'
import { Subject } from 'rxjs'
import { Status } from '../status/status.model.js';
import { poll } from './poll.js';
import { Report } from '../report/report.model.js';
import * as hooks from '../hooks/index.js';
import { generateReport } from '../report/generator.js';

export class Monitor {
  static active = new Map();

  constructor(check) {
    this.check = check;
    this.startNotifier = new Subject();
    this.stopNotifier = new Subject();
    this.poller = this.startNotifier.pipe(
      switchMap(() => {
        console.log('Starting to monitor:', check.name);
        const abortController = new AbortController();
        return poll(check, abortController.signal).pipe(
          repeat({ delay: check.intervalSeconds * 1000 }),
          takeUntil(this.stopNotifier),
          finalize(() => abortController.abort()),
          finalize(() => console.log('Stopped monitoring: ', check.name)))
      }),
      share() // Make sure only one poller is active.
    );

    // Note that poller is never completed normally as startNotifier isn't.
    this.poller.subscribe({ error: err => console.log('Poller terminated with an error ', err) });
  }

  /* Creats & starts a new monitor for the given check if active. */
  static registerIfActive(check) {
    if (check.active && !Monitor.active[check.id]) {
      const monitor = new Monitor(check);
      monitor.incidents().subscribe(report => {
        console.log('Incident ', report);
        for (var [_, hook] of Object.entries(hooks)) {
          hook(report); // No need to await.
        }
      });
      monitor.start();
    }
  }

  start() {
    this.startNotifier.next(0);
    Monitor.active[this.check.id] = this;
  }

  stop() {
    this.stopNotifier.next(0);
    delete Monitor.active[this.check.id];
  }

  /* Returns a stream of reports for monitored URL's incidents (changes in status). */
  incidents() {
    return this.poller.pipe(
      map(status => ({ status })),
      startWith(null),
      pairwise(),
      mergeMap(([prev, curr]) => {
        // Store the number of continuous failures.
        if (curr.status.ok()) {
          curr.failures = 0;
        } else {
          curr.failures = 1 + ((prev && prev.failures) || 0);
        }

        // The second check ensures a report is generated if the url is unavailable from the first check.
        curr.hasPendingChange = (prev && prev.hasPendingChange) || (!prev && !curr.status.ok());

        // console.log(prev, curr);

        // Generate a report if a change in status has occured or enough failures
        // have occured since the last change in status.
        let hasChange = prev && (prev.status.ok() != curr.status.ok());
        if ((hasChange && (curr.status.ok() || this.check.threshold == 1))
          || (curr.hasPendingChange && curr.failures >= this.check.threshold)) {
          curr.hasPendingChange = false; // Consume.
          return generateReport(this.check, curr.status.when);
        } else {
          curr.hasPendingChange |= hasChange;
          return EMPTY;
        }
      }));
  }
}
