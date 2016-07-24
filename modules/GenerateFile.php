<?php

$fileName = $_GET['fName'];
replaceName($fileName);

function codeToString(){
    $file = fopen("../resources/EXAMPLE_RequestHandler.inc.php",'r') or die("Unable to open File");
    $code =  (fread($file, filesize("../resources/EXAMPLE_RequestHandler.inc.php")) );
    fclose($file);
    return $code;
}

function replaceName($fName){
    $code = codeToString();
    $code = str_replace("TABLE_NAME", $fName, $code);

    $file = fopen('../generated files/'.$fName.'_RequestHandler.inc.php','w');
    fwrite($file,$code);
    fclose($file);

//    echo "<pre>";
    echo $code;
//    echo "</pre>";

}
