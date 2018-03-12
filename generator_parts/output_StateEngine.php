<?php
  class StateMachine {
    // Variables
    private $db;
    private $ID = -1;
    private $db_name = "";
    private $table = "";
    private $query_log = "";

    public function __construct($db, $db_name, $tablename = "") {
      $this->db = $db;
      $this->db_name = $db_name;
      $this->table = $tablename;
      if ($this->table != "")
      	$this->ID = $this->getSMIDByTablename($tablename);
    }
    private function log($text) {
      $this->query_log .= $text."\n\n";
    }
    public function getQueryLog() {
      return $this->query_log;
    }
    private function getResultArray($rowObj) {
      $res = array();
      if (!$rowObj) return $res; // exit if query failed
      while ($row = $rowObj->fetch_assoc())
        $res[] = $row;
      return $res;
    }
    private function getSMIDByTablename($tablename) {
    	// Return newest statemachine (MAX)
      $query = "SELECT MAX(id) AS 'id' FROM `$this->db_name`.state_machines WHERE tablename = '$tablename';";
      $res = $this->db->query($query);
     	$r = $this->getResultArray($res);
      if (empty($r)) return -1; // statemachine does not exist
      return (int)$r[0]['id'];
    }
    private function getStateAsObject($stateid) {
      settype($id, 'integer');
      $query = "SELECT state_id AS 'id', name AS 'name' FROM $this->db_name.state WHERE state_id = $stateid;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function createDatabaseStructure() {
    	$db_name = $this->db_name;
    	// ------------------------------- T A B L E S
    	//---- Create Table 'state_machines'
		  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state_machines` (
			  `id` bigint(20) NOT NULL AUTO_INCREMENT,
			  `tablename` varchar(45) DEFAULT NULL,
			  PRIMARY KEY (`id`)
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
		  $this->db->query($query);
      //$this->log($query); 

      // Add Form_data column to state_machines if not exists
      $query = "SHOW COLUMNS FROM  `$db_name`.`state_machines`;";
      $res = $this->db->query($query);
      $rows = $this->getResultArray($res);
      // Build one string with all columnnames
      $columnstr = "";
      foreach ($rows as $row) $columnstr .= $row["Field"];
      // Column [form_data] does not yet exist
      if (strpos($columnstr, "form_data") === FALSE) {
        $query = "ALTER TABLE `$db_name`.`state_machines` ADD COLUMN `form_data` LONGTEXT NULL AFTER `tablename`;";
        $res = $this->db->query($query);
        //$this->log($query);
      }
      // Column [form_data] does not yet exist
      if (strpos($columnstr, "transition_script") === FALSE) {
        $query = "ALTER TABLE `$db_name`.`state_machines` ADD COLUMN `transition_script` LONGTEXT NULL AFTER `tablename`;";
        $res = $this->db->query($query);
        //$this->log($query);
      }

		  //---- Create Table 'state'
		  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state` (
			  `state_id` bigint(20) NOT NULL AUTO_INCREMENT,
			  `name` varchar(45) DEFAULT NULL,
			  `form_data` longtext,
			  `entrypoint` tinyint(1) NOT NULL DEFAULT '0',
			  `statemachine_id` bigint(20) NOT NULL DEFAULT '1',
        `script_IN` longtext,
        `script_OUT` longtext,
			  PRIMARY KEY (`state_id`)
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
		  $this->db->query($query);
      //$this->log($query); 

      // Add columns script_IN and script_OUT
      $query = "SHOW COLUMNS FROM  `$db_name`.`state`;";
      $res = $this->db->query($query);
      $rows = $this->getResultArray($res);
      // Build one string with all columnnames
      $columnstr = "";
      foreach ($rows as $row) $columnstr .= $row["Field"];
      // Column [script_IN] does not yet exist
      if (strpos($columnstr, "script_IN") === FALSE) {
        $query = "ALTER TABLE `$db_name`.`state` ADD COLUMN `script_IN` LONGTEXT NULL AFTER `statemachine_id`;";
        $res = $this->db->query($query);
        //$this->log($query); 
      }
      // Column [script_OUT] does not yet exist
      if (strpos($columnstr, "script_OUT") === FALSE) {
        $query = "ALTER TABLE `$db_name`.`state` ADD COLUMN `script_OUT` LONGTEXT NULL AFTER `script_IN`;";
        $res = $this->db->query($query);
        //$this->log($query); 
      }

		  // Create Table 'state_rules'
		  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state_rules` (
			  `state_rules_id` bigint(20) NOT NULL AUTO_INCREMENT,
			  `state_id_FROM` bigint(20) NOT NULL,
			  `state_id_TO` bigint(20) NOT NULL,
			  `transition_script` longtext,
			  PRIMARY KEY (`state_rules_id`)
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
		  $this->db->query($query);
      //$this->log($query); 
			// ------------------------------- F O R E I G N - K E Y S
		  // 'state_rules'
		  $query = "ALTER TABLE `$db_name`.`state_rules` ".
		    "ADD INDEX `state_id_fk1_idx` (`state_id_FROM` ASC), ".
		    "ADD INDEX `state_id_fk_to_idx` (`state_id_TO` ASC);";
		  $this->db->query($query);
      //$this->log($query); 
		  $query = "ALTER TABLE `$db_name`.`state_rules` ".
		  	"ADD CONSTRAINT `state_id_fk_from` FOREIGN KEY (`state_id_FROM`) ".
		  	"REFERENCES `$db_name`.`state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION, ".
		  	"ADD CONSTRAINT `state_id_fk_to` FOREIGN KEY (`state_id_TO`) ".
		  	"REFERENCES `$db_name`.`state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
		  $this->db->query($query);
      //$this->log($query); 
		  // 'state'
		  $query = "ALTER TABLE `$db_name`.`state` ADD INDEX `state_machine_id_fk` (`statemachine_id` ASC);";
		  $this->db->query($query);
      //$this->log($query); 

		  $query = "ALTER TABLE `$db_name`.`state` ".
		  	"ADD CONSTRAINT `state_machine_id_fk` FOREIGN KEY (`statemachine_id`) ".
		  	"REFERENCES `$db_name`.`state_machines` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
		  $this->db->query($query);
      //$this->log($query); 
		  // TODO: Foreign Key for [state <-> state_machines]
    }    
    private function createNewState($statename, $isEP) {
    	$db_name = $this->db_name;
    	$SMID = $this->ID;
    	// build query
    	$query = "INSERT INTO `$db_name`.`state` (`name`, `form_data`, `statemachine_id`, `entrypoint`) ".
      	"VALUES ('$statename', '', $SMID, $isEP);";
      $this->db->query($query);
      $this->log($query); 
      return $this->db->insert_id;
    }
    private function createTransition($from, $to) {
      $db_name = $this->db_name;
      $query = "INSERT INTO $db_name.state_rules (state_id_FROM, state_id_TO) VALUES ($from, $to);";
      $this->db->query($query);
      $this->log($query);
      return $this->db->insert_id;
    }
    public function createBasicStateMachine($tablename) {
    	$db_name = $this->db_name;
      // check if a statemachine already exists for this table
      $ID = $this->getSMIDByTablename($tablename);
      if ($ID > 0) return $ID; // SM already exists

      $this->log("-- [Start] Creating a Basic StateMachine for Table '$tablename'"); 

      // Insert new statemachine for a table
      $query = "INSERT INTO `$db_name`.`state_machines` (`tablename`) VALUES ('$tablename');";
      $this->db->query($query);
      $this->log($query); 
      $ID = $this->db->insert_id; // returns the ID for the created SM
      $this->ID = $ID;

      // Insert states (new, active, inactive)
      $ID_new = $this->createNewState('new ('.$tablename.')', 1);
      $ID_active = $this->createNewState('active', 0);
      $ID_update = $this->createNewState('update', 0);
      $ID_inactive = $this->createNewState('inactive', 0);

      // Insert rules (new -> active, active -> inactive)
      $this->createTransition($ID_new, $ID_new);
      $this->createTransition($ID_active, $ID_active);
      $this->createTransition($ID_update, $ID_update);
      $this->createTransition($ID_new, $ID_active);
      $this->createTransition($ID_active, $ID_update);
      $this->createTransition($ID_update, $ID_active);
      $this->createTransition($ID_active, $ID_inactive);

      $this->log("-- [END] Basic StateMachine created for Table '$tablename'"); 
      return $ID;
    }
    public function getBasicFormDataByColumns($columns) {
      // possibilities = [RO, RW, HI]
      $res = array();
      // Loop each column
      for ($i=0;$i<count($columns);$i++) {
      	// if coumn is state_id then Hide it
      	if ($columns[$i] == 'state_id')
					$res[$columns[$i]] = "HI";
      	else      		
        	$res[$columns[$i]] = "RW"; // default: Read write
      }
      return $res;
    }
    public function getFormDataByStateID($StateID) {
      if (!($this->ID > 0)) return "";
      settype($StateID, 'integer');
      $query = "SELECT form_data AS 'fd' FROM $this->db_name.state ".
        "WHERE statemachine_id = $this->ID AND state_id = $StateID;";
      $res = $this->db->query($query);
      $r = $this->getResultArray($res);
      if ($r)
        return $r[0]['fd'];
      else
        return '';
    }
    public function getCreateFormByTablename() {
      if (!($this->ID > 0)) return "";
      settype($StateID, 'integer');
      $query = "SELECT form_data AS 'fd' FROM $this->db_name.`state_machines` ".
        "WHERE id = $this->ID;";
      $res = $this->db->query($query);
      $r = $this->getResultArray($res);
      if ($r)
        return $r[0]['fd'];
      else
        return '';
    }
    public function getID() {
    	return $this->ID;
    }
    public function getStates() {
      $query = "SELECT s.state_id AS 'id', s.name, s.entrypoint, (".
        "SELECT COUNT(*) FROM $this->db_name.$this->table AS x WHERE x.state_id = s.state_id) as 'NrOfTokens'".
        "FROM $this->db_name.state AS s WHERE s.statemachine_id = $this->ID;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getLinks() {
      $query = "SELECT state_id_FROM AS 'from', state_id_TO AS 'to' FROM $this->db_name.state_rules ".
               "WHERE state_id_FROM AND state_id_TO IN (SELECT state_id FROM $this->db_name.state WHERE statemachine_id = $this->ID);";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getEntryPoint() {
    	if (!($this->ID > 0)) return -1;
      $query = "SELECT state_id AS 'id' FROM $this->db_name.state ".
      	"WHERE entrypoint = 1 AND statemachine_id = $this->ID;";
      $res = $this->db->query($query);
      $r = $this->getResultArray($res);
      return (int)$r[0]['id'];
    }
    public function getNextStates($actStateID) {
      settype($actStateID, 'integer');
      $query = "SELECT a.state_id_TO AS 'id', b.name AS 'name' FROM $this->db_name.state_rules AS a ".
        "JOIN state AS b ON a.state_id_TO = b.state_id WHERE state_id_FROM = $actStateID;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getActState($id, $primaryIDColName) {
      settype($id, 'integer');
      $query = "SELECT a.state_id AS 'id', b.name AS 'name' FROM $this->db_name.".$this->table.
        " AS a INNER JOIN state AS b ON a.state_id = b.state_id WHERE $primaryIDColName = $id;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function executeScript($script, &$param = null) {
      // standard result
      $std_res = array("allow_transition" => true, "show_message" => false, "message" => "");
      // Check if script is not empty
      if (!empty($script)) {
        // Execute Script (WARNING -> eval = evil)
        eval($script);
        // check results, if no result => standard result
        if (empty($script_result))
          return $std_res;
        else
          return $script_result;
      }
      return $std_res;
    }
    public function setState($ElementID, $stateID, $primaryIDColName, &$param = null) {
      // get actual state from element
      $actstateObj = $this->getActState($ElementID, $primaryIDColName);
      if (count($actstateObj) == 0) return false;
      $actstateID = $actstateObj[0]["id"];
      // check transition (TODO: also check if allowed)
      $trans = $this->checkTransition($actstateID, $stateID);
      // if transition is possible
      if ($trans) {
        $newstateObj = $this->getStateAsObject($stateID);

        $result = array();

        // [1]- Execute [OUT] Script (Inverted Moore)
        $out_script = $this->getOUTScript($actstateID); // from source state
        $res = $this->executeScript($out_script, $param);
        if (!$res['allow_transition']) 
          return json_encode($res);
        else
          $result[] = $res;
        
        // [2]- Execute [Transition] Script (Mealy)
        $tr_script = $this->getTransitionScript($actstateID, $stateID);
        $res = $this->executeScript($tr_script, $param);
        if (!$res["allow_transition"])
          return json_encode($res);
        else
          $result[] = $res;

        // If all Scripts where successful, update row
        if ($res['allow_transition']){
          $query = "UPDATE $this->db_name.".$this->table." SET state_id = $stateID WHERE $primaryIDColName = $ElementID;";
          $this->db->query($query);

          // [3]- Execute IN Script (Moore)
          $in_script = $this->getINScript($stateID); // from target state
          $res = $this->executeScript($in_script, $param);
          $res["allow_transition"] = true;
          $result[] = $res;
        }

        return json_encode($result);

      }
      return false; // transition is not possible, because not wired in DB
    }
    public function checkTransition($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT * FROM $this->db_name.state_rules WHERE state_id_FROM=$fromID AND state_id_TO=$toID;";
      $res = $this->db->query($query);
      $cnt = $res->num_rows;
      return ($cnt > 0);
    }

    public function getTransitionScript($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT transition_script AS script FROM $this->db_name.state_rules WHERE ".
      "state_id_FROM = $fromID AND state_id_TO = $toID;";
      $res = $this->db->query($query);
      $script = $this->getResultArray($res);
      return $script[0]['script'];
    }
    public function getTransitionScriptCreate() {
      if (!($this->ID > 0)) return ""; // check for valid state machine
      $query = "SELECT transition_script AS script FROM $this->db_name.state_machines WHERE id = $this->ID;";
      $res = $this->db->query($query);
      $script = $this->getResultArray($res);
      return $script[0]['script'];
    }
    public function getINScript($StateID) {
      if (!($this->ID > 0)) return ""; // check for valid state machine
      $query = "SELECT script_IN AS script FROM $this->db_name.state WHERE state_id = $StateID;";
      $res = $this->db->query($query);
      $script = $this->getResultArray($res);
      return $script[0]['script'];
    }
    private function getOUTScript($StateID) {
      if (!($this->ID > 0)) return ""; // check for valid state machine
      $query = "SELECT script_OUT AS script FROM $this->db_name.state WHERE state_id = $StateID;";
      $res = $this->db->query($query);
      $script = $this->getResultArray($res);
      return $script[0]['script'];
    }

  }
?>