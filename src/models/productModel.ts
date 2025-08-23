// models/productModel.ts
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  material: { type: String },
  colors: { type: String },
  sizes: { type: String },
  category: { type: String },
  status: { type: String, default: 'Còn hàng' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
