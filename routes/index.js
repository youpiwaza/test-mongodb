var express = require('express');
var router = express.Router();

/// ---- Mon code a mwa ----

//// Premier test de la doc mongo > "Makes development easy"
//      https://www.mongodb.com/what-is-mongodb

// import { MongoClient } from 'mongodb'
let MongoClient = require ('mongodb')

async function connect () {
  // Connection URL
  const url = 'mongodb://localhost:27017/admin'

  let db

  try {
    db = await MongoClient.connect(url)
    console.log('Connected successfully!')
  }
  catch (err) {
    // Handle error
    console.warning(`Le serveur mongodb doit être installé et lancé, bizoux :)`);
    console.log(err);
  }

  return db
}

connect ();

/// ----

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresss' });
});

module.exports = router;
