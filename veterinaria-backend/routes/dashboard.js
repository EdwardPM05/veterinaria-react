// backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route to get dashboard summary (citas hoy, pendientes, completadas, canceladas)
router.get('/summary', dashboardController.getDashboardSummary);

// Route to get total client and pet counts
router.get('/counts', dashboardController.getCounts);

// Route to get upcoming appointments
router.get('/upcoming-citas', dashboardController.getUpcomingCitas);

// Route to get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;