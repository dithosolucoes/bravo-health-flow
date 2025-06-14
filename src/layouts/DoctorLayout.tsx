
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  ClipboardList, 
  User, 
  LogOut, 
  Menu, 
  X,
  Clock
} from 'lucide-react';

interface Navigation {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigations = [
    { name: 'Dashboard', path: '/medico/dashboard', icon: <Home size={20} /> },
    { name: 'Fila de Avaliação', path: '/medico/avaliacao', icon: <Clock size={20} /> },
    { name: 'Prescrições', path: '/medico/prescricoes', icon: <ClipboardList size={20} /> },
    { name: 'Histórico', path: '/medico/historico', icon: <Users size={20} /> },
    { name: 'Meu Perfil', path: '/medico/perfil', icon: <User size={20} /> },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-montserrat font-bold text-bravo-blue">Bravo Médico</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 flex flex-col px-4 space-y-1">
          {navigations.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg text-sm ${
                  isActive
                    ? 'bg-bravo-beige text-bravo-blue font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="mb-2 px-3 text-sm text-gray-500">Logado como:</div>
          <div className="px-3 py-2 rounded-lg bg-gray-50">
            <div className="font-medium text-sm">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full mt-3 text-gray-700 justify-start"
          >
            <LogOut size={18} className="mr-2" />
            Sair
          </Button>
        </div>
      </aside>
      
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-xl font-montserrat font-bold text-bravo-blue">Bravo Médico</span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-bravo-blue"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-white shadow-lg">
            <div className="flex-1 py-6 flex flex-col px-4 space-y-1">
              {navigations.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg text-sm ${
                      isActive
                        ? 'bg-bravo-beige text-bravo-blue font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="mb-2 px-3 text-sm text-gray-500">Logado como:</div>
              <div className="px-3 py-2 rounded-lg bg-gray-50">
                <div className="font-medium text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }} 
                className="w-full mt-3 text-gray-700 justify-start"
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 ml-0 md:ml-64 mt-16 md:mt-0">
        <div className="px-6 py-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
