<?php
  // Includes
  include_once("replaceDBName-config.inc.php");

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
      
      $cols = $config[$tablename]["columns"];
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
    private function splitQuery($row) {
      $res = array();
      foreach ($row as $key => $value) { 
        $res[] = array("key" => $key, "value" => $value);
      }
      return $res;
    }
    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      // New State Machine
      $SM = new StateMachine($this->db, DB_NAME, $tablename);
      // Check Query
      $x = $this->splitQuery($param["row"]);
      // Substitute Value for EntryPoint of Statemachine
      for ($i=0;$i<count($x);$i++) {
        // TODO: Make this better
        // (EP from client, and then check if correct in server)
        if ($x[$i]["value"] == '%!%PLACE_EP_HERE%!%')
          $x[$i]["value"] = $SM->getEntryPoint();
      }
      // Rebuild Object
      for ($i=0;$i<count($param["row"]);$i++) {
        $param["row"][$x[$i]["key"]] = $x[$i]["value"];
      }
      // Has StateMachine? then execute Scripts
      if ($SM->getID() > 0) {
        // Transition Script
        $script = $SM->getTransitionScriptCreate();
        $script_result = $SM->executeScript($script, $param);
      } else {
        // NO StateMachine
        $script_result = array("allow_transition" => true);
      }
      // If allow transition then Create
      if (@$script_result["allow_transition"] == true) {

      	// Reload row, because maybe the TransitionScript has changed some params
        $keys = array();
        $vals = array();
        $x = $this->splitQuery($param["row"]);
        foreach ($x as $el) {
          $keys[] = $this->db->real_escape_string($el["key"]);
          $vals[] = $this->db->real_escape_string($el["value"]);
        }

        // --- Operation CREATE
        $query = "INSERT INTO ".$tablename." (".implode(",", $keys).") VALUES ('".implode("','", $vals)."');";
        $res = $this->db->query($query);
        $newElementID = $this->db->insert_id;

        // Execute IN-Script
        if ($SM->getID() > 0) {
          $script = $SM->getINScript($SM->getEntryPoint());
          // Refresh row (add ID)
          $pri_cols = $this->getPrimaryColByTablename($tablename);
          $param["row"][$pri_cols[0]] = (string)$newElementID;
          // Script
          $script_result = $SM->executeScript($script, $param);
        }
        // Append the ID from new Element        
        $script_result["element_id"] = $newElementID; 
      }
      // Return
      return json_encode($script_result);
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
          $join_from .= " LEFT JOIN ".$joins[$i]["table"]." AS t$i ON ".
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

      //var_dump($query);

      $res = $this->db->query($query);
      // Return result as JSON
      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      // Primary Columns
      $tablename = $param["table"];
      $pCols = $this->getPrimaryColByTablename($tablename);
      // Build query
      $update = $this->buildSQLUpdatePart(array_keys($param["row"]), $pCols, $param["row"]);
      $where = $this->buildSQLWherePart($pCols, $param["row"]);
      $query = "UPDATE ".$tablename." SET ".$update." WHERE ".$where.";";
      $res = $this->db->query($query);
      // Check if rows where updated
      $success = false;
      if($this->db->affected_rows >= 0){
      	$success = true;
      }
      // Output
      return $success ? "1" : "0";
    }
    //================================== DELETE
    public function delete($param) {
      // Primary Columns
      $tablename = $param["table"];
      $pCols = $this->getPrimaryColByTablename($tablename);
      // Build query
      $where = $this->buildSQLWherePart($pCols, $param["row"]);
      $query = "DELETE FROM ".$tablename." WHERE ".$where.";";
      $res = $this->db->query($query);
      // Check if rows where updated
      $success = false;
      if($this->db->affected_rows >= 0){
      	$success = true;
      }
      // Output
      return $success ? "1" : "0";
    }
    //----------------------------------
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
    public function getFormCreate($param) {
      $tablename = $param["table"];
      $SM = new StateMachine($this->db, DB_NAME, $tablename);
      // Check if has state machine ?
      if ($SM->getID() > 0) {
        $r = $SM->getCreateFormByTablename();
        if (empty($r)) $r = "1"; // default: allow editing (if there are no rules set)
        return $r;
      } else {
        // allow editing if no statemachine
        return "1"; 
      }
    }
    //==== Statemachine -> substitue StateID of a Table with Statemachine
    public function getNextStates($param) {
      // Inputs
      $row = $param["row"];
      $tablename = $param["table"];

      // Find correct state_id with the inputs
      $pCols = $this->getPrimaryColByTablename($tablename);
      $where = $this->buildSQLWherePart($pCols, $param["row"]);

      // get StateID from the Element itself
      $query = "SELECT state_id FROM ".DB_NAME.".$tablename WHERE ".$where.";";
      $res = $this->db->query($query);
      $r = $res->fetch_array();
      $stateID = (int)$r[0];

      // execute query
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      $res = $SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function makeTransition($param) {
      // INPUT [table, ElementID, (next)state_id]
      // Get the next ID for the next State
      @$nextStateID = $param["row"]["state_id"];
      @$tablename = $param["table"];
      @$pricols = $this->getPrimaryColByTablename($tablename);
      @$pricol = $pricols[0]; // there should always be only 1 primary column for the identification of element
      @$ElementID = $param["row"][$pricol];

      // TODO: read out all params from DB
      //$query = "SELECT * FROM $tablename WHERE $pricol = $ElementID;";
      //$res = $this->db->query($query);
      //$param["row"] = $res->fetch_assoc();
      //var_dump($r);
      //$param["row"] = $this->parseToJSON($res);
      
      // Statemachine
      $SE = new StateMachine($this->db, DB_NAME, $tablename);
      // get ActStateID by Element ID
      $actstateObj = $SE->getActState($ElementID, $pricol);
      // No Element found in Database
      if (count($actstateObj) == 0) {
        echo "Element not found";
        return false;
      }
      $actstateID = $actstateObj[0]["id"];
      // Try to set State
      $result = $SE->setState($ElementID, $nextStateID, $pricol, $param);
      // Check if it was a recursive state
      $r = json_decode($result, true);
      // After successful transition, update entry
      // SAVE EVERY TIME, Not only at recursion, also when going to another state
      $allow_trans = true;
      for ($i=0;$i<count($r);$i++) {
      	$allow_trans = $allow_trans && $r[$i]["allow_transition"];
      }
      if ($allow_trans) {
        $this->update($param); // Update all other rows
      }
      // Return to client
      echo $result; // TODO: Do not echo, use return
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