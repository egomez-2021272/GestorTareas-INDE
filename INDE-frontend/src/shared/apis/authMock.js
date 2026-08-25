// simulación de como se trabajará en una respuesta 
// de un login, para poder trabajar sin el backend

export const loginRequest = async ({ username, password }) => {
  return new Promise((resolve, reject) => {
    // Simulamos que el servidor tarda 1 segundo en responder
    setTimeout(() => {
      // Simulación básica de validación
      if (username === 'admin' && password === 'admin123') {
        resolve({
          data: {
            data: {
              user: { id: 1, username: 'admin', role: 'ADMIN_ROLE', name: 'Administrador INDE' },
              token: 'mock-jwt-token-12345',
              refreshToken: 'mock-refresh-token',
            }
          }
        });
      } else {
        reject({
          response: {
            data: { message: 'Credenciales inválidas. Intenta con admin / admin123' }
          }
        });
      }
    }, 1000);
  });
};