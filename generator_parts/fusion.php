<?php
  //var_dump($_REQUEST);
  
 // put parameters into variables
  $db_server = $_REQUEST['host'].':'.$_REQUEST['port'];
  $db_user = $_REQUEST['user'];
  $db_pass = $_REQUEST['pwd'];
  $db_name = $_REQUEST['db_name'];
  $data = $_REQUEST["data"]; // TODO: Nur relevante Daten übergeben!

  $DEBUG = FALSE;
  if  (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'on')) {
    $DEBUG = TRUE;
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
  };
  
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
  if($con->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
  }else{
  	// echo "no mysqli error";
  }

  $all_table_names = array();
  // Die richtige Datenbank auswählen
  for ($i=0;$i<count($data);$i++) {
    if (strtoupper($data[$i]["database"]) == strtoupper($db_name)) {
      $all_table_names = $data[$i]["tables"];
    }
  }

  // if ($DEBUG) var_dump($all_table_names);

  $log = '';
   //Pseudocode alle files aus folder:  folder(this).getfilenames.foreach(file=> $file = fget(file))
  $handle = fopen("./output_LiamHeader.php", "r");
  $output_LiamHeader = stream_get_contents($handle);
  $handle = fopen("./output_DebugHeader.php", "r");
  $output_DebugHeader = stream_get_contents($handle);

  $partname = 'output_RequestHandler';
  $partpath = './'.$partname.'.php';
  $handle = fopen($partpath, "r");
  $output_RequestHandler = fread($handle, filesize($partpath));

  $output_RequestHandler = str_replace('<?php', '', $output_RequestHandler);
  $output_RequestHandler = str_replace('"replaceServer"', '"'.$db_server.'"', $output_RequestHandler);
  $output_RequestHandler = str_replace('"replaceUser"', '"'.$db_user.'"', $output_RequestHandler);
  $output_RequestHandler = str_replace('"replacePassword"', '"'.$db_pass.'"', $output_RequestHandler);
  $output_RequestHandler = str_replace('"replaceDBName"', '"'.$db_name.'"', $output_RequestHandler);

  $handle = fopen("./replaceCRUD.php", "r");
  $replaceCRUD = stream_get_contents($handle);
  // $output_RequestHandler = str_replace('//replaceCRUD', $replaceCRUD, $output_RequestHandler);

  $escaped = addslashes( $output_RequestHandler );
  $log.= '<h4>$output_RequestHandler</h4>'.$output_RequestHandler ;

  // $handle = fopen("./output_script.php", "r");
  // $output_script = stream_get_contents($handle);
  // fclose($handle);

  $handle = fopen("./output_header.php", "r");
  $output_header = stream_get_contents($handle);
  $log.= '<h4>$output_header</h4>'.$output_header;

  $handle = fopen("./output_menu.php", "r");
  $output_menu = stream_get_contents($handle);
  $log.= '<h4>$output_menu</h4>'.$output_menu;

  $handle = fopen("./output_content.php", "r");
  $output_content = stream_get_contents($handle);
  $log.= '<h4>$output_content</h4>'.$output_content;

  $handle = fopen("./output_footer.php", "r");
  $output_footer = stream_get_contents($handle);
  $log.= '<h4>$output_footer</h4>'.$output_footer;

  // Im Footer JS ersetzen
  $handle = fopen("./muster.js", "r");
    
  $musterJS = 'tables = '.json_encode($all_table_names).';';
  $musterJS .= stream_get_contents($handle);
  $output_footer = str_replace("replaceMusterJS", $musterJS, $output_footer);

  fclose($handle);

  // var_dump($log );

  $output_all = '<?php'
    // .$output_LiamHeader
    // .$output_DebugHeader
    .$output_RequestHandler
    // .$output_script
    .$output_header
    .$output_menu
    .$output_content
    .$output_footer
    ;
  // echo $output_all;
  // var_dump( $output_RequestHandler);
  var_dump( json_encode( $all_table_names ) );

  // Write code to file: .php as live-file, .txt as debug
  if (is_dir('../../IPMS_test')) {
    file_put_contents("../../IPMS_test/".$db_name.".php", $output_all);
    file_put_contents("../../IPMS_test/".$db_name.".txt", $output_all);
  }
?>