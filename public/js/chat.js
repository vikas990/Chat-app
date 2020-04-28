const socket  = io()  

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFromButton = document.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemaplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = ()=>{
    //new message
    const $newMessage = $messages.lastElementChild
    //new message height
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom )
    const newMessageHieght = $newMessage.offsetHeight +newMessageMargin

    //visble height
    const visibleHieght = $messages.offsetHeight

    //containerHeight
    const containerheight = $messages.scrollHeight
    //how far have i scrolled
    const scrolloffset = $messages.scrollTop + visibleHieght
    if(containerheight - newMessageHieght <= scrolloffset){
        $messages.scrollTop = $messages.scrollHeight
    }
   

}
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemaplate,{
        username:message.username,
        message:message.text,
        CreatedAt:moment(message.CreatedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoScroll()
})

socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        CreatedAt:moment(url.CreatedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoScroll()
})

socket.on('roomData',({ users, room })=>{
    const html = Mustache.render(sidebarTemplate,{
        users ,
        room
        })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
   const message = e.target.elements.Message.value

    $messageFromButton.setAttribute('disabled','disabled')

   socket.emit('sendMessage',message,(error)=>{
       $messageFromButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()
      if(error){
          return console.log(error)
      }

      console.log('Message Delivered!')

   })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your browser did not support this feature!')
    }
    
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const longitude = position.coords.longitude
        const latitude = position.coords.latitude
         socket.emit('sendLocation',longitude,latitude,()=>{
             $locationButton.removeAttribute('disabled')
             console.log('Location shared!' )
         })
    })


})


socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})