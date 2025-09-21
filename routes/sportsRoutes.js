const express = require("express");
const router = express.Router();
const sportsController = require("../controllers/sportsController");

// Tournament routes
router.get("/tournaments", sportsController.getTournaments);
router.get("/standings/:id", sportsController.getStandings);

// Team and event routes
router.get("/events/:teamId", sportsController.getEvents);
router.get("/statistics/:eventId", sportsController.getStatistics);

module.exports = router;