<?php
  // Includes
  $file_DB = __DIR__."/DatabaseHandler.inc.php";
  if (file_exists($file_DB)) include_once($file_DB);
  $file_SM = __DIR__."/StateMachine.inc.php";
  if (file_exists($file_SM)) include_once($file_SM);


  class RequestHandler {
    private $config;

    public function __construct() {
      DB::getInstance()->getConnection()->query("SET NAMES utf8");
      $this->config = json_decode(RequestHandler::init(), true);
    }
    private static function getColumnsByTablename($config, $tablename) {
      $cols = $config[$tablename]["columns"];
      return $cols;
    }
    public static function getPrimaryColByTablename($config, $tablename) {
      $res = array();
      $cols = RequestHandler::getColumnsByTablename($config, $tablename);
      // Find primary columns
      foreach ($cols as $col) {
        if ($col["COLUMN_KEY"] == "PRI")
          $res[] = $col["COLUMN_NAME"];
      }
      return $res;
    }
    private function parseToJSON($result) {
      $results_array = array();
      if (!$result) return false;
      // Read out fields
      $fieldcount = $result->field_count;
      // each row
      while ($row = $result->fetch_array()) {
        $tmprow = array();
        // Loop columns
        for($i=0;$i<$fieldcount;$i++) {
          $colname = mysqli_fetch_field_direct($result, $i)->name;
          if (array_key_exists($colname ,$tmprow)) {
            // If it is a ForeignKey -> merge Columns
            $tmpVal = $tmprow[$colname];
            $tmpArr = array();
            $tmpArr[] = $tmpVal;
            $tmpArr[] = $row[$i];
            $tmprow[$colname] = $tmpArr;
          } else
            $tmprow[$colname] = $row[$i];
        }
        $results_array[] = $tmprow;
      }
      return json_encode($results_array);
    }
    private static function buildSQLWherePart($primarycols, $rowcols) {
      $where = "";
      foreach ($primarycols as $col) {
        $where = $where . $col . "='" . $rowcols[$col] . "'";
        $where = $where . " AND ";
      }
      $where = substr($where, 0, -5); // remove last ' AND ' (5 chars)
      return $where;
    }
    private function buildSQLUpdatePart($cols, $primarycols, $rows, $tablename) {
      $update = "";
      // Convert everything to lowercase      
      $primarycols = array_map('strtolower', $primarycols);
      $existing_cols = RequestHandler::getColumnsByTablename($this->config, $tablename);
      // Loop every element
      foreach ($cols as $col) {
        // update only when no primary column
        if (!in_array($col, $primarycols)) {
          // Only add existing Columns of param to query
          if (array_key_exists($col, $existing_cols)) {
            // Special check for NULL (especially for ForeignKeys)
            if (is_null($rows[$col]))
              $update .= $col.'=NULL';
            else
              $update .= $col."='".DB::getInstance()->getConnection()->real_escape_string($rows[$col])."'";
            // Seperate by comma
            $update .= ",";
          }
        }
      }
      $update = substr($update, 0, -1); // remove last ',' char
      return $update;
    }
    private static function splitQuery($row) {
      $res = array();
      foreach ($row as $key => $value) { 
        $res[] = array("key" => $key, "value" => $value);
      }
      return $res;
    }
    private static function implodeWithNULLVals($input) {
      $output = "";
      foreach ($input as $key => $value) {
        if (is_null($value)) {
          $output .= 'NULL';
        } else
          $output .= '\''.$value.'\'';
        $output .= ",";
      }
      $output = substr($output, 0, -1);
      return $output;
    }
    private function readRow($tablename, $primColName, $ElementID) {
      $query = "SELECT * FROM $tablename WHERE $primColName = $ElementID;";
      $res = DB::getInstance()->getConnection()->query($query);
      return $res->fetch_assoc();
    }
    private static function checkString($string) {
      return (!preg_match('/[^A-Za-z0-9_]/', $string));
    }
    //================================== INIT
    // TODO: Rename to loadConfig
    public static function init() {
      global $config_tables_json;
      return $config_tables_json;
    }
    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      // New State Machine
      $SM = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);   
      // Make ARRAY for Script results
      $script_result = array();
      // Has StateMachine? then execute Scripts
      if ($SM->getID() > 0) {
        // Override/Set EP
        $EP = $SM->getEntryPoint();
        $param["row"]["state_id"]  = $EP;
        // Transition Script
        $script = $SM->getTransitionScriptCreate();
        $script_result[] = $SM->executeScript($script, $param);

      } else {
        // NO StateMachine
        $script_result[] = array("allow_transition" => true);
      }
      // If allow transition then Create
      if (@$script_result[0]["allow_transition"] == true) {
      	// Reload row, because maybe the TransitionScript has changed some params
        $keys = array();
        $vals = array();
        $x = RequestHandler::splitQuery($param["row"]);
        $cols = RequestHandler::getColumnsByTablename($this->config, $tablename);
        foreach ($x as $el) {
          // Only add existing Columns of param to query
          if (array_key_exists($el["key"], $cols)) {
            // escape keys and values
            $keys[] = DB::getInstance()->getConnection()->real_escape_string($el["key"]);
            $vals[] = is_null($el["value"]) ? NULL : DB::getInstance()->getConnection()->real_escape_string($el["value"]);
          }
        }
        // --- Operation CREATE
        // Build Query
        $query = "INSERT INTO ".$tablename." (".implode(",", $keys).") VALUES (".RequestHandler::implodeWithNULLVals($vals).");";
        $res = DB::getInstance()->getConnection()->query($query);
        $newElementID = DB::getInstance()->getConnection()->insert_id;

        // Execute IN-Script, but only when Insert was successful 
        if ($SM->getID() > 0 && $newElementID <> 0) {
          $script = $SM->getINScript($SM->getEntryPoint());
          // Refresh row (add ID)
          $pri_cols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
          $param["row"][$pri_cols[0]] = (string)$newElementID;          
          // IN-Script          
          $tmp_script_res = $SM->executeScript($script, $param);
          // Append the ID from new Element
          $tmp_script_res["element_id"] = $newElementID;
          $script_result[] = $tmp_script_res;          
        } else {
          // No Statemachine
          $script_result[0]["element_id"] = $newElementID;
          // ErrorHandling
          if ($newElementID == 0) {
            $script_result[0]["errormsg"] = DB::getInstance()->getConnection()->error;
          }
        }

      }
      // Return
      return json_encode($script_result);
    }
    //================================== READ
    public function read($param) {
      // Parameters and default values
      $tablename = $param["table"];
      $select = isset($param["select"]) ? $param["select"] : "*";
      $where = isset($param["where"]) ? $param["where"] : "";
      $filter = isset($param["filter"]) ? $param["filter"] : "";
      $orderby = isset($param["orderby"]) ? $param["orderby"] : "";
      $ascdesc = isset($param["ascdesc"]) ? $param["ascdesc"] : "";
      $joins = isset($param["join"]) ? $param["join"] : array();
      $limitStart = isset($param["limitStart"]) ? $param["limitStart"] : 0;
      $limitSize = isset($param["limitSize"]) ? $param["limitSize"] : 1000;

      // check values
      if (!is_int($limitSize)) die("Limit-Size is no integer!");
      if (!is_int($limitStart)) die("Limit-Start is no integer!");
      if (!RequestHandler::checkString($tablename)) die("Tablename is invalid (only A-z, 0-9 and _)!");

      //--- ORDER BY
      $ascdesc = strtolower(trim($ascdesc));
      if ($ascdesc == "asc" || $ascdesc == "") {
        $ascdesc == "ASC";
      } elseif ($ascdesc == "desc")
        $ascdesc == "DESC";
      else
        die("AscDesc has no valid value (value has to be empty, ASC or DESC)!");

      if (trim($orderby) <> "")
        $sql_orderby = " ORDER BY a.".$orderby." ".$ascdesc;
      else
        $sql_orderby = " "; // ORDER BY replacer_id DESC";

      //--- LIMIT
      $limit = " LIMIT ".$limitStart.",".$limitSize;

      //--- JOINS
      $join_from = $tablename." AS a"; // if there is no join
      $sel = array();
      $sel_raw = array();
      $sel_str = "";
      if (count($joins) > 0) {
        // Multi-join
        for ($i=0;$i<count($joins);$i++) {
          $substCol = $joins[$i]["col_subst"];
          // The FROM Part
          $join_from .= " LEFT JOIN ".$joins[$i]["table"]." AS t$i ON ".
            "t$i.".$joins[$i]["col_id"]."= a.".$joins[$i]["replace"];
          // The SELECT Part
          if (strpos($substCol, '(')) {
            // Check if contains a function parenthesis, then handle differently
            $sel[] = $substCol." AS '".$joins[$i]["replace"]."'";
            $sel_raw[] = $substCol; // This is only for the filter later
          }
          else {
            // No concat function involved
            $sel[] = "t$i.".$substCol." AS '".$joins[$i]["replace"]."'";
            $sel_raw[] = "t$i.".$substCol; // This is only for the filter later
          }          
        }
        $sel_str = ",".implode(",", $sel);
      }

      //--- WHERE (SEARCH / Filter)
      if ($where <> "" && $filter == "") {
        $where = " WHERE ".$where;
      }
      else if ($filter <> "") {
        // Get columns from the table
        $res = DB::getInstance()->getConnection()->query("SHOW COLUMNS FROM $tablename;");
        $k = [];
        while ($row = $res->fetch_array()) {
          $k[] = $row[0];
        }
        $k = array_merge($k, $sel_raw); // Additional JOIN-columns     
        // xxx LIKE = '%".$param["filter"]."%' OR yyy LIKE '%'
        $q_str = "";
        foreach ($k as $key) {
          $prefix = "";
          // if no "." in string and no function in key then refer to first table
          if (strpos($key, ".") === FALSE && strpos($key, '(') === FALSE)
            $prefix = "a.";
          $q_str .= " ".$prefix.$key." LIKE '%$filter%' OR ";
        }
        // Remove last 'OR '
        $q_str = substr($q_str, 0, -3);
        // Build WHERE String
        if ($where == '')
          $where = " WHERE $q_str";
        else
          $where = " WHERE $where AND ($q_str)";
        //$where = " WHERE ".$q_str;
      }

      //--- SELECT + Concat final query
      if ($select <> '*')
        $query = "SELECT ".$select." FROM ".$join_from.$where.$sql_orderby.$limit.";";
      else
        $query = "SELECT a.*".$sel_str." FROM ".$join_from.$where.$sql_orderby.$limit.";";
      // Clean up a bit
      $query = str_replace("  ", " ", $query);
      
      //for debugging
      /*
      if (strpos($query, 'COUNT'))
        file_put_contents('log-read-cmd.txt', time().":\n".$query."\n\n");
      */
      
      $res = DB::getInstance()->getConnection()->query($query);
      // Return result as JSON
      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      // Primary Columns
      $tablename = $param["table"];
      $pCols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
      // Build query
      $update = $this->buildSQLUpdatePart(array_keys($param["row"]), $pCols, $param["row"], $tablename);
      $where = RequestHandler::buildSQLWherePart($pCols, $param["row"]);
      $query = "UPDATE ".$tablename." SET ".$update." WHERE ".$where.";";
      $res = DB::getInstance()->getConnection()->query($query);
      // Check if rows where updated
      $success = false;
      if(DB::getInstance()->getConnection()->affected_rows >= 0){
      	$success = true;
      }
      // Output
      return $success ? "1" : "0";
    }
    //================================== DELETE
    public function delete($param) {
      // Primary Columns
      $tablename = $param["table"];
      $pCols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
      // Build query
      $where = RequestHandler::buildSQLWherePart($pCols, $param["row"]);
      $query = "DELETE FROM ".$tablename." WHERE ".$where.";";
      $res = DB::getInstance()->getConnection()->query($query);
      // Check if rows where updated
      $success = false;
      if(DB::getInstance()->getConnection()->affected_rows >= 0){
      	$success = true;
      }
      // Output
      return $success ? "1" : "0";
    }
    //----------------------------------
    public function getFormData($param) {
      // Inputs
      $tablename = $param["table"];
      // TODO: Make function::::::::::::::::::::::::
      // Find correct state_id with the inputs
      $pCols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
      $where = RequestHandler::buildSQLWherePart($pCols, $param["row"]);
      // get StateID from the Element itself
      $query = "SELECT state_id FROM ".DB_NAME.".$tablename WHERE ".$where.";";
      $res = DB::getInstance()->getConnection()->query($query);
      $r = $res->fetch_array();
      $stateID = (int)$r[0];

      $SM = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      // Check if has state machine ?
      if ($SM->getID() > 0) {
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
      $SM = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      // StateMachine ?
      if ($SM->getID() > 0) {
        // Has StateMachine
        $r = $SM->getCreateFormByTablename();
        if (empty($r)) $r = "1"; // default: allow editing (if there are no rules set)
      } else {
        // Has NO StateMachine -> Return standard form
        $cols = RequestHandler::getColumnsByTablename(json_decode(RequestHandler::init(), true), $tablename);
        $excludeKeys = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
        $r = $SM->getBasicFormDataByColumns($cols, $excludeKeys);
      }
      return $r;
    }
    //==== Statemachine -> substitue StateID of a Table with Statemachine
    public function getNextStates($param) {
      // Inputs
      $row = $param["row"];
      $tablename = $param["table"];

      // Find correct state_id with the inputs
      $pCols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
      $where = RequestHandler::buildSQLWherePart($pCols, $param["row"]);

      // get StateID from the Element itself
      $query = "SELECT state_id FROM ".DB_NAME.".$tablename WHERE ".$where.";";
      $res = DB::getInstance()->getConnection()->query($query);
      $r = $res->fetch_array();
      $stateID = (int)$r[0];

      // execute query
      $SE = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      $res = $SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function makeTransition($param) {
      // INPUT [table, ElementID, (next)state_id]
      // Get the next ID for the next State
      @$nextStateID = $param["row"]["state_id"];
      @$tablename = $param["table"];
      // Get Primary Column
      @$pricols = RequestHandler::getPrimaryColByTablename($this->config, $tablename);
      @$pricol = $pricols[0]; // there should always be only 1 primary column for the identification of element
      @$ElementID = $param["row"][$pricol];

      // Load all data from Element
      $existingData = $this->readRow($tablename, $pricol, $ElementID);
      // overide existing data
      foreach ($param['row'] as $key => $value) {
        $existingData[$key] = $value;
      }
      $param["row"] = $existingData;

      // Statemachine
      $SE = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      // get ActStateID by Element ID
      $actstateObj = $SE->getActState($ElementID, $pricol);
      // No Element found in Database
      if (count($actstateObj) == 0) {
        echo "Element not found";
        return false;
      }      
      $actstateID = $actstateObj[0]["id"];
      // check if transition is allowed
      $transPossible = $SE->checkTransition($actstateID, $nextStateID);
      if ($transPossible) {
        // Execute Scripts
        $feedbackMsgs = array(); // prepare empty array
        //---[1]- Execute [OUT] Script
        $out_script = $SE->getOUTScript($actstateID); // from source state
        $res = $SE->executeScript($out_script, $param);
        if (!$res['allow_transition']) {
          $feedbackMsgs[] = $res;
          return json_encode($feedbackMsgs);
        } else {
          $feedbackMsgs[] = $res;
        }
        //---[2]- Execute [Transition] Script
        $tr_script = $SE->getTransitionScript($actstateID, $nextStateID);
        $res = $SE->executeScript($tr_script, $param);
        if (!$res["allow_transition"]) {
          $feedbackMsgs[] = $res;
          return json_encode($feedbackMsgs);
        } else {
          $feedbackMsgs[] = $res;
        }

        // Update all rows
        $this->update($param); 

        //---[3]- Execute IN Script
        $in_script = $SE->getINScript($nextStateID); // from target state
        $res = $SE->executeScript($in_script, $param);
        $res["allow_transition"] = true;
        $feedbackMsgs[] = $res;
        
        // UPDATE StateID only
        //$query = "UPDATE $this->db_name.".$this->table." SET state_id = $stateID WHERE $primaryIDColName = $ElementID;";
        //$this->db->query($query);
        // Return
        echo json_encode($feedbackMsgs);
        exit;

      } else {
        echo "Transition not possible!";
        exit;
      }
    }
    public function getStates($param) {
      $tablename = $param["table"];
      $SE = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      $res = $SE->getStates();
      return json_encode($res);
    }
    public function smGetLinks($param) {
      $tablename = $param["table"];
      $SE = new StateMachine(DB::getInstance()->getConnection(), DB_NAME, $tablename);
      $res = $SE->getLinks();
      return json_encode($res);
    }
    public function getFile($param) {
      // Download File from Server
      
      // Inputs
      $filename = strtolower($param["name"]);
      $filepath = strtolower($param["path"]);
      $tmp_parts = explode(".", strtolower($param["name"]));
      $filetype = end($tmp_parts);

      // Whitelists
      $whitelist_paths = WHITELIST_PATHS;
      $whitelist_types = WHITELIST_TYPES;

      if (in_array($filepath, $whitelist_paths) && in_array($filetype, $whitelist_types)) {
        //echo "path and type in whitelist\n";
        // File exists
        $filepathcomplete = $filepath . $filename;
        //echo "Filepath: ".$filepathcomplete."\n";
        if (file_exists($filepathcomplete)) {
          //echo "File exists\n";
          $filecontent = file_get_contents($filepathcomplete);
          echo $filecontent;
        } else 
          die("error");
      } else
        die("error");
    }
  }
?>