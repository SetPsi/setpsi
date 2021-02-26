<?php
    session_start();
    $root = realpath(dirname(__FILE__)."/../."); 
?>
<?php
    $can_edit = false;
    if (isset($_GET["user"])&&isset($_GET["project"])) {
        $project = $root."/users/".$_GET["user"]."/projects/".$_GET["project"];
        if (strcmp($_GET["user"],$_SESSION["logged_in"])==0) $can_edit = true;
    } else {
        $project = $root."/users/wyatt/projects/1";
    }
    $project_title = file_get_contents($project."/title.txt");
    $project_config = file_get_contents($project."/config.txt");
    $project_functions = array_slice(scandir($project."/functions"),2);
    $project_shaders = array_slice(scandir($project."/shaders"),2);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Editor</title>
        <style>
            <?php
                echo file_get_contents($root."/lib/main.css");
            ?>
            #canvas-2d {
                position :fixed;
                left : 0;
                top : 0;
            }
            #canvas-webgl {
                display :none;
            }
        </style>
    </head>
    <body>
        <canvas id="canvas-webgl"></canvas>
        <canvas id="canvas-2d"></canvas>
        <script type="text/javascript">
            <?php
                echo "window.can_edit = ".($can_edit?"true":"false").";\n";
                echo "window.title = `".$project_title."`;\n";
                echo "window.config = `".$project_config."`;\n";
                echo "const functions = [";
                $comma_flag = false;
                foreach ($file as $project_functions) {
                    if ($comma_flag) echo ",\n";
                    else $comma_flag = true;
                    echo file_get_contents($project."/functions/".$file);
                }
                echo "];\n";
                echo "const shaders = [";
                $comma_flag = false;
                foreach ($file as $project_shaders) {
                    if ($comma_flag) echo ",\n";
                    else $comma_flag = true;
                    echo file_get_contents($project."/shaders/".$file);
                }
                echo "];\n";
                echo file_get_contents($root."/editor/webgl.js");
                echo file_get_contents($root."/editor/button.js");
                echo file_get_contents($root."/editor/code.js");
                echo file_get_contents($root."/editor/textbox.js");
                echo file_get_contents($root."/editor/options.js");
                echo file_get_contents($root."/editor/keyboard.js");
                echo file_get_contents($root."/editor/code_editor.js");
                echo file_get_contents($root."/editor/editor.js");
                echo file_get_contents($root."/editor/main.js");
	?>
        </script>
        <p id="error">Something is wrong. Please try a different browser.</p>
    </body>
</html>
