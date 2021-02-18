<?php
   session_start();
   $root = realpath(dirname(__FILE__)."/../.");
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Log In</title>
        <style>
            <?php
                echo file_get_contents ($root."/lib/main.css");
            ?>
        </style>
    </head>
    <body>
        <h2>Log In</h2>
        <form method="post" action="login.php">
          <label for="username">User Name/Email:</label>
          <input type="text" id="username" name="username"><br>
          <?php if (strcmp($_GET["error"],"username")==0) echo "<i>User ".$_GET["username"]." does not exist</i>" ?><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password"><br>
          <?php if (strcmp($_GET["error"],"password")==0) echo "<i>Wrong password</i>" ?><br>
          <input type="submit">
        </form>
        <br>
        <a href="createaccount.php">Create Account</a>
    </body>
</html>
