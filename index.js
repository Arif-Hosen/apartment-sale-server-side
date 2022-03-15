const express = require('express')
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

// user: apartment-sales
// pass: 2ukRkzFk9ojOWOEg

const uri = `mongodb+srv://apartment-sales:2ukRkzFk9ojOWOEg@cluster0.p2nrx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully');

        const database = client.db('apartment_sales');
        const apartmentCollection = database.collection('apartments');
        const bookingCollection = database.collection('booking');
        const usersCollection = database.collection('users');
        // const reviewsCollection = database.collection('reviews');

        // 6 apartments get for home page
        app.get('/apartments', async (req, res) => {
            const cursor = apartmentCollection.find({});
            const apartments = await cursor.limit(6).toArray();
            res.json(apartments);

        })
        // all apartments get for home page
        app.get('/moreApartments', async (req, res) => {
            const cursor = apartmentCollection.find({});
            const apartments = await cursor.toArray();
            res.json(apartments);

        })

        // get specific apartment for placebooking
        app.get('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await apartmentCollection.findOne(query);
            res.json(result);
        })

        // post booking info from placeBooking to db
        app.post('/placebooking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result)

        })

        // my booking get from booking collection
        app.get('/mybooking/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = { email: email };
            const result = await bookingCollection.find(query).toArray();
            // console.log(result);
            res.json(result);
        })
        // all booking get from booking collection
        app.get('/allbooking', async (req, res) => {
            const allBooking = await bookingCollection.find({}).toArray();
            res.json(allBooking);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })

        // get user for admin check (if user role property is admin ,set admin is true)
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // after find users check role property
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Apartments Sales!')
})

app.listen(port, () => {
    console.log(`listening at:${port}`)
})