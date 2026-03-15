// src/hooks/useAuth.js
const ROLES = {
  VISITOR: 0,
  EMPLOYEE: 1,
  MANAGER: 2,
  ADMIN: 3,
};

const roleMapping = {
  visitor: ROLES.VISITOR,
  employee: ROLES.EMPLOYEE,
  manager: ROLES.MANAGER,
  admin: ROLES.ADMIN,
};

export const useAuth = () => {
  const storedRole = localStorage.getItem("role");
  const userRole = roleMapping[storedRole] ?? ROLES.VISITOR;

  return {
    userRole,
    isVisitor: userRole === ROLES.VISITOR, // was >=, now exact
    isEmployee: userRole >= ROLES.EMPLOYEE, // keeps >= so managers/admins also qualify
    isManager: userRole >= ROLES.MANAGER,
    isAdmin: userRole >= ROLES.ADMIN,
    roles: ROLES,
  };
};
