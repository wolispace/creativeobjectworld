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


function sendCmd(cmd) {
  var urlParams = settings.player;
  urlParams.cmd = cmd;
  jsonRequest( JSON.stringify(urlParams), function( jsonData ) {

    //debug( 'log:['+jsonData.log+']' );
    var msg = '';

    if( handleResultsOk( jsonData ) ) {
      // update the playser info.. id and location.
      if (typeof jsonData.player !== 'undefined') {
        settings.player = jsonData.player;
      }
      if (jsonData.log !== undefined) {
        // TODO: a log msg will have params that need converting into the nice clickable objects..
        msg = jsonData.log+"<br/>";
        addMessage( msg );
        $('#log').trigger('click');
      }
      if( jsonData.look !== undefined ) {
        objStore.data = jsonData.look; 
        msg = 'You look around and see ';
        for (var id in jsonData.look) { 
          var objOne = objStore.getObj(id);
          msg += objOne.htmlLink+', ';
          // 
        }
        $('#look').html( msg );
        $('#look').trigger('click');
      }
      if( jsonData.edit !== undefined ) {
        $('#edit_textarea').html( jsonData.edit ).change();
        $('#edit').trigger('click');
      }
    }
  });

}

function formatForReading(sourceText) {
  console.log(sourceText);
  return sourceText.replace(/\\n/g, "<br/>").replace(/\\r/g, "<br/>");
}

// send json and receive json..
function jsonRequest(urlParams, successFunction) {
  $.getJSON( settings.url, urlParams )
  .done( successFunction )
  .fail(function( jqxhr, textStatus, error ) {
    console.log( jqxhr );
    console.log( textStatus );
    console.log( error );
    var err = textStatus + ', ' + error;
    addMessage( "Request Failed: " + err);
    addMessage( jqxhr.responseText );
  });
}

// if a sysMessage is defined the process it then if received json had an error defined then show it and return false to its not considered a success..
function handleResultsOk( jsonData ) {
  var returnResult = true;
  if( jsonData.sys ) {
    addMessage( 'System msg: '+jsonData.sys );
  }
  if( jsonData.error ) {
    addMessage( 'Failed to login because: '+jsonData.error );
    returnResult = false;
  }
  return returnResult;
}

function addMessage( msg ) {
  $('#log').append( "<div class='log_entry'>"+msg+"</div>\n" );
}
			
function clickObj(id) {
  // TODO: correctly set the locaiton for this player at the right time (whem moving - from a response from the server thet they are there..)
  var cmd = 'read';
  var objOne = objStore.getObj(id);
  if (objOne.link !== '') {
    // TODO: should really be GO..
    cmd = 'go';
  }
  //console.log(objOne);
  $('#cmd').val(cmd+' '+id);
  sendCmd($('#cmd').val());
}
// ------ end from cow.js


			