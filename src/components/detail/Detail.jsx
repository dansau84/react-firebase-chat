import "./detail.css";

const Detail = () => {
  return (
    <div className="detail">
      <div className="user">
        <img src="./avatar.png" alt="User avatar" />
        <h2>Jane Doe</h2>
        <p>This is just a text...</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Expand" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy and Help</span>
            <img src="./arrowUp.png" alt="Expand" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Collapse" />
          </div>

          <div className="photos">
            <div className="photoItem">
              <img
                src="https://tinyjpg.com/images/social/website.jpg"
                alt="Photo 1"
                className="thumb"
              />
              <span>photo1.png</span>
              <img src="./download.png" alt="Download" className="icon" />
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Expand" />
          </div>
        </div>

        <button className="blockBtn">Block User</button>
        <button className="logout">Logout</button>
      </div>
    </div>
  );
};

export default Detail;
