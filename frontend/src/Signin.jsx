import React from "react";
import Axios from "axios";
import {useNavigate,Routes,Route} from "react-router-dom";
import App from "./App";

function Signin(){

     const navigate=useNavigate();
     
     function handleSubmit(event){
        event.preventDefault();
        const name=document.getElementById("Username").value;
        const password=document.getElementById("password").value;
        if(name && password){
        Axios.post("/signin",{
            username:name,
            password:password
        }).then(res=>{
            console.log(res.data);
            if(res.data==="exists"){
                navigate("/App",{state:{userName:name}});
            }else{
                alert(res.data);
            }
        })
    }else{
        alert("Enter all credentials");
    }
     }

    return <div className="container">
        <h2><i>Sign In</i></h2>
        <div className="inputElements">
            <label htmlFor="username">Username</label>
        <input type="text" id="Username" placeholder="Username" required="true"/>
        </div>
        <div  className="inputElements">
            <label htmlFor="password">Password</label>
           <input type="password" id="password" placeholder="password" required="true" />
        </div>
        
       
        <button type="submit" onClick={handleSubmit}>Signin</button>

        <Routes>
            <Route path="/App" element={<App />} />
        </Routes>
    </div>
}

export default Signin;