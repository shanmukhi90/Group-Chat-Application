import React from "react";
import Axios from "axios";
import {useLocation,useNavigate,Routes,Route} from "react-router-dom";
import ChatRoom from "./ChatRoom";

function CreateRoom(){
    const navigate=useNavigate();
    const location=useLocation();

    const {admin}=location && location.state?location.state:"";

    function handleSubmit(event){
        event.preventDefault();
        const roomname=document.getElementById("name").value;
        const limit=document.getElementById("limit").value;
        const password=document.getElementById("password").value;
        Axios.post("/createchatroom",{
            roomname:roomname,
            limit:limit,
            password:password,
            admin:admin

        }).then(res=>{
          
        if(typeof(res.data)==="string"){
            console.log(res.data);
            alert(res.data);
        }
            navigate("/ChatRoom",{state:{userName:admin,groupName:roomname}});
        })

    }

    return(
        <div className="container">
            <h2><i>Create Group</i></h2>
            <div className="inputElements">
                <label htmlFor="name">Groupname</label>
            <input  type="text" id="name" name="RoomName" placeholder="Enter Room Name" />
            </div>
            <div className="inputElements">
            <label htmlFor="limit">Limit</label>
            <input   type="number" id="limit" name="limit" placeholder="enter members limit" />
            </div>
            <div className="inputElements">
                <label htmlFor="password">Password</label>
            <input type="password" id="password" name="Password" placeholder="password" />
            </div>
           
           
           
             <button type="submit" onClick={handleSubmit}>create</button>

             <Routes>
                <Route path="/ChatRoom" element={<ChatRoom />} />
             </Routes>
        </div>
    )
}

export default CreateRoom;