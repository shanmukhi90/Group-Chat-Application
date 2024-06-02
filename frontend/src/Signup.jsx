import React from "react";
import Axios from "axios";
import {useNavigate,Routes,Route,useLocation} from "react-router-dom";
import App from "./App";
import  CreateRoom from "./CreateRoom";
import  JoinRoom from "./JoinRoom";
import Signin from "./Signin";
import ChatRoom from "./ChatRoom";
import "./index.css";

function Signup(){

   const navigate=useNavigate();
   const location=useLocation();

   function handleSubmit(event){
         event.preventDefault();
         const name=document.getElementById("Username").value;
         const email=document.getElementById("email").value;
         const password=document.getElementById("password").value;
         if(name && email && password){
         Axios.post("/signup",{
            name:name,
            email:email,
            password:password
         }).then(res=>{
            console.log(res.data);
            if(res.data==="created account")
                   navigate("/App",{state:{userName:name}});
            else{
                alert(res.data);
            }
         })
        }else{
            alert("Enter all credentials");
        }

    }

   function handleSignIn(){
        navigate("/Signin");
    }

   const isAppPage=location.pathname==="/App";
   const isCreateRoomPage=location.pathname==="/CreateRoom";
   const isJoinRoomPage=location.pathname==="/JoinRoom";
   const isSignInPage=location.pathname==="/Signin";
   const isChatRoom=location.pathname==="/ChatRoom"

    return <div>
           <nav>
            <h1><i>Group-Chat App</i></h1>
            </nav> 
            { isAppPage || isCreateRoomPage || isJoinRoomPage || isSignInPage ||isChatRoom ?null:
            <div className="container">
            <h2><i>Create Account</i></h2>
            <div className="inputElements">
            <label htmlFor="Username">Username</label>
            <input type="text" id="Username" placeholder="Username" required/>
            </div>
            <div className="inputElements">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Email" required/>
            </div>
            <div className="inputElements">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="password" required />
            </div>
           
       
        
        <button type="submit" onClick={handleSubmit}>Signup</button>
        <p>Have an account?<button onClick={handleSignIn}>Signin</button></p>
        </div>
    }
        <Routes>
      <Route path="/App" element={<App />} />
      <Route path="/CreateRoom" element={<CreateRoom />} />
      <Route path="/JoinRoom" element={<JoinRoom />} />
      <Route path="/Signin" element={<Signin />} />
      <Route path="/ChatRoom" element={<ChatRoom />} />
        </Routes>


    </div>
}

export default Signup;