const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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

const verigyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({ message: 'unauthorized' });
	}
	const token = authHeader.split(' ')[1];

	jwt.verify(token, process.env.ACCESS_TOKEN_SERCRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: 'access forbidden' });
		}
		req.decoded = decoded;
		next();
	});
};

const run = async () => {
	try {
		const database = client.db('assignment-11');
		const servicesColection = database.collection('services');
		const reviewsColection = database.collection('reviews');

		app.post('/jwt', (req, res) => {
			const user = req.body;
			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SERCRET, {
				expiresIn: '1h',
			});

			res.send({ token });
		});
		// getting all service from databse
		app.get('/services', async (req, res) => {
			const query = {};
			const result = await servicesColection.find(query).toArray();
			res.send(result);
		});

		// inserting new service in database
		app.post('/services', verigyJWT, async (req, res) => {
			const service = req.body;

			const result = await servicesColection.insertOne(service);

			res.send(result);

			console.log(result);
		});

		// getting services for homepage
		app.get('/services-home', async (req, res) => {
			const query = {};

			const mySort = { date: 1 };

			const result = await servicesColection
				.find(query)
				.sort(mySort)
				.limit(3)
				.toArray();
			res.send(result);
		});

		// getting single service by id
		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = {
				_id: ObjectId(id),
			};
			const result = await servicesColection.findOne(query);

			res.send(result);
		});

		// adding new review from client side
		app.post('/reviews', async (req, res) => {
			const reviews = req.body;
			console.log(reviews);
			const result = await reviewsColection.insertOne(reviews);
			res.send(result);
		});

		// getting all review from database
		app.get('/reviews', async (req, res) => {
			const result = await reviewsColection.find({}).toArray();
			res.send(result);
		});

		// getting CurrentUser reviews by query
		app.get('/reviewsByQuery', verigyJWT, async (req, res) => {
			const decoded = req.decoded;

			if (decoded.email !== req.query.email) {
				return res.status(403).send({ message: 'unauthorized access' });
			}
			let query = {};

			if (req.query.email) {
				query = {
					email: req.query.email,
				};
			}

			const result = await reviewsColection.find(query).toArray();
			res.send(result);
		});

		// updating reviews

		app.put('/reviews/:id', async (req, res) => {
			const _id = req.params.id;
			const review = req.body;
			const option = { upsert: true };
			const filter = { _id: ObjectId(_id) };
			const updatedReview = {
				$set: {
					review: review.review,
				},
			};

			const result = await reviewsColection.findOneAndUpdate(
				filter,
				updatedReview,
				option
			);
			console.log(result);
			res.send(option);
		});

		// deleting reviews
		app.delete('/reviews/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };

			const result = await reviewsColection.findOneAndDelete(query);
			console.log(result);

			res.send(result);
		});
		app.get('/reviews/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };

			const result = await reviewsColection.findOne(query);
			console.log(result);

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
