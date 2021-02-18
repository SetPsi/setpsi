<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com";  
?>
<!DOCTYPE html>
<html>
    <head>
        <title><?php 
            echo $_GET["user"];
        ?></title>
    <style>
        <?php
            echo file_get_contents ($root."/lib/main.css");
        ?>
    </style>
    </head>
    <body>
        <h1><?php echo $_GET['user']?></h1>
        <?php
            $projects = $root . "/users/" . $_GET['user'] . "/projects";
            $files = array_slice(scandir($projects),2);
            foreach ($files as $file) {
                echo "<b>".$file." : </b>";
                $title = file_get_contents( $projects . "/" . $file . "/title.txt");
                echo "<a href='https://www.setpsi.com/editor/?user=".$_GET['user']."&project=".$file."'>" . $title . "</a><br>" ;
            }
            
            if (strcmp($_SESSION["logged_in"], $_GET["user"]) == 0) {
                echo "<form method='post' action='new.php'>
                    <input type='submit' value='NEW'>
                </form>";
            }
        ?>
    </body>
</html>