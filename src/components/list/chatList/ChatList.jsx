import "./chatList.css";
import { useState, useEffect } from "react";
import AddUser from "./addUser/AddUser";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const ChatList = ({ user, setSelectedChat }) => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "userchats", user.uid, "chats"),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

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
        <div key={chat.id} className="item" onClick={() => setSelectedChat(chat)}>
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{chat.username}</span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser user={user} />}
    </div>
  );
};

export default ChatList;
