<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" ng-app="application" xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>BPMspace IPMS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!--    <meta http-equiv="refresh" content="0; URL=index.php">-->
    <!--	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css"-->
    <!--		  media="screen">-->
    <!--	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">-->

    <link rel="stylesheet" href="../libraries/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="../libraries/css/font-awesome.css" type="text/css">

    <link rel="shortcut icon" href="../images/favicon.png"/>

    <link rel="stylesheet" href="../css/styles.css">
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

    ?>
</head>
<body>
<div class="container" style="background-color:#003296 ">
    <div class="row">
        <div class="col-md-8">
            <img style="margin-left: -14px;" src="../images/BPMspace_logo_small.png" class="img-responsive"
                 alt="BPMspace Development"/>
        </div>
        <div class="col-md-4" style="margin-top: 8px; margin-right: 0px;">

            <?php //include_once '../../_header_LIAM.inc.php'; ?>

        </div>
    </div>
</div>
<?php
/* presente $error_messages when not empty */
if (!empty ($_GET ["error_messages"])) {
    echo '<div class="container alert alert-danger centering 90_percent" role="alert"; > <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>';
    echo '&nbsp;error:&nbsp;' . htmlspecialchars($_GET ["error_messages"]);
    echo '</div></br>';
}


if((isset($_GET['Database']) && $_GET['Database'] != "Please choose database")
    &&(isset($_GET['TableName']) && $_GET['TableName'] != 'undefined')){

    $db = $_GET['Database'];
    $table = $_GET['TableName'];

    $con = new mysqli(HOST, USER, PASSWORD, $db) or die('Error');
    $result = $con->query("SELECT * FROM $table");
    echo '<div class="container">';
    table($result);
    echo '</div>';

}else{ ?>
    <h1>Please Select a Table and then comeback to view Data</h1>
    <script type="text/javascript">setTimeout("window.close();", 3000);</script>
<?php
}

/*Function Definitions*/
function table( $result ) {
    $result->fetch_array( MYSQLI_ASSOC );
    echo '<table class="table table-striped">';
    tableHead( $result );
    tableBody( $result );
    echo '</table>';
}

function tableHead( $result ) {
    echo '<thead>';
    foreach ( $result as $x ) {
        echo '<tr>';
        foreach ( $x as $k => $y ) {
            echo '<th>' . ucfirst( $k ) . '</th>';
        }
        echo '</tr>';
        break;
    }
    echo '</thead>';
}

function tableBody( $result ) {
    echo '<tbody>';
    foreach ( $result as $x ) {
        echo '<tr>';
        foreach ( $x as $y ) {
            echo '<td>' . $y . '</td>';
        }
        echo '</tr>';
    }
    echo '</tbody>';
}
?>
<div class="container well">
    BPMspace IPMS using <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a>.
</div>

<!-- Loading js Scripts    -->
<script type="text/javascript" src="libraries/js/jquery.min.js"></script>
<script type="text/javascript" src="libraries/js/bootstrap.min.js"></script>
<script type="text/javascript" src="libraries/js/clipboard.min.js"></script>
<script>    // init clipboard
    new Clipboard('.bpm-copy');
</script>
<script type="text/javascript" src="js/actions.js"></script>

<!--<script type="text/JavaScript" src="../phpSecureLogin/js/sha512.js"></script>-->
<!--<script type="text/JavaScript" src="../phpSecureLogin/js/forms.js"></script>-->


</body>
</html>


