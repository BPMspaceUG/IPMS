<?php
	$db_server = $_REQUEST['host'].':'.$_REQUEST['port'];
	$db_user = $_REQUEST['user'];
	$db_pass = $_REQUEST['pwd'];
	
	$table_name = $_REQUEST['table_name'];
	$db_name = $_REQUEST['db_name'];
	
	$con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
	if($con->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');}
	
	$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$table_name' AND TABLE_SCHEMA = '$db_name'";
	
	if(!$result = $con->query($query)){
    die('There was an error running the query [' . $con->error . ']');}
	
	$array = $result->fetch_all(MYSQLI_ASSOC);
	$output = "";
	
	//print_r ($array);
	if ($array[0]['COLUMN_KEY'] != "PRI"){
	$output .= "WARNING - FIRST Column not PRIMARY KEY \n";
	}

	
	
	foreach($array as $value){
		echo $value['COLUMN_NAME']."\n";
	}
			
	/*
	$i =0;
	while($row = mysqli_fetch_array($result)) {		
		$COLUMN_NAME[$i] = $row['COLUMN_NAME'];
		$ORDINAL_POSITION[$i] = $row['ORDINAL_POSITION'];
		$DATA_TYPE[$i] = $row['DATA_TYPE'];
		$COLUMN_TYPE[$i] = $row['COLUMN_TYPE'];
		$COLUMN_KEY[$i] =$row['COLUMN_KEY'];
		$i++;
	}
	*/
	
	
	
	$output .= "<?php\n";
	$output .= "function getResultArray(\$result) {\n";
	$output .= "\t\$results_array = array();\n";
	$output .= "\tif (!\$result) return false;\n";
	$output .= "\twhile (\$row = \$result->fetch_assoc()) {\n";
	$output .= "\t\t\$results_array[] = \$row;\n";
	$output .= "\t}\n";
	$output .= "\treturn \$results_array;\n";
	$output .= "}\n";

	$output .= "class RequestHandler {\n";
	$output .= "private \$db;\n";

	$output .= "public function __construct() {\n";
	$output .= "\t// Get global variables here\n";
	$output .= "\tglobal \$DB_host;\n";
	$output .= "\tglobal \$DB_user;\n";
	$output .= "\tglobal \$DB_pass;\n";
	$output .= "\tglobal \$DB_name;\n";

	$output .= "\t\$db = new mysqli(\$DB_host, \$DB_user, \$DB_pass, \$DB_name);\n";
	$output .= "\t/* check connection */\n";
	$output .= "\tif(\$db->connect_errno){\n";
	$output .= "\t\tprintf(\"Connect failed: %s\", mysqli_connect_error());\n";
	$output .= "\t\texit();\n";
	$output .= "\t}\n";
	$output .= "\t\$db->query(\"SET NAMES utf8\");\n";
	$output .= "\t\$this->db = \$db;\n";
	$output .= "}\n\n";
	
	$output .= "\tpublic function handle(\$command, \$params) {\n";
    $output .= "\tswitch(\$command) {\n";

	$output .= "\t\tcase " . $table_name . ":\n";
	$output .= "\t\t\t\$return = \$this->get_" . $table_name . "_List();\n";
	$output .= "\t\t\treturn json_encode(\$return);\n";
	$output .= "\t\t\tbreak;\n";
   
	$output .= "\t\tcase'create_" . $table_name . "':\n";
	$output .= "\t\t\treturn \$this->add_" . $table_name . "(\$params[\"ALL_NECCESATRY_ATTRIBUTES\"]);\n";
	$output .= "\t\t\tbreak;\n";
				
	$output .= "\t\tcase 'delete_" . $table_name . "':\n";
	$output .= "\t\t\treturn \$this->del_" . $table_name . "(\$params[\"" . $array[0]['COLUMN_NAME'] . "\"]);\n";
	$output .= "\t\t\tbreak;\n";
    
	$output .= "\t\tcase 'update_" . $table_name . "':\n";
	$output .= "\t\t\t\$id = \$params[\"TABLE_NAME_Primary_KEY\"];\n";
	$output .= "\t\t\t\$res = \$this->updateATTRIBUTE(\$id, \$params[\"ATTRIBUTE\"]);\n";
	$output .= "			\$res += \$this->updateATTRIBUTE(\$id, \$params[\"ATTRIBUTE\"]);\n";
	$output .= "			\$res += \$this->updateATTRIBUTE_3(\$id, \$params[\"ATTRIBUTE_3\"]);\n";
	$output .= "\t\tif (\$res != ". $result->num_rows . ") return ''; else return \$res;\n";
	$output .= "\t\tbreak;\n";

	$output .= "\t\tdefault:\n";
	$output .= "\t\t\treturn \"\"; // empty string\n";
	$output .= "\t\t\texit;\n";
	$output .= "\t\t\tbreak;\n";
    $output .= "\t\t}\n";
    $output .= "\t}\n";
	
	$output .= "//In Table \"" . $table_name . "\" there are ". $result->num_rows . " Attributes.";
	
	$output .= "\n\n?>";
	
	echo $output;
	

?>
