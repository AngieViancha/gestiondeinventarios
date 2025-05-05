import { useAuthCheck } from './AuthCheck';

function Inicio() {
  useAuthCheck(); // Verifica si el usuario está logueado
  
  const userEmail = localStorage.getItem('userEmail');

  return (
    <div>
      <h1>Bienvenido</h1>
      <p>Has iniciado sesión como: {userEmail}</p>
    </div>
  );
}

export default Inicio;