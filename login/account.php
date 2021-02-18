<?php
    session_start();
    $root = realpath(dirname(__FILE__)."/../."); 
?>

<?php
    function generateRandomString($length = 6) {
        return substr(str_shuffle(str_repeat($x='0123456789', ceil($length/strlen($x)) )),1,$length);
    }
    function email_exists($email) {
        $email = str_replace("@","_at_",$email);
        $email = str_replace(".","_dot_",$email);
        global $root;
        $path = $root."/info/email_tree/";
        for ($i = 0; $i < strlen($email); $i++){
            $path .= $email[$i]."/";
            if (!file_exists($path)) return false;
        }
        $path .= "user.txt";
        if (file_exists($path)) 
            return file_get_contents($path);
        else 
            return false;
    }
    
    if (file_exists($root."/users/".$_REQUEST["username"])) {
        $url = "https://www.setpsi.com/login/createaccount.php?error=username&username=".$_REQUEST["username"];
        echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
    }
    else if (email_exists($_REQUEST["email"])) {
        $url = "https://www.setpsi.com/login/createaccount.php?error=email&email=".$_REQUEST["email"];
        echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
    } 
    else {
        $_SESSION["verification"] = generateRandomString();
        $_SESSION["email"] = $_REQUEST["email"];
        $_SESSION["username"] = $_REQUEST["username"];
        $_SESSION["password"] = password_hash($_REQUEST["password"], PASSWORD_DEFAULT);
        
        $message = 'Hello, ' . htmlspecialchars($_SESSION["username"]) . '! Verification Code : ' . $_SESSION["verification"] ;
        $email = htmlspecialchars($_SESSION["email"]);
        mail($email, "Set Psi", $message);
        //echo "<p>".$_SESSION["verification"]."</p>";
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title><?php echo htmlspecialchars($_SESSION["username"]);?></title>
        <style>
            <?php
                echo file_get_contents ($root."/lib/main.css");
            ?>
        </style>
    </head>
    <body>
        <h1><?php echo "Welcome ".htmlspecialchars($_SESSION["username"]) ;?></h1>
        <p>An email was sent to <?php echo $_SESSION["email"];?> with your verification code. </p>
        <form id="verify" method="post" action="verify.php">
          <label for="verification">Verification Code:</label>
          <input type="text" id="verification" name="verification"><br><br>
          <input type="submit">
        </form>
    </body>
</html>
