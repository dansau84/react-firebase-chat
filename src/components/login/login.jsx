import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import Notification from "../notification/Notification"; // importa el contenedor

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

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

  const handleSignup = (e) => {
    e.preventDefault();
    toast.success("Sign Up successful!");
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
        <form onSubmit={handleSignup}>
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

      {/* contenedor de notificaciones */}
      <Notification />
    </div>
  );
};

export default Login;
