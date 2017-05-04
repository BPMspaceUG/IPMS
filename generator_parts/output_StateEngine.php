<?php
  /****************************
    S T A T E     E N G I N E  
  ****************************/
  class StateEngine {
    private $db;
    // tables
    private $table = 'connections'; // root element
    private $table_states = 'state';
    private $table_rules = 'state_rules';
    // columns
    private $colname_rootID = 'id';
    private $colname_stateID = 'state_id_ext';
    
    private $colname_stateID_at_TblStates = 'state_id';
    private $colname_stateName = 'name';
    private $colname_from = ' state_id_FROM';
    private $colname_to = 'state_id_TO';
    
    public function __construct($db, $tbl_root, $tbl_states, $tbl_rules, $col_rootID, $col_stateID, $colname_stateID_at_TblStates) {
      // set initial variables
      $this->db = $db;
      $this->table = $tbl_root;
      $this->table_states = $tbl_states;
      $this->table_rules = $tbl_rules;
      $this->colname_rootID = $col_rootID;
      $this->colname_stateID = $col_stateID;
      $this->colname_stateID_at_TblStates = $colname_stateID_at_TblStates;
    }
    private function getResultArray($result) {
      $results_array = array();
      while ($row = $result->fetch_assoc()) {
        $results_array[] = $row;
      }
      return $results_array;
    }
    public function getActState($id) {
      settype($id, 'integer');
      $query = "SELECT a.".$this->colname_stateID." AS 'id', b.".
        $this->colname_stateName." AS 'name' FROM ".$this->table." AS a INNER JOIN ".
        $this->table_states." AS b ON a.".$this->colname_stateID."=b.".$this->colname_stateID_at_TblStates.
        " WHERE ".$this->colname_rootID." = $id;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }    
	public function getStates() {
        $query = "SELECT name FROM ".$this->table_states; 
      $res = $this->db->query($query);
	  //echo json_encode($res);
      return $this->getResultArray($res);
    }    
    public function getStateAsObject($stateid) {
      settype($id, 'integer');
      $query = "SELECT ".$this->colname_stateID_at_TblStates." AS 'id', ".
        $this->colname_stateName." AS 'name' FROM ".$this->table_states.
        " WHERE ".$this->colname_stateID_at_TblStates." = $stateid;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getNextStates($actstate) {
      settype($actstate, 'integer');
      $query = "SELECT a.".$this->colname_to." AS 'id', b.".
        $this->colname_stateName." AS 'name' FROM ".$this->table_rules." AS a INNER JOIN ".
        $this->table_states." AS b ON a.".$this->colname_to."=b.".$this->colname_stateID_at_TblStates.
        " WHERE ".$this->colname_from." = $actstate;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    
    public function setState($ElementID, $stateID) {

      // get actual state from element
      $actstateObj = $this->getActState($ElementID);
      if (count($actstateObj) == 0) return false;
      $actstateID = $actstateObj[0]["id"];
      $db = $this->db;
      $roottable = $this->table;

      // check transition, if allowed
      $trans = $this->checkTransition($actstateID, $stateID);
      // check if transition is possible
      if ($trans) {        
        $newstateObj = $this->getStateAsObject($stateID);
        $scripts = $this->getTransitionScripts($actstateID, $stateID);
        
        // Execute all scripts from database at transistion
        foreach ($scripts as $script) {
          // Set path to scripts
          $scriptpath = "functions/".$script["transistionScript"]; 

          // -----------> Standard Result
          $script_result = array(
            "allow_transition" => true,
            "show_message" => false,
            "message" => ""
          );
          
          // If script exists then load it
          if (trim($scriptpath) != "functions/" && file_exists($scriptpath))
            include_once($scriptpath);

          // update state in DB, when plugin says yes
          if (@$script_result["allow_transition"] == true) {
            $query = "UPDATE ".$this->table." SET ".$this->colname_stateID." = ".$stateID.
              " WHERE ".$this->colname_rootID." = ".$ElementID.";";
            $res = $this->db->query($query);
          }

          // Return
          return json_encode($script_result);
        }
        
      }
      return false; // exit
    }
    public function checkTransition($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT * FROM ".$this->table_rules." WHERE ".$this->colname_from." = $fromID ".
        "AND ".$this->colname_to." = $toID;";
      $res = $this->db->query($query);
      $cnt = $res->num_rows;
      return ($cnt > 0);
    }
    public function getTransitionScripts($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT transistionScript FROM ".$this->table_rules." WHERE ".
      "sqms_state_id_FROM = $fromID AND sqms_state_id_TO = $toID;";
      $return = array();
      $res = $this->db->query($query);
      $return = $this->getResultArray($res);
      return $return;
    }
  }
?>