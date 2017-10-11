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
    //private $SE;

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
      //$this->SE = new StateEngine($this->db);
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
      //$cols = array_map('strtolower', $cols);
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
      // Split array
      foreach ($rowdata as $key => $value) {        
        // Check if has stateengine
        if ($value == '%!%PLACE_EP_HERE%!%') {
          $SE = new StateEngine($this->db, $tablename);
          $value = $SE->getEntryPoint();
        }
        // Append
        $keys[] = $this->db->real_escape_string($key);
        $vals[] = $this->db->real_escape_string($value);
      }
      // Operation
      $query = "INSERT INTO ".$tablename." (".implode(",", $keys).") VALUES ('".implode("','", $vals)."');";
      //echo $query;
      // Checking
      if (count($keys) != count($vals)) {
        echo "ERORR while buiding Query! (k=".count($keys).", v=".count($vals).")";
        exit;
      }
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
      $joins = isset($param["join"]) ? $param["join"] : "";

      // ORDER BY
      $ascdesc = strtolower(trim($ascdesc));
      if ($ascdesc == "asc" || $ascdesc == "") $ascdesc == "ASC";
      if ($ascdesc == "desc") $ascdesc == "DESC";
      if (trim($orderby) <> "")
        $orderby = " ORDER BY ".$param["orderby"]." ".$ascdesc;
      else
        $orderby = " "; // ORDER BY replacer_id DESC";

      // LIMIT
      // TODO: maybe if limit Start = -1 then no limit is used
      $limit = " LIMIT ".$param["limitStart"].",".$param["limitSize"];

      // JOIN
      $join_from = $param["tablename"]." AS a"; // if there is no join
      $sel = array();
      $sel_raw = array();
      $sel_str = "";
      if (count($joins) > 0) {
        // Multi-join
        for ($i=0;$i<count($joins);$i++) {
          $join_from .= " JOIN ".$joins[$i]["table"]." AS t$i ON ".
                        "t$i.".$joins[$i]["col_id"]."= a.".$joins[$i]["replace"];
          $sel[] = "t$i.".$joins[$i]["col_subst"]." AS '".$joins[$i]["replace"]."'";
          $sel_raw[] = "t$i.".$joins[$i]["col_subst"];
        }
        $sel_str = ",".implode(",", $sel);
      }

      // SEARCH
      if (trim($where) <> "") {
        // Get columns from the table
        $res = $this->db->query("SHOW COLUMNS FROM ".$param["tablename"].";");
        $k = [];
        while ($row = $res->fetch_array()) { $k[] = $row[0]; } 
        $k = array_merge($k, $sel_raw); // Additional JOIN-columns     
        // xxx LIKE = '%".$param["where"]."%' OR yyy LIKE '%'
        $q_str = "";
        foreach ($k as $key) {
          $prefix = "";
          // if no "." in string then refer to first table
          if (strpos($key, ".") === FALSE) $prefix = "a.";
          $q_str .= " ".$prefix.$key." LIKE '%".$where."%' OR ";
        }
        // Remove last 'OR '
        $q_str = substr($q_str, 0, -3);

        $where = " WHERE ".$q_str;
      }
      // Concat final query
      $query = "SELECT ".$param["select"].$sel_str." FROM ".$join_from.$where.$orderby.$limit.";";
      $query = str_replace("  ", " ", $query);
      $res = $this->db->query($query);
      // Return result as JSON
      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      // SQL
      $update = $this->buildSQLUpdatePart(array_keys($param["row"]), $param["primary_col"], $param["row"]);
      $where = $this->buildSQLWherePart($param["primary_col"], $param["row"]);
      $query = "UPDATE ".$param["table"]." SET ".$update." WHERE ".$where.";";

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
      $row = $param["row"];
      $stateID = false;
      foreach ($row as $key => $value) {
        // if column contains *state_id*
        if (strpos($key, 'state') !== false) {
          $stateID = $value;
          break;
        }
      }
      // Return invalid
      if ($stateID === false) return json_encode(array());
      // execute query
      $tablename = $param["table"];
      $SE = new StateEngine($this->db, $tablename);
      $res = $SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function makeTransition($param) {
      // Get the correct ID
      $pricol = $param["primary_col"][0];
      $ElementID = $param["row"][$pricol];
      $nextStateID = $param["row"]["state_id"];
      $tablename = $param["table"];
      // Statemachine
      $SE = new StateEngine($this->db, $tablename);
      echo $SE->setState($ElementID, $nextStateID);
    }
    public function getStates($param) {
      $tablename = $param["table"];
      $SE = new StateEngine($this->db, $tablename);
      $res = $SE->getStates();
      return json_encode($res);
    }
    public function smGetLinks($param) {
      $tablename = $param["table"];
      $SE = new StateEngine($this->db, $tablename);
      $res = $SE->getLinks();
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