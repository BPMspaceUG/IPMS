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
      mkdir('../../IPMS_test', 0750, true);
    }
  }

  // Open a new DB-Connection
  define('DB_HOST', $db_server);
  define('DB_NAME', $db_name);
  define('DB_USER', $db_user);
  define('DB_PASS', $db_pass);
  require_once("output_DatabaseHandler.php");


  /* ------------------------------------- Statemachine ------------------------------------- */

  require_once("output_StateEngine.php");
  require_once("output_RequestHandler.php");
  require_once("output_AuthHandler.php");
  // Loop each Table with StateMachine checked create a StateMachine Column

  // -------------------- FormData --------------------

  $content_tabs = '';
  $content_tabpanels = '';  
  $content_jsObjects = '';
  
  // Add Pseudo Element for Dashboard
  $content_tabs .= "            ".
  "<li class=\"nav-item\">
    <a class=\"nav-link\" href=\"#dashboard\" data-toggle=\"tab\">
      <i class=\"fa fa-dashboard\"></i>&nbsp;
      <span class=\"table_alias\">Dashboard</span>
    </a>
  </li>\n";
  // Add Pseudo Element for Dashboard
  $content_tabpanels .= "            ".
    "<div role=\"tabpanel\" class=\"tab-pane\" id=\"dashboard\">".
    "<?php include_once(__DIR__.'/dashboard.html'); ?>".
    "</div>\n";


  foreach ($data as $table) {
    // Get Data
    $tablename = $table["table_name"];
    @$se_active = (bool)$table["se_active"];
    $con = DB::getInstance()->getConnection();

    //--- Create HTML Content
    if ($table["is_in_menu"]) {

      // Tabs
      $content_tabs .= "            ".
            "<li class=\"nav-item\">
              <a class=\"nav-link\" href=\"#$tablename\" data-toggle=\"tab\">
                <i class=\"".$table["table_icon"]."\"></i>&nbsp;
                <span class=\"table_alias\">".$table["table_alias"]."</span>
              </a>
            </li>\n";

      // TabPanes
      $content_tabpanels .= "            ".
        "<div role=\"tabpanel\" class=\"tab-pane\" id=\"$tablename\">".
        "<div class=\"table_$tablename\"></div></div>\n";

      // Init a JS-Object
      $tableVarName = "tbl_$tablename";
      $content_jsObjects .= "      let $tableVarName = new Table('$tablename', '.table_$tablename', 0, function(){ $tableVarName.loadRows(function(){ $tableVarName.renderHTML(); }); });\n";

    }
    //---/Create HTML Content


    // TODO: Check if the "table" is no view


    //--- Create a stored procedure for each Table
    $con->exec('CREATE PROCEDURE sp_'.$tablename.'(IN token_uid INT)
BEGIN
  SELECT * FROM '.$tablename.';
END');

    //--- Create StateMachine
    if ($se_active) {
      // ------- StateMachine Creation
      $SM = new StateMachine($con);
      $SM->createDatabaseStructure();
      $SM_ID = $SM->createBasicStateMachine($tablename);

      // Add Basic Form Data for each state
      $colData = $table["columns"];
      $excludeKeys = Config::getPrimaryColsByTablename($tablename, $data);
      
      /*
      // write the formdata into the column if empty (TRANSITION)
      $form_data = $SM->getBasicFormDataByColumns($colData, $excludeKeys);
      $query = "UPDATE state SET form_data = '$form_data' WHERE statemachine_id = '$SM_ID' AND NULLIF(form_data, ' ') IS NULL";
      $con->query($query);
      
      // write the formdata into the column if empty (CREATE)
      $excludeKeys[] = 'state_id'; // Also exclude StateMachine in the create Form
      $form_data = $SM->getBasicFormDataByColumns($colData, $excludeKeys);
      $query = "UPDATE state_machines SET form_data = '$form_data' WHERE tablename = '$tablename' AND NULLIF(form_data, ' ') IS NULL";
      $con->query($query);
      */

      // TODO: Only create a default form
      $excludeKeys[] = 'state_id'; // Also exclude StateMachine in the FormData
      $form_data = $SM->getBasicFormDataByColumns($colData, $excludeKeys);
      $query = "UPDATE state_machines SET form_data_default = '$form_data' WHERE tablename = '$tablename' AND NULLIF(form_data_default, ' ') IS NULL";
      $con->query($query);
      
      $queries1 = $SM->getQueryLog();
      // Clean up
      unset($SM);

      // ------------ Connection to existing structure !

      // Set the default Entrypoint for the Table (when creating an entry the Process starts here)
      $SM = new StateMachine($con, $tablename); // Load correct Machine
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
  $output_content = str_replace('replaceDBName', $db_name, $output_content);
  // Write the init functions for the JS-Table Objects
  $output_footer = str_replace('###JS_TABLE_OBJECTS###', $content_jsObjects, $output_footer);

  // ------------------------------------ Generate Core File
  $output_all = $output_header.$output_content.$output_footer;
  // Output information
  echo "Generating-Time: ".date("Y-m-d H:i:s")."\n\n";
  echo $queries1;
  echo $output_all;

  // ------------------------------------ Generate Config File

  // Generate Secret Key
  $secretKey = 'secretkey_'.sha1('test' . date("Y-m-d")); // Changes every day only

  // Generate a machine token
  $token_data = array();
  $token_data['uid'] = 1337;
  $token_data['firstname'] = 'Machine';
  $token_data['lastname'] = 'Machine';
  $token = JWT::encode($token_data, $secretKey);
  $machine_token = $token;

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
  define("AUTH_KEY", "'.$secretKey.'");

  // Machine-Token for internal API Calls
  define("MACHINE_TOKEN", "'.$machine_token.'");

  // WhiteLists for getFile
  @define("WHITELIST_PATHS", array("ordner/test/", "ordner/"));
  @define("WHITELIST_TYPES", array("pdf", "doc", "txt"));

  // Structure Configuration Data
  $config_tables_json = \''.$json.'\';
?>';


  function createSubDirIfNotExists($dirname) {
    if (!is_dir($dirname))
      mkdir($dirname, 0750, true);
  }
  
  function createFile($filename, $content) {
    file_put_contents($filename, $content);
    chmod($filename, 0660);
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
    createSubDirIfNotExists($project_dir."/css");
    createSubDirIfNotExists($project_dir."/js");
    createSubDirIfNotExists($project_dir."/src");

    // Put Files
    createFile($project_dir."/js/muster.js", $output_JS);    
    createFile($project_dir."/css/muster.css", $output_css);
    createFile($project_dir."/src/RequestHandler.inc.php", $output_RequestHandler);
    createFile($project_dir."/src/StateMachine.inc.php", $class_StateEngine);
    createFile($project_dir."/src/DatabaseHandler.inc.php", $output_DBHandler);
    createFile($project_dir."/src/AuthHandler.inc.php", $output_AuthHandler);
    // Main Directory
    createFile($project_dir."/api.php", $output_API);
    createFile($project_dir."/login.php", $output_LoginPage);
    // Create a dashboard, which gets included
    if (!file_exists($project_dir."/dashboard.html"))
      createFile($project_dir."/dashboard.html", "<section>\n\t<h1>Dashboard</h1>\n</section>");
    createFile($project_dir."/".$db_name.".php", $output_all);
    createFile($project_dir."/".$db_name."-config.inc.php", $output_config);
    createFile($project_dir."/index.php", "<?php\n\tHeader(\"Location: ".$db_name.".php\");\n\texit();\n?>");
  }
?>