import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = () => {
    if ((user === 'admin' && password === '1234') || 
        (user === 'empleado' && password === '1234') || 
        (user === 'dueno' && password === '1234')) {
      localStorage.setItem('rol', user);
      history.push('/dashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio de Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput placeholder="Usuario" onIonChange={(e) => setUser(e.detail.value!)} />
        <IonInput placeholder="Contraseña" type="password" onIonChange={(e) => setPassword(e.detail.value!)} />
        <IonButton expand="full" onClick={handleLogin}>Ingresar</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;