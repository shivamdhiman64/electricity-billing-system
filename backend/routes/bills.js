const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');

function calculateAmount(units) {
  if (units <= 100) return parseFloat((units * 5).toFixed(2));
  if (units <= 300) return parseFloat((100 * 5 + (units - 100) * 7).toFixed(2));
  return parseFloat((100 * 5 + 200 * 7 + (units - 300) * 10).toFixed(2));
}

// GET all bills
router.get('/', async (req, res) => {
  try {
    const bills = await all(`
      SELECT b.*, c.name as customer_name, c.meter_no, c.connection_type
      FROM bills b JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, data: bills });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST generate bill
router.post('/', async (req, res) => {
  const { customer_id, previous_reading, current_reading } = req.body;
  if (!customer_id || previous_reading === undefined || current_reading === undefined)
    return res.status(400).json({ success: false, message: 'All fields required' });
  if (parseFloat(current_reading) < parseFloat(previous_reading))
    return res.status(400).json({ success: false, message: 'Current reading cannot be less than previous reading' });
  const units = parseFloat((parseFloat(current_reading) - parseFloat(previous_reading)).toFixed(2));
  const amount = calculateAmount(units);
  try {
    const result = await run(
      'INSERT INTO bills (customer_id, previous_reading, current_reading, units, amount) VALUES (?, ?, ?, ?, ?)',
      [customer_id, previous_reading, current_reading, units, amount]
    );
    const newBill = await get(`
      SELECT b.*, c.name as customer_name, c.meter_no
      FROM bills b JOIN customers c ON b.customer_id = c.id WHERE b.id = ?
    `, [result.lastID]);
    res.status(201).json({ success: true, data: newBill, message: 'Bill generated successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT mark as paid
router.put('/:id/pay', async (req, res) => {
  try {
    await run("UPDATE bills SET status='Paid' WHERE id=?", [req.params.id]);
    res.json({ success: true, message: 'Bill marked as paid' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE bill
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM bills WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
