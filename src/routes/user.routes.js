const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/user.controller');

// Importar uploadImage con manejo de errores
let uploadImage;
try {
  const uploadMiddleware = require('../middlewares/upload.middleware');
  uploadImage = uploadMiddleware.uploadImage;
  console.log('[user.routes] uploadImage middleware loaded successfully');
} catch (error) {
  console.error('[user.routes] Error loading uploadImage middleware:', error);
  // Crear un middleware dummy que falle con un error claro
  uploadImage = {
    single: () => (req, res, next) => {
      return res.status(500).json({ 
        error: { code: 'USER.UPLOAD_MIDDLEWARE_ERROR', message: 'Upload middleware no disponible' } 
      });
    }
  };
}

router.get('/me', requireAuth, ctrl.getMe);
router.put('/me', requireAuth, ctrl.putMe);
// Registrar ruta de avatar con logging
console.log('[user.routes] Registering POST /me/avatar route');
router.post('/me/avatar', requireAuth, uploadImage.single('file'), ctrl.uploadAvatar);
console.log('[user.routes] Registering DELETE /me/avatar route');
router.delete('/me/avatar', requireAuth, ctrl.deleteAvatar);

// Endpoint para obtener perfil por ID (para compatibilidad con el gateway)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Solo permitir que el usuario vea su propio perfil
    if (parseInt(req.params.id) !== req.user.userId) {
      return res.status(403).json({ 
        error: { code: 'USER.FORBIDDEN', message: 'No tienes permisos para ver este perfil' } 
      });
    }
    
    // CORREGIDO: No llamar ctrl.getMe que ya responde, sino redirigir internamente
    // Opción A: Redirigir a /me
    req.url = '/me';
    return ctrl.getMe(req, res);
    
    // Opción B: Duplicar la lógica (si no quieres redirigir)
    // const user = await User.findByPk(req.user.userId, { attributes: { exclude: ['password'] } });
    // if (!user) return res.status(404).json({ error: { code: 'USER.NOT_FOUND', message: 'Usuario no encontrado' } });
    // res.json(user);
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: { code: 'USER.INTERNAL_ERROR', message: 'Error interno del servidor' } 
      });
    }
  }
});

module.exports = router;