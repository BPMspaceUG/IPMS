// create BPMspace LIAM Header
<?php
  //LIAM header starts here
  // comment if you do NOT want to use BPMspace LIAM for identity and access management
  include_once '../phpSecureLogin/includes/db_connect.inc.php';
  include_once '../phpSecureLogin/includes/functions.inc.php';
  
  sec_session_start();
  
	if(login_check($mysqli) != true) {
    header("Location: ../index.php?error_messages='You are not logged in!'");
    exit();
  }
  else {
    $logged = 'in';
  }
  //LIAM header ends here
?>