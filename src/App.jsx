import { useState } from "react"; // <-- Importante: necesitamos useState
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import "./index.css";

const App = () => {
  // CORRECCIÓN: Cambiamos la variable fija por un estado dinámico de React
   /*const user = false; // ponelo en true para ver el chat, false para ver el login*/
  const [user, setUser] = useState(null); 

  return (
    <div className="container">
      {user ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        // Ahora sí le pasamos la función real 'setUser' al componente Login
        <Login setUser={setUser} /> 
      )}
    </div>
  );
};

export default App;