import "./chat.css";
import { useState, useRef, useEffect } from "react"; 
import EmojiPicker from "emoji-picker-react";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  doc 
} from "firebase/firestore";

const Chat = ({ user, selectedChat }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const endRef = useRef(null);

  // cargar historial en tiempo real
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedChat) return;

    // guardar mensaje en Firestore
    await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
      text,
      sender: user.uid,
      createdAt: serverTimestamp(),
    });

    // actualizar último mensaje en la lista de chats del usuario actual
    await setDoc(doc(db, "userchats", user.uid, "chats", selectedChat.id), {
      ...selectedChat,
      lastMessage: text,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // actualizar último mensaje en la lista del otro usuario
    if (selectedChat.otherUserId) {
      await setDoc(doc(db, "userchats", selectedChat.otherUserId, "chats", selectedChat.id), {
        ...selectedChat,
        lastMessage: text,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{selectedChat?.username || "Select a chat"}</span>
            <p>Chatting...</p>
          </div>
        </div>
      </div>

      <div className="center">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.sender === user.uid ? "own" : ""}`}>
            {m.sender !== user.uid && <img src="./avatar.png" alt="" />}
            <div className="texts">
              <p>{m.text}</p>
              <span>
                {m.createdAt?.seconds
                  ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString()
                  : ""}
              </span>
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
