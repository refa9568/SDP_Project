const Equipment = require('../models/Equipment');

const getAllEquipment = async (req, res) => {
  try {
    const { company, type, status } = req.query;
    const user = req.user;

    let filters = {};

    // Role-based filtering
    if (user.role === 'soldier') {
      // Soldiers see only equipment assigned to them
      filters.assigned_to = user.user_id;
    } else if (user.role === 'coy_comd') {
      // Company Commander sees equipment from their company
      filters.company = user.company;
    }
    // adjutant, bsm, commanding_officer see all equipment

    // Apply additional filters if provided
    if (company && (user.role === 'adjutant' || user.role === 'commanding_officer' || user.role === 'bsm')) {
      filters.company = company;
    }

    if (type) {
      filters.type = type;
    }

    if (status) {
      filters.status = status;
    }

    const equipment = await Equipment.getAllEquipment(filters);

    res.json({
      count: equipment.length,
      equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id).populate('assigned_to', 'name service_number');

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { equipment_id, name, type, company, status, assigned_to, location, notes } = req.body;
    const user = req.user;

    // Only admins can create equipment
    if (!['adjutant', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Validate required fields
    if (!equipment_id || !name || !type || !company) {
      return res.status(400).json({ error: 'Required fields: equipment_id, name, type, company' });
    }

    // Check if equipment already exists
    const existingEquipment = await Equipment.findByEquipmentId(equipment_id);
    if (existingEquipment) {
      return res.status(400).json({ error: 'Equipment with this ID already exists' });
    }

    // Create equipment
    const equipment = await Equipment.createEquipment({
      equipment_id,
      name,
      type,
      company,
      status: status || 'available',
      assigned_to: assigned_to || null,
      location: location || null,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;

    // Only admins can update equipment
    if (!['adjutant', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const equipment = await Equipment.updateEquipment(id, updates);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Only admins can delete equipment
    if (!['adjutant', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const equipment = await Equipment.deleteEquipment(id);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};