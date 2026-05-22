import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  clientName: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
}, { timestamps: true });

clientSchema.index({ userId: 1, email: 1 });

const Client = mongoose.model('Client', clientSchema);
export default Client;