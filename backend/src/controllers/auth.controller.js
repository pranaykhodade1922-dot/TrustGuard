import { authService } from '../services/auth.service.js';

export const authController = {
  /**
   * Handle user signup
   * POST /api/auth/signup
   */
  async signup(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.signup(email, password);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Development/Testing protected route to verify token
   * GET /api/auth/me
   */
  async getMe(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Authenticated profile retrieved.',
      user: req.user,
    });
  },
};
