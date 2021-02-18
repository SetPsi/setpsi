// Live update of the source base from master branch on Github.

const exec = require('child_process').exec;

require('http').createServer(function (req, res) {
  
  console.log(req.url);
  
  if (req.url === '/new-version-with-key-ezh-ymm-xmn-hpn-cm7-7ke-pe8-aednxcwd7eh') {

    req.on('readable', () => {
      const commit = JSON.parse(req.read());

      if (commit && commit.ref && commit.ref === 'refs/heads/master') {
        console.log('Github push detected:', commit.head_commit.url);

        exec('git rev-parse HEAD', function(error, stdout, stderr) {
          if (!error) {
            const productionCommit = stdout;

            exec('git pull origin master:master', function(error, stdout, stderr) {
              if (!error) {
                console.log('Source code pulled from Github:\n', stdout);
                // We cannot wait more. It will be service timeout on Github.
                res.writeHead(200);
                res.end('SUCCESS');

                exec('knex migrate:latest', function(error, stdout, stderr) {
                  if (!error) {
                    
                    console.log('Migrations applied successfully:\n', stdout);
                    
                    exec('cd app && npm install && cd .. && cd cordova && npm install && webpack -p --env.server https://demo.epicmeetapp.com', function(error, stdout, stderr) {
                      if (!error) {
                        // res.writeHead(200);
                        console.log('Webpack compilation successful:\n', stdout);
                        
                        // res.end('SUCCESS');
                      } else {
                        //res.writeHead(500);
                        console.log('Error compiling Webpack:\n', stderr);
                        //res.end(stderr);
                      }
                    });
                    
                  } else {
                    //res.writeHead(500);
                    console.log('Error applying migrations:\n', stderr);
                    //res.end(stderr);
                    exec('git reset --hard ' + productionCommit, function(error, stdout, stderr) {
                      if (!error) {
                        console.log('Master commit was reverted dure to migrations errors.\n', stdout);
                      } else {
                        console.log('FATAL: error undoing the latest commit due to unclean repository.\n', stdout);
                      }
                    });
                  }
                });
              } else {
                res.writeHead(500);
                console.log('Error pulling source code from Github:\n', stderr);
                res.end(stderr);
              }
            });
          }
        });
      }
    });
  } else {
    res.writeHead(404);
    res.end('');
  }
}).listen(8081);

