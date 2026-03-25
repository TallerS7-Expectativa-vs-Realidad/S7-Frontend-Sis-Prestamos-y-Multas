const { z } = require('zod');

// Validation schema for loan creation request
const createLoanSchema = z.object({
  id_book: z.string().min(1, 'id_book is required'),
  title: z.string().min(1, 'title is required'),
  type_id_reader: z.enum(['CI', 'DNI']).refine(
    (val) => val !== undefined,
    'type_id_reader must be either CI or DNI'
  ),
  id_reader: z.string().min(1, 'id_reader is required'),
  name_reader: z.string().min(1, 'name_reader is required'),
  loan_days: z.enum(['7', '14', '21']).transform(Number),
});

// Response schema for loan creation
const loanResponseSchema = z.object({
  loan_id: z.number(),
  id_book: z.string(),
  title: z.string(),
  type_id_reader: z.string(),
  id_reader: z.string(),
  name_reader: z.string(),
  loan_days: z.number(),
  state: z.string(),
  date_limit: z.string().datetime(),
  date_return: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

module.exports = {
  createLoanSchema,
  loanResponseSchema,
};
