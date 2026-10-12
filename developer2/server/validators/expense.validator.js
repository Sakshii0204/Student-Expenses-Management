import { expenseCategories, paymentMethods } from '../models/Expense.js';

export function validateExpenseInput(data) {
  const errors = [];
  const { amount, category, date, description, paymentMethod } = data;

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number greater than 0.' });
  } else if (numAmount > 1000000) {
    errors.push({ field: 'amount', message: 'Amount exceeds the maximum limit of 1,000,000.' });
  }

  if (!category || !expenseCategories.includes(category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${expenseCategories.join(', ')}.`,
    });
  }

  if (!date || isNaN(new Date(date).getTime())) {
    errors.push({ field: 'date', message: 'A valid date is required.' });
  }

  if (description && typeof description === 'string' && description.length > 300) {
    errors.push({ field: 'description', message: 'Description cannot exceed 300 characters.' });
  }

  if (paymentMethod && !paymentMethods.includes(paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: `Payment method must be one of: ${paymentMethods.join(', ')}.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
