<?php
	$db_server = $_REQUEST['host'].':'.$_REQUEST['port'];
	$db_user = $_REQUEST['user'];
	$db_pass = $_REQUEST['pwd'];
	
	$table_name = $_REQUEST['table_name'];
	$db_name = $_REQUEST['db_name'];
	
	$con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
	if($con->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');}
	
	$query = "SELECT distinct TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '$db_name'";
	
	if(!$result = $con->query($query)){
    die('There was an error running the query [' . $con->error . ']');}
	
	$array_1 = $result->fetch_all(MYSQLI_ASSOC);
	
	$output_index = "// ---------------------------------- index.php starts here --------------------------------------------\n\n";
	
	$output_index .= "<?php\n";
		$output_index .= "// uncomment at least one line!";
		foreach($array_1 as $value){
							$output_index .= "//header(\"Location: " . $value['TABLE_NAME'] .".php\");\n";
			}
	$output_index .= "?>\n\n";
	
	$output_index .= "// ---------------------------------- index.php ends here --------------------------------------------\n\n";
	
	$output_header = "// ---------------------------------- _header.inc.php starts here --------------------------------------------\n\n";
	
	$output_header .= "<?php\n";
	$output_header .= "\t// uncomment if you want to use LIAM for identity and access management\n";
	$output_header .= "\t\tinclude_once '../phpSecureLogin/includes/db_connect.inc.php';\n";
	$output_header .= "\t\tinclude_once '../phpSecureLogin/includes/functions.inc.php';\n";
	$output_header .= "\n\tsec_session_start();\n\n";
  	$output_header .= "\tif(login_check(\$mysqli) != true) {\n";
    $output_header .= "\t\theader(\"Location: ../index.php?error_messages='You are not logged in!'\");\n";
    $output_header .= "\t\texit();\n";
	$output_header .= "\t}\n";
	$output_header .= "\telse {\n";
    $output_header .= "\t\t\$logged = 'in';\n";
	$output_header .= "\t}\n";
	$output_header .= "?>\n";
	
	
	
	$output_header .= "// ---------------------------------- _header.inc.php ends here --------------------------------------------\n\n";
	
	$output_footer = "// ---------------------------------- _footer.inc.php starts here --------------------------------------------\n\n";
	
	
		
	$output_footer .= "// ---------------------------------- _footer.inc.php ends here --------------------------------------------\n\n";
	

	$output_RequestHandler = "// ---------------------------------- Request Handler starts here --------------------------------------------\n\n";
	
	$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$table_name' AND TABLE_SCHEMA = '$db_name'";
	
	if(!$result = $con->query($query)){
    die('There was an error running the query [' . $con->error . ']');}
	
	$array_2 = $result->fetch_all(MYSQLI_ASSOC);
	
	
	$output_RequestHandler .= "//Table \"" . $table_name . "\" in database " . $db_name . " has ". $result->num_rows . " coloumns. \n";
	
	$output_RequestHandler .= "//\tCOLUMN_NAME[ORDINAL_POSITION]:\tvalue\tCOLUMN_TYPE\tCOLUMN_KEY\n";
	foreach($array_2 as $value){
		$output_RequestHandler .= "//\tCOLUMN_NAME[" . $value['ORDINAL_POSITION'] . "]:\t\t" . $value['COLUMN_NAME']. "\t\t" .$value['COLUMN_TYPE']. "\t\t" .$value['COLUMN_KEY']."\n";
	}
	$output_RequestHandler .= "\n\r\n\r";
	//print_r ($array_2);
	
	if ($array_2[0]['COLUMN_KEY'] != "PRI"){
	$output_RequestHandler .= "WARNING - FIRST Column not PRIMARY KEY \n";
	}
	
	
	$output_RequestHandler .= "<?php\n";
	$output_RequestHandler .= "function getResultArray(\$result) {\n";
	$output_RequestHandler .= "\t\$results_array = array();\n";
	$output_RequestHandler .= "\tif (!\$result) return false;\n";
	$output_RequestHandler .= "\twhile (\$row = \$result->fetch_assoc()) {\n";
	$output_RequestHandler .= "\t\t\$results_array[] = \$row;\n";
	$output_RequestHandler .= "\t}\n";
	$output_RequestHandler .= "\treturn \$results_array;\n";
	$output_RequestHandler .= "}\n";

	$output_RequestHandler .= "class RequestHandler {\n";
	$output_RequestHandler .= "private \$db;\n";

	$output_RequestHandler .= "public function __construct() {\n";
	$output_RequestHandler .= "\t// Get global variables here\n";
	$output_RequestHandler .= "\tglobal \$DB_host;\n";
	$output_RequestHandler .= "\tglobal \$DB_user;\n";
	$output_RequestHandler .= "\tglobal \$DB_pass;\n";
	$output_RequestHandler .= "\tglobal \$DB_name;\n";

	$output_RequestHandler .= "\t\$db = new mysqli(\$DB_host, \$DB_user, \$DB_pass, \$DB_name);\n";
	$output_RequestHandler .= "\t/* check connection */\n";
	$output_RequestHandler .= "\tif(\$db->connect_errno){\n";
	$output_RequestHandler .= "\t\tprintf(\"Connect failed: %s\", mysqli_connect_error());\n";
	$output_RequestHandler .= "\t\texit();\n";
	$output_RequestHandler .= "\t}\n";
	$output_RequestHandler .= "\t\$db->query(\"SET NAMES utf8\");\n";
	$output_RequestHandler .= "\t\$this->db = \$db;\n";
	$output_RequestHandler .= "}\n\n";
	
	$output_RequestHandler .= "\tpublic function handle(\$command, \$params) {\n";
    $output_RequestHandler .= "\tswitch(\$command) {\n";

	$output_RequestHandler .= "\t\tcase " . $table_name . ":\n";
	$output_RequestHandler .= "\t\t\t\$return = \$this->get_" . $table_name . "_List();\n";
	$output_RequestHandler .= "\t\t\treturn json_encode(\$return);\n";
	$output_RequestHandler .= "\t\t\tbreak;\n";
   
	$output_RequestHandler .= "\t\tcase'create_" . $table_name . "':\n";
	$output_RequestHandler .= "\t\t\treturn \$this->add_" . $table_name . "(\$params[\"ALL_NECCESATRY_ATTRIBUTES\"]);\n";
	$output_RequestHandler .= "\t\t\tbreak;\n";
				
	$output_RequestHandler .= "\t\tcase 'delete_" . $table_name . "':\n";
	$output_RequestHandler .= "\t\t\treturn \$this->del_" . $table_name . "(\$params[\"" . $array_2[0]['COLUMN_NAME'] . "\"]);\n";
	$output_RequestHandler .= "\t\t\tbreak;\n";
    
	$output_RequestHandler .= "\t\tcase 'update_" . $table_name . "':\n";
	$output_RequestHandler .= "\t\t\t\$id = \$params[\"TABLE_NAME_Primary_KEY\"];\n";
	$output_RequestHandler .= "\t\t\t\$res = \$this->updateATTRIBUTE(\$id, \$params[\"ATTRIBUTE\"]);\n";
	$output_RequestHandler .= "			\$res += \$this->updateATTRIBUTE(\$id, \$params[\"ATTRIBUTE\"]);\n";
	$output_RequestHandler .= "			\$res += \$this->updateATTRIBUTE_3(\$id, \$params[\"ATTRIBUTE_3\"]);\n";
	$output_RequestHandler .= "\t\tif (\$res != ". $result->num_rows . ") return ''; else return \$res;\n";
	$output_RequestHandler .= "\t\tbreak;\n";

	$output_RequestHandler .= "\t\tdefault:\n";
	$output_RequestHandler .= "\t\t\treturn \"\"; // empty string\n";
	$output_RequestHandler .= "\t\t\texit;\n";
	$output_RequestHandler .= "\t\t\tbreak;\n";
    $output_RequestHandler .= "\t\t}\n";
    $output_RequestHandler .= "\t}\n";
	
	$output_RequestHandler .= "\n\n?>";
	
	$output_RequestHandler .= "\n// ---------------------------------- Request Handler ends here --------------------------------------------\n\n";
	
	
	echo $output_index;
	echo $output_header;
	echo $output_footer;
	echo $output_RequestHandler;
	

?>
