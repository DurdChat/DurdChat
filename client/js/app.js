var socket = io();
var connected = false;
var rating;
var partnerRating;
var isRating;

$(document).ready(function() {
    
    updateRating();
    socket.on('partnerFound', function(pr) {
        connected = true;
        isRating = false;
        partnerRating = pr;
        clearMessages();
        displaySystemMessage('You are connected!');
    });
    socket.on('sendMessage', function(msg) {
        displayOtherMessage(msg);
    });
    socket.on('partnerDisconnected', function() {
        displaySystemMessage('The other person has disconnected.');
        displaySystemMessage('Please rate the other person on a scale from -5 to 5.');
        isRating = true;
        connected = false;
    });
    
    $('#logo').on('click', function() {
        updateRating();
        clearMessages();
        
        $('#intro-page').show();
        $('#chat-page').hide();
        
        socket.emit('removeFromWaitinglist');
        console.log('Sent waitinglist removal request.');
        if(connected) {
            socket.emit('chatDisconnect');
        }
        
        connected = false;
        isRating = false;
    });
    
    $('#roleplay-start').on('click', function() {
        $('#intro-page').hide();
        $('#chat-page').show();
        isRating = false;
        
        socket.emit('onRPWaiting');
        displaySystemMessage('Searching for other...');
    });
    
    $('#talk-start').on('click', function() {
        $('#intro-page').hide();
        $('#chat-page').show();
        isRating = false;
        
        socket.emit('onTalkWaiting');
        displaySystemMessage('Searching for other...');
    });
    
    $("#msg-input").keydown(function(event){
        if(event.keyCode == 13) {
            if(connected && $('#msg-input').val().length !== 0) {
                displayOwnMessage($('#msg-input').val());
                socket.emit('sendMessage', $('#msg-input').val());
                $('#msg-input').val('');
            } else if(isRating) {
                var input = parseInt($('#msg-input').val(), 10);
                
                if(validRating(input)) {
                    displaySystemMessage('Your rating has been sent.');
                    socket.emit('sendRating', input);
                    $('#msg-input').val('');
                    isRating = false;
                } else {
                    displaySystemMessage('Must be a number from -5 to 5.');
                }
            }
        }
    });
    
    $('#disconnect').on('click', function() {
        if(connected) {
            onDisconnect();
            connected = false;
        }
    });
});

function scrollDown() {
    $("#chat-display").scrollTop($("#chat-display")[0].scrollHeight);
}

function displayOwnMessage(message) {
    $('#chat-display').append('<p class="message"><span class="you">You (' + rating + '):</span> ' + message + '</p><br>');
    scrollDown();
}

function displayOtherMessage(message) {
    $('#chat-display').append('<p class="message"><span class="other">Other (' + partnerRating + '):</span> ' + message + '</p><br>');
    scrollDown();
}

function displaySystemMessage(message) {
    $('#chat-display').append('<p class="message" style="font-weight: bold;">' + message +'</p><br>');
    scrollDown();
}

function onDisconnect() {
    socket.emit('chatDisconnect');
    isRating = true;
    displaySystemMessage('You left the chat!');
    displaySystemMessage('Please rate the other person on a scale from -5 to 5.');
}

function clearMessages() {
    $('#chat-display').empty();
}

function updateRating() {
    socket.emit('getRating');
    socket.on('sendRating', function(r) {
        $('#rating').text(r);
        rating = r;
    });
}

function validRating(input) {
    return input === parseInt(input, 10) && input >= -5 && input <= 5;
}