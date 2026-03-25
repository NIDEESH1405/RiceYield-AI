const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const { name, email, organization, message, interest } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required' });

    const contact = await Contact.create({
      name, email, organization, message, interest,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, total: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
