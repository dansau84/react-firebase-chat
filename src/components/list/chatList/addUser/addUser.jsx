import "./addUser.css";

const AddUser = () => {
  return (
    <div className="addUser">
      <form className="form">
        <input type="text" placeholder="Username" />
        <button type="submit">Search</button>
      </form>

      <div className="user">
        <div className="detail">
          <img src="./avatar.png" alt="avatar" />
          <span>Jane Doe</span>
        </div>
        <button>Add User</button>
      </div>
    </div>
  );
};

export default AddUser;
