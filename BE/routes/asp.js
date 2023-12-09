const express = require('express');
const router = express.Router();
const commitment = require('../controller/asp');

router.post('/add-commitment', commitment.addCommitment);
router.post('/add-anon-commitment', commitment.addAnonCommitment);
router.post('/add-attest-commitment', commitment.addAtestationCommitment);



module.exports = router;