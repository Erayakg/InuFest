import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    return <Navigate to="/login" />;
  }

  // Kullanıcının rolü, izin verilen roller arasında değilse profile sayfasına yönlendir
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/profile" />;
  }

  // Kullanıcının rolü uygunsa içeriği göster
  return children;
};

export default RoleBasedRoute; 