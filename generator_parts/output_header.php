<?php
  // Includes
  require_once(__DIR__.'/src/DatabaseHandler.inc.php'); // For AuthKey from Config
  require_once(__DIR__.'/src/AuthHandler.inc.php');

  // Check if token is set
  if (isset($_COOKIE['token']))
    $token_str = $_COOKIE['token'];
  else
    $token_str = null;

  // Check Token
  if (!is_null($token_str)) {
    // Token is set -> validate token
    try {
      $token = JWT::decode($token_str, AUTH_KEY);
    }
    catch (Exception $e) {
      //Invalid Token!
      // Clear Cookie -> for next Login
      setcookie('token', null, -1);
      header("Location: login.php");
      exit();
    }
    // Token vaild but expired
    if (property_exists($token, "exp")) {
      if (($token->exp - time()) <= 0) {
        // Redirect to Login-Page
        header("Location: login.php");
        exit();
      }
    }

    // Token vaild
    echo "Hello ".$token->firstname." ".$token->lastname."! ";
    if (property_exists($token, "exp"))
      echo "Your Token will expire in ".(($token->exp - time()) / 60)."min.";
    else
      echo "Your Token will never be expiring.";

  } else {
    // Redirect to Login-Page
    header("Location: login.php");
    exit();
  }
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Title -->
  <title>replaceDBName - [IPMSProject]</title>
  <!-- CSS via CDN -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css"/>
  <link rel="stylesheet" href="css/muster.css">
  <!-- JS via CDN -->
  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
</head>
<body>
