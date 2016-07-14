
<?php
/*uncomment this below */
//    // session_destroy();
//    if (empty ($_GET ["error_messages"])) {
//        include_once '../../phpSecureLogin/includes/db_connect.inc.php';
//        include_once '../../phpSecureLogin/includes/functions.inc.php';
//
//        // sec_session_start();
//
//        if (login_check($mysqli) == true) {
//            $logged = 'in';
//        } else {
//            $logged = 'out';
//        }
//    } else {
//        $logged = 'out';
//    }
//
/* Comment the 3 lines below */
define("HOST", "localhost"); //change these
define("USER", "root"); // to required DB
define("PASSWORD", ""); //connection


define("DATABASE", "bpmspace_ipms_v1");
define("DB_TBL", "connections");

prepareLocalDbAndTables();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (!empty($_POST['host']) && !empty($_POST['user']) && !empty($_POST['port'])) {
        $host = $_POST['host'];
        $user = $_POST['user'];
        $port = $_POST['port'];

        $con = new mysqli(HOST, USER, PASSWORD, DATABASE);
        if ($con->connect_error) {
            echo("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
            die ("\nCould not connect to db. Further Script processing terminated ");
        }

        //Total Row Count before new insertion
        $before = null;
        $rowBefore = $con->query("SELECT COUNT(id) FROM connections");
        while ($row = $rowBefore->fetch_assoc()) {
            $before = ($row['COUNT(id)']);
        }

//        Insertion
        $query = "INSERT INTO `connections` (dbhost, dbuser,dbport)
        SELECT '$host', '$user',$port  FROM DUAL
        WHERE NOT EXISTS (SELECT * FROM `connections`
        WHERE dbhost='$host' AND dbuser='$user' AND dbport=$port)
        LIMIT 1";
        $results = mysqli_query($con, $query);
//        Total Row Count after new insertion
        $after = null;
        $rowAfter = $con->query("SELECT COUNT(id) FROM connections");
        while ($row = $rowAfter->fetch_assoc()) {
            $after = ($row['COUNT(id)']);
        }
//        Connection Closed
        $con->close();
//        checking whether number of rows affected or not
//        echo $after.$before;
        if ($after > $before) {
            echo (1);
        } else {
            echo (0);
        }//check ends
    } else { // no Connection params
        echo 404;
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (isset($_GET['id'])) {
        $con = new mysqli(HOST, USER, PASSWORD, DATABASE);
        if ($con->connect_error) {
            echo("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
            die ("\nCould not connect to db. Further Script processing terminated ");
        }

        $query = "DELETE FROM " . DB_TBL . " WHERE id = " . $_GET['id'];
        mysqli_query($con, $query);
        $con->close();
        header('Location: ../');
    } else {
//        header('Content-Type: application/json');

        $con = new mysqli(HOST, USER, PASSWORD, DATABASE);
        if ($con->connect_error) {
            echo("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
            die ("\nCould not connect to db. Further Script processing terminated ");
        }

        $response = array();

        $query = "SELECT * FROM " . DB_TBL;
        $result = mysqli_query($con, $query);
        while ($row = $result->fetch_assoc()) {
            array_push($response, array(
                "id" => $row['id'],
                "host" => $row['dbhost'],
                "user" => $row['dbuser'],
                "port" => $row['dbport']
            ));
        }

//        $response = array("result" => $response);

        echo json_encode($response);
    }

}
/**
 * creates local database and table(s) for the first time
 * @return void
 * */
function prepareLocalDbAndTables()
{

    $con = new mysqli(HOST, USER, PASSWORD, DATABASE);
    if ($con->connect_error) {
        echo("\n\nCould not connect: ERROR NO. " . $con->connect_errno . " : " . $con->connect_error);
        die ("\nCould not connect to db. Further Script processing terminated ");
    }

    $createDbQuery = "CREATE DATABASE IF NOT EXISTS " . DATABASE;
    $createTableQuery =
        "CREATE TABLE IF NOT EXISTS " . DB_TBL
        . "(id int not null auto_increment primary key, dbhost varchar(45), dbuser varchar(140), dbport int)";

    // create db
    mysqli_query($con, $createDbQuery);

    mysqli_select_db($con, DATABASE);

    // create table
    mysqli_query($con, $createTableQuery);

    $con->close();
}