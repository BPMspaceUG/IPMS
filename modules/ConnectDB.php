<?php
/*
 * Fetching all parameters
 */
$params = $_REQUEST;

/*
 * Creating a new Connection from given parameters
 */
//$con = new mysqli ('localhost:3306', 'root', '');  //Default server.
$con = new mysqli();
if (isset($_REQUEST)) {
    // Making Connection with port number
    if (isset($params['port'])) {
        $con = new mysqli ($params['host'] . ":" . $params['port'], $params['user'], $params['pwd']);
    } // Connection with default port number
    else {
        $con = new mysqli ($params['host'], $params['user'], $params['pwd']);
//        echo 'without port';
    }

    if ($con->connect_error) {
        echo("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
        die ("\nCould not connect to db. Further Script processing terminated ");
    } else {
        $json = getData($con);

//        $jsonFinal = array("result" => $json);
//        $jsonFinal = null;
//        json_encode($jsonFinal);
        header('Content-Type: application/json');
        echo json_encode($json);
        $con->close();
    }

}


// Extracting databases and converting them to jSon
function getData($con)
{
    $json = array();
    $query = "SHOW DATABASES";
    $result = mysqli_query($con, $query);

    while ($row = $result->fetch_assoc()) {
        $dbName = $row['Database'];
        array_push($json, array(
                "database" => $dbName,
                "tables" => getTablesJson($con, $dbName)
            )
        );
    }

    return $json;
}

// Extracting tables and converting them to jSon
function getTablesJson($con, $db)
{
    $query = "show tables in $db";
    $json = array();

    $nameParam = "Tables_in_$db";

    $result = mysqli_query($con, $query);
    while ($row = $result->fetch_assoc()) {

        array_push($json, array(
                "table" => $row[$nameParam])
        );
    }

    return $json;
}
