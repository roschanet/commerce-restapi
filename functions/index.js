const functions = require('firebase-functions');
var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require('express');
const app = express();
const cors = require('cors');
const db = admin.firestore();
app.use(cors({ origin: true }));

app.post('/api/create', (req, res) => {
  (async () => {
    try {
      await db.collection('products').doc(`/${req.body.id}/`).create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });

      return res.status(200).send('Product is created successfully');
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.get('/api/read/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('products').doc(req.params.id);
      const product = await document.get();
      const response = product.data();

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.get('/api/read', (req, res) => {
  (async () => {
    try {
      const query = db.collection('products');
      let response = [];

      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs;

        for (let doc of docs) {
          const eachProduct = {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            price: doc.data().price,
          };
          response.push(eachProduct);
        }
      });

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.put('/api/update/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('products').doc(req.params.id);
      await document.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });

      return req.status(200).send('Product is updated');
    } catch (error) {
      console.log(error);

      return res.status(500).send(error);
    }
  })();
});

app.delete('/api/delete/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('products').doc(req.params.id);

      await document.delete();
      return res.status(200).send('Product is deleted');
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
