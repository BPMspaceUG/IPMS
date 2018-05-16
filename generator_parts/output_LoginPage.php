<?php
    // Includes
    require_once(__DIR__.'/src/AuthHandler.inc.php');

    // Parameters
    @$user = $_POST['usr'];
    @$pass = $_POST['pwd'];
    // TODO: check login
    if ($user == 'root' && $pass == 'toor') {
        
        // TODO: Generate Token
        $secret_key = 'bmp_space_165423106546545'; // TODO: Config
        $token = array();
        $token['uid'] = $_GET['uid'];
        $token['firstname'] = $_GET['firstname'];
        $token['lastname'] = $_GET['lastname'];
        $token['exam_valid_for'] = $_GET['examvalidfor'];
        $token['exam_id'] = $_GET['examid'];
        $token['exp'] = time() + $_GET['tokenvalidfor'] * 60;
        //echo '<a href="verify.php?token=';
        echo JWT::encode($token, $secret_key);
        //echo '">verify.php?token='.JWT::encode($token, $secret_key).'</a>'

        // Set Cookie (for the next 30 days)
        setcookie("token", "content", time()+(3600 * 24 * 30));
        // Redirect
        header("Location: index.php");
        exit();
    }
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <link rel="icon" href="../../favicon.ico">
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