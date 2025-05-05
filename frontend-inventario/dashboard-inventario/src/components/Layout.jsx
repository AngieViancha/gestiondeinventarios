import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra superior fija */}
      <Navbar />
      
      {/* Contenido principal debajo de la barra */}
      <main className="flex-grow pt-14"> {/* pt-14 para compensar la altura del navbar */}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Footer opcional */}
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} InventarioApp - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Layout;