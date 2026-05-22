import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";

const Login = ({ setUser }) => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });

  const handleAvatar = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatar({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Sign In successful!");
      setUser(res.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Espera a que la foto se suba a Firebase Storage y nos dé su URL pública
      const imgUrl = await upload(avatar.file);

      // Crea el documento del usuario en Firestore vinculando la URL de la imagen
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Cuenta creada!");
      setUser(res.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome to Chat App</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button type="submit">Sign In</button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file" className="avatarUpload">
            <img src={avatar.url || "./avatar.png"} alt="avatar preview" />
            <span>Upload an image</span>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      <Notification />
    </div>
  );
};

export default Login;