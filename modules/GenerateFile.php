<?php
	// put parameters into variables
	$db_server = $_REQUEST['host'].':'.$_REQUEST['port'];
	$db_user = $_REQUEST['user'];
	$db_pass = $_REQUEST['pwd'];
	$db_name = $_REQUEST['db_name'];
	
	$DEBUG = FALSE;
	if  (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'on' )) {
		$DEBUG = TRUE;
		ini_set('display_errors', 1);
		error_reporting(E_ALL);
		};
	
	//open DB connection or die
	$con = new mysqli ($db_server, $db_user, $db_pass);  //Default server.
	if($con->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');}
	
	// Get all table names in the selecetd DB from INFORMATION_SCHEMA
	
	$query = "SELECT distinct TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '$db_name'";
	if(!$result = $con->query($query)){
    die('There was an error running the query [' . $con->error . ']');}
	$all_table_names = $result->fetch_all(MYSQLI_ASSOC);
	
	if ($DEBUG) var_dump($all_table_names);
		
	// create BPMspace LIAM Header
	$output_LiamHeader = "<!-- LIAM header starts here -->\n";
	$output_LiamHeader .= "\t<?php\n";
	$output_LiamHeader .= "\t// comment if you do NOT want to use BPMspace LIAM for identity and access management\n";
	$output_LiamHeader .= "\t\tinclude_once '../phpSecureLogin/includes/db_connect.inc.php';\n";
	$output_LiamHeader .= "\t\tinclude_once '../phpSecureLogin/includes/functions.inc.php';\n";
	$output_LiamHeader .= "\n\tsec_session_start();\n\n";
  	$output_LiamHeader .= "\tif(login_check(\$mysqli) != true) {\n";
    $output_LiamHeader .= "\t\theader(\"Location: ../index.php?error_messages='You are not logged in!'\");\n";
    $output_LiamHeader .= "\t\texit();\n";
	$output_LiamHeader .= "\t}\n";
	$output_LiamHeader .= "\telse {\n";
    $output_LiamHeader .= "\t\t\$logged = 'in';\n";
	$output_LiamHeader .= "\t}\n";
	$output_LiamHeader .= "\t?>\n";
	$output_LiamHeader .= "<!-- LIAM header ends here -->\n\n";
	
	//create DEBUG function
	
	$output_DebugHeader = "<!-- DEBUG function starts here -->\n";
	$output_DebugHeader .= "\t<?php\n";
	$output_DebugHeader .= "\t\$DEBUG = FALSE;\n";
	$output_DebugHeader .= "\tif  (!empty(\$_GET) && !empty(\$_GET[\"debug\"]) && (\$_GET[\"debug\"] == 'on' )) {\n";
	$output_DebugHeader .= "\t\t\$DEBUG = TRUE;\n";
	$output_DebugHeader .= "\t\tini_set('display_errors', 1);\n";
	$output_DebugHeader .= "\t\terror_reporting(E_ALL);\n";
	$output_DebugHeader .= "\t}\n";
	$output_DebugHeader .= "\t?>\n";
	$output_DebugHeader .= "<!-- DEBUG function ends here -->\n\n";
		
	//create Request Handler class for each table
	
	$output_RequestHandler = "<!-- START return just data from the DB here -->\n";
	$output_RequestHandler .="<!--  Request Handler starts here  -->\n";
	$output_RequestHandler .="<!--  Process Parameters starts here  -->\n";
	$output_RequestHandler .= "\t<?php\n";
	$output_RequestHandler .= "\t\$command=\"\";\n";
	$output_RequestHandler .= "\t\$parameter=\"\";\n";
	$output_RequestHandler .= "\tif (!empty(\$_GET) &&  \$_GET[\"data\"] == 'on' ) {\n";
	$output_RequestHandler .= "\t\tif (!empty(\$_GET[\"cmd\"])) {\n";
	$output_RequestHandler .= "\t\t\t\$command=\$_GET[\"cmd\"];\n";
	$output_RequestHandler .= "\t\t\t\$parameter = \"\";\n";
	$output_RequestHandler .= "\t\t\tif (!empty(\$_GET[\"param\"])){\$parameter=\$_GET[\"param\"];}\n";
	$output_RequestHandler .= "\t\t}\n";
	$output_RequestHandler .= "\telse {exit;}\n";
	$output_RequestHandler .= "\t}\n";
	$output_RequestHandler .= "\t?>\n";
	$output_RequestHandler .="<!--  Process Parameters ends here  -->\n";
	
	$output_RequestHandler .="<!--  RequestHandler Class Definition starts here  -->\n";
	
	$output_RequestHandler .= "<?php\n";
	$output_RequestHandler .= "\tclass RequestHandler {\n";
	$output_RequestHandler .= "\t\tprivate \$db;\n";
	$output_RequestHandler .= "\t\tpublic function __construct() {\n";
	$output_RequestHandler .= "\t\t\$config['db']['host'] = \"$db_server\";\n";
	$output_RequestHandler .= "\t\t\$config['db']['user'] = \"$db_user\";\n";
	$output_RequestHandler .= "\t\t\$config['db']['password'] = \"$db_pass\";\n";
	$output_RequestHandler .= "\t\t\$config['db']['database'] = \"$db_name\";\n";
	$output_RequestHandler .= "\t\t/* include_once '../DB_config/login_credentials_DB_bpmspace_sample.inc.php';*/\n\n";
	$output_RequestHandler .= "\t\t\$db = new mysqli(\$config['db']['host'], \$config['db']['user'], \$config['db']['password'], \$config['db']['database']);\n";
	$output_RequestHandler .= "\t\t/* check connection */\n";
	$output_RequestHandler .= "\t\tif(\$db->connect_errno){\n";
	$output_RequestHandler .= "\t\t\tprintf(\"Connect failed: %s\", mysqli_connect_error());\n";
	$output_RequestHandler .= "\t\t\texit();\n";
	$output_RequestHandler .= "\t\t\t}\n";
	$output_RequestHandler .= "\t\t\$db->query(\"SET NAMES utf8\");\n";
	$output_RequestHandler .= "\t\t\$this->db = \$db;\n";
	$output_RequestHandler .= "\t}\n\n";
	$output_RequestHandler .= "\tprivate function getResultArray(\$result) {\n";
	$output_RequestHandler .= "\t\t\$results_array = array();\n";
	$output_RequestHandler .= "\t\tif (!\$result) return false;\n";
	$output_RequestHandler .= "\t\twhile (\$row = \$result->fetch_assoc()) {\n";
	$output_RequestHandler .= "\t\t\t\$results_array[] = \$row;\n";
	$output_RequestHandler .= "\t\t}\n";
	$output_RequestHandler .= "\t\treturn json_encode(\$results_array);\n";
	$output_RequestHandler .= "\t}\n\n";
	
	foreach ($all_table_names as $table) { //for eaceh tabel of the sected DB generate CRUD functions
	
		$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$table["TABLE_NAME"]."' AND TABLE_SCHEMA = '$db_name'";
		if(!$result = $con->query($query)){
		die('There was an error running the query [' . $con->error . ']');}
		$columns_info = $result->fetch_all(MYSQLI_ASSOC);
				
		$output_RequestHandler .= "\t// Table \"" .$table["TABLE_NAME"]. "\" in database " . $db_name . " has ". $result->num_rows . " coloumns. \n";
		
		$output_RequestHandler .= "\t// \tCOLUMN_NAME[ORDINAL_POSITION]:\tvalue\tCOLUMN_TYPE\tCOLUMN_KEY\n";
		foreach($columns_info as $value){
			$output_RequestHandler .= "\t// \tCOLUMN_NAME[" . $value['ORDINAL_POSITION'] . "]:\t\t" . $value['COLUMN_NAME']. "\t\t" .$value['COLUMN_TYPE']. "\t\t" .$value['COLUMN_KEY']."\n";
		}
		$output_RequestHandler .= "\n";
		
		$prim_key ="";
		//foreach ($prim_key
		
		if ($columns_info[0]['COLUMN_KEY'] != "PRI"){
		$output_RequestHandler .= "\t//WARNING - FIRST Column not PRIMARY KEY \n";
		}
		
		$output_RequestHandler .= "\t\tpublic function get_$table[TABLE_NAME]_list(\$limit = \"100\"){\n";
		$output_RequestHandler .= "\t\t\t\$query = \$this->db->query(\"SELECT * FROM $table[TABLE_NAME] LIMIT \".\$limit.\";\");\n";
		$output_RequestHandler .= "\t\t\treturn \$this->getResultArray(\$query);\n";								
		$output_RequestHandler .= "\t\t}\n";
		  		  
		$output_RequestHandler .= "\t\tpublic function get_$table[TABLE_NAME]_element(\$id = \"\"){\n";
		$output_RequestHandler .= "\t\t\t\$query = \$this->db->query(\"SELECT * FROM $table[TABLE_NAME] where [COLUMN_NAME] = \".\$id.\";\");\n";
		$output_RequestHandler .= "\t\t\treturn \$this->getResultArray(\$query);\n";
		$output_RequestHandler .= "\t\t}\n\n";
		
	} //End loop for each tabel
		$output_RequestHandler .="\t}\n";
		
		$output_RequestHandler .="\t\$RH = new RequestHandler();\n";
		$output_RequestHandler .="\tif ( \$command != \"\") {\n";
		$output_RequestHandler .="\t\tif ( \$parameter != \"\") {\n";
		$output_RequestHandler .="\t\t\t\$result = \$RH->\$command(\$parameter);\n";
		$output_RequestHandler .="\t\t}\n";
		$output_RequestHandler .="\t\telse {\n";
		$output_RequestHandler .="\t\t\t\$result = \$RH->\$command();\n\t\t}\n";
		$output_RequestHandler .="\techo \$result;\n";
		$output_RequestHandler .="\texit;\n";
		$output_RequestHandler .="\t}";
		$output_RequestHandler .="\n?>\n";
		$output_RequestHandler .="<!--  Class Definition ends here  -->\n";
	
		$output_RequestHandler .= "<!-- Request Handler ends here  -->\n\n";
		
		$output_RequestHandler .= "<!-- END return just data from the DB here -->\n";
		
	// end create Request Handler Class
	
	$output_header = "<!DOCTYPE html>\n";

	
	
	$output_header .= "<html xmlns=\"http://www.w3.org/1999/xhtml\" ng-app=\""."$db_name"."App\">\n";
	$output_header .= "<head>\n";
	$output_header .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n";
	$output_header .= "<title>BPMspace "."$db_name"."</title>\n";
	$output_header .= "<!-- CSS -->\n";
	$output_header .= "<link rel=\"stylesheet\" href=\"../css/bootstrap.min.css\" media=\"screen\" />\n";
	$output_header .= "<link rel=\"stylesheet\" href=\"../css/font-awesome.min.css\" />\n";
	$output_header .= "<link rel=\"stylesheet\" href=\"../css/fuelux.min.css\" />\n";
	$output_header .= "<link rel=\"stylesheet\" href=\"../css/xeditable.css\" />\n";

	$output_header .= "<style>\n";
	$output_header .= "#bpm-liam-header { margin-top: -20px; margin-bottom: 10px; padding-right: 50px;}\n";
	$output_header .= "#bpm-logo-care { position:relativ;	z-index: 10;	margin-right: -20px;}\n";
	$output_header .= "#bpm-logo  { position:relativ; margin-bottom: 20px;}\n";
	$output_header .= "#bpm-menu {margin-right: 20px; margin-left: 20px; margin-bottom: 10px;}\n";
	$output_header .= "#bpm-content {margin-right: 20px; margin-left: 20px; margin-bottom: 10px;}\n";
	$output_header .= "#bpm-footer {margin-right: 10px; margin-left: 10px; margin-bottom: 10px;}\n";
	$output_header .= "</style>\n";

	$output_header .= "<!-- <link rel=\"stylesheet\" href=\"css/"."$db_name".".css\" /> -->\n";
	$output_header .= "</head>\n";

	$output_header .= "<!--  header ends here -->\n\n";
	
			
	$output_menu = "<!--  body menu starts here -->\n\n";
	
	$output_menu .= "<body ng-controller=\""."$db_name"."Ctrl\">\n";
	$output_menu .= "\t<div class=\"container\">\n";
	$output_menu .= "\t\t<div class=\"row\">\n";
	
	$output_menu .= "\t\t<div  class=\"row text-right\">\n";
	$output_menu .= "\t\t\t<div class=\"col-md-12\">\n";
    $output_menu .= "\t\t\t<a href='#' id=\"bpm-logo-care\" class=\"btn collapsed\" data-toggle=\"collapse\" data-target=\"#bpm-logo, #bpm-liam-header\"><i class=\"fa fa-caret-square-o-down\"></i></a>\n";
    $output_menu .= "\t\t\t</div>\n";
	
	$output_menu .= "\t\t\t<div class=\"col-md-12 collapse in text-right\" id=\"bpm-liam-header\">\n";
	$output_menu .= "\t\t\t\t<?php\n";
	$output_menu .= "\t\t\t\t\t// comment if you do NOT want to use LIAM for identity and access management\n";
	$output_menu .= "\t\t\t\t\tinclude_once '../_header_LIAM.inc.php'\n";
	$output_menu .= "\t\t\t\t\t// end liam header\n";
	$output_menu .= "\t\t\t\t?>\n";
	$output_menu .= "\n\t\t\t</div>\n";
	$output_menu .= "\t\t</div>\n";
	$output_menu .= "\t</div>\n";
	

	
	$output_menu .= "\t\t<div class=\"col-md-12 collapse in\" id=\"bpm-logo\">\n";
	$output_menu .= "\t\t\t<div class=\"col-md-6 \"><img class=\"img-rounded\" src=\"http://dummyimage.com/100x100/ff0000/FFF.png&text=your+logo\" alt=\"your logo\" /></div>\n";
	$output_menu .= "\t\t\t<div class=\"col-md-6 \"><img class=\"pull-right img-rounded\" src=\"http://dummyimage.com/200x100/0000ff/FFF.png&text="."$db_name"."\" alt=\""."$db_name"."\" /></div>\n";
    $output_menu .= "\t\t</div>\n";
	$output_menu .= "\t</div>\n";
	$output_menu .= "\n";
	

	$output_menu .= "<nav class=\"navbar navbar-default bg-faded\">\n";
	$output_menu .= "\t<div class=\"container\">\n";
	$output_menu .= "\t\t<ul class=\"nav nav-tabs\" id=\"bpm-menu\">\n";
	
	foreach($all_table_names as $value){
		$output_menu .= "\t\t\t<li><a title=\"".$value['TABLE_NAME']."\" href=\"#".$value['TABLE_NAME']."\" data-toggle=\"tab\"><i class=\"fa fa-circle-o\"></i> ".$value['TABLE_NAME']."</a></li>\n";
	}
	
	$output_menu .= "\n";
	$output_menu .= "\t\t</ul>\n";
	$output_menu .= "\t</div>\n";
	$output_menu .= "</nav>\n";

	$output_menu .= "\n";
	$output_menu .= "\n";
	$output_menu .= "\n\n";
	
	$output_menu .= "<!--  body menu starts here -->\n\n";
	
	$output_content = "<!--  body content starts here -->\n\n";
	
	$output_content .= "<div class=\"container\">\n";
	$output_content .= "\t\t<div class=\"row\">\n";
	
	$output_content .="\t\t<div class=\"col-md-12 tab-content\" id=\"bpm-content\">\n";
		
	$i = 0;
	foreach($all_table_names as $value){
				$output_content .= "\t\t\t\t<div class=\"tab-pane";
				if ($i == 3) {$output_content .= " active";}
				$output_content .= "\" id=\"".$value['TABLE_NAME']."\">\n";
				$output_content .= "\t\t\t\t<h2>".$value['TABLE_NAME']."</h2>\n";
				$output_content .= "\t\t\t\t".$value['TABLE_NAME']."</div>\n";
				$i++;
				}
				
	$output_content .= "\t\t</div>\n";
	$output_content .= "\t</div>\n";
	$output_content .= "</div>\n";
	
	$output_content .= "<!--  body content ends here -->\n\n";
	

	$output_footer = "<!--  footer starts here -->\n\n";

	$output_footer .= "<div class=\"container\">\n";
	$output_footer .= "\t<div class=\"row well\" id=\"bpm-footer\">\n";
	$output_footer .= "\t\t\t<div class=\"col-md-3\">BPMspace "."$db_name"." using</div>\n";
	$output_footer .= "\t\t\t<small><div class=\"col-md-9\">\n";
	$output_footer .= "\t\t\t\t<ul class=\"list-inline\">\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"http://getbootstrap.com/\" target=\"_blank\">Bootstrap</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://jquery.com/\" target=\"_blank\">jQuery</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://angularjs.org/\" target=\"_blank\">AngularJS</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"http://php.net/\" target=\"_blank\">PHP</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"http://getfuelux.com/\" target=\"_blank\">FuelUX</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://angular-ui.github.io/\" target=\"_blank\">AngularUI</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://www.tinymce.com/\" target=\"_blank\">TinyMCE</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://vitalets.github.io/x-editable/\" target=\"_blank\">X-editable</a></li>\n";
	$output_footer .= "\t\t\t\t\t<li><a href=\"https://github.com/peredurabefrog/phpSecureLogin\" target=\"_blank\">phpSecureLogin</a></li>\n";
	$output_footer .= "\t\t\t\t</ul>\n";
	$output_footer .= "\t\t</div><small>\n";
	$output_footer .= "\t</div>\n";
	$output_footer .= "</div>\n";

	
	$output_footer .= "<!-- JS -->\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/angular.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/angular-sanitize.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/ui-bootstrap-1.3.1.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/ui-bootstrap-tpls-1.3.1.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/jquery-2.1.4.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/tinymce.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/tinymceng.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/bootstrap.min.js\"></script>\n";
	$output_footer .= "<script type=\"text/javascript\" src=\"../js/xeditable.min.js\"></script>\n";
		
	$output_footer .= "<!-- <script type=\"text/javascript\" src=\"js/"."$db_name".".js\"></script> -->\n";


	$output_footer .= "</body>\n";
	$output_footer .= "</html>\n";
	$output_footer .= "\n\n";

	$output_footer .= "<!--  footer ends here -->\n\n";
	
	echo $output_LiamHeader;
	echo $output_DebugHeader;
	echo $output_RequestHandler;
	//echo $output_header;
	//echo $output_menu;
	//echo $output_content;
	//echo $output_footer;
	

?>
