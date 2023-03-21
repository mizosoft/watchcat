# Watchcat

A RESTful API for monitoring URLs & sending incident reports. Powered by NodeJS, [RxJS](https://rxjs.dev/) & [MongoDB](https://www.mongodb.com/).

## Install & Run

Run the following commands to start a local instance. Note that you need to have a proper MongoDB installation.

```bash
git clone https://github.com/mizosoft/watchcat
npm install
mkdir -p db && mongod --dbpath db
npm run dev
```

If successful, an instance will start listening for requests at `http://localhost:8080`. A connection to mongodb will be established through the default port. The app and MongoDB ports can be changed by modifying the respective values in `.env`. 

### Docker

Alternatively, the app can be started in a docker container by running the following command.

```
sudo docker-compose up
```

Docker port mappings can also be changed from `.env`.

## Usage

The API is JWT-authenticated and a user must be created first to use the API. We'll use `curl` to sketch example requests. For simplicity, `$APP_URL` is used as a placeholder for the actual app URL (we'll assume we ran an `$APP_URL="http://localhost:8080"`), and `$TARGET_URL` will be used for some endpoint to be monitored.

## Register

A user is registered with an email & password.

```bash
curl -d '{"email": "will.smith@gmail.com", "password": "123"}' -H "Content-Type: application/json" "$APP_URL/users"
```

If the user isn't already registered, a `201` response is generated with a similar payload to the following.

```json
{"status":"ok","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDE5MzE5YmMwNjVkOGY3ZGI1ZThlMjQiLCJpYXQiOjE2NzkzNzI2OTl9.JQYO2Uv-XHCp5FBkGvEbaqXeelWJdU05TKRKKdpVpcU"}
```

The token must be saved to access the monitoring API. For brevity, we'll refer to it as `$TOKEN`.

## Login

```bash
curl -d '{"email": "will.smith@gmail.com", "password": "123"}' -H "Content-Type: application/json" "$APP_URL/users/login"
```

Similarly, a `200` response containing the token is generated.

```json
{"status":"ok","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDE5MzE5YmMwNjVkOGY3ZGI1ZThlMjQiLCJpYXQiOjE2NzkzNzMxMTV9.wnR1G2VbdilQgQ-qbAoEgRwbWMi6lICE1yUqiiTYCnI"}
```

## Start monitoring

To start monitoring a URL, add a corresponding check.

```bash
curl -d "{\"name\": \"Check #1\", \"url\": \"$TARGET_URL\"}" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" "$APP_URL/checks"
```

The URL will be actively monitored in background and the ID of the created check is returned.

```json
{"status":"ok","id":"64193448f4b7be0f78169496"}
```

## Pause/Resume monotiring 

If there's a deliberate downtime (e.g. for maintenance or upgrades), we better stop monitoring the URL to avoid getting false negatives. This is done with a `PATCH` request on the `check.active` field using the check ID.

```bash
curl -X PATCH -d '{"active": false}' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" "$APP_URL/checks/$CHECK_ID"
```

If the check ID is valid, a response with the updated check is returned.

```json
{"status":"ok","check":{"validation":{"status":200},"_id":"64193448f4b7be0f78169496","name":"Check #1","url":"http://localhost:50002/","active":false,"port":-1,"method":"GET","headers":{},"timeoutSeconds":5,"intervalSeconds":2,"threshold":1,"retries":0,"retryDelaySeconds":1,"ignoreSsl":false,"tags":[],"userId":"64193411f4b7be0f78169492","__v":0}}
```

If we want to resume monitoring, we `PATCH` with `{active: true}`. `PATCH` can also be used to update any field, not just `active`.

## Getting checks

We can also get all the checks created by the authenticated user. 

```bash
curl "$APP_URL/checks" -H "Authorization: Bearer $TOKEN"
```

Or get a specific check by ID.

```bash
curl "$APP_URL/checks/$CHECK_ID" -H "Authorization: Bearer $TOKEN"
```

Or get all the checks for some URL or a number of tags.

```bash
curl "$APP_URL/checks?url=<url-encoded-url>&tag=a&tag=b" -H "Authorization: Bearer $TOKEN"
```

Or `DELETE` a specific check or all checks made by user.

```bash
curl -X DELETE "$APP_URL/checks/$CHECK_ID" -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X DELETE "$APP_URL/checks" -H "Authorization: Bearer $TOKEN"
```

## Incidents & Hooks

When the URL's status changes, an incident report is generated and sent to concerned parties through configured channels. Currently, email (per user) & webhook (per check) are supported (email is currently only send to an SMTP trap for lack of a dedicated account). 

Extending support for incident hooks should be straightforward. A hook is basically a function that receives a report whenver an incident happens. 

For instance, let's say we want to add a hook that sends reports via telegram. We'll add a `telegram.js` in the `hooks` directory with an exported hook function.

```js
import { Check } from '../check/check.model.js';
import { User } from '../user/user.model.js';

export const hook = async (report) => {
  // Note that 'telegramId' needs to be added in the User model.
  const check = await Check.findById(report.checkId, ['name', 'url', 'userId']);
  const user = await User.findById(check.userId, 'telegramId');
  if (check && user) {
    // Format report & send a message (see hooks/email.js).
  }
};
```

Next, we'll add a corresponding entry in `hooks/index.js`.

```js
export { hook as email } from './email.js';
export { hook as webhook } from './webhook.js';

...

export ( hook as telegramHook ) from './telegram.js';
```

And that's it!

## Manually generating reports

Aggregate reports can also be requested manually for a specific check ID.

```bash
curl "$APP_URL/reports/$CHECK_ID" -H "Authorization: Bearer $TOKEN"
```

Or for checks matching a given URL or a number of tags.

```bash
curl "$APP_URL/reports?url=<url-encoded-url>&tag=a&tag=b" -H "Authorization: Bearer $TOKEN"
```

## TODO 

- Error handling & validation of user data is currently not that great. Some errors or invalid values crash the app while others are logged in background. The latter should be always preferred in case of invalid user input.
- Unit tests!
- Some performance optimization (see TODOs).
