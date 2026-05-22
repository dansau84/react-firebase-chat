import "./chat.css";
import { useState, useRef, useEffect } from "react"; 
import EmojiPicker from "emoji-picker-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useChatStore } from "../lib/chatStore"; // <-- ¡Faltaba importar!
import { useUserStore } from "../lib/userStore"; // <-- ¡Necesario para saber quién envía!

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null); // <-- Corregido setChat con 'C' mayúscula
  
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

  // Función para enviar mensajes a Firestore
  const handleSend = async () => {
    if (text.trim() === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      setText("");
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
        {chat?.messages?.map((m, index) => (
          <div key={index} className={`message ${m.senderId === currentUser.id ? "own" : ""}`}>
            {m.senderId !== currentUser.id && <img src={user?.avatar || "./avatar.png"} alt="" />}
            <div className="texts">
              <p>{m.text}</p>
              <span>Hace un momento</span>
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