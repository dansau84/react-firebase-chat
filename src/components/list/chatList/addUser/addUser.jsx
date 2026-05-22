import "./addUser.css";
import { db } from "../../../lib/firebase";
import { useState } from "react";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

const AddUser = ({ user }) => {
  const [username, setUsername] = useState("");
  const [foundUser, setFoundUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setFoundUser(querySnapshot.docs[0].data());
    } else {
      setFoundUser(null);
    }
  };

  const handleAdd = async () => {
    if (!foundUser || !user) return;

    const chatId =
      user.uid > foundUser.id ? user.uid + foundUser.id : foundUser.id + user.uid;

    // Crear sala si no existe
    await setDoc(doc(db, "chats", chatId), {
      createdAt: serverTimestamp(),
      users: [user.uid, foundUser.id],
    }, { merge: true });

    // Inicializar historial vacío
    await setDoc(doc(db, "chats", chatId, "messages", "init"), {
      text: "",
      sender: "system",
      createdAt: serverTimestamp(),
    });

    // Actualizar lista de chats del usuario actual
    await setDoc(doc(db, "userchats", user.uid, "chats", chatId), {
      id: chatId,
      username: foundUser.username,
      otherUserId: foundUser.id,
      lastMessage: "",
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Actualizar lista de chats del usuario agregado
    await setDoc(doc(db, "userchats", foundUser.id, "chats", chatId), {
      id: chatId,
      username: user.email,
      otherUserId: user.uid,
      lastMessage: "",
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  return (
    <div className="addUser">
      <form className="form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {foundUser && (
        <div className="user">
          <div className="detail">
            <img src="./avatar.png" alt="avatar" />
            <span>{foundUser.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
