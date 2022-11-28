import myJson from './properties/properties.js';
const el = document.getElementById('collection');
let text = "<ul class = 'grid'>";


Object.values(myJson).forEach(val => {
  text = text + "<li class='id" + val.property1 +" id" + val.property2 +" id" + val.property3 +"'>" +
    "<div class='nft__item'>" +
    "<div class='img_holder'>" +
    "<img src='https://ipfs.krazykobe.com/ipfs/QmdYSTJEnRyjMtuXpE2PeC9M2jA91UYigcmx49fguxQZUt/"+ val.name + ".jpg' alt=''>" +
    "<a href='nft-single.html?id=" + val.name + " ' class='full_link'></a>" +
    "</div>" +
    "<div class='title_holder'>" +
    "<h3 class='fn_title'><a href='nft-single.html?id=" + val.name + " '>Krazy Kobe "+ val.name + "</a></h3>" +
    "</div>" +
    "</div>"
});

text = text +'</ul>';
el.innerHTML = text;
