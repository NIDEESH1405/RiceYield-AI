const express = require('express');
const router = express.Router();
const { createContact, getContacts } = require('../controllers/contactController');

router.post('/', createContact);    // POST /api/contacts
router.get('/', getContacts);       // GET  /api/contacts

module.exports = router;
