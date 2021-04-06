var express = require('express');
var router = express.Router();

/// ---- Mon code a mwa ----

//// MAJ : Remplacé par le code ci-dessous, plus propre :D
//// Premier test de la doc mongo > "Makes development easy"
//      https://www.mongodb.com/what-is-mongodb

// import { MongoClient } from 'mongodb'
// let MongoClient = require ('mongodb')

// async function connect () {
//   // Connection URL
//   const url = 'mongodb://localhost:27017/admin'

//   let db

//   try {
//     db = await MongoClient.connect(url)
//     console.log('Connected successfully!')
//   }
//   catch (err) {
//     // Handle error
//     console.warning(`Le serveur mongodb doit être installé et lancé, bizoux :)`);
//     console.log(err);
//   }

//   return db
// }

// connect ();



//// Clean de la connexion : On se base sur la doc a jour
//      https://www.npmjs.com/package/mongodb
//      https://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html
//    On en profite pour retirer les warning / deprecated, etc.

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'admin';
// Enlever le warning deprecated
//    trace terminal : [MONGODB DRIVER] Warning: Current Server Discovery and
//      Monitoring engine is deprecated, and will be removed in a future version.
//      To use the new Server Discover and Monitoring engine,
//      pass option { useUnifiedTopology: true } to the MongoClient constructor.
// On spécifie une option lors de la connexion
const client = new MongoClient(url, { useUnifiedTopology: true });
// Use connect method to connect to the server
client.connect(function(err) {
  // Deprecated
  // assert.equal(null, err);
  assert.strictEqual(null, err);
  console.log('Connected successfully to server');

  const db = client.db(dbName);

  client.close();
});

/// ----

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresss' });
});

module.exports = router;
