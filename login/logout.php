<?php
    session_start();
    $_SESSION["logged_in"] = false;
    session_destroy();
    
    $url = "https://www.setpsi.com/login";
    echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
?>