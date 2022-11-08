const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { async } = require('@firebase/util');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.e9mltxe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async () => {
	try {
		const database = client.db('assignment-11');
		const servicesColection = database.collection('services');
		const reviewsColection = database.collection('reviews');

		app.get('/services', async (req, res) => {
			const query = {};
			const result = await servicesColection.find(query).toArray();
			res.send(result);
		});
		app.get('/services-home', async (req, res) => {
			const query = {};

			const result = await servicesColection.find(query).limit(3).toArray();
			res.send(result);
		});
		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = {
				_id: ObjectId(id),
			};
			const result = await servicesColection.findOne(query);

			res.send(result);
		});

		app.post('/reviews', async (req, res) => {
			const reviews = req.body;
			console.log(reviews);
			const result = await reviewsColection.insertOne(reviews);
			res.send(result);
		});
		app.get('/reviews', async (req, res) => {
			const result = await reviewsColection.find({}).toArray();
			res.send(result);
		});
	} finally {
	}
};

run();

app.get('/', (req, res) => {
	console.log('hello from behind');
	res.send('hello behind');
});

app.listen(port, () => {
	console.log('server running at port ', port);
});
