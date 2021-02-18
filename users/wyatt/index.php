<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com";
?>
<!DOCTYPE html>
<html>
    <head>
        <title>wyatt</title>
    </head>
    <body>
        <h1>
            <?php 
                if(strcmp("wyatt",$_SESSION["logged_in"])==0) {
                    echo "Welcome ";
                }
            ?>
        wyatt</h1>
        <a href="https://www.setspi.com/index.php">New</a>
        <?php
            chdir($root."/users/wyatt");
            $projects = scandir("projects");
            foreach ($projects as $project) {
                if ($project[0]!=".") {
                    echo "<p>".$project."</p>";
                }
            }
            
        ?>
        <a href="https://www.setpsi.com/login/logout.php">Logout</a>
    </body>
</html>