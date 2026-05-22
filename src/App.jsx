import { useEffect, useState } from "react"; // <-- Importante: necesitamos useState
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import "./index.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/lib/firebase";
import { useUserStore } from "./components/lib/userStore"; // <-- Importamos el hook de Zustand

const App = () => {
  // CORRECCIÓN: para testeo podemos usar una variable fija ..
   /*const user = false; // ponelo en true para ver el chat, false para ver el login*/
  //o bien por un estado dinámico de React  y desde cada file.jsx  vamos poniendo true o false si el usuario esta logeado o no.
   //const [user, setUser] = useState(null); 
//pero mejor aun en vez de state local ,usamos state global usando tools como  zustand.
//better use this global state store with zusband tool
const {currentUser,isloading,fetchuserinfo}=useUserStore(); 


//to get user data authenticated.
  useEffect(() => {
  const unSub= onAuthStateChanged(auth, (user) => { 
  fetchuserinfo(user?.uid);
});
return()=>unSub();
},[fetchuserinfo])

console.log("currentUser",currentUser);

if(isloading) return <div className="loading">Loading...</div>

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        // testing purpose podemos pasarle la función real 'setUser' al componente Login (testing purpose)
        //<Login setUser={setUser} /> 
        <Login />
      )}
    </div>
  );
};

export default App;