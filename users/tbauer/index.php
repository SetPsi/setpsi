<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com";
?>
<!DOCTYPE html>
<html>
    <head>
        <title>tbauer</title>
    </head>
    <body>
        <h1>
            <?php 
                if(strcmp("tbauer",$_SESSION["logged_in"])==0) {
                    echo "Welcome ";
                }
            ?>
        tbauer</h1>
        <a href="https://www.setspi.com/index.php">New</a>
        <?php
            chdir($root."/users/tbauer");
            $projects = scandir("projects");
            foreach ($projects as $project) {
                echo "<p>".$project."</p>";
            }
            
        ?>
        <a href="https://www.setpsi.com/login/logout.php">Logout</a>
    </body>
</html>