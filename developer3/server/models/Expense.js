import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Debit Card',
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
