const express=require("express");
const dotenv=require("dotenv");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const http=require("http");
const cors=require("cors");
const socketIO=require("socket.io");
const path = require("path");

const app=express();
const server=http.createServer(app);
// const io=socketIO(server,{
//     cors:{
//         origin:"http://localhost:3000"
//     }
// });
const io=socketIO(server);
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
dotenv.config();

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();
console.log(__dirname1);
const projectRoot = path.resolve(__dirname, '..');
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(projectRoot, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------


async function main(){
     try{
       
          // await mongoose.connect("mongodb://127.0.0.1:27017/chatappDB");
       
        await mongoose.connect("mongodb+srv://shanmukhib18:RYs3q1Kn5oO6FWyL@group-chat.loj9tf1.mongodb.net/");
           console.log("connected to mongodb server");

           const peopleSchema={
            Name:String,
            Email:String,
            Password:String,
            JoinedRooms:[String]
           }

           const chatSchema={
             Admin:String,
             RoomName:String,
             Limit:Number,
             Password:String,
             people:[String],
             chats:[{userName:String,message:String,time:String}]
           }

           const Person=mongoose.model("Person",peopleSchema);
           const Chat=mongoose.model("Chat",chatSchema);

         

           io.on("connection",(socket)=>{
           // console.log(`a user connected with id ${socket.id}`);
            socket.on("JoinRoom",details=>{
               io.emit("newParticipant",details);
            })

           async function AddMessage(message,username,groupname,time){
            const getGroup=await Chat.findOne({RoomName:groupname});
           const addmsg=await Chat.findOneAndUpdate({RoomName:groupname},{$push:{chats:{userName:username,message:message,time:time}}},{new:true});
           if(addmsg){
              console.log("added msg");
              io.emit("newmessage",{message,username,time,groupname});
           }else{
              console.log("msg not added");
           }


     }

          socket.on("sendmessage",messages=>{
                const message=messages.input;
                const username=messages.userName;
                const groupname=messages.nameOfGroup;
                const time=messages.time;
                console.log(message);
                console.log(username);
                console.log(groupname);
                AddMessage(message,username,groupname,time);
                
           })

           socket.on("newGroupName",name=>{
              io.emit("updateGroupName",name);
           })

           async function  RemoveParticipate(groupname,person){
            const remove=await Chat.findOneAndUpdate({RoomName:groupname},{$pull:{people:person}},{new:true});
            console.log(remove);
            if(remove){
                console.log(remove);
                const removeFromPersonDetails=await Person.findOneAndUpdate({Name:person},{$pull:{JoinedRooms:groupname}},{new:true})
                if(removeFromPersonDetails){
                    const getGroup=await Chat.findOne({RoomName:groupname});
                   // res.send(getGroup.people);
                   const people=getGroup.people.map(person=>{
                    return person;
                   })
                   io.emit("presentPeople",{people,groupname});
                }
            }
           }

           socket.on("removePerson",details=>{
            RemoveParticipate(details.nameOfGroup,details.participant);
           })

           async function DeleteGroup(groupName){
             const getGroupDetails=await Chat.findOne({RoomName:groupName});
             var people=[];
             if(getGroupDetails && getGroupDetails.people.length>0){
              people=getGroupDetails.people.map(person=>{
                return person;
             })
            }
            const deletegroup=await Chat.findOneAndDelete({RoomName:groupName});
            if(deletegroup  ){
                if(people.length>0){
              for(var person of people){
                const removeGroupFromPersonDetails=await Person.findOneAndUpdate({Name:person},{$pull:{JoinedRooms:groupName}},{new:true});
               }
            }
               const result="Deleted Group";
               io.emit("deletedGroup",{result,groupName});
            }
           }

           socket.on("/deleteGroup",groupName=>{
            DeleteGroup(groupName);
           })

           async function ExitGroup(userName,groupName){
            var people=[];
            const deletePersonFromGroup=await Chat.findOneAndUpdate({RoomName:groupName},{$pull:{people:userName}},{new:true});
            console.log(deletePersonFromGroup);
            if(deletePersonFromGroup){
                const deleteGroupFromPersonDetails=await Person.findOneAndUpdate({Name:userName},{$pull:{JoinedRooms:groupName}},{new:true});
                if(deleteGroupFromPersonDetails){
                    if(deletePersonFromGroup.people){
                        people=deletePersonFromGroup.people.map(person=>{return person})
                    }
                    io.emit("exitedGroup",{groupName,people});
                }
            }

           }

           socket.on("/exitGroup",details=>{
            ExitGroup(details.userName,details.nameOfGroup);
           })

           socket.on('disconnect', () => {
            //console.log('A user disconnected');
          });
        })

          async function  createAccount(name,email,password,res){
                const isPersonExists=await Person.findOne({Name:name,Email:email,Password:password});
                if(isPersonExists){
                     res.send("Person account already exists");
                }
                    else if(await Person.findOne({Name:name})){
                        res.send("username exists");
                    }else if(await Person.findOne({Email:email})){
                        res.send("email exists");
                    }
                   
                else{
                    const newPerson=new Person({
                        Name:name,
                        Email:email,
                        Password:password,
                        JoinedRooms:[]
                    })
                    newPerson.save();
                    console.log("created account");
                    res.send("created account");
                }
           }
           app.post("/signup",(req,res)=>{
            const name=req.body.name;
            const email=req.body.email;
            const password=req.body.password;
            createAccount(name,email,password,res);
           })

           async function createChatRoom(res,roomname,limit,password,admin){
            console.log(password);
            const isRoomExists=await Chat.findOne({RoomName:roomname});
            if(isRoomExists){
                res.send("Room already Exists");
            }else{
                const newChatRoom=new Chat({
                    Admin:admin,
                    RoomName:roomname,
                    Limit:limit,
                    Password:password,
                    people:[admin],
                    chats:[]
                })
                newChatRoom.save();
                const addGroupInProfile=await Person.findOneAndUpdate({Name:admin},{$push:{JoinedRooms:roomname}});
                console.log("added");
                res.send("room created")
            }
           }

           app.post("/createchatroom",(req,res)=>{
            const roomname=req.body.roomname;
            const limit=req.body.limit;
            const password=req.body.password;
            console.log(password);
            const admin=req.body.admin;
            createChatRoom(res,roomname,limit,password,admin);
           })

           async function JoinRoom(res,roomname,password,username){
            console.log(username);
            const isRoomExists=await Chat.findOne({RoomName:roomname,Password:password});
            if(isRoomExists && isRoomExists.RoomName===roomname && isRoomExists.Password===password){
                console.log(isRoomExists);

                // if(isRoomExists.people.find(name=>{
                //     return name===username;
                // })){
                //     res.send("already joined");
                // }
                isRoomExists.people.find(name=>{
                    if(name==username)  res.send("already joined");
                })
                   
                
                if(isRoomExists.people.length<isRoomExists.Limit){
                  const joinGroup= await Chat.findOneAndUpdate({RoomName:roomname,Password:password},{$push:{people:username}},{new:true});
                  console.log(joinGroup);
                  if(joinGroup) 
                   { 
                    const addGroupInProfile=await Person.findOneAndUpdate({Name:username},{$push:{JoinedRooms:roomname}});
                    console.log("added");
                     res.send("joined successfully")}
                  else{
                    res.send("unable to add");
                  }
                }else{
                    res.send("group filled")
                }
            
        }
            else{
                res.send("No group found..once check the details once")
            }
           }

           app.post("/joinroom",(req,res)=>{
            const roomname=req.body.roomname;
            const password=req.body.password;
            const username=req.body.username;
            console.log(username);
            JoinRoom(res,roomname,password,username);
           })

           async function Signin(res,username,password){
            if(await Person.findOne({Name:username,Password:password})){
                res.send("exists");
            }else{
                if(await Person.findOne({Name:username})){
                    res.send("Wrong Credentials");
                }
                else{
                    res.send("create account to login");
                }
                
            }
           }

           app.post("/signin",(req,res)=>{
            const username=req.body.username;
            const password=req.body.password;
              Signin(res,username,password);
           })

           async function GetGroups(res,username){
            const getPersonDetails=await Person.findOne({Name:username});
           console.log(getPersonDetails);
           if(getPersonDetails && getPersonDetails.JoinedRooms )
                     res.send(getPersonDetails.JoinedRooms);
            else{
                console.log("no groups")
            }
           }

           app.post("/getgroups",(req,res)=>{
            const username=req.body.username;
            GetGroups(res,username);
           })

           async function GetChats(res,groupname){
               const chats=await Chat.findOne({RoomName:groupname});
               if(chats){
                 res.send(chats);
               }else{
                      res.send("no group")
               }
           }

           app.post("/getchats",(req,res)=>{
            const groupname=req.body.groupname;
            GetChats(res,groupname);
           })

           async function  ChangeGroupName(res,newname,oldname){
            const getGroup=await Chat.findOne({RoomName:oldname});
            console.log(getGroup);
             if(getGroup){
               const update=await Chat.findOneAndUpdate({RoomName:oldname},{$set:{RoomName:newname}},{new:true});
               console.log(update);
               if(update){
                res.send("changed");
                for(var person of getGroup.people){
                    const getPersonDetails=await Person.findOne({Name:person});
                    console.log(getPersonDetails);
                    console.log(getPersonDetails.JoinedRooms)
                    console.log(getPersonDetails.JoinedRooms.length)
                    for(var i=0 ; i<getPersonDetails.JoinedRooms.length;i++){
                        if(getPersonDetails.JoinedRooms[i]==oldname){
                            getPersonDetails.JoinedRooms[i]=newname;
                            break;
                        }
                    }
                   const isUpdated= getPersonDetails.save();
                   if(isUpdated){
                    console.log("added to people");
                   }else{
                    console.log("not added to people");
                   }
                }
               }else{
                res.send("not changed");
               }
             }
           }

           app.post("/changeGroupName",(req,res)=>{
            const newname=req.body.newgroupname;
            const oldname=req.body.groupname;
            ChangeGroupName(res,newname,oldname)
           })

           async function ChangePassword(res,groupname,newPassword){
            const getGroup=await Chat.findOne({RoomName:groupname});
            console.log(getGroup);
             if(getGroup){
               const update=await Chat.findOneAndUpdate({RoomName:groupname},{$set:{Password:newPassword}},{new:true});
               console.log(update);
               if(update){
                res.send("changed");
               
               }else{
                res.send("not changed");
               }
             }
           }

           app.post("/changePassword",(req,res)=>{
            const groupname=req.body.groupname;
            const newPassword=req.body.newPassword;
            ChangePassword(res,groupname,newPassword)
           })

           async function GetParticipants(res,groupName){
              const getGroup=await Chat.findOne({RoomName:groupName});
              console.log(getGroup)
              if(getGroup){
                res.send(getGroup.people);
              }
           }

           app.post("/getParticipants",(req,res)=>{
            const groupName=req.body.groupname;
            console.log(groupName);
            GetParticipants(res,groupName);
           })

     }catch(err){
        console.log(err);
     }
}

main().catch(console.error);

const PORT=process.env.PORT;
console.log(PORT);
server.listen(4500, () => {
    console.log('Server running on port 4500');
  });

