const genrateMessage = (username,text)=>{
   
   return{ 
       username,
       text,
    CreatedAt: new Date().getTime()
   }
}

const genrateLocationMessage = (username,url)=>{
    return{
        username,
        url,
        CreatedAt: new Date().getTime()
    }
}

module.exports={
    genrateMessage,
    genrateLocationMessage
}