const CryptoJS = require('crypto-js');

function encryp(data, key){
    return CryptoJS.AES.encrypt(data, key).toString();
}

function decryp(data, key){
    var wA= CryptoJS.AES.decrypt(data, key);
    return wA.toString(CryptoJS.enc.Utf8);
}

const args= process.argv;

if(args.length<7){
    console.log(`Uso: node cfrf.js <file-input> <op [‘enc’ || ‘des’]> <pass> <deep> <file-out>\n\n 
                 Ejem: node cfrf.js texto.txt enc clave_secreta 3 texto.txt.cfr`);
    return;
}

var file_inp= args[2];
var op= args[3];
var pass= args[4];
var deep= args[5];
var file_out= args[6];


var fs = require('fs');
var binary = fs.readFileSync(file_inp);

var buffer=null;

if(op=='enc'){    
    let base64data = binary.toString('base64');
    let enc=base64data;
    for (let i = 1; i <= deep; i++) {
        enc= encryp(enc, pass);     
    }
    
    buffer = Buffer.from(enc, 'utf-8');
}else if(op=='des'){
    let dataS= binary.toString('ascii');
    let dec=dataS;
    for (let i = 1; i <= deep; i++) {
        dec= decryp(dec, pass); 
    }
    buffer = Buffer.from(dec, 'base64');
}

fs.open(file_out, 'w', function(err, fd) {
    if (err) {
        throw 'No se puede crear el archivo: ' + err;
    }
    
    fs.write(fd, buffer, 0, buffer.length, null, function(err) {
        if (err) throw 'Error al escribir en el archivo: ' + err;
        fs.close(fd, function() {});
    });
});
