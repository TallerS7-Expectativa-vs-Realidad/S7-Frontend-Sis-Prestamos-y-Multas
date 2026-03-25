const { z } = require('zod');

// Validation schema for debt queries
const debtQuerySchema = z.object({
  id_reader: z.string().min(1, 'id_reader is required'),
});

// Response schema for debt
const debtResponseSchema = z.object({
  dept_id: z.number(),
  loan_id: z.number(),
  id_reader: z.string(),
  name_reader: z.string(),
  units_fib: z.number(),
  amount_dept: z.number(),
  state_dept: z.string(),
  created_at: z.string().datetime(),
});

module.exports = {
  debtQuerySchema,
  debtResponseSchema,
};
