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

  // Peut importe nos requêtes
  // On les gère en parrallèle : On les lance toutes en même temps
  // Une fois que tout est fini, on ferme le flux/la connexion
  parallel(db, client);
});

/// ----

//    https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function#exemple_simple
//      `-> Ctrl + F > "var parallel" 


const parallel = async function(db, client) {
  console.log('==Exécution parallèle avec await Promise.all==');

  // Démarre 2 tâches en parallèle et on attend que les deux soient finies
  //  https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
  await Promise.all([
    insertDocuments(db, 1)
    ,insertDocuments(db, 2)
    ,insertDocuments(db, 3)
    ,insertDocuments(db, 4)
    ,aggregateDocuments(db)
  ]);

  console.log('fin parallel() et clôture du client');
  // Attention a l'asynchrone, ne pas fermer la connexion avant l'ajout dans la bdd
  client.close();
}


//// Test ajout document
//      https://www.mongodb.com/what-is-mongodb >> etape 2 / Insert a document

async function insertDocuments (db, identifiant) {
  // Get the documents collection
  // /!\ ATTENTION /!\ / Pas d'espaces devant derrière le nom de la collection
  const collection = db.collection('ma_super_collection')
  
  console.log(`début insertDocuments() n° ${identifiant}`);

  // Insert some documents
  const result = await collection.insertMany([
      // {
      //     name: 'Sun Bakery Trattoria',
      //     stars: 4,
      //     categories: [
      //         'Pizza', 'Pasta', 'Italian', 'Coffee', 'Sandwiches'
      //     ]
      // }, {
      //     name: 'Blue Bagels Grill',
      //     stars: 3,
      //     categories: [
      //         'Bagels', 'Cookies', 'Sandwiches'
      //     ]
      // }
      {
        "id":1000,
        "first_name":"test- mon test a mwa 2",
        "last_name":"Frith",
        "email":"pfrith0@tinypic.com",
        "gender":"Genderqueer",
        "ip_address":"203.252.104.99",
        "ma_bonne_dope":"nasal"
      }
  ])

  console.log(`fin insertDocuments() n° ${identifiant}`);
  
  return result
}

///--- Exemple 3
// TODO: Tester sur onglet Aggregation sur compass, bizoux
// lire un peu wesh
//    https://docs.mongodb.com/manual/reference/method/db.collection.aggregate/
//    https://docs.mongodb.com/manual/aggregation/
async function aggregateDocuments (db) {
  const collection = db.collection('ma_super_collection')

  console.log(`debut aggregateDocuments()`);

  const results = await collection.aggregate([
    {
      $match: {
        gender: 'Male'
      }
    },
    {
      $group: {
        _id: '$gender',
        count: { $id: 1 }
      }
    }
  ])

  console.log(`fin aggregateDocuments()`);
  console.log(results);

  return results
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresss' });
});

module.exports = router;
