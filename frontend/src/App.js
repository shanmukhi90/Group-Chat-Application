import React,{useEffect,useState} from "react";
import './App.css';
import {useNavigate,Routes,Route,useLocation} from "react-router-dom";
import  CreateRoom from "./CreateRoom";
import  JoinRoom from "./JoinRoom";
import ChatRoom from "./ChatRoom";
import Axios from "axios";


function App() {
  const navigate= useNavigate();
  const location=useLocation();
  const {userName}=location && location.state?location.state:"";
  const [groups,setGroups]=useState([]);

  useEffect(()=>{
    Axios.post("/getgroups",{
      username:userName
    }).then( (res)=>{
     console.log(res.data);
      setGroups(res.data);
    })
  },[])

  function handleCreate(){
    navigate("/CreateRoom",{state:{admin:userName}});
  }

  function handleJoin(){
    navigate("/JoinRoom",{state:{username:userName}})
  }

  function handleGo(group){
    navigate("/ChatRoom",{state:{userName:userName,groupName:group}});
  }

  return (
    <div className="app" >
    
      <div className="groups">

        <h3><i>Joined Groups</i></h3>
     
      {
        groups.length>0?groups.map((group,index)=>{
         return  <ul> <li key={index}><button onClick={()=>handleGo(group)}>{group}</button></li></ul>  
        }):<p>No groups joined yet</p>
      }
      </div>
      <div className="button">
      <button onClick={handleCreate}>Create Room</button>
     <button onClick={handleJoin}>Join Room</button>
     </div>

     <Routes>
      <Route path="/CreateRoom" element={<CreateRoom />} />
      <Route path="/JoinRoom" element={<JoinRoom />} />
      <Route path="/ChatRoom" element={<ChatRoom />} />
    </Routes>
    </div>

    
  );
}

export default App;
