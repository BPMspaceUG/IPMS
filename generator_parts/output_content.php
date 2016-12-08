	$output_content = "<!--  body content starts here -->\n\n";	
	$output_content .= "<div class=\"container\">\n";
	$output_content .= "\t\t<div class=\"row\">\n";	
	$output_content .= "\t\t<div class=\"col-md-12 tab-content\" id=\"bpm-content\">\n";		
	$i = 0;
	foreach($all_table_names as $value) {
		$output_content .= "\t\t\t\t<div class=\"tab-pane";
		if ($i == 1) {$output_content .= " active";}
		$output_content .= "\" id=\"".$value['table_name']."\">\n";
		$output_content .= "\t\t\t\t<h2>".$value['table_alias']."</h2>\n";
		$output_content .= "\t\t\t\t<table class=\"table table-striped table-condensed\" >\n";
		
		$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$value["table_name"]."' AND TABLE_SCHEMA = '$db_name'";
			if(!$result = $con->query($query)){ 
			die('There was an error running the query [' . $con->error . ']');}
			$columns_info = $result->fetch_all(MYSQLI_ASSOC);
		
		$output_content .= "\t\t\t\t\t<th></th>\n";
		
		foreach($columns_info as $value_2){
			$output_content .= "\t\t\t\t\t<th>".$value_2['COLUMN_NAME']."</th>\n";
			}
			
		$output_content .= "\t\t\t\t\t<tr  ng-repeat=\"row in ".$value['table_name']."\">\n";
		$output_content .= "\t\t\t\t\t<td><i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i>&nbsp;&nbsp;<i class=\"fa fa-trash\" aria-hidden=\"true\"></i></td>\n";
		
		foreach($columns_info as $value_2){
			$output_content .= "\t\t\t\t\t<td>{{row.".$value_2['COLUMN_NAME']."}}</td>\n";
			}	
		
		$output_content .= "\t\t\t\t</table>\n\t\t\t\t</div>\n";
		$i++;
	}
			

	$output_content .= "\t\t</div>\n";
	$output_content .= "\t</div>\n";
	$output_content .= "</div>\n";
	
	$output_content .= "<!--  body content ends here -->\n\n";