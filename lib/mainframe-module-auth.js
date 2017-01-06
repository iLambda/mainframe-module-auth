// importing modules
import Datastore from 'nedb'
import whirlpool from 'whirlpool'
import * as path from 'path'
import * as _ from 'lodash'


// the auth module
export default class {

  // creating a modules
  constructor(datapath, name="auth") {
    // the module name
    this.name = name
    // the users list
    this.users = []
    // the Mainframe
    this.mainframe = null
    // save the database path.
    // if nothing supplied, the database is in-memory only.
    this.datapath = _.isString(datapath) ? datapath : undefined
    // set credentials
    this.credentials = null
  }


  // read only property
  get docked() { return !!(this.mainframe) }


  // this module is docking
  dock(mainframe) {
    // if the module is not already docked
    if (!this.docked) {
      // dock it
      this.mainframe = mainframe
      // create a log
      this.mainframe.logs.make('auth', 'INFO')
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

  // get only property
  get user() { return this.credentials ? this.credentials.name : null }


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
    this.datastore.find({ name: credentials.name }, (err, res) => {
      // if an error occured
      if (err) {
        onresult(err, undefined)
        return
      }
      // if already an user
      if (res.length > 0) {
        onresult(new Error('User is already registered.'), undefined)
        return
      } else {
        // get name
        var name = credentials.name
        // attribute salt
        var salt = ''
        // whirlpool the password
        var hash = whirlpool(credentials.password + salt)
        // create user
        var user = {
          name: credentials.name,
          hash: hash,
          salt: salt
        }
        // store it
        this.datastore.insert(user, (err, res) => {
          // if an error occured
          if (err) {
            onresult(err, undefined)
            return
          }
          // log
          this.mainframe.logs.auth.info(`User '${name}' has registered`)
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
    this.datastore.find({ name: credentials.name }, (err, res) => {
      // if an error occured
      if (err) {
        onresult(err, undefined)
        return
      }
      // if already an user
      if (res.length <= 0) {
        onresult(new Error('User is not registered.'), undefined)
        return
      } else if (res.length > 1) {
        onresult(new Error('Too many users???'), undefined)
        return
      } else {
        // get result
        res = _.first(res)
        // whirlpool the password
        var hash = whirlpool(credentials.password + res.salt)
        // if the passwords match
        if (hash === res.hash) {
          // add user to connected list
          this.users.push(credentials.name)
          // brain starts to bud and create the layer associated to user
          this.mainframe.brain.bud(credentials.name)
          // save credentials
          credentials.password = hash
          this.credentials = credentials
          var name = this.credentials.name
          // log
          this.mainframe.logs.auth.info(`User '${name}' has logged in`)
          // it's all good man !
          onresult(undefined, res)
          return
        }
      }
    })
  }
  // log an user out
  logout(user) {
    // if user is not connected
    if (!this.islogged(user)) {
      return false
    }
    // remove user from connected list
    this.users = _.remove(this.users, user)
    // ted the layer
    this.mainframe.brain.ted(user)
    // logged out
    var name = this.credentials.name
    this.mainframe.logs.auth.info(`User '${name}' has logged out`)
    // unset credentials
    this.credentials = null
    // success
    return true
  }
  // is the given user logged ?
  islogged(user) {
    return _.contains(this.users, user)
  }
 }
