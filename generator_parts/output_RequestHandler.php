<?php
  // Includes
  include_once("replaceDBName-config.php");
  // Parameter and inputstream
  $params = json_decode(file_get_contents('php://input'), true);
  $command = $params["cmd"];  
  

  replaceClassStateEngine


  //RequestHandler Class Definition starts here
  class RequestHandler {
    // Variables
    private $db;
    private $SE;

    public function __construct() {
      // create DB connection object - Data comes from config file
      $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      // check connection
      if($db->connect_errno){
        printf("Connect failed: %s", mysqli_connect_error());
        exit();
      }
      $db->query("SET NAMES utf8");
      $this->db = $db;
      $this->SE = new StateEngine($this->db);
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
    private function buildSQLUpdatePart($cols, $primarycols, $rows) {
      $update = "";
      // Convert everything to lowercase      
      $primarycols = array_map('strtolower', $primarycols);
      $cols = array_map('strtolower', $cols);
      // Loop every element
      foreach ($cols as $col) {
        // update only when no primary column
        if (!in_array($col, $primarycols)) {
          $update = $update . $col."='".$this->db->real_escape_string($rows[$col])."'";
          $update = $update . ", ";
        }
      }
      $update = substr($update, 0, -2); // remove last ' ,' (2 chars)
      return $update;
    }
    public function init() {
      // Send data from config file
      global $config_tables_json;
      return $config_tables_json;
    }
    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      $rowdata = $param["row"];
      for ($i=0;$i<count($rowdata);$i++)
        $rowdata[$i] = $this->db->real_escape_string($rowdata[$i]);
      // Operation
      $query = "INSERT INTO ".$tablename." VALUES ('".implode("','", $rowdata)."');";
      $res = $this->db->query($query);
      // Output
      return $res ? "1" : "0";
    }
    //================================== READ

    public function read($param) {
      // Parameters
      $where = isset($param["where"]) ? $param["where"] : "";
      $orderby = isset($param["orderby"]) ? $param["orderby"] : "";
      $ascdesc = isset($param["ascdesc"]) ? $param["ascdesc"] : "";

      // SEARCH
      if (trim($where) <> "") {
        // Do a search
        $res = $this->db->query("SHOW COLUMNS FROM ".$param["tablename"].";");
        $k = [];
        while ($row = $res->fetch_array()) {
          $k[] = $row[0];
        }
        // xxx LIKE = '%".$param["where"]."%' OR yyy LIKE '%'
        $q_str = "";
        foreach ($k as $key) {
          $q_str .= " ".$key." LIKE '%".$where."%' OR ";
        }
        // Remove last 'OR '
        $q_str = substr($q_str, 0, -3);

        $where = " WHERE ".$q_str;
      }

      // ORDER BY
      $ascdesc = strtolower(trim($ascdesc));
      if ($ascdesc == "asc" || $ascdesc == "") $ascdesc == "ASC";
      if ($ascdesc == "desc") $ascdesc == "DESC";
      if (trim($orderby) <> "")
        $orderby = " ORDER BY ".$param["orderby"]." ".$ascdesc;
      else
        $orderby = " "; // ORDER BY replacer_id DESC";

      // SQL
      $query = "SELECT ".$param["select"]." FROM ".$param["tablename"].$where.$orderby.
        " LIMIT ".$param["limitStart"].",".$param["limitSize"].";"; 
      $res = $this->db->query($query);

      // TODO: Also read out statemachine and concat with results
      $states = array("states" => array("id" => 1, "name" => "unknown")); //$this->SE->getStateAsObject(1);
      //$result = array_merge($res, $states);

      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      // SQL
      $update = $this->buildSQLUpdatePart(array_keys($param["row"]), $param["primary_col"], $param["row"]);
      $where = $this->buildSQLWherePart($param["primary_col"], $param["row"]);
      $query = "UPDATE ".$param["table"]." SET ".$update." WHERE ".$where.";";
      //var_dump($query);
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
    //==== Statemachine -> substitue StateID of a Table with Statemachine
    public function getNextStates($param) {
      // Find right column (Maybe optimize with GUID)
      $keys = array_keys($param["row"]);
      $kid = array_search('state_id', $keys); // <= Column must contain state_id
      $real_key = $keys[$kid];
      $stateID = $param["row"][$real_key];
      // execute query
      $res = $this->SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function getStates($param) {
      // IN: (table_name)
      // OUT: [{id: 1, name: 'unknown'}, {id: 2, name: 'test'}]
      $res = $this->SE->getStates(); //$param["row"]["state_id_ext"]);
      return json_encode($res);
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