import { map, concatMap, tap, of, defer, retry, catchError } from 'rxjs';
import { Status } from '../status/status.model.js';
import axios from 'axios';
import https from 'https';

// Client instance for ignoring SSL stuff.
const insecureAxios = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export function poll(check, signal) {
  const client = check.ignoreSsl ? insecureAxios : axios;
  return defer(async () => {
    const requestConfig = {
      url: check.url,
      method: check.method,
      headers: Object.fromEntries(check.headers),
      timeout: check.timeoutSeconds * 1000,
      signal
    };
    if (check.authentication) {
      requestConfig.auth = {
        username: check.authentication.username,
        password: check.authentication.password
      };
    }

    const start = Date.now();
    const response = await client.request(requestConfig);
    response.responseTimeMillis = Date.now() - start;
    return response;
  }).pipe(
    map(response => status(check, response, response.responseTimeMillis)),
    retry({
      count: check.retries,
      delay: check.retryDelaySeconds * 1000
    }),
    // TODO find a way to differentiate network erros from silly errors that are bugs. 
    // The latter shoudln't be wrapped in status but forwarded as is.
    catchError(err => of(Status.error(check.id, err))), 
    concatMap(status => status.save()),
    tap(status => console.log(`Status (${check.url}): ${status}`)));
}

function status(check, response, responseTime) {
  // Currently supported validation is with response status.
  return response.status == check.validation.status
    ? Status.ok(check._id, responseTime)
    : Status.invalid(`Invalid status code ${response.status}`, responseTime);
}
