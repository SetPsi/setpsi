<?php
    session_start();
    $root = "/home/wyattfla/setpsi.com"
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Code Editor Test</title>
        <script src='code_editor.js'></script>
    </head>
    <body>
        <canvas id="canvas" width="500" height="500"></canvas>
        <script>
            let canvas = document.getElementById('canvas');
            codeEditor = new CodeEditor (canvas);
            document.onkeydown = (e) => {
                codeEditor.handle(e,"down");
            }
            document.onkeyup = (e) => {
                codeEditor.handle(e,"up");
            }
        </script>
    </body>
</html>