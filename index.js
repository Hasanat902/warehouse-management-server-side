// server side code started
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: "Unauthorized access"});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: "Forbidden access"});
        }
        req.decoded = decoded;
        next();
    })

}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ab0f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("wareHouse").collection("products");

        // AUTh
        app.post('/login', async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        })

        // product api
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

        // update api
        app.put('/product/:id', async(req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
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

        // DELETE API
        app.delete('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/product', async(req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // get my items api
        app.get('/myItems', verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if(email === decodedEmail){
                const query = {email: email};
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else{
                res.status(403).send({message: "Forbidden access"});
            }
        })

        app.delete('/myItems/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
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