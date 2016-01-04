// requiring modules
import Mainframe from 'mainframe-core'
import AuthModule from '../lib/mainframe-module-auth.js'
import * as _ from 'lodash'

// create the mainframes
let mainframe = new Mainframe(new AuthModule())

// register users
mainframe.auth.register({ name:'picard', password:'paris' }, (err, res) => {
  // connect user
  mainframe.auth.login({ name: 'picard', password: 'paris' }, (err, res) => {
    // list users
    console.log(mainframe.auth.users, _.keys(mainframe.brain.layers))
    // log out
    mainframe.auth.logout('picard')
    // list users
    console.log(mainframe.auth.users, _.keys(mainframe.brain.layers))
  })
})
