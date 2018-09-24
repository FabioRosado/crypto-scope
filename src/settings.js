const electron = require('electron')
const path = require('path')
const Store = require('electron-store')
const store = new Store()

function getForm() {
  const form = document.getElementById("set-settings");
  const cryptos = document.querySelectorAll('input[name=crypto]:checked');
  let crypto = ""

  for (i = 0; i < cryptos.length; i++) {
    crypto += cryptos[i].value + ","
  }

  const currency = form.elements['currency'].value;
  store.set({'currency': currency, "cryptocurrencies": crypto})
  document.getElementById('was-sent').style.display = "block";
}