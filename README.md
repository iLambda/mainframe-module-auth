# mainframe-module-auth
mainframe-module-auth is an authentication module for mainframe-core.

## install
**mainframe-module-auth** is available on [npm](https://www.npmjs.com/package/mainframe-module-auth).

```sh
$ npm install mainframe-module-auth
```

## principle
This moduel handle your brain layers for different users. Assuming each user will use one layer of the
mainframe's brain simultaneously, this module allows for automatic creation of the layers when the users
log with the right password.

## documentation

To dock the module to the [previously created mainframe](https://github.com/iLambda/mainframe), just type :
```js
var AuthModule = require('mainframe-module-auth')

// hook the auth module
// if filename is valid, the database is created into
// a file. else, it is in-memory only.
mainframe.dock(new AuthModule(filename))
```

You can then access the created auth module by typing :
```js
var auth = mainframe.auth
```

The following methods are available :
```js
var credentials = { name: '[username]', password: '[password]' }

// asychronously register an user
//  onresult will be called with an error and a result object
//  as parameters.
mainframe.auth.register(credentials, onresult)
// asychronously connects an user
//  onresult will be called with an error and a result object
//  as parameters.
mainframe.auth.login(credentials, onresult)
// instantly disconnects an user
mainframe.auth.logout(credentials)
```
