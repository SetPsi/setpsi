<?php
    session_start();
    $_SESSION["logged_in"] = false;
    session_destroy();
    
    echo "<script type='text/javascript'>window.location.replace(window.location.origin + '/login');</script>";
?>
