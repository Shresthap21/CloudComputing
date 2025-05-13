require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.post('/book', async (req, res) => {
  try {
    console.log("Received booking request:", req.body);

    const existingBooking = await Booking.findOne({
      date: req.body.date,
      time: req.body.time,
    });
    
    if (existingBooking) {
      return res.status(400).send('Time slot is already booked.');
    }

    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/all-bookings', async (req, res) => {
  console.log('Received request for all bookings...');
  try {
    const bookings = await Booking.find();
    if (bookings.length === 0) {
      console.log('No bookings found.');
    } else {
      console.log('Bookings fetched:', bookings); // Logging fetched bookings data
    }
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Error fetching bookings');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
