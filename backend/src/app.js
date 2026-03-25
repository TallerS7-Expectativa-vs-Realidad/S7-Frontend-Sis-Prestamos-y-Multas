const express = require('express');
const corsMiddleware = require('./middleware/corsMiddleware');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const LoanRepository = require('./repositories/loanRepository');
const DebtRepository = require('./repositories/debtRepository');
const LoanService = require('./services/loanService');
const DebtService = require('./services/DebtService');
const makeLoanRouter = require('./routes/loanRoutes');
const makeDebtRouter = require('./routes/debtRoutes');

/**
 * Factory function to create and configure the Express app
 * Takes a database pool as parameter for dependency injection
 */
module.exports = function makeApp(pool) {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // ============================================================
  // DEPENDENCY INJECTION SETUP
  // ============================================================
  // This section instantiates all repositories, services, and routers
  // in the correct order and injects them as dependencies

  // Repositories (depend on database pool)
  const loanRepository = new LoanRepository(pool);
  const debtRepository = new DebtRepository(pool);

  // Services (depend on repositories)
  const loanService = new LoanService(loanRepository, debtRepository);
  const debtService = new DebtService(debtRepository);

  // Routers (depend on services)
  const loanRouter = makeLoanRouter({ loanService });
  const debtRouter = makeDebtRouter({ debtService });

  // ============================================================
  // ROUTE REGISTRATION
  // ============================================================
  app.use('/api/v1/loan', loanRouter);
  app.use('/api/v1/debt', debtRouter);

  // ============================================================
  // ERROR HANDLING MIDDLEWARE
  // ============================================================
  // Must be registered AFTER all routes
  app.use(errorHandler);

  return app;
};
