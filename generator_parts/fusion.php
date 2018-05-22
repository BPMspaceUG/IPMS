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
    die('Unable to connect to database [' . $con->connect_error . ']');
  }

  /* ------------------------------------- Statemachine ------------------------------------- */

  require_once("output_StateEngine.php");
  require_once("output_RequestHandler.php");
   // Loop each Table with StateMachine checked create a new StateMachine Column

  // -------------------- FormData --------------------

  $content_tabs = '';
  $content_tabpanels = '';  

  foreach ($data as $table) {
    // Get Data
    $tablename = $table["table_name"];
    @$se_active = (bool)$table["se_active"];


    //--- Create HTML Content
    if ($table["is_in_menu"]) {
      // Tabs
      $content_tabs .= "            ".
            "<li>
              <a href=\"#$tablename\" data-toggle=\"tab\">
                <i class=\"".$table["table_icon"]."\"></i>&nbsp;
                <span class=\"table_alias\">".$table["table_alias"]."</span>
              </a>
            </li>\n";
      // TabPanes
      $content_tabpanels .= "            ".
        "<div role=\"tabpanel\" class=\"tab-pane\" id=\"$tablename\">".
        "<div class=\"table_$tablename\"></div></div>\n";
    }
    //---/


    // TODO: Check if the "table" is no view


    if ($se_active) {
      // ------- StateMachine Creation
      $SM = new StateMachine($con, $db_name);
      $SM->createDatabaseStructure();
      $SM_ID = $SM->createBasicStateMachine($tablename);

      // Add Basic Form Data for each state
      $colData = $table["columns"];
      $excludeKeys = RequestHandler::getPrimaryColByTablename($data, $tablename);
      $excludeKeys[] = 'state_id'; // Also exclude StateMachine in the create Form
      $form_data = $con->real_escape_string($SM->getBasicFormDataByColumns($colData, $excludeKeys));

      // write the formdata into the column if empty      
      $query = "UPDATE $db_name.state_machines SET form_data = '$form_data' WHERE ".
               "tablename = '$tablename' AND NULLIF(form_data, ' ') IS NULL;";
      $con->query($query);      
      $query = "UPDATE $db_name.state SET form_data = '$form_data' WHERE ".
               "statemachine_id = '$SM_ID' AND NULLIF(form_data, ' ') IS NULL;";
      $con->query($query);
      
      $queries1 = $SM->getQueryLog();
      // Clean up
      unset($SM);

      // ------------ Connection to existing structure !

      // Set the default Entrypoint for the Table (when creating an entry the Process starts here)
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

  // ------------------- Load complete Project
  $class_StateEngine = loadFile("./output_StateEngine.php");
  $output_RequestHandler = loadFile("./output_RequestHandler.php");  
  $output_DBHandler = loadFile("./output_DatabaseHandler.php");
  $output_AuthHandler = loadFile("./output_AuthHandler.php");
  $output_API = loadFile("./output_API.php");
  $output_LoginPage = loadFile("./output_LoginPage.php");
  $output_header = loadFile("./output_header.php");
  $output_css = loadFile("./muster.css");
  $output_content = loadFile("./output_content.php");
  $output_footer = loadFile("./output_footer.php");
  $output_JS = loadFile("./muster.js");

  // Replace Names
  $output_DBHandler = str_replace('replaceDBName', $db_name, $output_DBHandler); // For Config-Include
  $output_header = str_replace('replaceDBName', $db_name, $output_header); // For Title
  $output_footer = str_replace('replaceDBName', $db_name, $output_footer); // For Footer
  
  // --- Content
  // Modify HTML for later adaptions
  // Insert Tabs in HTML (Remove last \n)
  $content_tabs = substr($content_tabs, 0, -1);
  $content_tabpanels = substr($content_tabpanels, 0, -1);
  $output_content = str_replace('###TABS###', $content_tabs, $output_content);
  $output_content = str_replace('###TAB_PANELS###', $content_tabpanels, $output_content);

  // ------------------------------------ Generate Core File
  $output_all = $output_header.$output_content.$output_footer;
  // Output information
  echo "Generating-Time: ".date("Y-m-d H:i:s")."\n\n";
  echo $queries1;
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

  // AuthKey
  define("AUTH_KEY", "secretkeybpmspace_'.time().sha1(time()).'");

  // Structure Configuration Data
  $config_tables_json = \''.$json.'\';
?>';


  function createSubDirIfNotExists($dirname) {
    if (!is_dir($dirname))
      mkdir($dirname, 0755, true);
  }


  // ----> Write Project to Filesystem
	//$Path_IPMS_test = '../../IPMS_test';
  $Path_IPMS_test = __DIR__ . "/../../IPMS_test"; //.$data."-config.php";

	// check if IPMS test exists
  if (is_dir($Path_IPMS_test)) {

  	// Path for Project
    $project_dir = $Path_IPMS_test.'/'.$db_name;
    // Create Project directory
    createSubDirIfNotExists($project_dir);
    createSubDirIfNotExists($project_dir."/api");
    createSubDirIfNotExists($project_dir."/css");
    createSubDirIfNotExists($project_dir."/js");
    createSubDirIfNotExists($project_dir."/src");

    // Put Files
    file_put_contents($project_dir."/js/muster.js", $output_JS);
    file_put_contents($project_dir."/css/muster.css", $output_css);
    file_put_contents($project_dir."/api/index.php", $output_API);

    file_put_contents($project_dir."/src/RequestHandler.inc.php", $output_RequestHandler);
    file_put_contents($project_dir."/src/StateMachine.inc.php", $class_StateEngine);
    file_put_contents($project_dir."/src/DatabaseHandler.inc.php", $output_DBHandler);
    file_put_contents($project_dir."/src/AuthHandler.inc.php", $output_AuthHandler);

    file_put_contents($project_dir."/login.php", $output_LoginPage);
    file_put_contents($project_dir."/".$db_name.".php", $output_all);
    file_put_contents($project_dir."/".$db_name."-config.inc.php", $output_config);
    file_put_contents($project_dir."/index.php", "<?php\n\tHeader(\"Location: ".$db_name.".php\");\n\texit();\n?>");
  }
?>