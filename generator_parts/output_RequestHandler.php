<?php
  // Parameter
  $test = isset($_GET["test"]) ? TRUE : FALSE;
  $params = json_decode(file_get_contents('php://input'), true);
  $command = $params["cmd"];
    
  //RequestHandler Class Definition starts here
  class RequestHandler {
    // Variables
    private $db;

    public function __construct() {
      //identifyer for replace in fusion.php
      $config['db'] =  array('host' => "replaceServer",'user' => "replaceUser",'password' => "replacePassword",'database' => "replaceDBName" );

      //for testing $_GET["p"] = password
      if ($config['db']['host'] == "replaceServer") { $config['db']['host'] = 'localhost'; }
      if ($config['db']['user'] == "replaceUser") { $config['db']['user'] = 'root'; }
      if (($config['db']['password'] == "replacePassword") && isset($_GET["p"])) { $config['db']['password'] = $_GET["p"]; }
      if ($config['db']['database'] == "replaceDBName") { $config['db']['database'] = 'sample'; }

      $db = new mysqli($config['db']['host'], $config['db']['user'], $config['db']['password'], $config['db']['database']);
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
    //================================== CREATE
    public function create($param) {
      // Inputs
      $tablename = $param["table"];
      $rowdata = $param["row"];
      // Operation
      $query = "INSERT INTO ".$tablename." VALUES ('".implode("','", $rowdata)."');";
      $res = $this->db->query($query);      
      // Output
      return ($res != false);
    }
    //================================== READ
    public function read($param) {
      $query = "SELECT ".$param["select"]." FROM " . $param["tablename"] ." LIMIT ".$param["limit"].";";      
      $res = $this->db->query($query);
      return $this->parseToJSON($res);
    }
    //================================== UPDATE
    public function update($param) {
      /*
      $query = "UPDATE " . $param["tablename"] ." SET column = value;";
      $res = $this->db->query($query);
      */
      $tmp = array(
          array(1, "Success=true")
        );
      return json_encode($tmp);
    }
    //================================== DELETE
    public function delete($param) {
      var_dump($param);
      /*
      $query = "DELETE FROM " . $param["tablename"] ." WHERE id = value;";
      $res = $this->db->query($query);
      */
      return -1;
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