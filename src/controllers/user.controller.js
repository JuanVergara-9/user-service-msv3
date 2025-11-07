const { z } = require('zod');
const svc = require('../services/user.service');
const { uploadBuffer, destroy } = require('../utils/cloudinary');

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
    // Asegurar que created_at y updated_at se incluyan en la respuesta
    const profileData = profile.toJSON ? profile.toJSON() : profile;
    // Si Sequelize convirtió created_at a createdAt, mantener ambos para compatibilidad
    if (profileData.createdAt && !profileData.created_at) {
      profileData.created_at = profileData.createdAt;
    }
    if (profileData.updatedAt && !profileData.updated_at) {
      profileData.updated_at = profileData.updatedAt;
    }
    res.json({ profile: profileData });
  } catch(e){ next(e); }
}

async function putMe(req,res,next){
  try{
    const data = putSchema.parse(req.body);
    const profile = await svc.updateProfile(req.user.userId, data);
    res.json({ profile });
  } catch(e){ next(e); }
}

async function uploadAvatar(req, res, next) {
  console.log('[uploadAvatar] Request received:', req.method, req.path);
  try {
    const userId = Number(req.user?.userId);
    console.log('[uploadAvatar] Processing upload for userId:', userId);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: { code: 'USER.UNAUTHORIZED', message: 'No autorizado: userId inválido' } });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: { code: 'USER.NO_FILE', message: 'Archivo requerido (field: file)' } });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'miservicio/users';
    const publicIdBase = `user_${userId}`;
    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder,
      public_id: `${publicIdBase}_${Date.now()}`,
      overwrite: true,
      resource_type: 'image'
    });

    const updated = await svc.setAvatar(userId, {
      url: uploadResult.secure_url || uploadResult.url
    });

    res.status(200).json({ profile: updated });
  } catch (e) { next(e); }
}

async function deleteAvatar(req, res, next) {
  try {
    const userId = Number(req.user?.userId);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: { code: 'USER.UNAUTHORIZED', message: 'No autorizado: userId inválido' } });
    }
    
    const profile = await svc.getOrCreateProfile(userId);
    if (profile.avatar_url) {
      // Intentar eliminar de Cloudinary si es posible (opcional)
      try {
        // Extraer public_id de la URL si es posible
        const urlParts = profile.avatar_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        if (publicId && publicId.startsWith(`user_${userId}`)) {
          await destroy(publicId);
        }
      } catch(_e) { /* ignore */ }
    }
    
    const updated = await svc.clearAvatar(userId);
    res.status(200).json({ profile: updated });
  } catch (e) { next(e); }
}

module.exports={ getMe, putMe, uploadAvatar, deleteAvatar };
