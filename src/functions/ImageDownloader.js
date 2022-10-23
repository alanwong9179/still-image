import React from 'react'

export default function ImageDownloader(base64URL) {
    var a = document.createElement("a"); //Create <a>
    a.href = base64URL; //Image Base64 Goes here
    a.download = "Image.png"; //File name Here
    a.click(); //Downloaded file
}

