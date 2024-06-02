import React,{useState,useEffect} from "react";
import io from "socket.io-client";
import {useLocation,useNavigate,Routes,Route} from "react-router-dom";
import Axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPen,faUser,faTrash} from "@fortawesome/free-solid-svg-icons";

import App from "./App";

function ChatRoom(){
     
    const socket=io.connect();

     const location=useLocation();
     const navigate=useNavigate();
     
     const {userName,groupName}=location && location.state?location.state:"";

    const [nameOfGroup,setNameOfGroup]=new useState( groupName);
    //input message is stored in below input
    const [input,setInput]=useState("");
    //new messages are stored in messages and displayed
    const [messages,setMessages]=useState([]);
    //past messages are stored in pastmsgs
    const [pastmsgs,setPastMsgs]=useState([]);
    const [groupDetails,setGroupDetails]=useState({});
    //below flags are used to mark which option i.e., change groupname,password,deletegroup etc events
    const [nameFlag,setNameFlag]=useState(0);
    const [passwordFlag,setPasswordFlag]=useState(0);
    const [peopleFlag,setPeopleFlag]=useState(0);
    //participants are stored in participants
    const [participants,setParticipants]=useState([]);
    const [showOptions,setShowOptions]=useState(0);
    const [delparticipant,setDelParticipant]=useState("");
    
    const date=new Date();
    
  

    useEffect(()=>{
       

        Axios.post("/getchats",{
           groupname:nameOfGroup
        }).then(res=>{
            console.log(res.data);
            setNameOfGroup(res.data.RoomName);
            setParticipants(res.data.people);
            if(typeof(res.data)==="string"){
                alert(res.data);
            }
            if(typeof(res.data)!=="string" && pastmsgs.length===0){
                setGroupDetails(res.data);
               
                
            res.data.chats.map(messages=>{
                return setPastMsgs(prev=>{
                    return [...prev,messages];
                })
            })
        }
        })

        socket.on("newParticipant",details=>{
            console.log(details);
            if(details.roomname===nameOfGroup){
                var exist=0;
                     for(var person in participants){
                        if(person===details.username){
                            exist=1;
                        }
                     }
                     console.log(exist);
                        if(exist===0){
                        setParticipants(prev=>{
                            return [...prev,details.username];
                        })
                    }
            }
        })

      
       
         socket.on("newmessage",message=>{
            if(message.groupname===nameOfGroup){
            setMessages(prev=>{
                return [...prev,message];
            })
        }
         })

         socket.on( "updateGroupName",name=>{
           
            if(name.nameOfGroup===nameOfGroup){
                setNameOfGroup(name.newName);
            }
           
         })
        //after deleting a participant get remaining people
         socket.on("presentPeople",people=>{
           
            console.log(people);
            console.log(people.groupname)
            if(people.groupname===nameOfGroup){
                if(participants.length===0){
                    setParticipants(people.people); 
                }
                else{
                    setParticipants([]);
                    setTimeout(setParticipants(people.people),1000);
                    
                }
            
          
          }
        
         })

         socket.on("deletedGroup",msg=>{
           if( msg.result==="Deleted Group"){
            console.log(msg.groupName);
           
               if(msg.groupName===nameOfGroup){
               navigate("/App",{state:{userName:userName}});
               }
           }
         })

         socket.on("exitedGroup",details=>{
            
            if(details.groupName===nameOfGroup){
                if(participants.length===0){
                    setParticipants(details.people); 
                }
                else{
                    setTimeout(setParticipants([]),1000);
                    setParticipants(details.people);
                }
                
            }
         })

         return ()=>{
            socket.off("newmessage");
         }
    },[])

    function handleChange(event){
        setInput(event.target.value);
    }

    function handleGroupNameChange(){
        const newName=document.getElementById("groupname").value;
        console.log(newName);
        Axios.post("/changeGroupName",{
            newgroupname:newName,
            groupname:nameOfGroup
        }).then(res=>{
            console.log(res.data)
            if(res.data==="changed"){
                socket.emit("newGroupName",{newName,nameOfGroup});

            }
        })
        setNameFlag(0);
    }

    function handlePasswordChange(){
        const newPassword=document.getElementById("grouppassword").value;
        Axios.post("/changePassword",{
            groupname:nameOfGroup,
            newPassword:newPassword
        }).then(res=>{
            console.log(res.data);
            setPasswordFlag(0);
        })
    }

    function handleSend(){
        const min=date.getMinutes();
        const hour=date.getHours();
        const time=`${hour}:${min}`;
        console.log(time);
        console.log(nameOfGroup)
        const sendDetails={input,userName,nameOfGroup,time};
        console.log(participants);
        if(participants.find(person=>{return person===userName})){
            socket.emit("sendmessage",sendDetails);
        }
        
       
        setInput("");
    }
      
    function handleParticipants(){
        peopleFlag===0?setPeopleFlag(1):setPeopleFlag(0);
        Axios.post("/getParticipants",{
            groupname:nameOfGroup
        }).then(res=>{
            console.log(res.data);
            setParticipants(res.data);
        })
    }

    function RemoveParticipant(participant){
            setDelParticipant(participant);
            socket.emit("removePerson",{nameOfGroup,participant});
            alert(`deleted ${participant}`);
    }

    function handleDeleteGroup(){
        socket.emit("/deleteGroup",nameOfGroup);
    }

    function handleExit(){
        socket.emit("/exitGroup",{userName,nameOfGroup});
    }
    
    return <div className="chats">
        <h2><i style={{display:"flex",justifyContent:"center"}}>{nameOfGroup}</i></h2>
        {
            //if admin then the folling additional options are displayed
            groupDetails.Admin===userName?<div className="admin-options">

           <button style={{backgroundColor:"white",border:"none",color:"Black"}} onClick={()=>{ showOptions===0? setShowOptions(1):setShowOptions(0);} }><b>options</b></button>
       
                {
                showOptions?<div className="admin-options"  >
                <button style={{backgroundColor:"white",border:"none",color:"Black"}} onClick={()=>{nameFlag===0?setNameFlag(1):setNameFlag(0); } }><FontAwesomeIcon icon={faPen} /> Name</button>

                { 
                 nameFlag===1? <div className="selectedOption">
                    <input type="text" id="groupname"  />
                    <button onClick={handleGroupNameChange}><FontAwesomeIcon icon={faPen} GroupName /></button>
                   </div>:""
                }
              
                <button style={{backgroundColor:"white",border:"none",color:"Black"}} onClick={()=>{passwordFlag===0?setPasswordFlag(1):setPasswordFlag(0);}}><FontAwesomeIcon icon={faPen} /> Password</button>

                {
                    passwordFlag===1?<div className="selectedOption"><input type="text" id="grouppassword"  />
                    <button  onClick={handlePasswordChange}><FontAwesomeIcon icon={faPen} /></button></div>:""
                }
               
                <button style={{backgroundColor:"white",border:"none",color:"Black"}} onClick={handleParticipants}><FontAwesomeIcon icon={faUser} /> Participants</button>
               
                {
                    peopleFlag===1?participants.map(participant=>{
                        return  <div  >
                            {
                                groupDetails.Admin!==participant?<div className="participants"> 
                                     <p><FontAwesomeIcon style={{color:"#f5ba13"}} icon={faUser} /> {participant}</p>
                            <button style={{backgroundColor:"white",border:"none"}} onClick={()=>{RemoveParticipant(participant)}}><FontAwesomeIcon style={{color:"#f5ba13",height:"20px"}} icon={faTrash} /></button>
                                </div>:""
                            }
                           
                            </div>
                    }):""
                }

                <button style={{backgroundColor:"white",border:"none",color:"Black"}} onClick={handleDeleteGroup}><FontAwesomeIcon icon={faTrash} /> Group</button>
               
                </div>:""
                }
             
            </div>:""
        }
        
{  

 //if participant there in group then only he can view the messages
   participants&&participants.find(person=>{return person===userName})?
        <div className="scroll" >
        
        {
          pastmsgs.length>0?pastmsgs.map((msg,index)=>{
              return <div key={index} id={userName===msg.userName?"me":"others"} >
                <span>
                <p className="user">{msg.userName}</p>
                  <p className="msg">{msg.message}</p>
                  <p className="time">{msg.time}</p>
                  </span> 
                  </div>
          }):""
        }
      {messages.length>0? messages.map((message,index)=>{
         return  <div  key={index}  id={userName===message.username?"me":"others"}>
          <span>
          <p className="user">{message.username}</p>
         <p  className="msg">{message.message}</p>
         <p className="time">{message.time}</p>
         </span></div>}):""

      }
      </div>:"You are no longer a member"
}
     { 
     //if participant there in group then only he/she can send messages
        participants&&participants.find(person=>{return person===userName})?<div>
     <div className="inputdiv"><input type="text" onChange={handleChange}  placeholder="Type Something....." value={input}  />
        <button onClick={handleSend}>Send</button></div>
        <button style={{backgroundColor: "Red", borderColor: "Red"}} className="exit-button" onClick={handleExit}>Exit Group</button></div>:"" }       
        <Routes>
            <Route path="/App" element={<App />} />
        </Routes>
     
</div>
        
}

export default ChatRoom;