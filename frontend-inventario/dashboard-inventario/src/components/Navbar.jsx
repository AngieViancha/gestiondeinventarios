import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Layers, Home, Users, ClipboardList, Store, BarChart2 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Inicio', path: '/', icon: <Home size={16} /> },
    { name: 'Productos', path: '/productos', icon: <Package size={16} /> },
    { name: 'Inventario', path: '/inventario', icon: <ClipboardList size={16} /> },
    { name: 'Ventas', path: '/ventas', icon: <ShoppingCart size={16} /> },
    { name: 'Reportes', path: '/reportes', icon: <BarChart2 size={16} /> },
    { name: 'Usuarios', path: '/usuarios', icon: <Users size={16} /> },
    { name: 'Tienda', path: '/tienda', icon: <Store size={16} /> }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Store size={20} className="text-blue-200" />
            <span className="text-lg font-semibold">InventarioApp</span>
          </div>
          
          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded transition-all ${
                  location.pathname === link.path 
                    ? 'bg-blue-700/90' 
                    : 'hover:bg-blue-700/50'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
          
          {/* Menú usuario/mobile */}
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-full hover:bg-blue-700/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="md:hidden p-1 rounded-full hover:bg-blue-700/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

  
