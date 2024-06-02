import React from "react";
import Axios from "axios";
import {useLocation,useNavigate,Routes,Route} from "react-router-dom";
import ChatRoom from "./ChatRoom";
import io from "socket.io-client";


function JoinRoom(){
    const navigate=useNavigate();
    const location=useLocation();
    // const socket=io.connect("http://localhost:4500");
    const socket=io.connect();
  const {username}=location && location.state?location.state:"";
  console.log(username);

    function handleSubmit(event){
        event.preventDefault();
        const roomname=document.getElementById("name").value;
        const password=document.getElementById("password").value;
        Axios.post("/joinroom",{
           username:username,
           roomname:roomname,
           password:password
        }).then(res=>{
            console.log(res.data);
            alert(res.data);
            if(res.data==="joined successfully")
            {
                socket.emit("JoinRoom",{roomname,username})
                navigate("/ChatRoom",{state:{userName:username,groupName:roomname}});
            }
        })
    }


    return <div className="container">
        <h2><i>Join Room</i></h2>
        <div className="inputElements">
            <label htmlFor="name">Groupname</label>
        <input  type="text" id="name" name="RoomName" placeholder="Enter Room Name" />
        </div>

        <div  className="inputElements">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="Password" placeholder="password" />
        </div>
       
       
             <button type="submit" onClick={handleSubmit}>join</button>
             
             <Routes>
                <Route path="/ChatRoom" element={<ChatRoom />} />
             </Routes>
    </div>
}
export default JoinRoom;