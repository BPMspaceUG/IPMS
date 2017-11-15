<?php
	// Load data from Angular
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) {
    $_REQUEST = json_decode(file_get_contents('php://input'), true);
  }  
  // Parameters
  $db_server = $_REQUEST['host']; //.':'.$_REQUEST['port'];
  $db_user = $_REQUEST['user'];
  $db_pass = $_REQUEST['pwd'];
  $db_name = $_REQUEST['db_name'];
  $data = $_REQUEST["data"];

  // check if LIAM is present and create a Directory if not exists
  $content = "";
  $content = @file_get_contents("../../.git/config");
  if (!empty($content) && strpos($content,"https://github.com/BPMspaceUG/LIAM.git")) {
    if (!is_dir('../../IPMS_test')) {
      mkdir('../../IPMS_test', 0755, true);
    }
  }
  // Open a new DB-Connection
  $con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
  if ($con->connect_errno > 0) {
    die('Unable to connect to database [' . $db->connect_error . ']');
  }
  // Create an array with all table names
  $all_table_names = array();
  for ($i=0;$i<count($data);$i++) {
    array_push($all_table_names, $data[$i]["table_name"]);
  }

  /* ------------------------------------- Statemachine ------------------------------------- */

  require_once("output_StateEngine.php");
 
  // Loop each Table with StateMachine checked create a new StateMachine Column
  for ($i=0;$i<count($data);$i++) {
    // Get Data
    $tablename = $data[$i]["table_name"];
    @$se_active = (bool)$data[$i]["se_active"];

    // TODO: Check if the "table" is no view

    if ($se_active) {
      // ------- StateMachine Creation
      $SM = new StateMachine($con, $db_name);
      $SM->createDatabaseStructure();
      $SM_ID = $SM->createBasicStateMachine($tablename);

      // Add Basic Form Data for each state
      $query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '$db_name' AND TABLE_NAME = '$tablename';";
      $res = $con->query($query);
      $cols = array();
      while ($row = $res->fetch_row()) $cols[] = $row[0];
      $form_data = json_encode($SM->getBasicFormDataByColumns($cols));
      var_dump($form_data);
      
      // TODO: Insert basic form_data
      //$query = "INSERT INTO `".$db_name."`.`state` (from_data) VALUES ('') WHERE state_id = ;";

      unset($SM);
      // ------------ Connection to existing structure !
      // Add new column already existing struct - Does not add if already exists
      $SM = new StateMachine($con, $db_name, $tablename); // Load correct Machine
      $EP_ID = $SM->getEntryPoint();
      $q_se = "ALTER TABLE `".$db_name."`.`".$tablename."` ADD COLUMN `state_id` BIGINT(20) DEFAULT $EP_ID;";
      $con->query($q_se);
      // Add UNIQUE named foreign Key
      $uid = substr(md5($tablename), 0, 8);
      $q_se = "ALTER TABLE `".$db_name."`.`".$tablename."` ADD CONSTRAINT `state_id_".$uid."` FOREIGN KEY (`state_id`) ".
        "REFERENCES `".$db_name."`.`state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
      $con->query($q_se);
    }
  }

  //-------------------------------------------------------

  function loadFile($fname) {
  	$fh = fopen($fname, "r");
  	$content = stream_get_contents($fh);
  	fclose($fh);
  	return $content;
  }

  /*
  // --- Liam
  $output_LiamHeader = loadFile("./output_LiamHeader.php");
  // --- Debug Header
  $output_DebugHeader = loadFile("./output_DebugHeader.php");  
	*/

  // ------------------- Server Side
  // --- Class State Engine
  $class_StateEngine = loadFile("./output_StateEngine.php");
  $class_StateEngine = str_replace('<?php', '', $class_StateEngine);
  $class_StateEngine = str_replace('?>', '', $class_StateEngine);    
  // --- RequestHandler
  $output_RequestHandler = loadFile("./output_RequestHandler.php");
  $output_RequestHandler = str_replace('replaceDBName', $db_name, $output_RequestHandler);
  $output_RequestHandler = str_replace('replaceClassStateEngine', $class_StateEngine, $output_RequestHandler);

  // ------------------- Client Side
  // --- HTML Header
  $output_header = loadFile("./output_header.php");
  $output_header = str_replace('replaceDBName', $db_name, $output_header);
  // --- CSS in Header
  $output_css = loadFile("./muster.css");
  $output_header = str_replace('replaceCSS', $output_css, $output_header);
  // --- Menu
  $output_menu = loadFile("./output_menu.php");
  // --- Content
  $output_content = loadFile("./output_content.php");
  // --- Footer
  $output_footer = loadFile("./output_footer.php");
  $output_footer = str_replace('replaceDBName', $db_name, $output_footer);
  // --- JavaScript
  $output_JS = loadFile("./muster.js");
  // place JS in Footer
  $output_footer = str_replace("replaceMusterJS", $output_JS, $output_footer);

  // ------------------------------------ Generate Core File

  $output_all = ''
  // .$output_LiamHeader
  // .$output_DebugHeader
  .$output_RequestHandler
  // .$output_script
  .$output_header
  .$output_menu
  .$output_content
  .$output_footer
  ;

  echo $output_all;

  // ------------------------------------ Generate Config File

  // ---> ENCODE Data as JSON
  $json = json_encode($data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);
  // ----------------------- Config File generator
  $output_config = '<?php
  /*
    IPMS Generator
    ==================================================
    Generated: '.date("Y-m-d H:i:s").'
  */

  // Database Login
  define("DB_USER", "'.$db_user.'");
  define("DB_PASS", "'.$db_pass.'");
  define("DB_HOST", "'.$db_server.'");
  define("DB_NAME", "'.$db_name.'");

  // Structure Configuration Data
  $config_tables_json = \''.$json.'\';

  // Executed the following SQL Queries:
  /*
'.$db_changes.'
  */
?>';

  // ----> Write to file
  if (is_dir('../../IPMS_test')) {
    file_put_contents("../../IPMS_test/".$db_name.".php", $output_all);
    file_put_contents("../../IPMS_test/".$db_name."-config.php", $output_config);
  }

?>