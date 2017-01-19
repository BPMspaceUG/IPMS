<?php
  //create DEBUG function
  //DEBUG function starts her
  $DEBUG = FALSE;
  if  (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'on' )) {
    $DEBUG = TRUE;
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
  }
  //DEBUG function ends her
?>