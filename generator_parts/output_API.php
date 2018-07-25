<?php
  // Includes
  require_once(__DIR__.'/src/AuthHandler.inc.php');
  include_once(__DIR__."/src/RequestHandler.inc.php");

  // Check if authenticated via Token
  $rawtoken = JWT::getBearerToken();
  try {
    $token = JWT::decode($rawtoken, AUTH_KEY);
  }
  catch (Exception $e) {
    // Invalid Token!
    http_response_code(401);
    exit();
  }
  // Token vaild but expired
  if (property_exists($token, "exp")) {
    if (($token->exp - time()) <= 0) {
      http_response_code(401);
      exit();
    }
  }
  
  // Parameter
  $paramData = json_decode(file_get_contents('php://input'), true);
  $command = $paramData["cmd"];
  $param = $paramData["paramJS"];

  /* TODO
  // Check if has rights
  if ($command == 'create') {
    http_response_code(403); // Forbidden
    exit();
  }

  if ($command == 'read') {
    $param["where"] = 'a.account_id = '.$token->uid;
  }
  */

  // Handle the Requests
  if ($command != "") {
    $RH = new RequestHandler();
    if ($paramData != "") // are there parameters?
      $result = $RH->$command($param); // execute with params
    else
      $result = $RH->$command(); // execute
    // Output result
    echo $result;
  }
?>