import "./addUser.css";
import { db } from "../../../lib/firebase";
import { useState } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [foundUser, setFoundUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setFoundUser({ ...docSnap.data(), id: docSnap.id });
      } else {
        setFoundUser(null);
      }
    } catch (err) {
      console.error("Error searching user:", err);
    }
  };

  const handleAdd = async () => {
    if (!foundUser || !currentUser) return;

    try {
      const chatRef = collection(db, "chats");
      const userchatRef = collection(db, "userchats");

      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        members: [currentUser.id, foundUser.id],
      });

      await updateDoc(doc(userchatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: foundUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userchatRef, foundUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      console.log("Chat creado con:", foundUser.username);
      setFoundUser(null);
    } catch (err) {
      console.error("Error adding user to chat:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>

      {foundUser && (
        <div className="user">
          <div className="detail">
            <img src={foundUser.avatar || "./avatar.png"} alt="avatar" />
            <span>{foundUser.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;   // ✅ exportación correcta
