const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  equipment_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['weapon', 'vehicle', 'communication', 'medical', 'other']
  },
  company: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'damaged'],
    default: 'available'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Static methods
equipmentSchema.statics.findByEquipmentId = function(equipment_id) {
  return this.findOne({ equipment_id });
};

equipmentSchema.statics.getAllEquipment = function(filters = {}) {
  let query = this.find();

  if (filters.company) {
    query = query.where('company').equals(filters.company);
  }

  if (filters.type) {
    query = query.where('type').equals(filters.type);
  }

  if (filters.status) {
    query = query.where('status').equals(filters.status);
  }

  return query.populate('assigned_to', 'name service_number').sort({ createdAt: -1 });
};

equipmentSchema.statics.createEquipment = function(equipmentData) {
  const equipment = new this(equipmentData);
  return equipment.save();
};

equipmentSchema.statics.updateEquipment = function(equipment_id, updates) {
  return this.findOneAndUpdate({ equipment_id }, updates, { new: true });
};

equipmentSchema.statics.deleteEquipment = function(equipment_id) {
  return this.findOneAndDelete({ equipment_id });
};

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;