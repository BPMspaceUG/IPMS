<?php
  // Includes
  $file_DB = __DIR__."/DatabaseHandler.inc.php";
  if (file_exists($file_DB)) include_once($file_DB);
  $file_SM = __DIR__."/StateMachine.inc.php";
  if (file_exists($file_SM)) include_once($file_SM);


  class Config {
    // In this class the configuration should be loaded in the constructor once
    // there should be a method for getting easy the primary column by tablename
    // also other helper functions
    // i.e.

    public static function getConfig() {
      global $config_tables_json;
      return $config_tables_json;
    }
    public static function getColsByTablename($tablename, $data = null) {
      $tablename = strtolower($tablename);

      if (is_null($data))
        $data = json_decode(Config::getConfig(), true);

      $cols = $data[$tablename]["columns"];      
      return $cols;
    }
    public static function getColNamesByTablename($tablename) {
      // = string[]
    }
    public static function getPrimaryColsByTablename($tablename, $data = null) {
      $res = array();
      $cols = Config::getColsByTablename($tablename, $data);
      // Find primary columns
      foreach ($cols as $col) {
        if ($col["COLUMN_KEY"] == "PRI")
          $res[] = $col["COLUMN_NAME"];
      }
      return $res;
    }
    public static function getPrimaryColNameByTablename($tablename) {
      $cols = Config::getPrimaryColsByTablename($tablename);
      return $cols[0];
    }
    public static function doesTableExist($tablename) {
      $result = false;
      $tablename = strtolower($tablename); // always lowercase
      $config = json_decode(Config::getConfig(), true);
      $result = (array_key_exists($tablename, $config));
      return $result;
    }
    public static function doesColExistInTable($tablename, $colname) {
      //= boolean
    }
    public static function isValidTablename($tablename) {
      // check if contains only vaild letters
      return (!preg_match('/[^A-Za-z0-9_]/', $tablename));
    }
    public static function isValidColname($colname) {
      // = boolean // check if contains only vaild letters
      return (!preg_match('/[^A-Za-z0-9_]/', $colname));
    }
  }


  class RequestHandler {

    private static function buildSQLUpdatePart($cols, $primarycols, $rows, $tablename, $existing_cols) {
      $update = "";
      // Convert everything to lowercase
      $primarycols = array_map('strtolower', $primarycols);
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
              $update .= $col."='".$rows[$col]."'";
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
    // TODO: Obsolete
    private static function checkString($string) {
      return (!preg_match('/[^A-Za-z0-9_]/', $string));
    }
    // -------------------------------------------------- Database Access Methods
    private function readRowByPrimaryID($tablename, $ElementID) {
      $primColName = Config::getPrimaryColNameByTablename($tablename);

      $result = NULL;
      $pdo = DB::getInstance()->getConnection();
      $stmt = $pdo->prepare("SELECT * FROM $tablename WHERE $primColName = ?");
      $stmt->execute(array($ElementID));   
      while($row = $stmt->fetch()) {
        $result = $row;
      }
      return $result;
    }
    private function getActualStateByRow($tablename, $row) {    
      $result = -1; // default

      $pkColName = Config::getPrimaryColNameByTablename($tablename);
      $id = (int)$row[$pkColName];
      $pdo = DB::getInstance()->getConnection();
      $stmt = $pdo->prepare("SELECT state_id FROM $tablename WHERE $pkColName = ? LIMIT 1");
      $stmt->execute(array($id));
      $row = $stmt->fetch();

      $result = $row['state_id'];
      return $result;
    }


    //======= INIT (Load the configuration to the client)
    // TODO: Rename to loadConfig or make completely obsolete
    public static function init() {
      return Config::getConfig();
    }

    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      $row = $param["row"];
      // Check Parameter
      if (!Config::isValidTablename($tablename)) die('Invalid Tablename!');
      if (!Config::doesTableExist($tablename)) die('Table does not exist!');

      // New State Machine
      $pdo = DB::getInstance()->getConnection();
      $SM = new StateMachine($pdo, $tablename);
      $script_result = array();

      //--- Has StateMachine? then execute Scripts
      if ($SM->getID() > 0) {
        // Override/Set EP
        $EP = $SM->getEntryPoint();
        $param["row"]["state_id"] = $EP;
        // Execute Transition Script
        $script = $SM->getTransitionScriptCreate();
        $script_result[] = $SM->executeScript($script, $param);
      }
      else {
        // NO StateMachine => goto next step
        $script_result[] = array("allow_transition" => true);
      }

      //--- If allow transition then Create
      if (@$script_result[0]["allow_transition"] == true) {
      	// Reload row, because maybe the TransitionScript has changed some params
        $keys = array();
        $vals = array();
        $x = RequestHandler::splitQuery($row);
        $cols = Config::getColsByTablename($tablename);
        foreach ($x as $el) {
          // Only add existing Columns of param to query
          if (array_key_exists($el["key"], $cols)) {
            // escape keys and values
            $keys[] = $el["key"];
            $vals[] = $el["value"];
          }
        }

        // --- Operation CREATE
        // Build Query
        $strKeys = implode(",", $keys);
        $strVals = implode(",", array_fill(0, count($keys), '?'));
        $stmt = $pdo->prepare("INSERT INTO $tablename ($strKeys) VALUES ($strVals)");
        $stmt->execute($vals);
        $newElementID = $pdo->lastInsertId();

        // Execute IN-Script, but only when Insert was successful and Statemachine exists
        if (($SM->getID() > 0) && ($newElementID > 0)) {
          $script = $SM->getINScript($SM->getEntryPoint());
          // Refresh row (add ID)
          $pcol = Config::getPrimaryColNameByTablename($tablename);
          $row[$pcol] = (string)$newElementID;
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
            $script_result[0]["errormsg"] = $stmt->errorInfo()[2];
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

      // Check Parameter
      if (!Config::isValidTablename($tablename)) die('Invalid Tablename!');
      if (!Config::doesTableExist($tablename)) die('Table does not exist!');
      if (!is_int($limitSize)) die("Limit-Size is no integer!");
      if (!is_int($limitStart)) die("Limit-Start is no integer!");

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
        $stmt = DB::getInstance()->getConnection()->prepare("SHOW COLUMNS FROM $tablename");
        $k = [];
        $stmt->execute();
        while ($row = $stmt->fetch()) {
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
      }

      //--- SELECT
      if ($select <> '*')
        $query = "SELECT ".$select." FROM ".$join_from.$where.$sql_orderby.$limit.";";
      else
        $query = "SELECT a.*".$sel_str." FROM ".$join_from.$where.$sql_orderby.$limit.";";

      // Clean up a bit
      $query = str_replace("  ", " ", $query);


      // Execute & Fetch
      $result = array();
      $pdo = DB::getInstance()->getConnection();
      $stmt = $pdo->prepare($query);
      if ($stmt->execute()) {
        while($row = $stmt->fetch(PDO::FETCH_NAMED)) {
          $result[] = $row;
        }
      } else {
        echo $stmt->queryString."<br />";
        var_dump($stmt->errorInfo());
      }

      // Return result as JSON
      return json_encode($result);
    }
    //================================== UPDATE
    public function update($param) {
       // Parameter
      $tablename = $param["table"];
      $row = $param["row"];
      // Check Parameter
      if (!Config::isValidTablename($tablename)) die('Invalid Tablename!');
      if (!Config::doesTableExist($tablename)) die('Table does not exist!');
      // Extract relevant Info via Config     
      $pcol = Config::getPrimaryColNameByTablename($tablename);
      $id = (int)$row[$pcol];
      // Build query TODO: Remove!!
      $update = RequestHandler::buildSQLUpdatePart(array_keys($row), array($pcol), $row, $tablename, Config::getColsByTablename($tablename));
      // Execute on Database
      $success = false;
      $pdo = DB::getInstance()->getConnection();
      $stmt = $pdo->prepare("UPDATE $tablename SET $update WHERE $pcol = ?");
      if ($stmt->execute(array($id))) {
        // Check if rows where updated
        $success = ($stmt->rowCount() > 0);
      } else {
        echo $stmt->queryString."<br />";
        var_dump($stmt->errorInfo());
      }            
      // Output
      return $success ? "1" : "0";
    }
    //================================== DELETE
    public function delete($param) {
      // Parameter
      $tablename = $param["table"];
      $row = $param["row"];
      // Check Parameter
      if (!Config::isValidTablename($tablename)) die('Invalid Tablename!');
      if (!Config::doesTableExist($tablename)) die('Table does not exist!');
      // Extract relevant Info via Config
      $pcol = Config::getPrimaryColNameByTablename($tablename);
      $id = (int)$row[$pcol];
      // Execute on Database
      $success = false;
      $pdo = DB::getInstance()->getConnection();
      $stmt = $pdo->prepare("DELETE FROM $tablename WHERE $pcol = ?");
      $stmt->execute(array($id));
      // Check if rows where updated
      $success = ($pdo->rowCount() > 0);
      // Output
      return $success ? "1" : "0";
    }



    //----------------------------------

    public function getFormData($param) {
      // Inputs
      $tablename = $param["table"];
      $row =  $param['row'];

      $SM = new StateMachine(DB::getInstance()->getConnection(), $tablename);
      // Check if has state machine ?
      if ($SM->getID() > 0) {
        $stateID = $this->getActualStateByRow($tablename, $row);
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
      $SM = new StateMachine(DB::getInstance()->getConnection(), $tablename);
      // StateMachine ?
      if ($SM->getID() > 0) {
        // Has StateMachine
        $r = $SM->getCreateFormByTablename();
        if (empty($r)) $r = "1"; // default: allow editing (if there are no rules set)
      } else {
        // Has NO StateMachine -> Return standard form
        $cols = Config::getColsByTablename($tablename);
        $excludeKeys = array(Config::getPrimaryColNameByTablename($tablename));
        $r = $SM->getBasicFormDataByColumns($cols, $excludeKeys);
      }
      return $r;
    }
    public function getNextStates($param) {
      // Inputs
      $tablename = $param["table"];
      $stateID = $this->getActualStateByRow($tablename, $param['row']);

      // execute query
      $SE = new StateMachine(DB::getInstance()->getConnection(), $tablename);
      $res = $SE->getNextStates($stateID);
      return json_encode($res);
    }
    public function makeTransition($param) {
      // INPUT [table, ElementID, (next)state_id]
      // Get the next ID for the next State
      $nextStateID = $param["row"]["state_id"];
      $tablename = $param["table"];

      // Get Primary Column
      $pcol = Config::getPrimaryColNameByTablename($tablename);
      $ElementID = $param["row"][$pcol];

      // Load all data from Element
      $existingData = $this->readRowByPrimaryID($tablename, $ElementID);
      // overide existing data
      foreach ($param['row'] as $key => $value) {
        $existingData[$key] = $value;
      }
      $param["row"] = $existingData;

      // Statemachine
      $SE = new StateMachine(DB::getInstance()->getConnection(), $tablename);
      // get ActStateID by Element ID
      $actstateID = $this->getActualStateByRow($tablename, $param['row']);

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
        
        echo json_encode($feedbackMsgs);
        exit;

      } else {
        echo "Transition not possible!";
        exit;
      }
    }
    public function getStates($param) {
      $tablename = $param["table"];
      $SE = new StateMachine(DB::getInstance()->getConnection(), $tablename);
      $res = $SE->getStates();
      return json_encode($res);
    }
    public function smGetLinks($param) {
      $tablename = $param["table"];
      $SE = new StateMachine(DB::getInstance()->getConnection(), $tablename);
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