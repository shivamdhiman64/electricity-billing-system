const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await all('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ success: true, data: customers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST add customer
router.post('/', async (req, res) => {
  const { name, phone, address, meter_no, connection_type } = req.body;
  if (!name || !phone || !address || !meter_no || !connection_type)
    return res.status(400).json({ success: false, message: 'All fields are required' });
  try {
    const result = await run(
      'INSERT INTO customers (name, phone, address, meter_no, connection_type) VALUES (?, ?, ?, ?, ?)',
      [name, phone, address, meter_no, connection_type]
    );
    const newCustomer = await get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newCustomer, message: 'Customer added successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE'))
      res.status(409).json({ success: false, message: 'Meter number already exists' });
    else
      res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  const { name, phone, address, meter_no, connection_type } = req.body;
  try {
    await run(
      'UPDATE customers SET name=?, phone=?, address=?, meter_no=?, connection_type=? WHERE id=?',
      [name, phone, address, meter_no, connection_type, req.params.id]
    );
    const updated = await get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Customer updated successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

// POST /api/customers/login - Customer self-login via meter_no + phone
router.post('/login', async (req, res) => {
  const { meter_no, phone } = req.body;
  if (!meter_no || !phone)
    return res.status(400).json({ success: false, message: 'Meter number and phone required' });
  try {
    const customer = await get(
      'SELECT * FROM customers WHERE meter_no = ? AND phone = ?',
      [meter_no, phone]
    );
    if (customer) {
      res.json({ success: true, message: 'Login successful', customer });
    } else {
      res.status(401).json({ success: false, message: 'Invalid meter number or phone number' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/:id/bills - Get bills for a specific customer
router.get('/:id/bills', async (req, res) => {
  try {
    const bills = await all(`
      SELECT b.*, c.name as customer_name, c.meter_no, c.connection_type
      FROM bills b JOIN customers c ON b.customer_id = c.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [req.params.id]);
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
