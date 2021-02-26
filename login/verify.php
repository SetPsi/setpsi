<?php
    session_start();
    $root = realpath(dirname(__FILE__)."/../."); 
?>
<!DOCTYPE html>
<html>
    <head>
        <title><?php echo $_SESSION["username"]; ?></title>
    </head>
    <body>
        <?php
        
            if (strcmp($_REQUEST["verification"], $_SESSION["verification"])==0) {
                echo "<h1>Success</h1>";
                chdir($root."/users");
                mkdir($_SESSION["username"]);
                chdir($_SESSION["username"]);
                $password = fopen("password.txt","w");
                fwrite($password, $_SESSION[password]);
                fclose($password);
                chmod("password.txt",0700);
                $email = fopen("email.txt","w");
                fwrite($email, $_SESSION["email"]);
                fclose($email);
                chmod("email.txt",0700);
                $index = fopen("index.php","w");
                $url = "https://www.setpsi.com/user/?user=".$_SESSION["username"];
                $html =  "<script type='text/javascript'>window.location.replace('".$url."');</script>";
                fwrite($index,$html);
                fclose($index);
                mkdir("projects");
                $email = str_replace("@","_at_",$_SESSION[email]);
                $email = str_replace(".","_dot_",$email);
                $path = $root."/info/emails/".$email;
                mkdir($path);
                chmod($path,0700);
                file_put_contents($path."user.txt",$_SESSION["username"]);
                chmod($path."user.txt",0700);
                chdir($root."/info/email_tree");
                for ($i = 0; $i < strlen($email); $i++){
                    if (!file_exists($email[$i])) {
                        mkdir($email[$i]);
                        chmod($email[$i],0700);
                    }
                    chdir($email[$i]);
                }
                $user = fopen("user.txt","w");
                fwrite($user,$_SESSION["username"]);
                fclose($user);
                $pojectcount = fopen("projectcount.txt","w");
                fwrite($projectcount,"0");
                fclose($projectcount);
                chmod("projectcount.txt",0700);
                $_SESSION["logged_in"] = $_SESSION["username"];
                $url = "https://www.setpsi.com/user/?user=".$_SESSION["username"];
                echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
            } else {
                echo "<h1>Fail</h1>";
                $url = "https://www.setpsi.com/login/createaccount.php?error=verification";
                echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
            }
        ?>
    </body>
</html>
