/*
import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";
import { useUserStore } from "../lib/userStore"; // ✅ importamos Zustand  */

import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// CORRECCIÓN DE RUTAS: Subimos dos niveles (../../) para entrar a 'lib' correctamente
import { auth, db } from "../../components/lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import upload from "../../components/lib/upload";
import { useUserStore } from "../../components/lib/userStore"; 

const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

  // FIX 1: Cambiado a CamelCase 'fetchUserInfo'
  const { fetchUserInfo } = useUserStore(); 

  const handleAvatar = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatar({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Primero actualizamos el store de Zustand y esperamos a que termine
      await fetchUserInfo(res.user.uid); // FIX 2: Cambiado a CamelCase 'fetchUserInfo'
      toast.success("Sign In successful!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    } 
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      const imgUrl = await upload(avatar.file);

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

      // Primero actualizamos el store de Zustand y esperamos a que termine
      await fetchUserInfo(res.user.uid); // FIX 3: Cambiado a CamelCase 'fetchUserInfo'
      toast.success("Cuenta creada!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading} type="submit">{loading ? "Loading..." : "Login"}</button>
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
          <button disabled={loading} type="submit">{loading ? "Loading..." : "Sign up"}</button>
        </form>
      </div>

      <Notification />
    </div>
  );
};

export default Login;