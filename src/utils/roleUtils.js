// src/utils/roleUtils.js

// Mapeo de código de rol (número) a nombre de rol (string)
export const ROLES = {
  1: 'admin',
  2: 'empleado',
  3: 'usuario',
  4: 'dj',
};

// Obtener nombre del rol a partir del código
export const getRoleName = (rolCode) => {
  if (rolCode === undefined || rolCode === null) return null;
  return ROLES[rolCode] || null;
};

// Redirección según el rol (admite número o nombre)
export const roleRedirect = (roleOrCode) => {
  let roleName = typeof roleOrCode === 'number' ? getRoleName(roleOrCode) : roleOrCode;
  if (!roleName) return '/'; // fallback a home

  const routes = {
    admin: '/admin',
    empleado: '/empleado',
    usuario: '/usuario',
    dj: '/dj',
  };
  return routes[roleName] || '/';
};

// Verificar si un usuario tiene un rol permitido (soporta arrays)
export const hasRole = (user, allowedRoles) => {
  if (!user) return false;
  if (!user.role) return false;

  // Normalizar el rol del usuario a nombre
  const userRoleName = typeof user.role === 'number' ? getRoleName(user.role) : user.role;
  if (!userRoleName) return false;

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.some(r => r === userRoleName);
  }
  return allowedRoles === userRoleName;
};