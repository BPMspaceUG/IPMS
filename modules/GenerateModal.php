<?php

$fileName = $_GET['fName'];
replaceName($fileName);

function codeToString(){
    $file = fopen("../resources/EXAMPLEModal.php",'r') or die("Unable to open File");
    $code =  (fread($file, filesize("../resources/EXAMPLEModal.php")) );
    fclose($file);
    return $code;
}

function replaceName($fName){
    $code = codeToString();
    $code = str_replace("TABLE_NAME", $fName, $code);

    $file = fopen('../generated files/'.$fName.'_Modal.php','w');
    fwrite($file,$code);
    fclose($file);

    $_SESSION['TableName'] = $fName;
//    echo "<pre>";
    echo $code;
//    echo "</pre>";

}
