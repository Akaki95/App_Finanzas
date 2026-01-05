const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Auth = require('../models/auth');

// Función para generar códigos de respaldo
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code: code,
      used: false,
      usedAt: null
    });
  }
  return codes;
}

// Middleware para inicializar modelo
router.use((req, res, next) => {
  req.authModel = new Auth(req.app.locals.db);
  next();
});

// Verificar si existe configuración de autenticación
router.get('/status', async (req, res) => {
  try {
    const authConfig = await req.authModel.getAuthConfig();
    res.json({
      configured: !!authConfig
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar nueva configuración de autenticación
router.post('/register', async (req, res) => {
  try {
    const { password } = req.body;

    // Validar datos
    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' });
    }

    // Verificar que no exista ya una configuración
    const existing = await req.authModel.getAuthConfig();
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una configuración de autenticación' });
    }

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar códigos de respaldo
    const backupCodes = generateBackupCodes(10);

    // Crear configuración
    const authConfig = await req.authModel.createAuthConfig(passwordHash, backupCodes);

    res.json({
      success: true,
      message: 'Autenticación configurada correctamente',
      backupCodes: backupCodes.map(c => c.code) // Solo enviar los códigos, no el estado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Contraseña requerida' });
    }

    const authConfig = await req.authModel.getAuthConfig();
    if (!authConfig) {
      return res.status(404).json({ error: 'No hay configuración de autenticación' });
    }

    // Verificar si está bloqueado
    const isLocked = await req.authModel.isLocked();
    if (isLocked) {
      const lockUntil = new Date(authConfig.lockUntil);
      const minutesLeft = Math.ceil((lockUntil - new Date()) / 60000);
      return res.status(423).json({
        error: 'Cuenta bloqueada por intentos fallidos',
        minutesLeft,
        lockUntil
      });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, authConfig.passwordHash);

    if (!isValid) {
      await req.authModel.incrementLoginAttempts();
      const updatedConfig = await req.authModel.getAuthConfig();
      const attemptsLeft = 10 - (updatedConfig.loginAttempts || 0);

      return res.status(401).json({
        error: 'Contraseña incorrecta',
        attemptsLeft: Math.max(0, attemptsLeft)
      });
    }

    // Login exitoso
    await req.authModel.resetLoginAttempts();

    // Generar token simple (hash del password + timestamp)
    const token = crypto.createHash('sha256')
      .update(authConfig.passwordHash + Date.now())
      .digest('hex');

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      email: authConfig.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Solicitar recuperación de contraseña
router.post('/request-recovery', async (req, res) => {
  try {
    const authConfig = await req.authModel.getAuthConfig();
    if (!authConfig) {
      return res.status(404).json({ error: 'No hay configuración de autenticación' });
    }

    // Generar código de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    await req.authModel.createRecoveryCode(recoveryCode);

    // TODO: Enviar email con el código
    // Por ahora, lo devolvemos en la respuesta (solo para desarrollo)
    console.log(`📧 Código de recuperación: ${recoveryCode}`);

    res.json({
      success: true,
      message: 'Código de recuperación generado',
      email: authConfig.email,
      // ELIMINAR ESTO EN PRODUCCIÓN:
      recoveryCode: recoveryCode // Solo para desarrollo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar código de respaldo
router.post('/verify-backup-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código requerido' });
    }

    const result = await req.authModel.verifyBackupCode(code);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: 'Código válido'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resetear contraseña con código de respaldo
router.post('/reset-password-backup', async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ error: 'Código y nueva contraseña son requeridos' });
    }

    // Verificar código
    const result = await req.authModel.verifyBackupCode(code);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Generar nuevos códigos de respaldo
    const newBackupCodes = generateBackupCodes(10);

    // Actualizar contraseña y códigos
    await req.authModel.updatePassword(passwordHash, true, newBackupCodes);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
      backupCodes: newBackupCodes.map(c => c.code)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bypass para localhost - Resetear contraseña sin verificación
router.post('/localhost-reset', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nueva contraseña requerida' });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Generar nuevos códigos de respaldo
    const newBackupCodes = generateBackupCodes(10);

    // Actualizar contraseña y códigos
    await req.authModel.updatePassword(passwordHash, true, newBackupCodes);

    res.json({
      success: true,
      message: 'Contraseña restablecida correctamente',
      backupCodes: newBackupCodes.map(c => c.code)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerar códigos de respaldo (requiere contraseña actual)
router.post('/regenerate-backup-codes', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Contraseña requerida' });
    }

    const authConfig = await req.authModel.getAuthConfig();
    if (!authConfig) {
      return res.status(404).json({ error: 'No hay configuración de autenticación' });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, authConfig.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar nuevos códigos
    const newBackupCodes = generateBackupCodes(10);

    await req.authModel.regenerateBackupCodes(newBackupCodes);

    res.json({
      success: true,
      message: 'Códigos de respaldo regenerados',
      backupCodes: newBackupCodes.map(c => c.code)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar código de recuperación
router.post('/verify-recovery', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código requerido' });
    }

    const result = await req.authModel.verifyRecoveryCode(code);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: 'Código válido'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resetear contraseña con código
router.post('/reset-password', async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ error: 'Código y nueva contraseña son requeridos' });
    }

    // Verificar código
    const result = await req.authModel.verifyRecoveryCode(code);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await req.authModel.updatePassword(passwordHash);
    await req.authModel.clearRecoveryCode();

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
