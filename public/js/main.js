const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//Get username and Room from URL
const {username,room}= Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

const socket = io();

//Join ChatRoom
socket.emit('joinRoom',{username,room})


//Get room and users 
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on('message',msg=>{
    console.log(msg);
    outputMessage(msg);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;


    
})

//Semding message to server
chatForm.addEventListener('submit',(e)=>{  
    e.preventDefault();

    const msg = e.target.elements.msg.value; //getting message from the input field when submitting

    //Emitting msg to server
    socket.emit('chatMessage',msg);

    //clearing input after message is sent
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
})

//Output message to DOM
//Adding the new message to the list of messages
function outputMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}


//Add Room name to DOM
function outputRoomName(room){

    roomName.innerText=room;

}

//Add users to the UserList in DOM
function outputUsers(users){
    userList.innerHTML=`
        ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}