import { catchError, delay, timer } from 'rxjs'
import axios from 'axios'
import { from, map, concatMap, repeat, tap, of } from 'rxjs'
import { Status } from '../status/status.model.js'

function poll(check) {
  const start = Date.now();
  return defer(() => axios.request({
    url: check.url,
    method: check.method,
    headers: check.headers,
    timeout: check.timeoutSeconds * 1000
  })).pipe(
    map(response => validate(check, response, Date.now() - start)),
    catchError(err => of(Status.error(check._id, err))),
    concatMap(status => status.save()));
}

function validate(check, response, responseTime) {
  // Currently supported validation is with resposne status.
  return response.status == check.validation.status
    ? Status.ok(check._id, responseTime)
    : Status.invalid(`Invalid status code ${response.status}`, responseTime);
}

export class Monitor {
  constructor(check) {
    this.check = check;

    console.log('Creating monitor for: ' + JSON.stringify(check));
    this.poller = poll(check)
      .pipe(
        delay(check.delaySeconds * 1000),
        repeat({ delay: check.intervalSeconds * 1000 }));
  }

  start() {
    console.log('Starting monitor...');
    this.poller.subscribe({
      next: status => console.log(status),
      error: err => console.error(err)
    });
  }

  stop() {

  }

  incidents() {

  }

  generateReport() {

  }
}