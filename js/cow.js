//var cow_global = {};
$(document).ready( function() {
  initPage();
});

// what to do when the first page loads and things need initialising..
function initPage() {
  //cow_global.url = 'https://creativeobjectworld-c9-wolispace.c9.io';
  //cow_global.url = 'http://wolispace.kd.io:8888';
  //cow_global.noServer = false; // when we want to fake the json sending and recieving..
  console.log(settings);
  
  $('#cmd').keydown( function(e) { enterCmd(e); } );
  $('#name').keydown( function(e) { enterName(e); } );
  $('#pwd').keydown( function(e) { enterPwd(e); } );
  $('#cmd_button').click( function() { enterCmd({keyCode:13}); } );
  $('#login_button').click( function() { login(); } );
  $('#logoff_button').click( function() { logoff(); } );
  $('#tab_log').click( function() { clickTab('log') } );
  $('#tab_look').click( function() { clickTab('look') } );
  $('#tab_read').click( function() { clickTab('read') } );
  $('#tab_edit').click( function() { clickTab('edit') } );

  $('#clear_log_button').click( function() { clearLog(); } );
  $('#debug_button').click( function() {
    $( "#settings" ).panel( "close" );
    $( "#debug" ).panel( "open" );
  });
  showLoginForm();

  // DEBUG
  $('#name').val('bob');
  $('#pwd').val('a');
}


function enterCmd(e) {
  var cmd = $('#cmd').val();
  $('#cmd').focus();
  if (e.keyCode == 13 && cmd !== '' ) {
    // DEBUG: testing different command to send..
    if( cmd == 'debug' ) {
      $( "#debug" ).panel( "open" );
    } else if( cmd == 'look' ) {
      clickTab('look');
    } else if( cmd == 'read' ) {
      clickTab('read');
    } else if( cmd == 'edit' ) {
      sendCmd('edit');
    } else if( cmd == 'db' ) {
      sendCmd('db');
    } else {
      sendCmd($('#cmd').val());
    }
    $('#cmd').val('');
  }
}

function enterName(e) {
  if (e.keyCode == 13) {
    $('#pwd').focus();
  }
}

function enterPwd(e) {
  if (e.keyCode == 13) {
    login();
  }
}

// util for encoding strings like passwords so they are not sent in plain text..
function encodeString( string ) {
  var returnResult = string.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);}).split("").reverse().join("");
  return Math.random().toString(36).substr(2,5)+returnResult;
}

// send a login request.. inform is successful, unsuccessful handled in error state..
function login() {
 var urlParams = {};
 var returnResult = false;
 urlParams.cmd = 'login';
 urlParams.name = $('#name').val();
 urlParams.pwd  = encodeString( $('#pwd').val() );
 jsonRequest( JSON.stringify(urlParams), function( jsonData ) {
   $('#pwd').val('');
   //console.log('Got back '+jsonData);
   if( handleResultsOk( jsonData ) ) {
     addMessage( 'Logged in as '+jsonData.name );
     hideLoginForm();
     returnResult = true;
   } else {
     addMessage( 'got an error');
     // addMessage( JSON.stringify(jsonData) ); // needs json2.js
     highlightTab('log');
   }
 });
 return returnResult;
}


// send a logoff request.. inform if successfully, errors handled automatically..
function logoff() {
  var urlParams = {};
  urlParams.cmd = 'logoff';
  jsonRequest( urlParams, function( jsonData ) {
   if( handleResultsOk( jsonData ) ) {
     addMessage( 'Logged off OK' );
     showLoginForm();
     highlightTab('log');
   }
  });
}

function sendCmd(cmd) {
  var urlParams = {};
  urlParams.cmd = cmd;
  jsonRequest( JSON.stringify(urlParams), function( jsonData ) {

   debug( 'log:['+jsonData.log+']' );
   debug( 'look['+jsonData.look+']' );
   debug( 'read['+jsonData.read+']' );
   debug( 'edit['+jsonData.edit+']' );
   debug( 'error['+jsonData.error+']' );

   if( handleResultsOk( jsonData ) ) {
     var tabShown = false;
     if( jsonData.log !== '' ) {
       addMessage( jsonData.log );
       highlightTab('log');
     }
     if( jsonData.read !== undefined ) {
       showTab('read');
       $('#read').html( jsonData.read );
       tabShown = true;
     }
     if( jsonData.look !== undefined ) {
       $('#look').html( jsonData.look );
       showTab('look');
       tabShown = true;
     }
     if( jsonData.edit !== undefined ) {
       $('#edit_textarea').html( jsonData.edit ).change();
       showTab('edit');
       tabShown = true;
     }
     // always show the log if no other tab was specified..
     if(!tabShown) {
       showTab('log');
     }
   }
  });

}

// send json and receive json..
function jsonRequest(urlParams, successFunction) {
  if( settings.noServer ) {

    // faking a json response..
    console.log( urlParams );
    var jsonData = {};
    if( urlParams.c == 'look' ) {
      jsonData.log = "you look around.";
      jsonData.look = "You are in a large swamp.";
    }
    else if( urlParams.c == 'read' ) {
      jsonData.log = "you read a book.";
      jsonData.read = "It was a dark and stormy night.";
    }
    else if( urlParams.c == 'edit' ) {
      jsonData.log = "you look around.";
      jsonData.edit = "if target of push then ##mebushed\n##mepushed\nsay 'I was pushed'";
    }
    else {
      jsonData.log = "You say "+urlParams.c;
    }
    successFunction( jsonData );

  } else {
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

function debug( msg ) {
  $('#debug').append( "<div class='log_entry'>"+msg+"</div>\n" );
}

function showLoginForm() {
  $( "#settings" ).panel( "close" );
  $('#cmd').hide();
  $('#cmd_button').hide();
  $('.tabs').hide();
  $('#welcome_header').show();
  $('#login').show();
  $('#name').focus();
}

function hideLoginForm() {
  $('#welcome_header').hide();
  $('#login').hide();
  $('#cmd').show();
  $('#cmd_button').show();
  $('#cmd').focus();
  $('#settings_button').show();
  showTab( 'log' );
}

function clickTab( tab ) {
  // DEBUG:
  if( tab == 'read' ) {
    sendCmd('read');
  } else if( tab == 'look' ) {
    sendCmd('look');
  } else {
    showTab( tab );
  }
}

function showTab( tab ) {
  $( "#settings" ).panel( "close" );
  $('.tabs').hide();
  $('.tab_buttons').removeClass("ui-btn-active");
  $('#tab_'+tab).addClass("ui-btn-active");
  $('.tab_buttons').attr('data-theme','a');
  $('#'+tab).show();
}

function highlightTab( tab ) {
  $('#tab_'+tab).fadeOut().fadeIn().fadeOut().fadeIn();
}

function clearLog() {
  $( "#settings" ).panel( "close" );
  $('#log').html('');
  showTab('log');
}