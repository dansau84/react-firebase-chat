import "./addUser.css";
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
  arrayUnion ,getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";



const AddUser = () => {
  const { currentUser } = useUserStore();
  const [foundUser, setFoundUser] = useState(null);
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim();

    if (!username) return;

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const userData = { ...docSnap.data(), id: docSnap.id };

        // No permitir buscarse a sí mismo
        if (userData.id === currentUser.id) {
          setFoundUser(null);
          setAlreadyAdded(false);
          return;
        }

        setFoundUser(userData);

        // VALIDACIÓN AL BUSCAR: Comprobar en Firestore si ya lo tienes en userchats
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsSnap = await getDoc(userChatsRef);

        if (userChatsSnap.exists()) {
          const chatsList = userChatsSnap.data().chats || [];
          const isDuplicated = chatsList.some(chat => chat.receiverId === userData.id);
          setAlreadyAdded(isDuplicated);
        } else {
          setAlreadyAdded(false);
        }

      } else {
        setFoundUser(null);
        setAlreadyAdded(false);
      }
    } catch (err) {
      console.error("Error searching user:", err);
    }
  };

  const handleAdd = async () => {
    if (!foundUser || !currentUser) return;

    try {
      // CAPA DE SEGURIDAD MÁXIMA: Volvemos a leer Firestore justo antes de escribir
      // para asegurar de que no se metan duplicados si hacen clicks muy rápido
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const chatsList = userChatsSnap.data().chats || [];
        const isDuplicated = chatsList.some(chat => chat.receiverId === foundUser.id);
        
        if (isDuplicated) {
          setAlreadyAdded(true);
          return; // SE FRENA ACÁ. No crea ningún chat repetido en la base de datos.
        }
      }

      const chatRef = collection(db, "chats");
      const userchatRef = collection(db, "userchats");
      const newChatRef = doc(chatRef);
      
      // 1. Crear el documento único del chat privado
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        members: [currentUser.id, foundUser.id],
      });

      // 2. Agregar a la lista del usuario actual logeado
      await updateDoc(doc(userchatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: foundUser.id,
          updatedAt: Date.now(),
        }),
      });

      // 3. Agregar a la lista del usuario receptor
      await updateDoc(doc(userchatRef, foundUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      // Limpiar buscador al terminar con éxito
      setFoundUser(null);
      setAlreadyAdded(false);
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
      </form>

      {foundUser && (
        <div className="user">
          <div className="detail">
            <img src={foundUser.avatar || "./avatar.png"} alt="avatar" />
            <span>{foundUser.username}</span>
          </div>
          
          {/* CONTROL DE INTERFAZ: Si ya existe en tus contactos, bloquea el botón y muestra el cartel */}
          {alreadyAdded ? (
            <span style={{ 
              color: "#ff4d4d", 
              fontSize: "12px", 
              fontWeight: "bold", 
              backgroundColor: "rgba(255,77,77,0.15)",
              padding: "7px 12px",
              borderRadius: "5px",
              textAlign: "center",
              border: "1px solid rgba(255,77,77,0.3)",
              display: "block",
              marginTop: "10px"
            }}>
              Ya tienes a este usuario agregado a tu lista de contactos
            </span>
          ) : (
            <button onClick={handleAdd}>Add User</button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddUser;