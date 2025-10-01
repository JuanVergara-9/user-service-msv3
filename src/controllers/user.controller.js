const { z } = require('zod');
const svc = require('../services/user.service');

const putSchema = z.object({
  first_name: z.string().max(60).optional(),
  last_name: z.string().max(60).optional(),
  // YYYY-MM-DD
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  province: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  locality: z.string().max(80).optional(),
  address: z.string().max(160).optional(),
  phone_e164: z.string().max(32).optional(),
  avatar_url: z.string().url().max(255).optional(),
  public_profile: z.boolean().optional(),
  default_location_source: z.enum(['gps','city','manual']).optional()
}).strict();


async function getMe(req,res,next){
  try{
    const profile = await svc.getOrCreateProfile(req.user.userId);
    res.json({ profile });
  } catch(e){ next(e); }
}

async function putMe(req,res,next){
  try{
    const data = putSchema.parse(req.body);
    const profile = await svc.updateProfile(req.user.userId, data);
    res.json({ profile });
  } catch(e){ next(e); }
}

module.exports={ getMe, putMe };
