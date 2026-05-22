import "./userinfo.css";
import { useUserStore } from "../../lib/userStore"; // <-- Importamos el hook de Zustand

const Userinfo = () => {

const {currentUser}=useUserStore();  


  return (
    <div className="userinfo">
      <div className="user">
        <img src={currentUser.avatar ||"./avatar.png"} alt="" />
        <h2>{currentUser?.username || "User"}</h2>
      </div>

      <div className="icons">
        <img src="./mpore.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default Userinfo;
