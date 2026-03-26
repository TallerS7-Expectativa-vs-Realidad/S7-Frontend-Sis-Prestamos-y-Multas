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

// Validation schema for loan return (HU-03 and HU-04)
// Rules:
// - id_book and id_reader: at least one must be provided (both cannot be null/empty)
// - name_reader: can be null ONLY if id_book is provided
// - type_id_reader: always required (CI or DNI)
// - date_return: always required (format: YYYY-MM-DD)
// - base_fib_amount: optional, defaults to backend config if not provided (minimum 0.01)
const returnLoanSchema = z.object({
  date_return: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_return must be in YYYY-MM-DD format'),
  type_id_reader: z.enum(['CI', 'DNI']).refine(
    (val) => val !== undefined,
    'type_id_reader must be either CI or DNI'
  ),
  id_book: z.union([z.number().int().positive(), z.string().min(1)]).optional().nullable(),
  id_reader: z.union([z.number().int().positive(), z.string().min(1)]).optional().nullable(),
  name_reader: z.string().optional().nullable(),
  base_fib_amount: z.number().positive('base_fib_amount must be a positive number').optional(),
}).refine(
  (data) => {
    // At least one of id_book or id_reader must be provided
    const hasIdBook = data.id_book !== null && data.id_book !== undefined && String(data.id_book).trim() !== '';
    const hasIdReader = data.id_reader !== null && data.id_reader !== undefined && String(data.id_reader).trim() !== '';
    return hasIdBook || hasIdReader;
  },
  {
    message: 'At least one of id_book or id_reader must be provided',
    path: ['id_book', 'id_reader'],
  }
).refine(
  (data) => {
    // name_reader can be null ONLY if id_book is provided
    const hasIdBook = data.id_book !== null && data.id_book !== undefined && String(data.id_book).trim() !== '';
    const nameReaderEmpty = !data.name_reader || String(data.name_reader).trim() === '';
    
    // If name_reader is empty, id_book MUST be provided
    if (nameReaderEmpty) {
      return hasIdBook;
    }
    return true;
  },
  {
    message: 'name_reader can only be null/empty if id_book is provided',
    path: ['name_reader'],
  }
);

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
  returnLoanSchema,
  loanResponseSchema,
};
