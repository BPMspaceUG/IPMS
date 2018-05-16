<?php
  // Includes
  require_once(__DIR__.'/src/AuthHandler.inc.php');
  // Check if authenticated
  if ($_COOKIE['token'] != 'content') {
    header("Location: login.php");
    exit();
  }
?>
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Title -->
  <title>replaceDBName</title>
  <!-- CSS via CDN -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="css/muster.css">
  <!-- JS via CDN -->
  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/viz.js/1.8.2/viz-lite.js"></script>  
</head>
<body>
