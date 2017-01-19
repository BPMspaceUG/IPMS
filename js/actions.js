/************************************************************
                      A N G U L A R     J S
************************************************************/


var accumulated;
$(document).ready(function () {
  
  
  //Loading data for display on page load
  $.ajax({
      url: 'modules/ConnCrud.php',
      type: 'GET',
      dataType: 'json',
      data: '',
      success: function (data) {
          $.each(data, function (index, value) {
              $('.connection-values').append('<tr>' +
                  '<td class="bpm-id">' + value.id + '</td>' +
                  '<td class="bpm-host">' + value.host + '</td>' +
                  '<td class="bpm-user">' + value.user + '</td>' +
                  '<td class="bpm-port">' + value.port + '</td>' +
                  '<td><a href="#" class="bpm-load btn btn-info">Load</a></td>' +
                  '<td><a href="modules/ConnCrud.php?id=' + value.id + '" class="bpm-delete btn btn-danger">Delete</a></td>' +
                  '</tr>');
          });
      },
      error: function (jqXHR, exception) {
          console.log(jqXHR);
          console.log(exception);
      }
  });

    //Sending Connection
    $('#connect').click(function (e) {
        // Prevent form submission
        e.preventDefault();
        // Use Ajax to submit form data
        $.ajax({
            url: $('form').attr('action'),
            type: 'POST',
            dataType: 'json',
            data: $('form').serialize(),

            success: function (result) {
                if (result != null) {
                    $('.fa-check').css({ display: 'inline-block'});
                    $('.fa-minus-circle').css({ display: 'none'});
                    
                    accumulated = result;
                    log('result from POST to url('+ $('form').attr('action')+'): ');
                    log(result);
                    
                    //Appending Database and Tables
                    $.each(result, function (key, val) {
                        var tables = val.tables;

                        // Databases
                        $('#sqlDatabases').append('<option value="' + val.database + '">' + val.database + '</option>');
                        
                        $('#sqlTables').append('<div class="bpm-checkboxes" id="' + val.database + '"><table class="table"></table></div>');
                        var index = 0;
                        $.each(tables, function (key, value) {
                            $('#' + val.database).append(
                              '<tr><td style="width:200px;">' + value.table_name + '</td>'+
                              '<td><input type="text" class="form-control data_tblalias" value="' + value.table_alias +'"/></td>'+
                              '<td><input type="text" class="form-control data_tblicon" value="' + getRandomicon() +'"/></td>'+
                              '</tr>');
                            index += 1; // for identification
                        });
                    });


                } else {
                    $('.fa-minus-circle').css({
                        display: 'inline-block'
                    });
                    $('.fa-check').css({
                        display: 'none'
                    });
                }
            },

            error: function (jqXHR, exception) {
                $('.fa-minus-circle').css({ display: 'inline-block' });
                $('.fa-check').css({ display: 'none' });
            }
        });
    });
function handleConnectResult(result){

}
    
  // Saving new connections in database
  $('#save').click(function (e) {
      // Prevent form submission
      e.preventDefault();
      // Use Ajax to submit form data
      $.ajax({
          url: "modules/ConnCrud.php",
          type: 'POST',
          data: $('form').serialize(),
          success: function (result) {
            if (result == 1)
              alert("Connection has been saved");
            if (result == 0)
              alert("This Connection already exists");
            else if (result == 404)
              alert("Please fill all the connection parameters");
          },
          fail: function () {
            alert("There was a Problem connecting to the server, Kindly contact administrator or your developer");
          }
      });
  });

  //Connection Load Action
  $('.connection-values').on('click', '.bpm-load', function (event) {
    event.preventDefault();
    var host = $(this).parent().parent().find('.bpm-host').text();
    var port = $(this).parent().parent().find('.bpm-port').text();
    var user = $(this).parent().parent().find('.bpm-user').text();
    $('#sqlServer').val(host);
    $('#sqlPort').val(port);
    $('#username').val(user);
    $('#loadDb').modal('toggle');
  });

  //Revealing tables for selected Database
  $('#sqlDatabases').change(function () {
    var item = $(this);
    $('.bpm-active').removeClass('bpm-active');
    $('#' + item.val()).addClass('bpm-active');
  });

  //Getting Table_Name code for selected table
  $('#create').click(function (event) {
    event.preventDefault();
    
    var tbname = $('.bpm-checkboxes.bpm-active input[type="radio"]:checked').val();
    var dbname = $('#sqlDatabases option:selected').text();
    //var post_data = $('form').serialize() + '&table_name=' + name + '&db_name=' + db_name;
        
    console.log('------------------------------------- Create Button pressed');
    
    // Find database
    var index = -1;
    for (i=0;i<accumulated.length;i++){
      if (accumulated[i].database == dbname) {
        index = i;
      }
    }
    console.log("Index=" + index);
    


    //Extend DB-Array with custom selections
    var n = 0;
    $('#'+dbname+' .data_tblicon').each(function () {
      accumulated[index].tables[n].table_icon =  this.value;
      // log('accumulated['+index+'].tables['+n+'].table_icon = '+this.value)
      n += 1;
    });    
    n = 0;
    $('#'+dbname+' .data_tblalias').each(function () {
      accumulated[index].tables[n].table_alias =  this.value;
      // log('accumulated['+index+'].tables['+n+'].table_icon = '+this.value)
      n += 1;
    });
    console.log('accumulated['+index+']');
    
    var data = {
      host: $('#sqlServer')[0].value,
      port: $('#sqlPort')[0].value,
      user: $('#username')[0].value,
      pwd: $('#sqlPass')[0].value,
      db_name: dbname,
      data: accumulated
    }
    
    console.log('------------------------------------- Data Array created');
    console.log(data);
    
    $.ajax({
        // url: 'modules/GenerateFile.php',
        url: 'generator_parts/fusion.php',
        type: 'POST',
        data: data,
        success: function (result) {
            console.log('------------------------------------- Script generated');
            console.log(result);
            $('#bpm-code').empty();
            $('#bpm-code').html('<pre></pre>');
            $('#bpm-code pre').text(result);
            //alert("New Files have been Successfully Generated at server");
        }
    });
  });
});

function log(x){console.log(x)}

var iconlist = ['address-book','address-book-o','address-card','address-card-o','adjust','american-sign-language-interpreting','anchor','archive','area-chart','arrows','arrows-h','arrows-v','asl-interpreting','assistive-listening-systems','asterisk','at','audio-description','automobile','balance-scale','ban','bank','bar-chart','bar-chart-o','barcode','bars','bath','bathtub','battery','battery-0','battery-1','battery-2','battery-3','battery-4','battery-empty','battery-full','battery-half','battery-quarter','battery-three-quarters','bed','beer','bell','bell-o','bell-slash','bell-slash-o','bicycle','binoculars','birthday-cake','blind','bluetooth','bluetooth-b','bolt','bomb','book','bookmark','bookmark-o','braille','briefcase','bug','building','building-o','bullhorn','bullseye','bus','cab','calculator','calendar','calendar-check-o','calendar-minus-o','calendar-o','calendar-plus-o','calendar-times-o','camera','camera-retro','car','caret-square-o-down','caret-square-o-left','caret-square-o-right','caret-square-o-up','cart-arrow-down','cart-plus','cc','certificate','check','check-circle','check-circle-o','check-square','check-square-o','child','circle','circle-o','circle-o-notch','circle-thin','clock-o','clone','close','cloud','cloud-download','cloud-upload','code','code-fork','coffee','cog','cogs','comment','comment-o','commenting','commenting-o','comments','comments-o','compass','copyright','creative-commons','credit-card','credit-card-alt','crop','crosshairs','cube','cubes','cutlery','dashboard','database','deaf','deafness','desktop','diamond','dot-circle-o','download','drivers-license','drivers-license-o','edit','ellipsis-h','ellipsis-v','envelope','envelope-o','envelope-open','envelope-open-o','envelope-square','eraser','exchange','exclamation','exclamation-circle','exclamation-triangle','external-link','external-link-square','eye','eye-slash','eyedropper','fax','feed','female','fighter-jet','file-archive-o','file-audio-o','file-code-o','file-excel-o','file-image-o','file-movie-o','file-pdf-o','file-photo-o','file-picture-o','file-powerpoint-o','file-sound-o','file-video-o','file-word-o','file-zip-o','film','filter','fire','fire-extinguisher','flag','flag-checkered','flag-o','flash','flask','folder','folder-o','folder-open','folder-open-o','frown-o','futbol-o','gamepad','gavel','gear','gears','gift','glass','globe','graduation-cap','group','hand-grab-o','hand-lizard-o','hand-paper-o','hand-peace-o','hand-pointer-o','hand-rock-o','hand-scissors-o','hand-spock-o','hand-stop-o','handshake-o','hard-of-hearing','hashtag','hdd-o','headphones','heart','heart-o','heartbeat','history','home','hotel','hourglass','hourglass-1','hourglass-2','hourglass-3','hourglass-end','hourglass-half','hourglass-o','hourglass-start','i-cursor','id-badge','id-card','id-card-o','image','inbox','industry','info','info-circle','institution','key','keyboard-o','language','laptop','leaf','legal','lemon-o','level-down','level-up','life-bouy','life-buoy','life-ring','life-saver','lightbulb-o','line-chart','location-arrow','lock','low-vision','magic','magnet','mail-forward','mail-reply','mail-reply-all','male','map','map-marker','map-o','map-pin','map-signs','meh-o','microchip','microphone','microphone-slash','minus','minus-circle','minus-square','minus-square-o','mobile','mobile-phone','money','moon-o','mortar-board','motorcycle','mouse-pointer','music','navicon','newspaper-o','object-group','object-ungroup','paint-brush','paper-plane','paper-plane-o','paw','pencil','pencil-square','pencil-square-o','percent','phone','phone-square','photo','picture-o','pie-chart','plane','plug','plus','plus-circle','plus-square','plus-square-o','podcast','power-off','print','puzzle-piece','qrcode','question','question-circle','question-circle-o','quote-left','quote-right','random','recycle','refresh','registered','remove','reorder','reply','reply-all','retweet','road','rocket','rss','rss-square','s15','search','search-minus','search-plus','send','send-o','server','share','share-alt','share-alt-square','share-square','share-square-o','shield','ship','shopping-bag','shopping-basket','shopping-cart','shower','sign-in','sign-language','sign-out','signal','signing','sitemap','sliders','smile-o','snowflake-o','soccer-ball-o','sort','sort-alpha-asc','sort-alpha-desc','sort-amount-asc','sort-amount-desc','sort-asc','sort-desc','sort-down','sort-numeric-asc','sort-numeric-desc','sort-up','space-shuttle','spinner','spoon','square','square-o','star','star-half','star-half-empty','star-half-full','star-half-o','star-o','sticky-note','sticky-note-o','street-view','suitcase','sun-o','support','tablet','tachometer','tag','tags','tasks','taxi','television','terminal','thermometer','thermometer-0','thermometer-1','thermometer-2','thermometer-3','thermometer-4','thermometer-empty','thermometer-full','thermometer-half','thermometer-quarter','thermometer-three-quarters','thumb-tack','thumbs-down','thumbs-o-down','thumbs-o-up','thumbs-up','ticket','times','times-circle','times-circle-o','times-rectangle','times-rectangle-o','tint','toggle-down','toggle-left','toggle-off','toggle-on','toggle-right','toggle-up','trademark','trash','trash-o','tree','trophy','truck','tty','tv','umbrella','universal-access','university','unlock','unlock-alt','unsorted','upload','user','user-circle','user-circle-o','user-o','user-plus','user-secret','user-times','users','vcard','vcard-o','video-camera','volume-control-phone','volume-down','volume-off','volume-up','warning','wheelchair','wheelchair-alt','wifi','window-close','window-close-o','window-maximize','window-minimize','window-restore','wrench']
function getRandomicon(){
  var index = Math.floor( Math.random()*iconlist.length )
  return 'fa fa-'+iconlist[index]
}
