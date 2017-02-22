<?php
  // Parameter and inputstream
  $params = json_decode(file_get_contents('php://input'), true);
  $command = $params["cmd"];
    
  //RequestHandler Class Definition starts here
  class RequestHandler {
    // Variables
    private $db;

    public function __construct() {      
      //identifyer for replace in fusion.php
      $config['db'] =  array(
        'host' => "replaceServer",
        'user' => "replaceUser",
        'password' => "replacePassword",
        'database' => "replaceDBName"
      );
      // create DB connection object
      $db = new mysqli(
        $config['db']['host'],
        $config['db']['user'],
        $config['db']['password'],
        $config['db']['database']
      );
      /* check connection */
      if($db->connect_errno){
        printf("Connect failed: %s", mysqli_connect_error());
        exit();
      }
      $db->query("SET NAMES utf8");
      $this->db = $db;
    }
    // Format data for output
    private function parseToJSON($result) {
      $results_array = array();
      if (!$result) return false;
      while ($row = $result->fetch_assoc()) {
        $results_array[] = $row;
      }
      return json_encode($results_array);
    }
    private function buildSQLWherePart($primarycols, $rowcols) {
      $where = "";
      foreach ($primarycols as $col) {
        $where = $where . $col . "='" . $rowcols[$col] . "'";
        $where = $where . " AND ";
      }
      $where = substr($where, 0, -5); // remove last ' AND ' (5 chars)
      return $where;
    }
    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      $rowdata = $param["row"];
      // Operation
      $query = "INSERT INTO ".$tablename." VALUES ('".implode("','", $rowdata)."');";
      $res = $this->db->query($query);
      // Output
      return $res ? "1" : "0";
    }
    //================================== READ
    public function read($param) {
      $query = "SELECT ".$param["select"]." FROM " . $param["tablename"] ." LIMIT ".$param["limit"].";";      
      $res = $this->db->query($query);
      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      $str_update = "";
      $cols = array_keys($param["row"]);
      $len = count($param["row"]);
      $pri_cols = array_map('strtolower', $param["primary_col"]); // Convert to lowercase
      $cols = array_map('strtolower', $cols); // Convert to lowercase
      // loop each column
      for ($i=0; $i < $len; $i++) {
        // check if actual column is not a primary key
        $act_col = strtolower($cols[$i]); // Convert to lowercase for comparison
        // compare columns
        if (!in_array($act_col, $pri_cols)) {
          $str_update .= $act_col."='".$param["row"][$act_col]."'";
          if ($i < $len-1)
            $str_update .= ", ";
        }
      }
      $where = $this->buildSQLWherePart($param["primary_col"], $param["row"]);
      $query = "UPDATE ".$param["table"]." SET ".$str_update." WHERE ".$where.";";
      // var_dump($query); // for Debugging
      $res = $this->db->query($query);
      // TODO: Check if rows where REALLY updated!
      // Output
      return $res ? "1" : "0";
    }
    //================================== DELETE
    public function delete($param) {
      /*  DELETE FROM table_name WHERE some_column=some_value AND x=1;  */
      $where = $this->buildSQLWherePart($param["primary_col"], $param["row"]);
      // Build query
      $query = "DELETE FROM ".$param["table"]." WHERE ".$where.";";
      $res = $this->db->query($query);
      // Output
      return $res ? "1" : "0";
    }
  }
  // Class Definition ends here
  // Request Handler ends here
  
  $RH = new RequestHandler();
  
  // check if at least a command is set
  if ($command != "") {
    // are there parameters?
    if ($params != "") {
      // execute with parameters
      $result = $RH->$command($params["paramJS"]);
    } else {
      // only execute
      $result = $RH->$command();
    }
    // Output
    echo $result;
    exit();
  }
?>