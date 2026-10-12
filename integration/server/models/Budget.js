import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner student reference is required'],
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Budget calendar month is required (YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Monthly budget amount is required'],
      min: [1.0, 'Budget must be at least $1.00'],
      max: [1000000.0, 'Budget cannot exceed $1,000,000.00'],
    },
  },
  {
    timestamps: true,
  }
);

// One budget per user per month
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
