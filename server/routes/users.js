import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;

  const newUser = new User({username});

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update-goal').post(auth, (req, res) => {
  // auth middleware adds user object to req
  // We need to find by user._id or username depending on what auth implementation sets
  // Looking at auth.js, it sets req.user which typically contains the payload (id, username)
  // Let's assume auth middleware verifies token and maybe populates req.user.
  // Actually, standard JWT auth middleware usually decodes token to req.user. 
  // auth.js snippet was missing the middleware implementation file content, but used it in exercises.js
  // Let's assume it puts decoded token in req.user.
  // The token payload in auth.js is { _id, username }.
  
  User.findById(req.user._id)
    .then(user => {
      user.weeklyGoal = Number(req.body.weeklyGoal);
      user.save()
        .then(() => res.json({ message: 'Goal updated!', weeklyGoal: user.weeklyGoal }))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
