import "./chatList.css";
import { useState, useEffect } from "react";
import AddUser from "./addUser/AddUser";

// CORRECCIÓN DE RUTAS: Subimos 3 niveles (../../../) para llegar correctamente a 'lib'
import { db } from "../../../components/lib/firebase";
import { useUserStore } from "../../../components/lib/userStore";
import { useChatStore } from "../../../components/lib/chatStore"; // <-- ¡Faltaba este import!

import { onSnapshot, doc, getDoc } from "firebase/firestore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  
  // SOLUCIÓN AL ERROR: Unificamos en una sola línea limpia sin duplicar 'changeChat'
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data()?.chats || [];

      // Convertimos cada item en objeto con datos del usuario
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.exists() ? userDocSnap.data() : null;

        return { ...item, user };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt)); // Ordenamos por fecha de actualización
    });

    return () => unSub();
  }, [currentUser?.id]);

  console.log("chats", chats);

  const handleSelect = (chat) => {
    changeChat(chat.chatId, chat.user);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.map((chat) => (
        <div key={chat.chatId} className="item" onClick={() => handleSelect(chat)}>
          <img src={chat.user?.avatar || "./avatar.png"} alt="User avatar" />
          <div className="texts">
            <h2>{chat.user?.username || "Unknown"}</h2>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;