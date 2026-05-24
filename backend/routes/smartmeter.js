// smartmeter.js - Smart Meter & Bulk Billing Routes
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');

// ── Calculate bill amount with extra charges ──────────────────
function calculateAmount(units, connectionType = 'Residential') {
  let baseAmount = 0;
  if (units <= 100) baseAmount = units * 5;
  else if (units <= 300) baseAmount = (100 * 5) + (units - 100) * 7;
  else baseAmount = (100 * 5) + (200 * 7) + (units - 300) * 10;

  const onlineMeterCharge = 50;   // Fixed: online meter charge
  const serviceCharge = 30;        // Fixed: service charge
  const subtotal = baseAmount + onlineMeterCharge + serviceCharge;
  const gst = parseFloat((subtotal * 0.18).toFixed(2));
  const totalAmount = parseFloat((subtotal + gst).toFixed(2));

  return { baseAmount: parseFloat(baseAmount.toFixed(2)), onlineMeterCharge, serviceCharge, gst, totalAmount };
}

// GET /api/smartmeter/meters - Get all meter statuses
router.get('/meters', async (req, res) => {
  try {
    const meters = await all(`
      SELECT c.id, c.name, c.meter_no, c.connection_type, c.phone,
             sm.current_reading, sm.previous_reading, sm.last_updated, sm.status,
             sm.monthly_units, sm.bill_generated
      FROM customers c
      LEFT JOIN smart_meters sm ON c.id = sm.customer_id
      ORDER BY c.id
    `);
    res.json({ success: true, data: meters });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/smartmeter/simulate - Simulate meter readings update
router.post('/simulate', async (req, res) => {
  try {
    const customers = await all('SELECT * FROM customers');
    for (const c of customers) {
      const existing = await get('SELECT * FROM smart_meters WHERE customer_id = ?', [c.id]);
      if (existing) {
        // Add random units (50-400 units per month simulation)
        const addUnits = Math.floor(Math.random() * 350) + 50;
        const newReading = parseFloat((existing.current_reading + addUnits).toFixed(2));
        await run(`UPDATE smart_meters SET 
          previous_reading = current_reading,
          current_reading = ?,
          monthly_units = ?,
          last_updated = CURRENT_TIMESTAMP,
          bill_generated = 0,
          status = 'Online'
          WHERE customer_id = ?`,
          [newReading, addUnits, c.id]);
      } else {
        const initReading = Math.floor(Math.random() * 2000) + 500;
        const addUnits = Math.floor(Math.random() * 350) + 50;
        await run(`INSERT INTO smart_meters 
          (customer_id, previous_reading, current_reading, monthly_units, status, bill_generated)
          VALUES (?, ?, ?, ?, 'Online', 0)`,
          [c.id, initReading, initReading + addUnits, addUnits]);
      }
    }
    res.json({ success: true, message: `${customers.length} meters updated successfully` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/smartmeter/generate-all - Month end: generate all bills
router.post('/generate-all', async (req, res) => {
  try {
    const meters = await all(`
      SELECT sm.*, c.name, c.connection_type, c.phone
      FROM smart_meters sm
      JOIN customers c ON sm.customer_id = c.id
      WHERE sm.bill_generated = 0 AND sm.monthly_units > 0
    `);

    if (meters.length === 0) {
      return res.json({ success: false, message: 'No pending meter readings. Simulate readings first.' });
    }

    let generated = 0;
    const bills = [];
    for (const m of meters) {
      const charges = calculateAmount(m.monthly_units, m.connection_type);
      const result = await run(`
        INSERT INTO bills (customer_id, previous_reading, current_reading, units, amount, status)
        VALUES (?, ?, ?, ?, ?, 'Unpaid')`,
        [m.customer_id, m.previous_reading, m.current_reading, m.monthly_units, charges.totalAmount]
      );
      await run(`INSERT INTO bill_charges (bill_id, base_amount, online_meter_charge, service_charge, gst)
        VALUES (?, ?, ?, ?, ?)`,
        [result.lastID, charges.baseAmount, charges.onlineMeterCharge, charges.serviceCharge, charges.gst]);
      await run('UPDATE smart_meters SET bill_generated = 1 WHERE customer_id = ?', [m.customer_id]);

      // Add notification
      await run(`INSERT INTO notifications (customer_id, bill_id, message, is_read)
        VALUES (?, ?, ?, 0)`,
        [m.customer_id, result.lastID,
         `Your electricity bill for this month is ready! Units: ${m.monthly_units}, Amount: ₹${charges.totalAmount}`]);
      generated++;
      bills.push({ customer: m.name, units: m.monthly_units, amount: charges.totalAmount });
    }
    res.json({ success: true, message: `${generated} bills generated successfully!`, bills });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/smartmeter/notifications/:customerId - Customer notifications
router.get('/notifications/:customerId', async (req, res) => {
  try {
    const notifs = await all(`
      SELECT n.*, b.units, b.amount, b.status as bill_status
      FROM notifications n
      JOIN bills b ON n.bill_id = b.id
      WHERE n.customer_id = ?
      ORDER BY n.created_at DESC
    `, [req.params.customerId]);
    res.json({ success: true, data: notifs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/smartmeter/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/smartmeter/charges/:billId - Get charge breakdown
router.get('/charges/:billId', async (req, res) => {
  try {
    const charges = await get('SELECT * FROM bill_charges WHERE bill_id = ?', [req.params.billId]);
    res.json({ success: true, data: charges });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
