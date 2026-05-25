const express = require('express');
const cors = require('cors');
const { init } = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/smartmeter', require('./routes/smartmeter'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

init().then(() => {
  app.listen(PORT, () => {
    console.log('\n⚡ Smart Electricity Billing System