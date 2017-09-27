<?php
	// Param
	$data = htmlspecialchars($_POST['config_data']);
	$data = trim($data);

	if ($data == "") return;
	// Write config to file
	file_put_contents("tmp.php", $data);

	include_once("tmp.php");

	$prjname = DB_NAME;
	$jsvar = $config_tables_json;

	echo $jsvar;
?>