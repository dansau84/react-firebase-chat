import "./chat.css";
import { useState, useRef, useEffect } from "react"; 
import EmojiPicker from "emoji-picker-react";
import { db } from "../../components/lib/firebase"; // Ajustado a la ruta real de tu proyecto
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore"; // Añadido getDoc faltante
import { useChatStore } from "../../components/lib/chatStore"; 
import { useUserStore } from "../../components/lib/userStore"; 

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null); 
  
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Cargar historial de chat en tiempo real desde Firestore
  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // Función para enviar mensajes a Firestore (Sintaxis corregida)
  const handleSend = async () => {
    if (text.trim() === "") return;

    try {
      // 1. Añadir el mensaje a la colección "chats"
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      // 2. Actualizar los estados de userchats para ambos usuarios
      const userIDs = [currentUser.id, user.id];

      // Cambiado a for...of porque forEach no maneja correctamente promesas async/await en ciclos
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id); // Unificado nombre de colección a minúscula estándar
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }

      setText(""); // Limpiar el input tras enviar
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "Select a chat"}</span>
            <p>Chatting...</p>
          </div>
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div 
            className={`message ${message.senderId === currentUser.id ? "own" : ""}`} 
            key={message?.createdAt?.seconds || message?.createdAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && <EmojiPicker onEmojiClick={handleEmoji} />}
        </div>
        <button className="sendButton" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;