const path = require('path')
const express = require('express')
const http = require('http')
const hbs = require('hbs')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { genrateMessage, genrateLocationMessage } = require('./utils/messages')
const {  addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname,'../public')
const viewsDir = path.join(__dirname,'../templates/views')


app.use(express.static(publicDirectory))
// app.set('view engine','hbs')
// app.set('views',viewsDir)


io.on('connection',(socket)=>{
    console.log('web socket.io connection')
    

    socket.on('join',(options,callback)=>{
        const { error, user }=addUser({id:socket.id, ...options})

       if(error){
           return callback(error)
       }
        socket.join(user.room)

        socket.emit('message',genrateMessage('Admin','Welcome!'))  //thsi sends the data to the client and only one

    socket.broadcast.to(user.room).emit('message',genrateMessage('Admin',`${user.username} has joined!`))    //this part shows that a message will send to all user except the user who joined the room

    io.to(user.room).emit('roomData',{
        room:user.room,

        users:getUserInRoom(user.room)
    })

       callback()
    })

    socket.on('sendMessage',(message,callback)=>{
       const user = getUser(socket.id)
        const filter = new Filter() 
        if(filter.isProfane(message)){
            return callback(genrateMessage('profanity is not allowed!'))
        } 

        io.to(user.room).emit('message',genrateMessage(user.username,message))    // this also sends the data to the client but also to all connected useers
        

       callback()
   })


   socket.on('sendLocation',(longitude,latitude,callback)=>{
    const user = getUser(socket.id)
       io.to(user.room).emit('locationMessage',genrateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.broadcast.emit('locationmessage',)


   socket.on('disconnect',()=>{  //we connect through connection and disconnect through disconnect

    const user = removeUser(socket.id)
    if(user){
        io.to(user.room).emit('message',genrateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
    
            users:getUserInRoom(user.room)
        })
    }
   })

    
})


app.get('/',(req,res)=>{
    res.render('index')
})


server.listen(port, ()=>{
    console.log(`Server is up on server ${port}!`)
})