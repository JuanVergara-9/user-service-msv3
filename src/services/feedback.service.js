const { UserFeedback } = require('../../models');
const { badRequest } = require('../utils/httpError');

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip || null;
}

async function createFeedback(userId, payload, req) {
  const { type, subject, message } = payload;

  if (!type || !['bug', 'feature_request', 'complaint', 'other'].includes(type)) {
    throw badRequest('FEEDBACK.INVALID_TYPE', 'Tipo de reporte inválido');
  }

  if (!subject || subject.trim().length === 0) {
    throw badRequest('FEEDBACK.INVALID_SUBJECT', 'El asunto es requerido');
  }

  if (!message || message.trim().length === 0) {
    throw badRequest('FEEDBACK.INVALID_MESSAGE', 'El mensaje es requerido');
  }

  if (subject.length > 200) {
    throw badRequest('FEEDBACK.SUBJECT_TOO_LONG', 'El asunto no puede exceder 200 caracteres');
  }

  const feedback = await UserFeedback.create({
    user_id: userId || null,
    type,
    subject: subject.trim(),
    message: message.trim(),
    status: 'pending',
    ip: getClientIp(req),
    user_agent: req.headers['user-agent'] || null
  });

  return feedback;
}

module.exports = { createFeedback };

