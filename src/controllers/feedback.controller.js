const { z } = require('zod');
const svc = require('../services/feedback.service');

const createFeedbackSchema = z.object({
  type: z.enum(['bug', 'feature_request', 'complaint', 'other']),
  subject: z.string().min(1).max(200),
  message: z.string().min(1)
}).strict();

async function createFeedback(req, res, next) {
  try {
    const data = createFeedbackSchema.parse(req.body);
    const userId = req.user?.userId || null; // Puede ser null si no está autenticado
    const feedback = await svc.createFeedback(userId, data, req);
    res.status(201).json({ 
      feedback: {
        id: feedback.id,
        type: feedback.type,
        subject: feedback.subject,
        status: feedback.status,
        created_at: feedback.created_at
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { createFeedback };

