const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  votePoll,
} = require('../controllers/pollController');

router.post('/:id/vote', votePoll);

router.route('/').post(createPoll).get(getPolls);
router.route('/:id/vote').post(votePoll);

module.exports = router;
