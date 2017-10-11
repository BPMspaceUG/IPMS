<?php
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) {
    $_REQUEST = json_decode(file_get_contents('php://input'), true);
  }  
  // put parameters into variables
  $db_server = $_REQUEST['host']; //.':'.$_REQUEST['port'];
  $db_user = $_REQUEST['user'];
  $db_pass = $_REQUEST['pwd'];
  $db_name = $_REQUEST['db_name'];
  $data = $_REQUEST["data"];

  // check if liam is present and create test directory for IPMS if not exist
  $content = "";
  $create_test_file = FALSE;
  $content = @file_get_contents("../../.git/config");
  if (!empty($content) && strpos($content,"https://github.com/BPMspaceUG/LIAM.git")) {
    if (!is_dir('../../IPMS_test')) {
      mkdir('../../IPMS_test', 0755, true);
    }
  }
  // open DB-Connection or die
  $con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
  if ($con->connect_errno > 0) {
    die('Unable to connect to database [' . $db->connect_error . ']');
  }
  /* ------------------------------------- Statemachine ------------------------------------- */

  // ----------------------------------- Structure

  // Create Table STATEMACHINES
  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state_machines` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tablename` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
  $con->query($query);

  // Create Table NODES
  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state` (
  `state_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `form_data` longtext,
  `entrypoint` tinyint(1) NOT NULL DEFAULT '0',
  `statemachine_id` bigint(20) NOT NULL DEFAULT '1',
  PRIMARY KEY (`state_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
  $con->query($query);

  // Create Table LINKS
  $query = "CREATE TABLE IF NOT EXISTS `$db_name`.`state_rules` (
  `state_rules_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `state_id_FROM` bigint(20) NOT NULL,
  `state_id_TO` bigint(20) NOT NULL,
  `transition_script` longtext,
  PRIMARY KEY (`state_rules_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
  $con->query($query);

  // ----------------------------------- Constrainsts

  // FOREIGN KEYS StateEngine

  // Rules
  $query = "ALTER TABLE `$db_name`.`state_rules` ".
    "ADD INDEX `state_id_fk1_idx` (`state_id_FROM` ASC), ".
    "ADD INDEX `state_id_fk_to_idx` (`state_id_TO` ASC);";
  $con->query($query);
  $query = "ALTER TABLE `$db_name`.`state_rules` ADD CONSTRAINT `state_id_fk_from` FOREIGN KEY (`state_id_FROM`) REFERENCES `".$db_name."`.`state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION, ADD CONSTRAINT `state_id_fk_to` FOREIGN KEY (`state_id_TO`) REFERENCES `".$db_name."`.`state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
  $con->query($query);

  // Nodes
  $query = "ALTER TABLE `$db_name`.`state` ".
    "ADD INDEX `state_machine_id_fk` (`statemachine_id` ASC);";
  $con->query($query);
  $query = "ALTER TABLE `$db_name`.`state` ADD CONSTRAINT `state_machine_id_fk` FOREIGN KEY (`statemachine_id`) REFERENCES `".$db_name."`.`state_machines` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
  $con->query($query);


  /*
  $query = "CREATE TABLE IF NOT EXISTS `".$db_name."`.`state_rules` (
  `state_rules_id` bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `state_id_FROM` bigint(20) NOT NULL,
  `state_id_TO` bigint(20) NOT NULL,
  `transition_script` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

  // Create Table NODES
  $query_states = "CREATE TABLE IF NOT EXISTS `".$db_name."`.`state` (
  `state_id` bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(45) DEFAULT NULL,
  `form_data` longtext,
  `tablename` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

  // Execute queries
  $con->query($query_rules);
  $con->query($query_states);

  // Log queries in a DB-Changes file
  $db_changes = "";
  $db_changes .= $query_rules."\r\n";
  $db_changes .= $query_states."\r\n";
*/

  // Loop for each Table with StateEngine checked create a new StateMachine Column
  $count = 0;

  for ($i=0;$i<count($data);$i++) {
    // Get Data
    $tablename = $data[$i]["table_name"];
    @$se_active = (bool)$data[$i]["se_active"];

    if ($se_active) {

      // Add new column - Does not add if already exists

      $q_se = "ALTER TABLE `".$db_name."`.`".$tablename."` ADD COLUMN `state_id` BIGINT(20) DEFAULT 1;";
      $con->query($q_se);

      // Add UNIQUE named foreign Key
      $uid = substr(md5($tablename), 0, 8);
      $q_se = "ALTER TABLE `".$db_name."`.`".$tablename."` ADD CONSTRAINT `state_id_".$uid."` FOREIGN KEY (`state_id`) ".
        "REFERENCES `".$db_name."`.`state_nodes` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;";
      $con->query($q_se);


      // ----------------------------------------------
      // INSERT MINIMUM DATA

      // TODO: Better check if already statemachine is available already, if not create one
      // ----------------------------------------------

      // Add Statemachine
      $query = "INSERT INTO `$db_name`.`state_machines` (`id`, `tablename`) VALUES (1, '$tablename');";
      $con->query($query);

      // -> States
      $query = "INSERT INTO `$db_name`.`state` (`state_id`, `name`, `form_data`, `statemachine_id`, `entrypoint`) VALUES ".
        "(".(1+$count*3).", 'new', '', 1, 1),(".(2+$count*3).", 'active', '', 1, 0),(".(3+$count*3).", 'inactive', '', 1, 0)";
      $con->query($query);
      // -> Rules
      $query = "INSERT INTO `$db_name`.`state_rules` ".
        "(`state_rules_id`, `state_id_FROM`, `state_id_TO`, `transition_script`) VALUES ".
        "(".(1+$count*6).", ".(1+$count*3).", ".(1+$count*3).", ''), ".
        "(".(2+$count*6).", ".(2+$count*3).", ".(2+$count*3).", ''), ".
        "(".(3+$count*6).", ".(3+$count*3).", ".(3+$count*3).", ''), ".
        "(".(4+$count*6).", ".(1+$count*3).", ".(2+$count*3).", ''), ".
        "(".(5+$count*6).", ".(2+$count*3).", ".(3+$count*3).", ''), ".
        "(".(6+$count*6).", ".(3+$count*3).", ".(2+$count*3).", '')";
      $con->query($query);


      // Increase counter
      $count += 1;
    }
  }

  // Logging
  /*
  $db_changes .= $query_rules."\r\n";
  $db_changes .= $query_states."\r\n";
  */
  //-------------------------------------------------------

  // Make array with all table names
  $all_table_names = array();
  for ($i=0;$i<count($data);$i++) {
    array_push($all_table_names, $data[$i]["table_name"]);
  }

  // TODO: Make function, only pass filenames
  /*
  // --- Liam
  $handle = fopen("./output_LiamHeader.php", "r");
  $output_LiamHeader = stream_get_contents($handle);
  // --- Debug Header
  $handle = fopen("./output_DebugHeader.php", "r");
  $output_DebugHeader = stream_get_contents($handle);
  */
  // --- Class State Engine
  $handle = fopen("./output_StateEngine.php", "r");
  $class_StateEngine = stream_get_contents($handle);
    // Clear PHP Tags
    $class_StateEngine = str_replace('<?php', '', $class_StateEngine);
    $class_StateEngine = str_replace('?>', '', $class_StateEngine);
  // --- RequestHandler
  $handle = fopen("./output_RequestHandler.php", "r");
  $output_RequestHandler = stream_get_contents($handle);
  $output_RequestHandler = str_replace('replaceDBName', $db_name, $output_RequestHandler);
  // --- StateEngine in RequestHandler
  $output_RequestHandler = str_replace('replaceClassStateEngine', $class_StateEngine, $output_RequestHandler);
  // --- HTML - Header
  $handle = fopen("./output_header.php", "r");
  $output_header = stream_get_contents($handle);
  $output_header = str_replace('replaceDBName', $db_name, $output_header);
    // --- CSS in Header
    $handle = fopen("./muster.css", "r");
    $output_css = stream_get_contents($handle);
    $output_header = str_replace('replaceCSS', $output_css, $output_header);
  // --- Menu
  $handle = fopen("./output_menu.php", "r");
  $output_menu = stream_get_contents($handle);
  // --- Content
  $handle = fopen("./output_content.php", "r");
  $output_content = stream_get_contents($handle);
  // --- Footer
  $handle = fopen("./output_footer.php", "r");
  $output_footer = stream_get_contents($handle);
  // put Javascript in Footer
  $musterJS = '';
  $handle = fopen("./muster.js", "r");
  $musterJS = $musterJS . stream_get_contents($handle);
  $output_footer = str_replace('replaceDBName', $db_name, $output_footer);
  $output_footer = str_replace("replaceMusterJS", $musterJS, $output_footer);
  // Finally close FileHandler
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

  // ---> ENCODE Data as JSON
  $json = json_encode($data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);

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
    //file_put_contents("../../IPMS_test/".$db_name.".txt", $output_all); // For debugging
    //file_put_contents("../../IPMS_test/".$db_name."-config.txt", $output_config);
  }
?>