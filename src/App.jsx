import { useEffect } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import "./index.css";
import { onAuthStateChanged } from "firebase/auth";

// CORRECCIÓN DE RUTAS: Apuntando a la carpeta real src/components/lib/...
import { auth } from "./components/lib/firebase"; 
import { useUserStore } from "./components/lib/userStore"; 
import { useChatStore } from "./components/lib/chatStore"; // <-- ¡Te faltaba importar este también!

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => unSub();
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;