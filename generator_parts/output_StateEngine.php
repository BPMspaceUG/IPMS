<?php
  /****************************
    S T A T E     E N G I N E  
  ****************************/
  class StateEngine {
    // Variables
    private $db;
    private $ID;
    private $table;

    public function __construct($db, $tablename = "") {
      $this->db = $db;
      $this->table = $tablename;
      // get the ID by Tablename
      if ($tablename != "") {
        $this->ID = $this->getSMIDByTablename($tablename);
      }
    }

    private function getResultArray($result) {
      $results_array = array();
      while ($row = $result->fetch_assoc())
        $results_array[] = $row;
      return $results_array;
    }
    private function getSMIDByTablename($tablename) {
      $query = "SELECT id FROM state_machines WHERE tablename = '$tablename';";
      $res = $this->db->query($query);
      $r = $this->getResultArray($res);
      return (int)$r[0]['id'];
    }
    private function getStateAsObject($stateid) {
      settype($id, 'integer');
      $query = "SELECT state_id AS 'id', name AS 'name' FROM state WHERE state_id = $stateid;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }

    public function getStates() {
      $query = "SELECT state_id AS 'id', name, entrypoint FROM state WHERE statemachine_id = $this->ID;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getLinks() {
      $query = "SELECT state_id_FROM AS 'from', state_id_TO AS 'to' FROM state_rules ".
               "WHERE state_id_FROM AND state_id_TO IN (SELECT state_id FROM state WHERE statemachine_id = $this->ID);";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getEntryPoint() {
      $query = "SELECT state_id AS 'id' FROM state WHERE entrypoint = 1 AND statemachine_id = $this->ID;";
      $res = $this->db->query($query);
      $r = $this->getResultArray($res);
      return (int)$r[0]['id'];
    }
    public function getNextStates($actStateID) {
      settype($actStateID, 'integer');
      $query = "SELECT a.state_id_TO AS 'id', b.name AS 'name' FROM state_rules AS a ".
        "JOIN state AS b ON a.state_id_TO = b.state_id WHERE state_id_FROM = $actStateID;";
      $res = $this->db->query($query);
      return $this->getResultArray($res);
    }
    public function getActState($id) {
      settype($id, 'integer');
      $query = "SELECT a.state_id AS 'id', b.name AS 'name' FROM ".$this->table.
        " AS a INNER JOIN state AS b ON a.state_id = b.state_id WHERE id = $id;";
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

          // --- ! Execute Script (eval = evil) ! ---
          eval($script["transition_script"]);

          // -----------> Standard Result
          if (empty($script_result)) {
            $script_result = array(
              "allow_transition" => true,
              "show_message" => false,
              "message" => ""
            );
          }
          // update state in DB, when plugin says yes
          if (@$script_result["allow_transition"] == true) {
            $query = "UPDATE ".$this->table." SET state_id = $stateID WHERE id = $ElementID;";
            $res = $this->db->query($query);
          }
          // Return
          return json_encode($script_result);
        }        
      }
      return false;
    }
    public function checkTransition($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT * FROM state_rules WHERE state_id_FROM = $fromID AND state_id_TO = $toID;";
      $res = $this->db->query($query);
      $cnt = $res->num_rows;
      return ($cnt > 0);
    }
    public function getTransitionScripts($fromID, $toID) {
      settype($fromID, 'integer');
      settype($toID, 'integer');
      $query = "SELECT transition_script FROM state_rules WHERE ".
      "state_id_FROM = $fromID AND state_id_TO = $toID;";
      $return = array();
      $res = $this->db->query($query);
      $return = $this->getResultArray($res);
      return $return;
    }
    //--------------------------------------- New version

    // TODO: Create basic state engine --- returns SM_ID
    public function createBasicStateMachine($tablename) {
      // 0. check if a statemachine already exists for this table
      // 1. Insert new statemachine for a table
      // 2. Insert states (new, active, inactive)
      // 3. Insert links (new -> active, active -> inactive)
      return 1;
    }
  }
?>