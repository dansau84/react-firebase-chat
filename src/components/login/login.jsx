import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth, db } from "../lib/firebase";


import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";
import { useUserStore } from "../lib/userStore";

const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

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
      await fetchUserInfo(res.user.uid);
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
      const imgUrl = avatar.file ? await upload(avatar.file) : "";

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      // ✅ inicializamos userchats vacío
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      await fetchUserInfo(res.user.uid);
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
          <button disabled={loading} type="submit">
            {loading ? "Loading..." : "Login"}
          </button>
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
          <button disabled={loading} type="submit">
            {loading ? "Loading..." : "Sign up"}
          </button>
        </form>
      </div>

      <Notification />
    </div>
  );
};

export default Login;
