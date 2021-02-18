<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com";
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Create Account</title>
        <style>
            <?php
                echo file_get_contents ($root."/lib/main.css");
            ?>
        </style>
    </head>
    <body>
        <h2>Create New Account</h2>
          <?php if (strcmp($_GET["error"],'verification')==0) {echo "<i>Failed to verify email</i>"; }?><br>
        <form method="post" action="account.php">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email"><br>
          <?php if (strcmp($_GET["error"],'email')==0) {echo "<i>Email ".$_GET['email']." alerady exists</i>"; }?><br>
          <label for="username">User Name:</label>
          <input type="text" id="username" name="username"><br>
          <?php if (strcmp($_GET["error"],'username')==0) {echo "<i>User ".$_GET['username']." already exists</i>"; }?><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password"><br><br>
          <input type="submit">
        </form>
        <br>
        <a href="index.php">Log In</a>
    </body>
</html>