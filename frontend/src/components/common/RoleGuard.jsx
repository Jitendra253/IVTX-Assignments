import React from 'react';
import { useSelector } from 'react-redux';

export const RoleGuard = ({ roles = [], children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
};
