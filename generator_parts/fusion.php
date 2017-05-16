<?php
  //var_dump($_REQUEST);
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) {
    $_REQUEST = json_decode(file_get_contents('php://input'), true);
  }
  // put parameters into variables
  $db_server = $_REQUEST['host']; //.':'.$_REQUEST['port'];
  $db_user = $_REQUEST['user'];
  $db_pass = $_REQUEST['pwd'];
  $db_name = $_REQUEST['db_name'];
  $data = $_REQUEST["data"]; // TODO: Nur relevante Daten übergeben!

  $DEBUG = FALSE;
  if  (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'on')) {
    $DEBUG = TRUE;
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
  }
  
  // check if liam is present and create test directory for IPMS if not exist
  $content = "";
  $create_test_file = FALSE;
  $content = @file_get_contents("../../.git/config");
  if (!empty($content) && strpos($content,"https://github.com/BPMspaceUG/LIAM.git")) {
    if (!is_dir('../../IPMS_test')) {
      mkdir('../../IPMS_test', 0755, true);
    }
  }
  
  //open DB connection or die
  $con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
  if ($con->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
  } else {
    // echo "no mysqli error";
  }

  /* ------------------------------------- Statemachine ! */

  // Create the tables if the do not exist
  $query_rules = "CREATE TABLE IF NOT EXISTS `".$db_name."`.`state_rules` (
  `state_rules_id` bigint(20) NOT NULL,
  `state_id_FROM` bigint(20) NOT NULL,
  `state_id_TO` bigint(20) NOT NULL,
  `transition_script` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;";

  $query_states = "CREATE TABLE IF NOT EXISTS `".$db_name."`.`state` (
  `state_id` bigint(20) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `form_data` longtext,
  `tablename` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
  // Execute queries
  $con->query($query_rules);
  $con->query($query_states);

  // Add primary keys  
  $query_rules = "ALTER TABLE `".$db_name."`.`state_rules` ADD PRIMARY KEY (`state_rules_id`);";
  $query_states = "ALTER TABLE `".$db_name."`.`state` ADD PRIMARY KEY (`state_id`);";
  // Execute queries
  $con->query($query_rules);
  $con->query($query_states);

  //-------------------------------------------------------

  $all_table_names = array();
  // Die richtige Datenbank auswählen
  for ($i=0;$i<count($data);$i++) {
    array_push($all_table_names, $data[$i]["table_name"]);
  }

  $log = '';

  // Pseudocode alle files aus folder:  folder(this).getfilenames.foreach(file=> $file = fget(file))
  // TODO: Make function, only pass filenames

  $handle = fopen("./output_LiamHeader.php", "r");
  $output_LiamHeader = stream_get_contents($handle);

  $handle = fopen("./output_DebugHeader.php", "r");
  $output_DebugHeader = stream_get_contents($handle);

  // Class State Engine
  $handle = fopen("./output_StateEngine.php", "r");
  $class_StateEngine = stream_get_contents($handle);
    // Clear PHP Tags
    $class_StateEngine = str_replace('<?php', '', $class_StateEngine);
    $class_StateEngine = str_replace('?>', '', $class_StateEngine);

  // RequestHandler
  $handle = fopen("./output_RequestHandler.php", "r");
  $output_RequestHandler = stream_get_contents($handle);
  $output_RequestHandler = str_replace('replaceDBName', $db_name, $output_RequestHandler);
  $output_RequestHandler = str_replace('replaceClassStateEngine', $class_StateEngine, $output_RequestHandler);
  $log .= '<h4>$output_RequestHandler</h4>'.$output_RequestHandler ;

  // HTML - Header
  $handle = fopen("./output_header.php", "r");
  $output_header = stream_get_contents($handle);
  $output_header = str_replace('replaceDBName', $db_name, $output_header);
  $log .= '<h4>$output_header</h4>'.$output_header;

    // CSS in Header
    $handle = fopen("./muster.css", "r");
    $output_css = stream_get_contents($handle);
    $output_header = str_replace('replaceCSS', $output_css, $output_header);

  $handle = fopen("./output_menu.php", "r");
  $output_menu = stream_get_contents($handle);
  $log .= '<h4>$output_menu</h4>'.$output_menu;

  $handle = fopen("./output_content.php", "r");
  $output_content = stream_get_contents($handle);
  $log .= '<h4>$output_content</h4>'.$output_content;

  $handle = fopen("./output_footer.php", "r");
  $output_footer = stream_get_contents($handle);
  $log .= '<h4>$output_footer</h4>'.$output_footer;

  // put Javascript in Footer
  $musterJS = '';
  //$musterJS = 'tables = '.json_encode($data).';'; // save structure data in JS variable
  $handle = fopen("./muster.js", "r");
  $musterJS = $musterJS . stream_get_contents($handle);
  $output_footer = str_replace('replaceDBName', $db_name, $output_footer);
  $output_footer = str_replace("replaceMusterJS", $musterJS, $output_footer);
  fclose($handle);


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

  // ----------------------- Config File generator
  $output_config = 
'<?php
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
  $config_tables_json = \''.json_encode($data).'\';
?>';

  // ----> Write to file

  if (is_dir('../../IPMS_test')) {
    file_put_contents("../../IPMS_test/".$db_name.".php", $output_all);
    file_put_contents("../../IPMS_test/".$db_name.".txt", $output_all); // For debugging
    file_put_contents("../../IPMS_test/".$db_name."-config.php", $output_config);
    //file_put_contents("../../IPMS_test/".$db_name."-config.txt", $output_config);
  }
?>