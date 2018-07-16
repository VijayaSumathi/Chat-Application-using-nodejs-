$ (function(){

  var socket = io('/chat');

  var username = $('#user').val();
  var noChat = 0; //setting 0 if all chats histroy is not loaded. 1 if all chats loaded.
  var msgCount = 0; //counting total number of messages displayed.
  var oldInitDone = 0; //it is 0 when old-chats-init is not executed and 1 if executed.
  var roomId;//variable for setting room.
  var toUser;

  //passing data on connection.
  socket.on('connect',function(){
    socket.emit('set-user-data',username);
    // setTimeout(function() { alert(username+" logged In"); }, 500);

    socket.on('broadcast',function(data){
    document.getElementById("hell0").innerHTML += '<li>'+ data.description +'</li>';
    // $('#hell0').append($('<li>').append($(data.description).append($('<li>');
    $('#hell0').scrollTop($('#hell0')[0].scrollHeight);

});

  });//end of connect event.



  //receiving onlineStack.
  socket.on('onlineStack',function(stack){
    $('#list').empty();
    //$('#list').append($('<li>').append($('<button id="ubtn" class="btn btn-danger btn-block btn-lg"></button>').text("Group").css({"font-size":"18px"})));
    var totalOnline = 0;
    for (var user in stack){
      //setting txt1. shows users button.
      if(user == username){
        var txt1 = $('<button class="boxF disabled"> </button>').text(user).css({"font-size":"18px"});
      }
      else{
        var txt1 = $('<button id="ubtn" class="btn btn-success  btn-md">').text(user).css({"font-size":"18px"});
      }
      //setting txt2. shows online status.
      if(stack[user] == "Online"){
        var txt2 = $('<span class="badge"></span>').text("*"+stack[user]).css({"float":"right","color":"#009933","font-size":"18px"});
        totalOnline++;

      }
      else{
        var txt2 = $('<span class="badge"></span>').text(stack[user]).css({"float":"right","color":"#a6a6a6","font-size":"18px"});
      }
      //listing all users.
      $('#list').append($('<li>').append(txt1,txt2));
      $('#totalOnline').text(totalOnline);
    }//end of for.
    $('#scrl1').scrollTop($('#scrl1').prop("scrollHeight"));
  }); //end of receiving onlineStack event.


  //on button click function.
  $(document).on("click","#ubtn",function(){

    //empty messages.
    $('#messages').empty();
    $('#typing').text("");
    msgCount = 0;
    noChat = 0;
    oldInitDone = 0;
    toUser = $(this).text();

    //showing and hiding relevant information.
    $('#frndName').text(toUser);
    $('#initMsg').hide();
    $('#chatForm').show(); //showing chat form.
    $('#sendBtn').hide(); //hiding send button to prevent sending of empty messages.

    //assigning two names for room. which helps in one-to-one and also group chat.
   
      var currentRoom = username+"-"+toUser;
      var reverseRoom = toUser+"-"+username;
    

    //event to set room and join.
    socket.emit('set-room',{name1:currentRoom,name2:reverseRoom});

  }); 

 
  socket.on('set-room',function(room){
   
    $('#messages').empty();
    $('#typing').text("");
    msgCount = 0;
    noChat = 0;
    oldInitDone = 0;
   
    roomId = room;
    console.log("roomId : "+roomId);
  
    socket.emit('old-chats-init',{room:roomId,username:username,msgCount:msgCount});

  }); 

  
  $('#scrl2').scroll(function(){

    if($('#scrl2').scrollTop() == 0 && noChat == 0 && oldInitDone == 1){
      $('#loading').show();
      socket.emit('old-chats',{room:roomId,username:username,msgCount:msgCount});
    }

  }); 


  socket.on('old-chats',function(data){

    if(data.room == roomId){
      oldInitDone = 1; //setting value to implies that old-chats first event is done.
      if(data.result.length != 0){
        $('#noChat').hide(); //hiding no more chats message.
        for (var i = 0;i < data.result.length;i++) {
        
          var chatDate = moment(data.result[i].createdOn).format("MMMM Do YYYY, hh:mm:ss a");
          var txt1 = $('<span></span>').text(data.result[i].msgFrom+" : ").css({"color":"#006080"});
          var txt2 = $('<span></span>').text(chatDate).css({"float":"right","color":"#a6a6a6","font-size":"16px"});
          var txt3 = $('<p></p>').append(txt1,txt2);
          var txt4 = $('<p></p>').text(data.result[i].msg).css({"color":"#000000"});
          //showing chat in chat box.
          $('#messages').prepend($('<li>').append(txt3,txt4));
          msgCount++;

        }
        console.log(msgCount);
      }
      else {
        $('#noChat').show(); 
        noChat = 1; 
      }
   
      $('#loading').hide();

     
      if(msgCount <= 5){
        $('#scrl2').scrollTop($('#scrl2').prop("scrollHeight"));
      }
    }

  }); 

 
  $('#myMsg').keyup(function(){
    if($('#myMsg').val()){
      $('#sendBtn').show(); 
            socket.emit('typing');
    }
    else{
      $('#sendBtn').hide(); 
    }
  }); 

  
  socket.on('typing',function(msg){
    var setTime;
    
    clearTimeout(setTime);
   
    $('#typing').text(msg);
  
    setTime = setTimeout(function(){
      $('#typing').text("");
    },3500);
  }); 

 
  $('form').submit(function(){
    socket.emit('chat-msg',{msg:$('#myMsg').val(),msgTo:toUser,date:Date.now()});
    $('#myMsg').val("");
    $('#sendBtn').hide();
    return false;
  }); 
 


  socket.on('chat-msg',function(data){
   
    var chatDate = moment(data.date).format("MMMM Do YYYY, hh:mm:ss a");
    var txt1 = $('<span></span>').text(data.msgFrom+" : ").css({"color":"#006080"});
    var txt2 = $('<span></span>').text(chatDate).css({"float":"right","color":"#a6a6a6","font-size":"16px"});
    var txt3 = $('<p></p>').append(txt1,txt2);
    var txt4 = $('<p></p>').text(data.msg).css({"color":"#000000"});
    
    $('#messages').append($('<li>').append(txt3,txt4));
      msgCount++;
      console.log(msgCount);
      $('#typing').text("");
      $('#scrl2').scrollTop($('#scrl2').prop("scrollHeight"));
  }); 


  socket.on('disconnect',function(){


  
    $('#list').empty();
    $('#messages').empty();
    $('#typing').text("");
    $('#frndName').text("Disconnected..");
    $('#loading').hide();
    $('#noChat').hide();
    $('#initMsg').show().text("...Please, Refresh Your Page...");
    $('#chatForm').hide();
    msgCount = 0;
    noChat = 0;
  });


});