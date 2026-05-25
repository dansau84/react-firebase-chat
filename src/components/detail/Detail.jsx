import { auth, db , storage} from "../lib/firebase"; // Agregado db de tus configuraciones
import "./detail.css";
import { useUserStore } from "../lib/userStore"; // ✅ Corregido import nombrado con llaves
import { useChatStore } from "../lib/chatStore"; // ✅ Corregido import nombrado con llaves
import { arrayRemove, arrayUnion, doc, updateDoc ,getDoc} from "firebase/firestore"; // ✅ Agregados imports faltantes

import { ref, deleteObject } from "firebase/storage"; // Importaciones para borrar del Storage

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user || !currentUser) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.error("Error al bloquear usuario:", err);
    }
  };

  const handleUnblock = async () => {
    if (!user || !currentUser) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: arrayRemove(user.id),
      });
      changeBlock(); 
    } catch (err) {
      console.error("Error al desbloquear usuario:", err);
    }
  };

  // ELIMINAR CONTACTO DE MI LISTA Y LIMPIAR SUS IMÁGENES SUBIDAS EN STORAGE
  const handleDeleteUser = async () => {
    if (!chatId || !currentUser || !user) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${user.username}? Se borrarán de forma permanente las fotos que tú subiste en este chat.`
    );
    
    if (!confirmDelete) return; 

    try {
      // 1. LIMPIEZA EN FIREBASE STORAGE: Buscamos las fotos del historial creadas por mí
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        const chatData = chatDocSnap.data();
        const messages = chatData.messages || [];

        // Filtramos los mensajes que tengan imagen ('img') y que hayan sido enviados por tu ID
        const myImagesToDocs = messages.filter(
          (msg) => msg.img && msg.senderId === currentUser.id
        );

        // Iteramos y borramos cada archivo del almacenamiento físico de Storage
        for (const msg of myImagesToDocs) {
          try {
            // Creamos la referencia al Storage usando la URL HTTPS guardada en el mensaje
            const fileStorageRef = ref(storage, msg.img);
            await deleteObject(fileStorageRef);
            console.log("Archivo borrado de Storage de forma permanente:", msg.img);
          } catch (storageErr) {
            // Si el archivo ya no existía o cambió de ruta, evitamos que rompa el bucle
            console.warn("No se pudo borrar el archivo o ya fue eliminado del servidor:", storageErr);
          }
        }
      }

      // 2. LIMPIEZA EN FIRESTORE: Removemos el chat de tu lista de contactos en userchats
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const chatsList = userChatsSnap.data().chats || [];
        const chatToDelete = chatsList.find((c) => c.chatId === chatId);

        if (chatToDelete) {
          await updateDoc(userChatsRef, {
            chats: arrayRemove(chatToDelete),
          });

          alert("Usuario e imágenes asociadas a tu cuenta eliminados con éxito.");
          
          // Reseteamos el panel visual para cerrar la conversación de la pantalla actual
          useChatStore.setState({ 
            chatId: null, 
            user: null, 
            isCurrentUserBlocked: false, 
            isReceiverBlocked: false 
          });
        }
      }
    } catch (err) {
      console.error("Error crítico durante el proceso de eliminación:", err);
      alert("Hubo un error al intentar eliminar por completo al usuario.");
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="avatar" />
        <h2>{user?.username || "User"}</h2>
        <p>{isCurrentUserBlocked || isReceiverBlocked ? "Blocked" : "Active Chat"}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        {isReceiverBlocked ? (
          <button className="unblockBtn" onClick={handleUnblock} style={{backgroundColor: "#2ecc71", color: "white", padding: "10px", width: "100%", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "10px"}}>
            Unblock User
          </button>
        ) : (
          <button className="blockBtn" onClick={handleBlock} style={{backgroundColor: "#e74c3c", color: "white", padding: "10px", width: "100%", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "10px"}}>
            Block User
          </button>
        )}

        <button 
          className="deleteBtn" 
          onClick={handleDeleteUser} 
          style={{
            backgroundColor: "#2c3e50", 
            color: "white", 
            padding: "10px", 
            width: "100%", 
            border: "none", 
            borderRadius: "5px", 
            cursor: "pointer", 
            fontWeight: "bold", 
            marginTop: "10px"
          }}
        >
          Delete User
        </button>

        <button className="logout" onClick={() => auth.signOut()} style={{marginTop: "10px"}}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;