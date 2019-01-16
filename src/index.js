const electron = require('electron')
const path = require('path')
const axios = require('axios')
const Store = require('electron-store')
const store = new Store()
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const currency = store.get('currency', 'GBP');
const cryptocurrencies = store.get('cryptocurrencies', 'BTC,ETH,ETC,LTC,XRP,BCH')


function buildHTMLFields(crypto, currency) {
  let row = `<div class="row">
    <div id="price-container">
      <p id="${crypto.toLowerCase()}Intro">Current ${crypto} in ${currency}</p>
      <h1 id="${crypto.toLowerCase()}Price">Loading...</h1>
    </div>
    <div id="goal-container">
      <p>
        <img src="../assets/images/up.svg">
        <span id="${crypto.toLowerCase()}TargetPrice">
          Choose a Target Price
        </span>
      </p>
    </div>
    <div id="right-container">
      <button id="${crypto.toLowerCase()}NotifyBtn">Notify me when...</button>
    </div>
  </div>`
  const div = document.getElementById('cryptocurrencies')
  div.innerHTML += row
}

function getCurrencyIcon(currency) {
  switch(currency) {
    case "GBP":
      return "£"
    case "USD":
      return "$"
    case "EUR":
      return "€"
  }
}

function compareValue(previous, actual, currency){
  const normalizedPrevious = Number(previous.replace(/<.*><.*>\s£|\,|<\/span>/g, ''))
  icon = getCurrencyIcon(currency)

  if (normalizedPrevious < actual) {
    return '<span id="currentValue"><img src="../assets/images/rise.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  } else if (normalizedPrevious > actual) {
    return '<span id="currentValue"><img src="../assets/images/drop.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  } else {
    return '<span id="currentValue"><img src="../assets/images/equal.svg"> ' + icon + actual.toLocaleString('en') + '</span>'
  }

}

function updateSubtext(crypto, currency) {
  return 'CURRENT ' + crypto + ' IN ' + currency
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
              setNotification(crypto, currency, Object.values(res.data.BTC)[0]);
              btcIntro.innerHTML = updateSubtext(crypto, currency)
              btcPrice.innerHTML = compareValue(btcPrice.innerHTML, Object.values(res.data.BTC)[0], currency)
              break;
            case "LTC":
              setNotification(crypto, currency, Object.values(res.data.LTC)[0]);
              ltcIntro.innerHTML = updateSubtext(crypto, currency)
              ltcPrice.innerHTML = compareValue(ltcPrice.innerHTML, Object.values(res.data.LTC)[0], currency)
              break;
            case "ETH":
              setNotification(crypto, currency, Object.values(res.data.ETH)[0]);
              ethIntro.innerHTML = updateSubtext(crypto, currency)
              ethPrice.innerHTML = compareValue(ethPrice.innerHTML, Object.values(res.data.ETH)[0], currency)
              break;
            case "BCH":
              setNotification(crypto, currency, Object.values(res.data.BCH)[0]);
              bchIntro.innerHTML = updateSubtext(crypto, currency)
              bchPrice.innerHTML = compareValue(bchPrice.innerHTML, Object.values(res.data.BCH)[0], currency)
              break;
            case "XRP":
              setNotification(crypto, currency, Object.values(res.data.XRP)[0]);
              xrpIntro.innerHTML = updateSubtext(crypto, currency)
              xrpPrice.innerHTML = compareValue(xrpPrice.innerHTML, Object.values(res.data.XRP)[0], currency)
              break;
            case "ETC":
              setNotification(crypto, currency, Object.values(res.data.ETC)[0]);
              etcIntro.innerHTML = updateSubtext(crypto, currency)
              etcPrice.innerHTML = compareValue(etcPrice.innerHTML, Object.values(res.data.ETC)[0], currency)
              break;
          }
        }
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


function setNotification(crypto, currency, currentPrice) { 
  const notifyBtn = document.getElementById(`${crypto.toLowerCase()}NotifyBtn`)
  const targetPrice = document.getElementById(`${crypto.toLowerCase()}TargetPrice`)

  icon = getCurrencyIcon(currency)

  // Calls add.html so user can input the desired target price
  notifyBtn.addEventListener('click', function(event) {
    const modalPath = path.join('file://', __dirname, 'add.html')
    let win = new BrowserWindow(
      {
        frame: false, 
        transparent: true, 
        alwaysOnTop: true, 
        width: 400,
        height: 200
      })
    win.on('close', function(){ win = null })
    win.loadURL(modalPath)
    win.show()
  })



  // Get the desired targed price that was input on add.html
  ipc.on('targetPriceVal', function(event, arg){
    targetPriceVal = Number(arg)
    targetPrice.innerHTML = icon + targetPriceVal.toLocaleString('en')
  })


  // create notification if target price was beat. 
  // Here we turn targetPrice into a Number and 
  // replace anything thats not a digit to and empty string.
  if (Number(targetPrice.innerHTML.replace(/\D+/g, '')) && ! 0  < currentPrice) {
    const notification = {
      title: `${crypto} Alert`,
      body: `${crypto} just reached your target price!`,
      icon: path.join(__dirname, `../assets/images/${crypto.toLowerCase()}.svg`)
    }
    const myNotification = new window.Notification(notification.title, notification)
  }
}
