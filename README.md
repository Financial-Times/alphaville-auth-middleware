# alphaville-auth-middleware

### Usage in an express app

```
const auth = require('alphaville-auth-middleware');

app.use(auth());

```
If env variable SKIP_AUTH is set the authentication will be skipped (for local dev)
