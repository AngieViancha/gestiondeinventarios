import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/Navbar';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Inventarios from './pages/Inventarios';
import Reportes from './pages/Reportes';
import Home from './pages/Home';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import Tienda from './pages/Tienda';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Logout from './pages/Logout';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Navbar />
        <div style={{ flex: 1, padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventarios />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/login" element={<Login />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
