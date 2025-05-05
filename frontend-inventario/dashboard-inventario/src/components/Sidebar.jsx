import { Home, Boxes, Warehouse, FileText, Users, Store, ClipboardList, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Inicio', icon: <Home size={20} />, path: '/' },
  { name: 'Productos', icon: <Boxes size={20} />, path: '/productos' },
  { name: 'Inventario', icon: <Warehouse size={20} />, path: '/inventario' },
  { name: 'Ventas', icon: <FileText size={20} />, path: '/ventas' },
  { name: 'Usuarios', icon: <Users size={20} />, path: '/usuarios' },
  { name: 'Tienda', icon: <Store size={20} />, path: '/tienda' },
  { name: 'Reportes', icon: <BarChart2 size={20} />, path: '/reportes' },
  { name: 'Categorías', icon: <ClipboardList size={20} />, path: '/categorias' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white fixed p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-10">
        <Store size={28} className="text-blue-300" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
          Inventarios
        </h2>
      </div>
      
      <nav className="flex flex-col gap-2">
        {navItems.map(({ name, icon, path }) => (
          <Link
            key={name}
            to={path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              location.pathname === path 
                ? 'bg-blue-700 shadow-md transform scale-105' 
                : 'hover:bg-blue-700 hover:shadow-md hover:translate-x-1'
            }`}
          >
            <span className="text-blue-300">{icon}</span>
            <span className="font-medium">{name}</span>
          </Link> 
        ))}
      </nav>
      
      {/* Footer del sidebar */}
      <div className="absolute bottom-6 left-6 right-6 border-t border-blue-700 pt-4">
        <div className="text-sm text-blue-300">Versión 1.0.0</div>
      </div>
    </div>
  );
}
