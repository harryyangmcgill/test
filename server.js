const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

const register = require('./controllers/register');

const db = knex({
	client: 'pg',
	connection: {
		host : '127.0.0.1',
		user : 'harry',
		password : '',
		database : 'smart-brain'
	}
});


const app = express();

app.use(bodyParser.json());
app.use(cors())

//const database = {
//	users: [
//		{
//		id: '123',
//		name: 'John',
//		password: 'cookies',
//		email: 'john@gmail.com',
//		entries: 0,
//		joined: new Date()
//		},
//		{
//		id: '124',
//		name: 'sally',
//		password: 'bananas',
//		email: 'sally@gmail.com',
//		entries: 0,
//		joined: new Date()
//		}
//	],
//	login: [
//	{
//		id: '987',
//		hash: '',
//		email: 'john@gmail.com'
//	}]
//}

app.get('/', (req, res)=> {
	res.send(db.users);
})

app.post('/signin', (req,res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid) {
			return db.select('*').from('users')
			.where('email', '=', req.body.email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('unable to get user'))
		} else {
		res.status(400).json('wrong credentials')
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt) })

//[0] - want to get object, when you do returning, there is only 1 that is being returned so [0] is fine

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({id: id})
		.then(user => {
		if (user.length) {
			res.json(user[0])
		}	else {
			res.status(400).json('Not found')
		}
		})
		.catch(err => res.status(400).json('error getting user'))
//	if (!found) {
//		res.status(400).json('not found');
//	}
})

//where({id:id}) can simply be where({id})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))
})


// Load hash from your password DB.
//bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
//});
//bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
//});

app.listen(3000, ()=> {
	console.log('app is running on port 3000');
})