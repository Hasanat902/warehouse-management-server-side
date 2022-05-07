const express = require("express");
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ab0f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("wareHouse").collection("products");

        app.get('/product', async(req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.put('/product/:id', async(req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            console.log(updatedProduct);
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedProduct.quantity
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Running warehouse management server");
})

app.listen(port, () => {
    console.log("Listening from port", port);
})