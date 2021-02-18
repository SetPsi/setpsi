<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com";
    
    $projects = $root."/users/".$_SESSION["logged_in"]."/projects/";
    chdir($projects);
    $projectcount = $root."/users/".$_SESSION["logged_in"]."/projectcount.txt";
    $project = strval(((int)file_get_contents($projectcount))+1);
    file_put_contents($projectcount,$project);
    chmod($projectcount,0700);
    echo "<h1>Project ".$project."</h1>";
    mkdir($project);
    chdir($project);
    mkdir("functions");
    mkdir("shaders");
    $config = fopen("config.txt","w");
    fwrite($config, "");
    fclose($config);
    $title = fopen("title.txt","w");
    fwrite($title, "untitled");
    fclose($title);
    $url = "https://www.setpsi.com/editor?user=".$_SESSION["logged_in"]."&project=".$project;
    echo "<script type='text/javascript'>window.location.replace('".$url."');</script>";
?>