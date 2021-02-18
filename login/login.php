<?php
    session_start();
    $root = realpath(dirname(__FILE__)."/../.");
?>
<?php
    function email_exists($email) {
        $email = str_replace("@","_at_",$email);
        $email = str_replace(".","_dot_",$email);
        global $root;
        $path = $root."/info/email_tree";
        for ($i = 0; $i < strlen($email); $i++){
            $path .= "/".$email[$i];
            if (!file_exists($path)) return false;
        }
        $path .= "/"."user.txt";
        if (file_exists($path)) {
            return file_get_contents($path);
        } else 
            return false;
    }
    $username = $_REQUEST["username"];
    $email = email_exists ($username);
    if ($email != false) $username = $email;
    chdir($root."/users");
    if (file_exists($username)) {
        chdir($username);
        $password_file = fopen("password.txt","r");
        $password = fgets($password_file);
        if (password_verify($_REQUEST["password"],$password)) {
            $_SESSION["username"] = $username;
            $_SESSION["logged_in"] = $username;
            $url = "https://www.setpsi.com/user/?user=".$username;
            echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
        } else {
            $url = "https://www.setpsi.com/login/index.php?error=password";
            echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
        }
    } else {
        $url = "https://www.setpsi.com/login/index.php?error=username&username=".$username;
        echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
    }
?>
