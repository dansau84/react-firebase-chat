import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; // ✅ ruta corregida

const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });

  const handleAvatar = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatar({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    toast.success("Sign In successful!");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Sign Up successful!");
      console.log("User created:", res.user);
      console.log("Username:", username);
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
