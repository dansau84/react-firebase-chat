import "./chat.css";
import { useState, useRef, useEffect } from "react"; 
import EmojiPicker from "emoji-picker-react";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(""); // <-- faltaba este estado

  const handleEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setOpen(false);
  };
  console.log(text);


  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);




  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Jane Doe</span>
            <p>this is just a text...</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">

<div className="message own">
    <div className="texts">
    <p>Hello</p>
    <span>just now</span>
  </div>
</div>

<div className="message">
  <img src="./avatar.png" alt="" />
  <div className="texts">
    <p>Hello how are you?</p>
    <span>1 min ago</span>
  </div>
</div>

<div className="message own">
   <div className="texts">
    <p>find and you?</p>
    <span>5 sec ago</span>
  </div>
</div>

<div className="message">
  <img src="./avatar.png" alt="" />
  <div className="texts">
    <p>find too</p>
    <span>just now</span>
  </div>
</div>

<div ref={endRef}></div>

      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && <EmojiPicker onEmojiClick={handleEmoji} />}
        </div>
        <button className="sendButton">Send</button>
      </div>
    </div>
  );
};

export default Chat;
