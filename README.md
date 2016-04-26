# alphaville-auth-middleware

### Usage in an express app

```
const auth = require('alphaville-auth-middleware');

app.use(auth({
  checkHeader: 'Name-Of-The-Header-To-Check' //required
});

```
