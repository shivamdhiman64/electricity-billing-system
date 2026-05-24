const express = require('express');
const router = express.Router();
const { get, all } = require('../database');

router.get('/stats', async (req, res) => {
  try {
    const totalCustomers = (await get('SELECT COUNT(*) as count FROM customers')).count;
    const totalBills = (await get('SELECT COUNT(*) as count FROM bills')).count;
    const paidBills = (await get("SELECT COUNT(*) as count FROM bills WHERE status='Paid'")).count;
    const unpaidBills = (await get("SELECT COUNT(*) as count FROM bills WHERE status='Unpaid'")).count;
    const revenueRow = await get("SELECT COALESCE(SUM(amount),0) as total FROM bills WHERE status='Paid'");
    const revenue = parseFloat((revenueRow.total || 0).toFixed(2));

    const monthlyRevenue = await all(`
      SELECT strftime('%Y-%m', created_at) as month,
             SUM(CASE WHEN status='Paid' THEN amount ELSE 0 END) as revenue,
             COUNT(*) as bills
      FROM bills GROUP BY month ORDER BY month DESC LIMIT 6
    `);

    res.json({
      success: true,
      data: { totalCustomers, totalBills, paidBills, unpaidBills, revenue, monthlyRevenue: monthlyRevenue.reverse() }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
