const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({extended: true}))

const users = [];
const { randomUUID } = require('crypto');

app.post('/api/users', function (req, res) {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const _id = randomUUID();
  const user = { _id, username };
  users.push(user);
  res.json(user);
})

app.get('/api/users', function (req, res) {
  res.json(users);
})


app.post('/api/users/:_id/exercises', function (req, res) {
  const _id = req.params._id;
  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration, 10);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  if (!description || isNaN(duration)) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const exercise = {
    description,
    duration,
    date: date.toDateString()
  };

  if (!user.exercises) {
    user.exercises = [];
  }
  
  user.exercises.push(exercise);
  
  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

app.get('/api/users/:_id/logs', function (req, res) {
  const _id = req.params._id;
  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit, 10) || 0;

  let exercises = user.exercises || [];

  if (from) {
    exercises = exercises.filter(e => new Date(e.date) >= from);
  }
  
  if (to) {
    exercises = exercises.filter(e => new Date(e.date) <= to);
  }
  
  if (limit > 0) {
    exercises = exercises.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: exercises.length,
    log: exercises
  });
}
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
