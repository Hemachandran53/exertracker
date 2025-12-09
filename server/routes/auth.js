import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const apiToken = jwt.sign({ username }, process.env.JWT_SECRET); 
    // Simplified: usually valid user check or ID usage
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json('User already exists');

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Create token
    const token = jwt.sign({ _id: newUser._id.toString(), username: newUser.username }, process.env.JWT_SECRET);
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Unable to login');
    }

    const token = jwt.sign({ _id: user._id.toString(), username: user.username }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (err) {
    res.status(400).send('Error: ' + err.message);
  }
});

export default router;
