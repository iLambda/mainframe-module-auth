// importing modules
import * as Datastore from 'nedb'
import * as path from 'path'
import * as whirlpool from 'whirlpool'

// the auth module
export class {

  // creating a modules
  constructor(datapath) {
    // the module name
    this.name = "auth"
    // the users list
    this.users = []
    // the Mainframe
    this.mainframe = null
    // save the database path.
    // if nothing supplied, the database is in-memory only.
    this.datapath = _.isString(datapath) ? datapath : undefined
  }


  // read only property
  get docked() { return !!(mainframe) }


  // this module is docking
  dock(mainframe) {
    // if the module is not already docked
    if (!this.docked) {
      // dock it
      this.mainframe = mainframe
      // load the datastore
      this.datastore = new Datastore(
        this.datapath
          ? { filename: this.datapath, autoload: true }
          : undefined
      )
    }
  }

  // this module is undocking
  undock (mainframe) {
    // if the module is already docked
    if (this.docked) {
      // undock it
      this.mainframe = null
      // unload the datastore
      this.datastore = null
    }
  }

  // register an user
  register(credentials, onresult) {
    // check if parameters ok
    if (!(credentials
        && credentials.name && _.isString(credentials.name)
        && credentials.password && _.isString(credentials.password))) {
          // error occured
          onresult(new Error('Invalid credentials.'), undefined)
          return
    }
    // ask if user is not already registered
    this.datastore.find({ name: credentials.name }, function (err, res) {
      // if an error occured
      if (err) { onresult(err, undefined) return }
      // if already an user
      if (res.length > 0) { onresult(new Error('User is already registered.'), undefined) return }
      else {
        // attribute salt
        var salt = ''
        // whirlpool the password
        var hash = whirlpool(password + salt)
        // create user
        var user = {
          name: credentials.name,
          hash: hash,
          salt: salt
        }
        // store it
        this.datastore.insert(user, function (err, res) {
          // if an error occured
          if (err) { onresult(err, undefined) return }
          // it's all good man !
          onresult(undefined, user)
          return
        })
      }
    })
  }
  // log an user in
  login(credentials, onresult) {
    // check if parameters ok
    if (!(credentials
        && credentials.name && _.isString(credentials.name)
        && credentials.password && _.isString(credentials.password))) {
          // error occured
          onresult(new Error('Invalid credentials.'), undefined)
          return
    }
    // if user is not connected
    if (this.islogged(credentials.name)) {
      onresult(new Error('user is already logged in'), undefined)
      return
    }
    // get credentials
    this.datastore.find({ name: credentials.name }, function (err, res) {
      // if an error occured
      if (err) { onresult(err, undefined) return }
      // if already an user
      if (res.length <= 0) { onresult(new Error('User is not registered.'), undefined) return }
      else if (res.length > 1) { onresult(new Error('Too many users???'), undefined) return }
      else {
        // whirlpool the password
        var hash = whirlpool(credentials.password + res.salt)
        // if the passwords match
        if (hash === res.hash) {
          // add user to connected list
          this.users.push(credentials.name)
          // brain starts to bud and create the layer associated to user
          this.mainframe.brain.bud(user)
        }
      }
    })
  }
  // log an user out
  logout(user, onresult) {
    // if user is not connected
    if (!this.islogged(user)) {
      onresult(new Error('user is not already logged in'), undefined)
      return
    }
    // remove user from connected list
    this.users.remove(user)
    // brain starts to bud and create the layer associated to user
    this.mainframe.brain.bud(user)
  }
  // is the given user logged ?
  islogged(user) {
    return _.contains(this.users, user)
  }

  // give permission to user
  allow(user, permission, onresult) { }
  // remove permission to user
  forbid(user, permission, onresult) { }
  // is the user allowed ?
  isallowed(user, permission, onresult) { }
 }