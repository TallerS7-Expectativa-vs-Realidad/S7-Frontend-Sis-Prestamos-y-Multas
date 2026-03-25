const { Router } = require('express');

/**
 * Factory function to create debt router with injected service
 * Follows dependency injection pattern as per backend.instructions.md
 */
module.exports = function makeDebtRouter({ debtService }) {
  const router = Router();

  /**
   * GET /api/v1/debt/:id_reader
   * Get pending debts for a reader
   */
  router.get('/:id_reader', async (req, res, next) => {
    try {
      const { id_reader } = req.params;
      
      const debts = await debtService.getAllPendingDebtsByReader(id_reader);
      
      return res.status(200).json({
        success: true,
        data: debts,
        message: 'Debts retrieved successfully',
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
