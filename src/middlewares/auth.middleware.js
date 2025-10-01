const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/httpError');

function requireAuth(req,_res,next){
  const hdr=req.headers.authorization||''; const token=hdr.startsWith('Bearer ')?hdr.slice(7):null;
  if(!token) return next(unauthorized('AUTH.MISSING_TOKEN','Token requerido'));
  try{ const p=verifyAccessToken(token); req.user={ userId:p.userId, role:p.role }; next(); }
  catch{ return next(unauthorized('AUTH.INVALID_TOKEN','Token inválido o expirado')); }
}
module.exports={ requireAuth };
