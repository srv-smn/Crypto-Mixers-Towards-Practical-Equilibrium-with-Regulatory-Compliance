const express = require('express');
const router = express.Router();
const commitment = require('../controller/asp');

router.post('/add-commitment', commitment.addCommitment);
router.post('/add-anon-commitment', commitment.addAnonCommitment);



module.exports = router;