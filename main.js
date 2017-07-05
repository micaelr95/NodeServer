const http = require('http');
const fileSystem = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

var ifaces = os.networkInterfaces();
var localIp;
const file = "test.json";

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
            console.log("Body: " + body);

            fileSystem.readFile(file, function (err, data) {
                var json = JSON.parse(data);
                let key = crypto.randomBytes(20).toString('hex');
                json.teste[key] = JSON.parse(body);
                console.log(body);
                fileSystem.writeFile("test.json", JSON.stringify(json), (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                });
            })
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
