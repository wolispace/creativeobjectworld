   var objStore = new ObjectCache(),
     settings = {player:{id:'unknown', loc:'1'}},
          smallEditWidth = 30,
          cardPeek = 60,
          padding = 15;
    
      $(document).ready( function() {
        initPage();
      });

      // what to do when the first page loads and things need initialising..
      function initPage() {
     smallEditWidth = $('#edit').width();
          
     $(window).bind( 'resize', function(e){ 
              resetCards(0);
          });

     function smallHeight() {
       return 20;
         }
          
         function largeHeight() {
           var inputHeight = 70;
       var returnValue = ($(window).height() - inputHeight ) / 2;
       return returnValue;
         }
          
          function setEditWidth(desiredWidth) {
       var newWidth = 0;
              if (desiredWidth < 1) {
                newWidth = isEditCollapsed() ? smallEditWidth : $(window).width() - cardPeek;
              }	else {
         newWidth = desiredWidth;
              }							

              var newCardWidth = ($(window).width() - newWidth - padding);
              if ($('#edit').width() != newWidth) {
         
                  if (isEditCollapsed()) {
                    lockCardWidths();
                  }
                  if (desiredWidth != smallEditWidth) {
           $('#editContent').width(newWidth);
                  }									
                  if (isEditCollapsed() || (desiredWidth == smallEditWidth)) {
                    $('#edit').stop().animate({width:newWidth});
                  } else {		
                    $('#edit').width(newWidth);
                  }		
                  $('#cardHolder').stop().animate({width:newCardWidth});
              } else {
                  $('#cardHolder').width(newCardWidth);
                  unlockCardWidths();
              }
              
              $('#cmd').width($(window).width() - smallEditWidth*2 - 50);
          }
          
          function lockCardWidths() {
              $('#log').width( $('#log').width() ); 
              $('#look').width( $('#look').width() ); 
          }

          function unlockCardWidths() {
              $('#log').width( 'auto' ); 
              $('#look').width( 'auto' ); 
          }

          
          function resetCards() {
              $('#log').height(largeHeight());
              $('#look').height(largeHeight());
       $('#edit').height(largeHeight()*2+15);
              setEditWidth(0);
          }
          
          function isEditCollapsed() {
            var returnValue = ($('#edit').width() == smallEditWidth);
              console.log(returnValue+" "+$('#edit').width()+" == "+smallEditWidth);
              return returnValue;
          }

          // only way I can get the cards animating at the same time..
          $('#log').click( function() {
            setEditWidth(smallEditWidth);
     });

          $('#look').click( function() {
            setEditWidth(smallEditWidth);
     });

          $('#edit').click( function() {
              
              var newWidth = !isEditCollapsed() ? smallEditWidth : $(window).width() - cardPeek;
              setEditWidth(newWidth);
     });
          
          $('#userInput').click( function() {
       $('#cmd').focus();
                setEditWidth(smallEditWidth);
         if ($('#log').height() != smallHeight()) {
           $('#log').height(largeHeight());
         }
         if ($('#look').height() != smallHeight()) {
           $('#look').height(largeHeight());
         }

     });

          resetCards();
          
}

//------- from cow.js to handle sending and receiving messages..

$('#cmd').keydown( function(e) { enterCmd(e); } );
$('#goButton').click( function(e) { enterCmd(e); } );

function enterCmd(e) {
  var cmd = $('#cmd').val();
  $('#cmd').focus();
  if (e.keyCode == 13 && cmd !== '' ) {
    sendCmd($('#cmd').val());
    $('#cmd').val('');
  }
}

if (io) {
  var socket = io.connect('https://creativeobjectworld-c9-wolispace.c9.io');
  socket.on('msg', function (data) {
    handleMsg(data);
  });
} else {
  alert('failed to get started');
}

// send a cmd to the server..
function sendCmd(cmd) {
  // need to send json object via socket like this:
  // {'cmd':'create a small white fluffy mouse',
  //  'player':{id:'87',loc:'1'}}
  var jsonCmd = settings.player;
  jsonCmd.cmd = cmd;
  console.log("=sending cmd=");
  console.log(jsonCmd);
  socket.emit('cmd', jsonCmd);
}

// handle the response from the server..
function handleMsg(data) {
  console.log("=got msg=");
  console.log(data);
  // if we recieved any information about the player update its local info (like its loc)..
  if (typeof data.player !== 'undefined') {
    settings.player = data.player;
  }
  // was a log msg recieved eg "[123456] look around"
  if (data.log !== undefined) {
    // all numbers in square brackets get replaced by clickable links eg: "[12345] says 'Hi'"
    var matches = data.log.match(/(\d+)/g);
    matches.forEach (
      function(id) {
        var objOne = objStore.getObj(id);
        data.log = data.log.replace('['+id+']', objOne.htmlLink);
      }
    );

    addMessage( data.log+"<br/>" );
  }
  if( data.look !== undefined ) {
    objStore.data = data.look; 
    var msg = 'You look around and see ';
    for (var id in data.look) { 
      var objOne = objStore.getObj(id);
      msg += objOne.htmlLink+', ';
    }
    $('#look').html( msg );
  }  
  if( data.edit !== undefined ) {
    $('#edit_textarea').html( data.edit ).change();
    $('#edit').trigger('click');
  }
  
}

// make it look nice on an html page..  
function formatForReading(sourceText) {
  console.log(sourceText);
  return sourceText.replace(/\\n/g, "<br/>").replace(/\\r/g, "<br/>");
}

// add a message to the log.. this should scrol and roll off old msgs etc..
function addMessage( msg ) {
  $('#log').append( "<div class='log_entry'>"+msg+"</div>\n" );
}
      
function clickObj(id) {
  // TODO: correctly set the locaiton for this player at the right time (whem moving - from a response from the server thet they are there..)
  var cmd = 'read';
  var objOne = objStore.getObj(id);
  // need to handle all types of linked doorways..
  if (objOne.link !== '') {
    cmd = 'go';
  }
  // DEBUG show what the click became.. 
  $('#cmd').val(cmd+' '+id);
  sendCmd($('#cmd').val());
}
// ------ end from cow.js


      