// Auth Service - Gestiona la autenticación
const AuthService = {
  screen: null,
  content: null,
  currentView: null,

  init() {
    this.screen = document.getElementById('auth-screen');
    this.content = document.getElementById('auth-content');
  },

  async checkAuthStatus() {
    try {
      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/status`, {
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.configured) {
        // No existe configuración, mostrar registro
        this.showRegister();
        return false;
      }

      // Existe configuración, verificar si hay token en localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // No hay token, mostrar login
        this.showLogin();
        return false;
      }

      // Hay token, asumir que está autenticado
      // (En producción, deberías verificar el token en el backend)
      return true;
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      // Si hay error de red, no mostrar pantalla (la pantalla de conexión ya está visible)
      // Solo retornar false para que app.js detenga la inicialización
      return false;
    }
  },

  showRegister() {
    this.currentView = 'register';
    this.content.innerHTML = `
      <div class="auth-icon">🔐</div>
      <h2 class="auth-title">Configurar Acceso</h2>
      <p class="auth-subtitle">Configura tu contraseña para proteger tu aplicación</p>
      
      <form class="auth-form" id="register-form">
        <div class="auth-input-group">
          <label class="auth-label" for="register-password">Contraseña</label>
          <input 
            type="password" 
            id="register-password" 
            class="auth-input" 
            placeholder="Mínimo 6 caracteres" 
            required
            minlength="6"
            autocomplete="new-password"
          />
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="register-password-confirm">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="register-password-confirm" 
            class="auth-input" 
            placeholder="Repite la contraseña" 
            required
            minlength="6"
            autocomplete="new-password"
          />
        </div>
        
        <div class="auth-error" id="register-error"></div>
        
        <button type="submit" class="auth-button" id="register-btn">
          Configurar Acceso
        </button>
      </form>
    `;

    this.screen.classList.remove('hidden');

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
  },

  showLogin() {
    this.currentView = 'login';
    this.content.innerHTML = `
      <div class="auth-icon">🔑</div>
      <h2 class="auth-title">Iniciar Sesión</h2>
      <p class="auth-subtitle">Introduce tu contraseña para continuar</p>
      
      <form class="auth-form" id="login-form">
        <div class="auth-input-group">
          <label class="auth-label" for="login-password">Contraseña</label>
          <input 
            type="password" 
            id="login-password" 
            class="auth-input" 
            placeholder="Tu contraseña" 
            required
            autocomplete="current-password"
            autofocus
          />
        </div>
        
        <div class="auth-error" id="login-error"></div>
        <div class="auth-attempts" id="login-attempts" style="display:none;"></div>
        <div class="auth-lock-message" id="login-lock" style="display:none;"></div>
        
        <button type="submit" class="auth-button" id="login-btn">
          Iniciar Sesión
        </button>
      </form>
      
      <div class="auth-link" id="forgot-password-link">¿Olvidaste tu contraseña?</div>
    `;

    this.screen.classList.remove('hidden');

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('forgot-password-link').addEventListener('click', () => {
      this.showRecovery();
    });
  },

  showRecovery() {
    this.currentView = 'recovery';
    const isLocalhost = window.APP_ENV?.API_BASE?.includes('localhost');
    
    this.content.innerHTML = `
      <div class="auth-icon">🔑</div>
      <h2 class="auth-title">Recuperar Contraseña</h2>
      <p class="auth-subtitle">Usa un código de respaldo para recuperar tu acceso</p>
      
      <form class="auth-form" id="backup-code-form">
        <div class="auth-input-group">
          <label class="auth-label" for="backup-code">Código de Respaldo</label>
          <input 
            type="text" 
            id="backup-code" 
            class="auth-input" 
            placeholder="XXXXXXXX" 
            required
            maxlength="8"
            style="text-transform: uppercase;"
          />
          <div class="auth-info">Introduce uno de tus códigos de respaldo de 8 caracteres</div>
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="recovery-new-password">Nueva Contraseña</label>
          <input 
            type="password" 
            id="recovery-new-password" 
            class="auth-input" 
            placeholder="Mínimo 6 caracteres" 
            required
            minlength="6"
          />
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="recovery-new-password-confirm">Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            id="recovery-new-password-confirm" 
            class="auth-input" 
            placeholder="Repite la contraseña" 
            required
            minlength="6"
          />
        </div>
        
        <div class="auth-error" id="recovery-error"></div>
        
        <button type="submit" class="auth-button" id="recovery-btn">
          Restablecer Contraseña
        </button>
      </form>
      
      ${isLocalhost ? `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
          <div class="auth-link" id="localhost-reset-link" style="color: #fdcb6e;">🔓 Reseteo de Emergencia (Solo Localhost)</div>
        </div>
      ` : ''}
      
      <div class="auth-link" id="back-to-login">Volver al inicio de sesión</div>
    `;

    this.screen.classList.remove('hidden');

    document.getElementById('backup-code-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBackupCodeRecovery();
    });

    if (isLocalhost) {
      document.getElementById('localhost-reset-link').addEventListener('click', () => {
        this.showLocalhostReset();
      });
    }

    document.getElementById('back-to-login').addEventListener('click', () => {
      this.showLogin();
    });
  },

  showRecoveryCode(codes) {
    this.currentView = 'recovery-code';
    this.content.innerHTML = `
      <div class="auth-icon">�</div>
      <h2 class="auth-title">Códigos de Respaldo Generados</h2>
      <p class="auth-subtitle">Guarda estos códigos en un lugar seguro. Los necesitarás para recuperar tu contraseña.</p>
      
      <div class="auth-backup-codes-container" id="backup-codes-container">
        ${codes.map(c => `<div class="auth-backup-code-item">${c}</div>`).join('')}
      </div>
      
      <div class="auth-info" style="margin: 1rem 0;">
        ⚠️ Cada código solo se puede usar una vez. Guárdalos ahora.
      </div>
      
      <button class="auth-button" id="download-codes-btn" style="background: linear-gradient(135deg, #0984e3, #0767b8);">
        📥 Descargar Códigos
      </button>
      
      <button class="auth-button" id="confirm-saved-btn" style="margin-top: 0.5rem;">
        ✅ He Guardado los Códigos
      </button>
    `;

    this.screen.classList.remove('hidden');

    document.getElementById('download-codes-btn').addEventListener('click', () => {
      this.downloadBackupCodes(codes);
    });

    document.getElementById('confirm-saved-btn').addEventListener('click', () => {
      // Login automático después de confirmar
      this.hideAuth();
      window.location.reload();
    });
  },

  showLocalhostReset() {
    this.currentView = 'localhost-reset';
    this.content.innerHTML = `
      <div class="auth-icon">🔓</div>
      <h2 class="auth-title">Reseteo de Emergencia</h2>
      <p class="auth-subtitle" style="color: #fdcb6e;">Solo disponible en localhost - Genera nueva contraseña y códigos</p>
      
      <form class="auth-form" id="localhost-reset-form">
        <div class="auth-input-group">
          <label class="auth-label" for="localhost-new-password">Nueva Contraseña</label>
          <input 
            type="password" 
            id="localhost-new-password" 
            class="auth-input" 
            placeholder="Mínimo 6 caracteres" 
            required
            minlength="6"
          />
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="localhost-new-password-confirm">Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            id="localhost-new-password-confirm" 
            class="auth-input" 
            placeholder="Repite la contraseña" 
            required
            minlength="6"
          />
        </div>
        
        <div class="auth-error" id="localhost-error"></div>
        
        <button type="submit" class="auth-button" id="localhost-reset-btn" style="background: linear-gradient(135deg, #fdcb6e, #e1b12c);">
          🔓 Resetear Todo
        </button>
      </form>
      
      <div class="auth-link" id="back-to-recovery">Volver a recuperación</div>
    `;

    this.screen.classList.remove('hidden');

    document.getElementById('localhost-reset-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLocalhostReset();
    });

    document.getElementById('back-to-recovery').addEventListener('click', () => {
      this.showRecovery();
    });
  },

  downloadBackupCodes(codes) {
    const text = `Códigos de Respaldo - Aplicación de Finanzas Personales
Generados el: ${new Date().toLocaleString('es-ES')}

⚠️ IMPORTANTE: Guarda estos códigos en un lugar seguro
Cada código solo se puede usar UNA VEZ para recuperar tu contraseña

Códigos:
${codes.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---
No compartas estos códigos con nadie.
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async handleRegister() {
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const errorDiv = document.getElementById('register-error');
    const btn = document.getElementById('register-btn');

    errorDiv.classList.remove('show');

    if (password !== passwordConfirm) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.add('show');
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorDiv.classList.add('show');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = 'Configurando... <span class="auth-loading"></span>';

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      // Registro exitoso, mostrar códigos de respaldo
      this.showRecoveryCode(data.backupCodes);
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Configurar Acceso';
    }
  },
  async handleBackupCodeRecovery() {
    const code = document.getElementById('backup-code').value.toUpperCase();
    const newPassword = document.getElementById('recovery-new-password').value;
    const newPasswordConfirm = document.getElementById('recovery-new-password-confirm').value;
    const errorDiv = document.getElementById('recovery-error');
    const btn = document.getElementById('recovery-btn');

    errorDiv.classList.remove('show');

    if (newPassword !== newPasswordConfirm) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.add('show');
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorDiv.classList.add('show');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = 'Restableciendo... <span class="auth-loading"></span>';

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/reset-password-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer contraseña');
      }

      // Contraseña actualizada, mostrar mensaje y recargar
      alert(`Contraseña actualizada correctamente. Códigos restantes: ${data.remainingCodes}/10`);
      localStorage.removeItem('auth_token'); // Limpiar token anterior
      this.showLogin(); // Volver a login
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Restablecer Contraseña';
    }
  },

  async handleLocalhostReset() {
    const newPassword = document.getElementById('localhost-new-password').value;
    const newPasswordConfirm = document.getElementById('localhost-new-password-confirm').value;
    const errorDiv = document.getElementById('localhost-error');
    const btn = document.getElementById('localhost-reset-btn');

    errorDiv.classList.remove('show');

    if (newPassword !== newPasswordConfirm) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.add('show');
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorDiv.classList.add('show');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = 'Reseteando... <span class="auth-loading"></span>';

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/localhost-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al resetear contraseña');
      }

      // Mostrar nuevos códigos de respaldo
      this.showRecoveryCode(data.backupCodes);
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      btn.disabled = false;
      btn.textContent = '🔓 Resetear Todo';
    }
  },

  async handleLogin(providedPassword = null) {
    const password = providedPassword || document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const attemptsDiv = document.getElementById('login-attempts');
    const lockDiv = document.getElementById('login-lock');
    const btn = document.getElementById('login-btn');

    errorDiv.classList.remove('show');
    attemptsDiv.style.display = 'none';
    lockDiv.style.display = 'none';

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Iniciando sesión... <span class="auth-loading"></span>';
      }

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.status === 423) {
        // Bloqueado
        lockDiv.textContent = `Cuenta bloqueada. Espera ${data.minutesLeft} minuto(s) para volver a intentarlo.`;
        lockDiv.style.display = 'block';
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Iniciar Sesión';
        }
        return;
      }

      if (!response.ok) {
        if (data.attemptsLeft !== undefined) {
          attemptsDiv.textContent = `Intentos restantes: ${data.attemptsLeft}`;
          attemptsDiv.style.display = 'block';
        }
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Login exitoso
      localStorage.setItem('auth_token', data.token);
        this.hideAuth();
        window.location.reload();
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
      }
    }
  },

  async handleRequestRecovery() {
    const errorDiv = document.getElementById('recovery-error');
    const btn = document.getElementById('request-code-btn');

    errorDiv.classList.remove('show');

    try {
      btn.disabled = true;
      btn.innerHTML = 'Generando código... <span class="auth-loading"></span>';

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/request-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar código');
      }

      // Mostrar código (en desarrollo)
      this.showRecoveryCode(data.recoveryCode);
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Generar Código de Recuperación';
    }
  },

  async handleResetPassword() {
    const code = document.getElementById('verify-code').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('new-password-confirm').value;
    const errorDiv = document.getElementById('verify-error');
    const btn = document.getElementById('verify-btn');

    errorDiv.classList.remove('show');

    if (newPassword !== newPasswordConfirm) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.add('show');
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorDiv.classList.add('show');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = 'Restableciendo... <span class="auth-loading"></span>';

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer contraseña');
      }

      // Contraseña restablecida, hacer login automático
      await this.handleLogin(newPassword);
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Restablecer Contraseña';
    }
  },

  hideAuth() {
    if (this.screen) {
      this.screen.classList.add('hidden');
    }
  }
};

// Exportar para uso global
window.AuthService = AuthService;
