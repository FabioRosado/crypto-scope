const electron = require('electron')
const path = require('path')
const axios = require('axios')
const Store = require('electron-store')
const store = new Store()
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const notifyBtn = document.getElementById('notifyBtn')
const targetPrice = document.getElementById('targetPrice')
let targetPriceVal
const currency = store.get('currency', 'GBP');
const cryptocurrencies = store.get('cryptocurrencies', 'BTC,ETH,ETC,LTC,XRP,BCH')

const notification = {
  title: 'BTC Alert',
  body: 'BTC just beat your target price!',
  icon: path.join(__dirname, '../assets/images/bitcoin.png')
}

function buildHTMLFields(crypto, currency) {
  let row = `<div class="row">
    <div id="price-container">
      <p class="subtext">Current ${crypto} ${currency}</p>
      <h1 id="${crypto.toLowerCase()}Price">Loading...</h1>
    </div>
    <div id="goal-container">
      <p><img src="../assets/images/up.svg"><span id="targetPrice">Choose a Target Price</span></p>
    </div>
    <div id="right-container">
      <button id="notifyBtn">Notify me when...</button>
    </div>
  </div>`
  const div = document.getElementById('cryptocurrencies')
  div.innerHTML += row
}

function compareValue(previous, actual, currency){
  const normalizedPrevious = Number(previous.replace(/<.*><.*>\s£|\,|<\/span>/g, ''))
  let icon
  switch(currency) {
    case "GBP":
      icon = "£"
      break;
    case "USD":
      icon = "$"
      break;
    case "EUR":
      icon = "€"
      break
  }

  if (normalizedPrevious < actual) {
    return '<span id="currentValue"><img src="../assets/images/rise.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  } else if (normalizedPrevious > actual) {
    return '<span id="currentValue"><img src="../assets/images/drop.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  } else {
    return '<span id="currentValue"><img src="../assets/images/equal.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  }
}

function getValues() {
  const currency = store.get('currency', 'GBP');
  const cryptocurrencies = store.get('cryptocurrencies', 'BTC,ETH,ETC,LTC,EOS,BCH')

  axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptocurrencies}&tsyms=${currency}`)
       .catch(error => {
        console.error(error);
      })
       .then(res => {

        for (const crypto in res.data) {
          switch(crypto) {
            case "BTC":
              btcPrice.innerHTML = compareValue(btcPrice.innerHTML, Object.values(res.data.BTC)[0], currency)
              break;
            case "LTC":
              ltcPrice.innerHTML = compareValue(ltcPrice.innerHTML, Object.values(res.data.LTC)[0], currency)
              break;
            case "ETH":
              ethPrice.innerHTML = compareValue(ethPrice.innerHTML, Object.values(res.data.ETH)[0], currency)
              break;
            case "BCH":
              bchPrice.innerHTML = compareValue(bchPrice.innerHTML, Object.values(res.data.BCH)[0], currency)
              break;
            case "XRP":
              xrpPrice.innerHTML = compareValue(xrpPrice.innerHTML, Object.values(res.data.XRP)[0], currency)
              break;
            case "ETC":
              etcPrice.innerHTML = compareValue(etcPrice.innerHTML, Object.values(res.data.ETC)[0], currency)
              break;
          }
        }

        //  if (targetPrice.innerHTML && targetPriceVal < res.data.USD) {
        //    const myNotification = new window.Notification(notification.title, notification)
        //  }
       })
}

// Create the fields to be populated by getValue()
// These fields are not updated if the settings change - app needs to be restarted


for (c of cryptocurrencies.slice(0, -1).split(',')) {
  buildHTMLFields(c, currency)
}

// Populate fields with data obtained from API - reruns every 30secs.
getValues()
setInterval("getValues()", 30000);

// notifyBtn.addEventListener('click', function(event) {
//   const modalPath = path.join('file://', __dirname, 'add.html')
//   let win = new BrowserWindow(
//     {
//       frame: false, 
//       transparent: true, 
//       alwaysOnTop: true, 
//       width: 400,
//       height: 200
//     })
//   win.on('close', function(){ win = null })
//   win.loadURL(modalPath)
//   win.show()
// })

ipc.on('targetPriceVal', function(event, arg){
  targetPriceVal = Number(arg)
  targetPrice.innerHTML = '$' + targetPriceVal.toLocaleString('en')
})