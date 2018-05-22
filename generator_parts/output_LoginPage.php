<?php
    // Includes
    require_once(__DIR__.'/src/DatabaseHandler.inc.php'); // For Config (AuthKey)
    require_once(__DIR__.'/src/AuthHandler.inc.php');

    // Parameters
    @$user = $_POST['usr'];
    @$pass = $_POST['pwd'];

    // TODO: Select Login from Database
    $login_successful = false;   
    /* 
    // Select Login from Database
    $login_successful = false;    
    $sql = "SELECT userid, vorname, nachname FROM users WHERE username = '$user' AND password = '$pass' LIMIT 1;";
    $res = DB::getInstance()->getConnection()->query($sql);
    if ($res->num_rows > 0) {
        $row = $res->fetch_array();
        // Set Data
        $user_id = $row[0];
        $firstname = $row[1];
        $lastname = $row[2];
        $login_successful = true;
    }
    */
    if ($user == 'root' && $pass == 'toor') {
        $user_id = 23;
        $firstname = 'John';
        $lastname = 'Doe';
        $login_successful = true;
    }

    
    // Set Token when Login was successful
    if ($login_successful) {
        // Generate Token
        $token_data = array();
        $token_data['uid'] = $user_id;
        $token_data['firstname'] = $firstname;
        $token_data['lastname'] = $lastname;
        // Token vaild for 60min
        $token_data['exp'] = time() + 60 * 60; // 3600; // * 24 * 60;
        $token = JWT::encode($token_data, AUTH_KEY);

        // Set Cookie which holds Token (for the next 100 days)
        // TODO: Better use localstorage in client -> build into API
        setcookie("token", $token, time()+(3600 * 24 * 100));

        // Redirect
        header("Location: index.php");
        exit();
    }
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <title>Login</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container" style="margin-bottom: 50px;">
        <div class="row">
            <div class="col-xs-1 col-md-3 col-lg-4"></div>
            <form class="form col-xs-10 col-md-6 col-lg-4" method="post" action="login.php">
                <h2>Please sign in</h2>
                <label for="inputEmail" class="sr-only">Email address</label>
                <input type="text" id="inputEmail" name="usr" class="form-control" placeholder="Email address" required autofocus>
                <br>
                <label for="inputPassword" class="sr-only">Password</label>
                <input type="password" id="inputPassword" name="pwd" class="form-control" placeholder="Password" required>
                <br>
                <div class="row">
                    <div class="col-xs-6">
                        <button class="btn btn-lg btn-primary btn-block " type="submit">Sign in</button>
                    </div>
                </div>
            </form>
            <div class="col-xs-1 col-md-3 col-lg-4"></div>
        </div>
    </div>
  </body>
</html>