import express from 'express';
import Exercise from '../models/Exercise.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.route('/').get((req, res) => {
  Exercise.find({ username: req.user.username })
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.user.username; // Enforce logged in user
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = Date.parse(req.body.date);
  const category = req.body.category || 'Other';

  const newExercise = new Exercise({
    username,
    description,
    duration,
    date,
    category,
  });

  newExercise.save()
  .then(() => res.json('Exercise added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Exercise.findById(req.params.id)
    .then(exercise => {
      // Optional: Check if exercise belongs to user
      if (exercise.username !== req.user.username) {
         return res.status(403).json('Not authorized');
      }
      res.json(exercise)
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Exercise.findOneAndDelete({ _id: req.params.id, username: req.user.username })
    .then((doc) => {
       if(!doc) return res.status(404).json('Exercise not found or unauthorized');
       res.json('Exercise deleted.')
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  Exercise.findOne({ _id: req.params.id, username: req.user.username })
    .then(exercise => {
      if(!exercise) return res.status(404).json('Exercise not found or unauthorized');

      exercise.description = req.body.description;
      exercise.duration = Number(req.body.duration);
      exercise.date = Date.parse(req.body.date);
      exercise.category = req.body.category;

      exercise.save()
        .then(() => res.json('Exercise updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
