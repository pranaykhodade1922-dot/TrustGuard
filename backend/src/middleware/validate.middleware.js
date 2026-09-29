import { ZodError } from 'zod';

/**
 * Reusable Express middleware for Zod schema validation
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against req.body
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
      }

      next(error);
    }
  };
}
