<?php
  // Header
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST');
  // Includes
  include_once("replaceDBName-config.php");
  // Parameter and inputstream
  $params = json_decode(file_get_contents('php://input'), true);
  $command = $params["cmd"];
  

  replaceClassStateEngine


  //RequestHandler Class Definition starts here
  class RequestHandler {
    private $db;

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
    }
    private function getPrimaryColByTablename($tablename) {
      $config = json_decode($this->init(), true);
      $res = array();
      // Loop table configuration
      for ($i=0; $i<count($config); $i++) {
        if ($config[$i]["table_name"] == $tablename) {
          $cols = $config[$i]["columns"];
          break;
        }
      }
      // Find primary columns
      foreach ($cols as $col) {
        if ($col["COLUMN_KEY"] == "PRI")
          $res[] = $col["COLUMN_NAME"];
      }
      return $res;
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
    // TODO: Rename to loadConfig
    public function init() {
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
        // Check if has StateMachine // TODO: Optimize
        if ($value == '%!%PLACE_EP_HERE%!%') {
          $SE = new StateMachine($this->db, DB_NAME, $tablename);
          $value = $SE->getEntryPoint();
        }
        // Append and escape to prevent sqli
        $keys[] = $this->db->real_escape_string($key);
        $vals[] = $this->db->real_escape_string($value);
      }
      // Checking
      if (count($keys) != count($vals)) {
        echo "ERORR while buiding Query! (k=".count($keys).", v=".count($vals).")";
        exit;
      }
      // Operation
      $query = "INSERT INTO ".$tablename." (".implode(",", $keys).") VALUES ('".implode("','", $vals)."');";
      $res = $this->db->query($query);
      $lastID = $this->db->insert_id;
      // Output (return last id instead of 1)
      return $res ? $lastID : "0";
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
      // Primary Columns
      $tablename = $param["table"];
      $pCols = $this->getPrimaryColByTablename($tablename);
      // SQL
      $update = $this->buildSQLUpdatePart(array_keys($param["row"]), $pCols, $param["row"]);
      $where = $this->buildSQLWherePart($pCols, $param["row"]);
      $query = "UPDATE ".$param["table"]." SET ".$update." WHERE ".$where.";";
      //var_dump($query);
      $res = $this->db->query($query);
      // TODO: Check if rows where REALLY updated!
      // Output
      return $res ? "1" : "0";
    }
    //================================== DELETE
    public function delete($param) {
      // Primary Columns
      $tablename = $param["table"];
      $pCols = $this->getPrimaryColByTablename($tablename);
      /* DELETE FROM table_name WHERE some_column=some_value AND x=1; */
      $where = $this->buildSQLWherePart($pCols, $param["row"]);
      // Build query
      $query = "DELETE FROM ".$param["table"]." WHERE ".$where.";";
      $res = $this->db->query($query);
      // Output
      return $res ? "1" : "0";
    }
    public function getFormData($param) {
      $tablename = $param["table"];
      $SM = new StateMachine($this->db, DB_NAME, $tablename);
      // Check if has state machine ?
      if ($SM->getID() > 0) {
        $stateID = $param["row"]["state_id"];
        $r = $SM->getFormDataByStateID($stateID);
        if (empty($r)) $r = "1"; // default: allow editing (if there are no rules set)
        return $r;
      } else {
        // respond true if no statemachine (means: allow editing)
        return "1"; 
      }
    }
    //==== Statemachine -> substitue StateID of a Table with Statemachine
    public function getNextStates($param) {
      // Find right column (Maybe optimize with GUID)
      $row = $param["row"];

      // TODO: Get StateID not from client -> find itself by using [table, ElementID]
      // {
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
      // }
      
      // execute query
      $tablename = $param["table"];
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      $res = $SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function makeTransition($param) {
      // Get the next ID for the next State
      $nextStateID = $param["row"]["state_id"];
      $tablename = $param["table"];
      $pricols = $this->getPrimaryColByTablename($tablename);
      $pricol = $pricols[0]; // Count should always be 1
      $ElementID = $param["row"][$pricol];
      // Statemachine
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      // get ActStateID
      $actstateObj = $SE->getActState($ElementID, $pricol);
      if (count($actstateObj) == 0) {
        echo "Element not found";
        return false;
      }
      $actstateID = $actstateObj[0]["id"];
      // Try to set State
      $result = $SE->setState($ElementID, $nextStateID, $pricol, $param);
      // Check if was a recursive state
      $r = json_decode($result, true);
      // Special case [Save] transition
      if ($nextStateID == $actstateID) {
        if ($r["allow_transition"]) {
          $this->update($param); // Update all other rows
        }
      }
      // Return to client
      echo $result;
    }
    public function getStates($param) {
      $tablename = $param["table"];
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      $res = $SE->getStates();
      return json_encode($res);
    }
    public function smGetLinks($param) {
      $tablename = $param["table"];
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      $res = $SE->getLinks();
      return json_encode($res);
    }
  }
  // Class Definition ends here
  // Request Handler ends here
  //----------------------------------------------------------

  $RH = new RequestHandler();  
  if ($command != "") { // check if at least a command is set    
    if ($params != "") // are there parameters?      
      $result = $RH->$command($params["paramJS"]); // execute with params
    else
      $result = $RH->$command(); // only execute
    // Output
    echo $result;
    exit(); // Terminate further execution
  }
?>