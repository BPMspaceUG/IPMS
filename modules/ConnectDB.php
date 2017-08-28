<?php
  // Check if Request Method is POST
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) {
    // Convert the input stream into PHP variables from Angular
    $_POST = json_decode(file_get_contents('php://input'), true);
  }
  $params = $_POST;
  
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
    /*if (isset($port))
      $con = new mysqli($host.":".$port, $user, $pwd);
    else*/ 
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
    $nameParam = "Tables_in_$db";
    $res = array();
    $result = mysqli_query($con, $query);
    
    $tables = array();
    while ($row = $result->fetch_assoc()) {
      $tables[] = $row[$nameParam];
    }
    
    // jede table durchgehen
    foreach ($tables as $table) {

      // Alle columns auslesen vong dieser 1 table
      $query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE ".
        "TABLE_SCHEMA = '$db' AND ". // Database
        "TABLE_NAME = '$table';";

      $res2 = mysqli_query($con, $query);

      $columns = array();
      $primary_col = "";

      if ($res2) {
        while ($row2 = $res2->fetch_assoc()) {
          // Column information
          $column_info = $row2;
          // Additional information

          // Pre fill foreign keys
          if ($row2["COLUMN_NAME"] == "state_id_FROM" 
          || $row2["COLUMN_NAME"] == "state_id_TO") {
            $fk = array("table" => "state", "col_id" => "state_id", "col_subst" => "name");
          } else {
            $fk = array("table" => "", "col_id" => "", "col_subst" => "");
          }

          // enrich column info
          $additional_info = array(
            "column_alias" => ucfirst($row2["COLUMN_NAME"]),
            "is_in_menu" => true,
            "read_only" => false,
            "is_ckeditor" => false,
            "foreignKey" => $fk
          );
          // Filter columns array
          $allowed  = ['COLUMN_NAME', 'DATA_TYPE', 'COLUMN_TYPE', 'COLUMN_KEY', 'EXTRA'];
          $filtered = array_filter(
            $column_info,
            function ($key) use ($allowed) {
              return in_array($key, $allowed);
            },
            ARRAY_FILTER_USE_KEY
          );

          // Merge arrays
          $columns[] = array_merge($filtered, $additional_info);
        }
      }

      // TODO: Check if is a View => then ReadOnly = true
      $res[] = array(
        "table_name" => $table,
        "table_alias" => ucfirst($table),
        "is_in_menu" => true,
        "is_read_only" => false,
        "columns" => $columns
      );
    }
    // Output
    return $res;
  }
?>