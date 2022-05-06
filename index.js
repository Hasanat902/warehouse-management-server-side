const express = require("express");
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://{process.env.DB_USER}:{process.env.DB_PASS}@cluster0.3ab0f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log("db connected");
  // perform actions on the collection object
  client.close();
});



app.get('/', (req, res) => {
    res.send("Running warehouse management server");
})

app.listen(port, () => {
    console.log("Listening from port", port);
})