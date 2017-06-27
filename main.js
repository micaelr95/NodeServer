const http = require('http');
const fileSystem = require('fs');
const path = require('path');
const os = require('os');

var ifaces = os.networkInterfaces();
var localIp;
const file = "file.json";

// Get local machine IP
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            //console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            //console.log(ifname, iface.address);
            localIp = iface.address;
        }
        ++alias;
    });
});

console.log("Initiating");
http.createServer(function (request, response) {
    if (request.method == 'POST') {
        console.log("POST");
        var body = '';
        request.on('data', function (d) {
            console.log("data");
            body += d;
        });
        request.on('end', function () {
            //console.log("Body: " + body);

            fileSystem.readFile(file, function (err, data) {
                var json = JSON.parse(data);
                let jsonKey = json.teste2;
                let post = [];
                for (x in jsonKey) {
                    let o = {};
                    o[x] = jsonKey[x];
                    post.push(JSON.stringify(o));
                }
                console.log(post.join());
                jsonKey = post.join().slice(1, -1);
                var n = jsonKey.search("},{");
                jsonKey = jsonKey.slice(0, n) + "," + jsonKey.slice(n + 3, jsonKey.length);
                console.log(jsonKey);

                //post.push({'' num: 3, app: 'helloagain_again', message: 'yet another message' });
                //console.log(post);
                //var jsonArray = JSON.parse(JSON.stringify(post))
                //jsonKey = jsonArray.slice(0, -1);
                json.teste2 = jsonKey;
                console.log(JSON.stringify(JSON.parse(json)));

                //json[teste2] = value;

                //let cena = JSON.parse(json);

                //fileSystem.writeFile("test.json", JSON.parse(JSON.stringify(json)))
            })

            //var json = JSON.parse(fileSystem.readFileSync(file, 'utf8'));
            //json.push('search result: ' + body)

            //fs.writeFile("results.json", JSON.stringify(json))

            console.log("End POST");
        });
    } else if (request.method == 'GET') {
        console.log("GET");
        console.log(`Receiving request`);
        var filePath = path.join(__dirname, file);
        var stat = fileSystem.statSync(filePath);

        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(response);
    }
}).listen(2000);
console.log('Server listening at http://' + localIp + ':2000/');
