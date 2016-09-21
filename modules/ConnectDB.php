<?php
  $params = $_REQUEST;

  // Correctly fetch params
  $host = isset($params['host']) ? $params['host'] : null;
  $port = isset($params['port']) ? $params['port'] : null;
  $user = isset($params['user']) ? $params['user'] : null;
  $pwd = isset($params['pwd']) ? $params['pwd'] : null;

  // Create new connection
  $con = new mysqli();

  // If all relevant params are available
  if (isset($host) && isset($user) && isset($pwd)) {
    
    // Connect (with different or standard port)
    if (isset($port))
      $con = new mysqli($host.":".$port, $user, $pwd);
    else 
      $con = new mysqli($host, $user, $pwd);
    
    // Connection Error ?
    if ($con->connect_error) {
      die("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
      die ("\nCould not connect to db. Further Script processing terminated ");
    }
    else {
      // Return output
      $json = getData($con);
      header('Content-Type: application/json');
      echo json_encode($json);
      $con->close();
    }
  }

  // Extracting databases
  function getData($con) {
    $res = array();
    $query = "SHOW DATABASES";
    $result = mysqli_query($con, $query);

    while ($row = $result->fetch_assoc()) {
      $dbName = $row['Database'];
      // Filter information_schema to save resources
      if (strtolower($dbName) != "information_schema") {
        array_push($res, array(
            "database" => $dbName,
            "tables" => getTables($con, $dbName)
          )
        );
      }
    }
    return $res;
  }

  // Extracting tables
  function getTables($con, $db) {
    $query = "SHOW TABLES IN $db";
    $res = array();
    $nameParam = "Tables_in_$db";
    $result = mysqli_query($con, $query);
    
    while ($row = $result->fetch_assoc()) {
      $res[] = array(
        "table_name" => $row[$nameParam],
        "table_alias" => ucfirst($row[$nameParam]),
        "table_icon" => "fa fa-circle-o",
        "is_in_menu" => true,
        "columns" => array()
      );
    }
    //var_dump($res);
    return $res;
  }
?>