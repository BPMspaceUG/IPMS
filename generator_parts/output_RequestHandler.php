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
?>


<?php
//RequestHandler Class Definition starts here
  class RequestHandler {

    private $db;
    public function __construct() {
    $config['db']['host'] = "$db_server";
    $config['db']['user'] = "$db_user";"; // TODO NEW USER NOT ROOT ANY
    $config['db']['password'] = "$db_pass";"; // TODO NEW PASSWD NOT ROOTPASSWD ANY
    $config['db']['database'] = "$db_name";
    /* include_once '../DB_config/login_credentials_DB_bpmspace_sample.inc.php';*/
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



foreach ($all_table_names as $table) { //for each table of the sected DB generate CRUD functions

	$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$table["table_name"]."' AND TABLE_SCHEMA = '$db_name'";
	if(!$result = $con->query($query)){
		die('There was an error running the query [' . $con->error . ']');
	}
	$columns_info = $result->fetch_all(MYSQLI_ASSOC);


	$prim_key =array();
	$i = 0;
	foreach ($columns_info as $value){
		if ($value['COLUMN_KEY'] == "PRI") {
			$output_RequestHandler .=  "     //Primary Key[".$i."] ".$value['COLUMN_NAME']."";
			$prim_key[$i] = $value['COLUMN_NAME'];
			$i++;
		}
	}

	$foreign_key =array();

	public function read_$table[table_name]($parameter = array())
	{
		$sql = "SELECT ";
		$sql .= array_key_exists("select",$parameter)?$parameter['select']:'*';
		$sql .= " FROM $table[table_name]";
		$sql .= array_key_exists("inner_join_1",$parameter)?" INNER JOIN ".$parameter['inner_join_1']:'';
		$sql .= array_key_exists("inner_join_2",$parameter)?" INNER JOIN ".$parameter['inner_join_2']:'';
		$sql .= array_key_exists("inner_join_3",$parameter)?" INNER JOIN ".$parameter['inner_join_3']:'';
		$sql .= array_key_exists("where",$parameter)?" WHERE ".$parameter['where']:'';
		$sql .= array_key_exists("order_by",$parameter)?" ORDER BY ".$parameter['order_by']:'';
		$sql .= array_key_exists("limit",$parameter)?" LIMIT ".$parameter['limit']:'LIMIT 100';
		$query = $this->db->query($sql);
		return !empty($query)?$this->getResultArray($query):false;
	}

	// prepare part of Angular JS
	$output_script = ""
	// Angualr JS script for each Table -> will be added in the FOOTER TODO 
	."    $scope."."$table[table_name]"." = [];"
	."    $scope.temp"."$table[table_name]"."Data = {};"
	."    $http.get('<?php echo $_SERVER['PHP_SELF'] ?>', {"
	."      params:{"
	."        cmd: 'read_$table[table_name]',"
	."        paramJS: [{limit: 10, select: "*"}]"
	."        },"
	."      paramSerializer: '$httpParamSerializerJQLike'"
	."      }).then(function(response){"
	."        $scope."."$table[table_name]"." = response.data;"
	."      });";
} //End loop for each table


}

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


//Class Definition ends here ";
//Request Handler ends here  ";
//END return just data from the DB here";
?>";
