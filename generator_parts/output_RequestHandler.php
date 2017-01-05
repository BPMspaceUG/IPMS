<?php
//create Request Handler class for each table
// START return just data from the DB here 
// Request Handler starts here  
// Process Parameters starts here  
$command="";
$parameter="";
$test=FALSE;
if (!empty($_GET["paramURL"]) && !empty($_GET["paramJS"])) {
  echo "error: dont use both parameters at the same time !!  you must use paramJS OR paramURL  ";
  exit;
}
if (!empty($_GET) && !empty($_GET["cmd"])) {
  $command=$_GET["cmd"];
  if (!empty($_GET["paramURL"])){
    $parameter=$_GET["paramURL"];
    $parameter = stripslashes($parameter);
    $parameter = unserialize($parameter);
    }
  if(!empty($_GET["paramJS"])){
    $parameter=$_GET["paramJS"];
    $parameter=$parameter[0];
    }
}
if (!empty($_GET["test"])){$test=TRUE;}
//Process Parameters ends here


//RequestHandler Class Definition starts here
  class RequestHandler {

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

    private function getResultArray($result) {
      $results_array = array();
      if (!$result) return false;
      while ($row = $result->fetch_assoc()) {
        $results_array[] = $row;
      }
      return json_encode($results_array);
    }
    
    //================================== CREATE
    public function create($param) {
      /*
      $query = "INSERT INTO " . $param["tablename"] ." (colums) VALUES (values);";
      $res = $this->db->query($query);
      */
      return -1;
    }
    //================================== READ
    public function read($param) {  
      
      $query = "SELECT ".$param["select"]." FROM " . $param["tablename"] ." LIMIT ".$param["limit"].";";
      /*
      $res = $this->db->query($query);
      return $this->getResultArray($res);
      */
      $tmp = array(
          array(1, "Tablename", $param["tablename"]),
          array(2, "Limit",  $param["limit"]),
          array(3, "ColumnsSelect=", $param["select"]),
          array(4, "Query", $query)
        );
      return json_encode($tmp);
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
      /*
      $query = "DELETE FROM " . $param["tablename"] ." WHERE id = value;";
      $res = $this->db->query($query);
      */
      return -1;
    }
  }

  //Class Definition ends here ";
  //Request Handler ends here  ";
  //END return just data from the DB here";
  
  $RH = new RequestHandler();
  if ( $command != "") {
    if ( $parameter != "") {
      $result = $RH->$command($parameter);
    }
    else {
      $result = $RH->$command();    
    }
    echo $result;
    exit;
  }
?>