import myJson from './properties/properties.js';
const el = document.getElementById('collection');
let text = "<ul class = 'grid'>";


Object.values(myJson).forEach(val => {
  text = text + "<li class='id5 id13'>" +
    "<div class='nft__item'>" +
    "<div class='img_holder'>" +
    "<img src='https://ipfs.krazykobe.com/ipfs/QmXzrjBM1QLKUQtzR3iDWoWFptCCWgvzCL7K36souWeTwy/"+ val.name + ".jpg' alt=''>" +
    "<a href='nft-single.html' class='full_link'></a>" +
    "</div>" +
    "<div class='title_holder'>" +
    "<h3 class='fn_title'><a href='nft-single.html'>Meta Legends #4578</a></h3>" +
    "</div>" +
    "</div>"
});

text = text +'</ul>';
el.innerHTML = text;
