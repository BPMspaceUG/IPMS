/*
AngularJS - Controller
*/
var IPMS = angular.module('IPMS', []);
IPMS.controller('IPMScontrol', ['$scope','$http', function ($scope, $http) {    //https://docs.angularjs.org/api/ngSanitize/service/$sanitize

// initial definitions
$scope.path = 'modules/ConnectDB.php'
$scope.pw = ''
$scope.sqlServer = 'localhost'
$scope.sqlPort = 3306
$scope.username = 'root'

/*
send fetch database info order for user to ConnectDB.php
*/
$scope.connectToDB = function(){
  // log('\nPOST an '+$scope.path+': ')
  $http({
    url: $scope.path,
    method: "POST",
    data: { host:$scope.sqlServer, port:$scope.sqlPort, user:$scope.username, pwd:$scope.pw }
  })
  .success(function(data, status, headers, config) {
    $scope.resultData = data
    $scope.dbNames = {model: data[0].database, names : data.map(function(x){return x.database})};
    $scope.handleresult( data );
    $scope.updateTables();
    log('"Connect"-Response data: '); log(data);
  })
  .error(function(data, status, headers, config) {
    $scope.status = status;
    log('Error-Status: '+JSON.stringify(status));
    scsSignal(false)
  });
}

/*
define tables for manipulation, also set success signal and icons
*/
$scope.handleresult = function(result) {
  var result = result || null
  if (result != null) {
    scsSignal(true)
    $scope.updateTables()
  } else { // set red circle icon for fail
    scsSignal(false)
  }
}

$scope.tbl_toggle_sel_all = function() {
  $scope.tables.forEach(function(t){
    t.is_in_menu = !t.is_in_menu;
  });
}

/*
(re)define recent selected database
*/
$scope.updateTables = function(param){
  var param = param || $scope.dbNames.model
  // log('\nparam: '+param)
    $scope.db = $scope.resultData.find(function(db){ return db.database == param })  
  // log('db: ');log($scope.db)
    $scope.tables = $scope.db.tables.map(function(tbl){tbl.table_icon = getRandomicon(); return tbl})
  // log('tables: ');log($scope.tables)
}

/*
send script-create order to fusion, also print out Script on bottom page
*/
$scope.create_fkt = function(){
  var data = {
    host: $scope.sqlServer,
    port: $scope.sqlPort,
    user: $scope.username,
    pwd: $('#sqlPass')[0].value,
    db_name: $scope.dbNames.model,
    data: $scope.tables
  }
    
  $http({
    url: 'generator_parts/fusion.php',
    method: "POST",
    data: data
  })
  .success(function(data, status, headers, config) {
    console.log('\nScript generated success.'); 
    // console.log(data);
    $('#bpm-code').empty();
    $('#bpm-code').html('<pre></pre>');
    $('#bpm-code pre').text(data);
  })
  .error(function(data, status, headers, config) {
    $scope.status = status;
    log('Error-Status: '+JSON.stringify(status));
  });

}

// todo 
$scope.checkSpell = function(){}

}]);/*End Controller*/

/*
get a random Icon from the List
*/
var iconlist = ['address-book','address-book-o','address-card','address-card-o','adjust','american-sign-language-interpreting','anchor','archive','area-chart','arrows','arrows-h','arrows-v','asl-interpreting','assistive-listening-systems','asterisk','at','audio-description','automobile','balance-scale','ban','bank','bar-chart','bar-chart-o','barcode','bars','bath','bathtub','battery','battery-0','battery-1','battery-2','battery-3','battery-4','battery-empty','battery-full','battery-half','battery-quarter','battery-three-quarters','bed','beer','bell','bell-o','bell-slash','bell-slash-o','bicycle','binoculars','birthday-cake','blind','bluetooth','bluetooth-b','bolt','bomb','book','bookmark','bookmark-o','braille','briefcase','bug','building','building-o','bullhorn','bullseye','bus','cab','calculator','calendar','calendar-check-o','calendar-minus-o','calendar-o','calendar-plus-o','calendar-times-o','camera','camera-retro','car','caret-square-o-down','caret-square-o-left','caret-square-o-right','caret-square-o-up','cart-arrow-down','cart-plus','cc','certificate','check','check-circle','check-circle-o','check-square','check-square-o','child','circle','circle-o','circle-o-notch','circle-thin','clock-o','clone','close','cloud','cloud-download','cloud-upload','code','code-fork','coffee','cog','cogs','comment','comment-o','commenting','commenting-o','comments','comments-o','compass','copyright','creative-commons','credit-card','credit-card-alt','crop','crosshairs','cube','cubes','cutlery','dashboard','database','deaf','deafness','desktop','diamond','dot-circle-o','download','drivers-license','drivers-license-o','edit','ellipsis-h','ellipsis-v','envelope','envelope-o','envelope-open','envelope-open-o','envelope-square','eraser','exchange','exclamation','exclamation-circle','exclamation-triangle','external-link','external-link-square','eye','eye-slash','eyedropper','fax','feed','female','fighter-jet','file-archive-o','file-audio-o','file-code-o','file-excel-o','file-image-o','file-movie-o','file-pdf-o','file-photo-o','file-picture-o','file-powerpoint-o','file-sound-o','file-video-o','file-word-o','file-zip-o','film','filter','fire','fire-extinguisher','flag','flag-checkered','flag-o','flash','flask','folder','folder-o','folder-open','folder-open-o','futbol-o','gamepad','gavel','gear','gears','gift','glass','globe','graduation-cap','group','hand-grab-o','hand-lizard-o','hand-paper-o','hand-peace-o','hand-pointer-o','hand-rock-o','hand-scissors-o','hand-spock-o','hand-stop-o','handshake-o','hard-of-hearing','hashtag','hdd-o','headphones','heart','heart-o','heartbeat','history','home','hotel','hourglass','hourglass-1','hourglass-2','hourglass-3','hourglass-end','hourglass-half','hourglass-o','hourglass-start','i-cursor','id-badge','id-card','id-card-o','image','inbox','industry','info','info-circle','institution','key','keyboard-o','language','laptop','leaf','legal','lemon-o','level-down','level-up','life-bouy','life-buoy','life-ring','life-saver','lightbulb-o','line-chart','location-arrow','lock','low-vision','magic','magnet','mail-forward','mail-reply','mail-reply-all','male','map','map-marker','map-o','map-pin','map-signs','meh-o','microchip','microphone','microphone-slash','minus','minus-circle','minus-square','minus-square-o','mobile','mobile-phone','money','moon-o','mortar-board','motorcycle','mouse-pointer','music','navicon','newspaper-o','object-group','object-ungroup','paint-brush','paper-plane','paper-plane-o','paw','pencil','pencil-square','pencil-square-o','percent','phone','phone-square','photo','picture-o','pie-chart','plane','plug','plus','plus-circle','plus-square','plus-square-o','podcast','power-off','print','puzzle-piece','qrcode','question','question-circle','question-circle-o','quote-left','quote-right','random','recycle','refresh','registered','remove','reorder','reply','reply-all','retweet','road','rocket','rss','rss-square','s15','search','search-minus','search-plus','send','send-o','server','share','share-alt','share-alt-square','share-square','share-square-o','shield','ship','shopping-bag','shopping-basket','shopping-cart','shower','sign-in','sign-language','sign-out','signal','signing','sitemap','sliders','smile-o','snowflake-o','soccer-ball-o','sort','sort-alpha-asc','sort-alpha-desc','sort-amount-asc','sort-amount-desc','sort-asc','sort-desc','sort-down','sort-numeric-asc','sort-numeric-desc','sort-up','space-shuttle','spinner','spoon','square','square-o','star','star-half','star-half-empty','star-half-full','star-half-o','star-o','sticky-note','sticky-note-o','street-view','suitcase','sun-o','support','tablet','tachometer','tag','tags','tasks','taxi','television','terminal','thermometer','thermometer-0','thermometer-1','thermometer-2','thermometer-3','thermometer-4','thermometer-empty','thermometer-full','thermometer-half','thermometer-quarter','thermometer-three-quarters','thumb-tack','thumbs-down','thumbs-o-down','thumbs-o-up','thumbs-up','ticket','times','times-circle','times-circle-o','times-rectangle','times-rectangle-o','tint','toggle-down','toggle-left','toggle-off','toggle-on','toggle-right','toggle-up','trademark','trash','trash-o','tree','trophy','truck','tty','tv','umbrella','universal-access','university','unlock','unlock-alt','unsorted','upload','user','user-circle','user-circle-o','user-o','user-plus','user-secret','user-times','users','video-camera','volume-control-phone','volume-down','volume-off','volume-up','warning','wheelchair','wheelchair-alt','wifi','window-close','window-close-o','window-maximize','window-minimize','window-restore','wrench']
function getRandomicon(){
  var index = Math.floor( Math.random()*iconlist.length )
  return 'fa fa-square';
  //return 'fa fa-'+iconlist[index]
}

/*
 set green checked icon for success 
*/
function scsSignal(bool){
  if (bool) {
    $('.fa-minus-circle').css({ display: 'none' });
    $('.fa-check').css({ display: 'inline-block' });
  }else{
    $('.fa-minus-circle').css({ display: 'inline-block' });
    $('.fa-check').css({ display: 'none' });
  }
}

function log(x){console.log(x)}