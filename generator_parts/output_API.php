<?php
  // Includes
  include_once(__DIR__."/../src/RequestHandler.inc.php");

  // Parameter and inputstream
  $paramData = json_decode(file_get_contents('php://input'), true);

  $command = $paramData["cmd"];
  $param = $paramData["paramJS"];

  $RH = new RequestHandler();
  // check if a command is set
  if ($command != "") {   
    if ($paramData != "") // are there parameters?
      $result = $RH->$command($param); // execute with params
    else
      $result = $RH->$command(); // execute
    // Output
    echo $result;
  }
?>