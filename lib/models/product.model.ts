import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  currency: { type: String, required: true },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  description: { type: String },
  avgReviews: { type: String },
  priceHistory: [
    {
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  reviewsCount: { type: Number },
  discountPercentage: { type: Number },
  lowestPrice: { type: Number },
  highestPrice: { type: Number },
  averagePrice: { type: Number },
  category: { type: String },
  users: [
    { email: { type: String, required: true } }
  ]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;