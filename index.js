const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7mlny.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const port = 5000

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("goMovers").collection("service");
  const adminCollection = client.db("goMovers").collection("admin");
  const orderCollection = client.db("goMovers").collection("orders");
  const reviewCollection = client.db("goMovers").collection("review");

  app.post('/addService', (req, res) => {
    const service = req.body;
    serviceCollection.find({ serviceName: service.serviceName })
      .toArray((err, documents) => {
        if (documents.length === 0) {
            serviceCollection.insertOne(service)
              .then(result => {
                res.send(result.insertedCount > 0)
              })
        }
        else {
          res.send(false);
        }
      })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find()
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.delete('/deleteService/:key', (req, res) => {
    serviceCollection.deleteOne({ _id: ObjectId(req.params.key) })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/getReview', (req, res) => {
    reviewCollection.find()
      .toArray((err, documents) => {
        res.send(documents);
      })
  });


  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  });

  app.get('/orderDetails/:id', (req, res) => {
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  });

  app.post('/addOrder', (req, res) => {
    const placedOrderInfo = req.body;
    console.log(placedOrderInfo)
    orderCollection.insertOne(placedOrderInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.post('/orders', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        if (admin.length === 0) {
          orderCollection.find({ email: email })
            .toArray((err, documents) => {
              res.send(documents)
            })
        }
        else{
          orderCollection.find()
            .toArray((err, documents) => {
              res.send(documents)
            })
        }
      })

  })




});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)