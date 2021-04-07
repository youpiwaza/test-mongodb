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
    ,findDocuments(db)
    // ,aggregateDocuments(db)
    ,addIndexToCollection(db)
  ]);

  console.log('fin parallel() et clôture du client');
  // Attention a l'asynchrone, ne pas fermer la connexion avant l'ajout dans la bdd
  client.close();
}


//// Exemple 2 / Insert a document
//      https://www.mongodb.com/what-is-mongodb >> etape 2 / Insert a document

async function insertDocuments (db, identifiant) {
  // Get the documents collection
  // /!\ ATTENTION /!\ / Pas d'espaces devant derrière le nom de la collection
  const collection = db.collection('users')
  
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
        "age":"102",
        "ma_bonne_dope":"nasal"
      }
  ])

  console.log(`fin insertDocuments() n° ${identifiant}`);
  
  return result
}


////--- Exemple 3 / Create a query
//    NON🚨 / https://docs.mongodb.com/manual/reference/method/db.collection.find/
//    OUI   / http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find
async function findDocuments (db) {
  console.log(`début findDocuments()`);

  const collection = db.collection('users')

  const docs = await collection.find(
    // // Premier paramètre, un objet, afin de trier (~= WHERE en SQL)
    
    // {}                                       // Pas de critère, on renvoie tout
    // { id: 69 }                               // Propriété exacte
    // { first_name:"Barri", last_name:"Hew" }  // PropriétéS exactes
    // { id: { $in: [ 10, 15, 25, 38 ] } }      // Proriété parmis un ensemble
    { age: { $gt: 90 } }                     // Toutes les personnes de plus de 90 ans

    // // KO / Deuxième paramètre, un objet, Choix des champs à renvoyer (~SELECT en SQL)
    // // Deuxième paramètre, un objet, options à passer à find, cf.
    // //     http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find
    //  🚨mongo native 3.6, pas mongo 14
    // KO / { first_name: 1, last_name: 1 } // KO / Renvoie uniquement les champs voulus
    // KO / { first_name: 0, last_name: 0 } // KO / Exclure les champs voulus
    ,{ 
      limit : 3,                           // Renvoyer 3 résultats maximum
      // // Choix des colonnes afficher
      //    https://docs.mongodb.com/manual/reference/method/db.collection.find/#specify-the-fields-to-return
      // // 1 > On force l'affichage
      // // 0 > On empeche/ On exclue l'affichage
      // // On affiche uniquement nom/prenom
      projection: { 
        "first_name":1
        ,"last_name": 1
        ,"_id": 0 // forcer l'exclusion de la colonne _id
      }
      // // tous les champs sauf prenom/nom de famille
      // projection: { 
      //   "first_name":0
      //   ,"last_name": 0
      // }
    }
  ).toArray()

  console.log('Found the following records')
  console.log(docs)
  
  console.log(`fin findDocuments()`);

  return docs
}



////--- Exemple 4 / Create index
async function addIndexToCollection (db) {
  console.log(`début addIndexToCollection()`);

  const collection = db.collection('users')

  const result = await collection.createIndex({
    first_name: 1
    ,last_name: 1
  })

  console.log(`addIndexToCollection() > result`, result);
  console.log(`fin addIndexToCollection()`);

  return result
}



////--- Exemple 5 / Aggregation
// TODO: Tester sur onglet Aggregation sur compass, bizoux
//          >> Des trucs s'affichent, mais ne correspondent pas, cf. image
//          >> id:76 count:2 mais 9 personnes ont 76 ans
// TODO: Comprendre :'(

// lire un peu wesh
//    https://docs.mongodb.com/manual/reference/method/db.collection.aggregate/
//    https://docs.mongodb.com/manual/aggregation/
//    Manque d'affichage ? curseur ?
//      https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/
async function aggregateDocuments (db) {
  const collection = db.collection('users')

  console.log(`debut aggregateDocuments()`);

  const results = await collection.aggregate([
    {
      $match: {
        gender: 'Female'
      }
    },
    {
      $group: {
        _id: '$age',
        count: { $sum: 1 }
      }
    }
  ])

  console.log(`fin aggregateDocuments()`);
  console.log(results);

  //// Gestion de l'affichage ?
  //      KO / https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/
  // while (myCursor.hasNext()) {
  //   print(tojson(myCursor.next()));
  // }
  // while (results.hasNext()) {
  //   console.log(results.next());
  // }

  return results
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresss' });
});

module.exports = router;
