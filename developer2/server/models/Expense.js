import mongoose from 'mongoose';

const expenseCategories = [
  'Food & Groceries',
  'Housing & Rent',
  'Tuition & Books',
  'Transportation',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Health & Personal Care',
  'Electronics & Gadgets',
  'Other',
];

const paymentMethods = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'UPI / Mobile Transfer',
  'Bank Transfer',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner student reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
      max: [1000000, 'Amount cannot exceed 1,000,000'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: expenseCategories,
        message: '{VALUE} is not a valid expense category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: paymentMethods,
      default: 'Debit Card',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export { expenseCategories, paymentMethods };
