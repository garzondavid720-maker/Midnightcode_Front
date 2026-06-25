// src/utils/roleUtils.js
export const ROLES = {
  1: 'admin',
  2: 'empleado',
  3: 'usuario',
  4: 'dj',
};

export const getRoleName = (rolCode) => {
  if (rolCode === undefined || rolCode === null) return null;
  return ROLES[rolCode] || null;
};

export const roleRedirect = (roleOrCode) => {
  let roleName = typeof roleOrCode === 'number' ? getRoleName(roleOrCode) : roleOrCode;
  if (!roleName) return '/';
  const routes = {
    admin: '/admin',
    empleado: '/empleado',
    usuario: '/usuario',
    dj: '/dj',
  };
  return routes[roleName] || '/';
};

export const hasRole = (user, allowedRoles) => {
  if (!user) return false;
  const userRole = typeof user.role === 'number' ? getRoleName(user.role) : user.role;
  if (!userRole) return false;
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.some(r => r === userRole);
  }
  return allowedRoles === userRole;
}; 