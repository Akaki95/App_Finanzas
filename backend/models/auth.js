const { ObjectId } = require('mongodb');

class Auth {
  constructor(db) {
    this.collection = db.collection('auth');
  }

  // Obtener configuración de autenticación (solo debe haber un documento)
  async getAuthConfig() {
    return await this.collection.findOne({});
  }

  // Crear configuración de autenticación inicial
  async createAuthConfig(passwordHash, backupCodes) {
    const authConfig = {
      passwordHash,
      backupCodes: backupCodes || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      loginAttempts: 0,
      lockUntil: null
    };
    
    const result = await this.collection.insertOne(authConfig);
    return { ...authConfig, _id: result.insertedId };
  }

  // Actualizar contraseña
  async updatePassword(passwordHash, regenerateBackupCodes = false, newBackupCodes = null) {
    const update = {
      passwordHash,
      updatedAt: new Date(),
      loginAttempts: 0,
      lockUntil: null
    };

    if (regenerateBackupCodes && newBackupCodes) {
      update.backupCodes = newBackupCodes;
    }

    return await this.collection.updateOne({}, { $set: update });
  }

  // Incrementar intentos de login fallidos
  async incrementLoginAttempts() {
    const authConfig = await this.getAuthConfig();
    const newAttempts = (authConfig.loginAttempts || 0) + 1;
    
    const update = {
      loginAttempts: newAttempts,
      updatedAt: new Date()
    };

    // Si llega a 10 intentos, bloquear por 5 minutos
    if (newAttempts >= 10) {
      update.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    }

    return await this.collection.updateOne({}, { $set: update });
  }

  // Resetear intentos de login (después de login exitoso)
  async resetLoginAttempts() {
    return await this.collection.updateOne(
      {},
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date()
        }
      }
    );
  }

  // Verificar si está bloqueado
  async isLocked() {
    const authConfig = await this.getAuthConfig();
    if (!authConfig || !authConfig.lockUntil) return false;
    
    return new Date() < new Date(authConfig.lockUntil);
  }

  // Verificar y usar código de respaldo
  async verifyBackupCode(code) {
    const authConfig = await this.getAuthConfig();
    
    if (!authConfig || !authConfig.backupCodes) {
      return { valid: false, message: 'No hay códigos de respaldo configurados' };
    }

    const codeIndex = authConfig.backupCodes.findIndex(c => c.code === code && !c.used);

    if (codeIndex === -1) {
      return { valid: false, message: 'Código inválido o ya utilizado' };
    }

    // Marcar código como usado
    authConfig.backupCodes[codeIndex].used = true;
    authConfig.backupCodes[codeIndex].usedAt = new Date();

    await this.collection.updateOne(
      {},
      {
        $set: {
          backupCodes: authConfig.backupCodes,
          updatedAt: new Date()
        }
      }
    );

    return { valid: true };
  }

  // Regenerar códigos de respaldo
  async regenerateBackupCodes(newBackupCodes) {
    return await this.collection.updateOne(
      {},
      {
        $set: {
          backupCodes: newBackupCodes,
          updatedAt: new Date()
        }
      }
    );
  }

  // Crear código de recuperación (legacy - ya no se usa con códigos de respaldo)
  async createRecoveryCode(code) {
    return await this.collection.updateOne(
      {},
      {
        $set: {
          recoveryCode: code,
          recoveryExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
          updatedAt: new Date()
        }
      }
    );
  }

  // Verificar código de recuperación (legacy)
  async verifyRecoveryCode(code) {
    const authConfig = await this.getAuthConfig();
    
    if (!authConfig || !authConfig.recoveryCode) {
      return { valid: false, message: 'No hay código de recuperación activo' };
    }

    if (new Date() > new Date(authConfig.recoveryExpires)) {
      return { valid: false, message: 'El código ha expirado' };
    }

    if (authConfig.recoveryCode !== code) {
      return { valid: false, message: 'Código incorrecto' };
    }

    return { valid: true };
  }

  // Limpiar código de recuperación después de uso (legacy)
  async clearRecoveryCode() {
    return await this.collection.updateOne(
      {},
      {
        $set: {
          recoveryCode: null,
          recoveryExpires: null,
          updatedAt: new Date()
        }
      }
    );
  }
}

module.exports = Auth;
