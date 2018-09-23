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

const notification = {
  title: 'BTC Alert',
  body: 'BTC just beat your target price!',
  icon: path.join(__dirname, '../assets/images/bitcoin.png')
}

function compareValue(previous, actual){
  const normalizedPrevious = Number(previous.replace(/<.*><.*>\s£|\,|<\/span>/g, ''))

  if (normalizedPrevious < actual) {
    return '<span id="currentValue"><img src="../assets/images/rise.svg"> £' + actual.toLocaleString('en') + '</span>'
  } else if (normalizedPrevious > actual) {
    return '<span id="currentValue"><img src="../assets/images/drop.svg"> £' + actual.toLocaleString('en') + '</span>'
  } else {
    return '<span id="currentValue"><img src="../assets/images/equal.svg"> £' + actual.toLocaleString('en') + '</span>'
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

          btcPrice.innerHTML = compareValue(btcPrice.innerHTML, res.data.BTC.GBP)
          ethPrice.innerHTML = compareValue(ethPrice.innerHTML, res.data.ETH.GBP)
          ltcPrice.innerHTML = compareValue(ltcPrice.innerHTML, res.data.LTC.GBP)
          bchPrice.innerHTML = compareValue(bchPrice.innerHTML, res.data.BCH.GBP)
          eosPrice.innerHTML = compareValue(eosPrice.innerHTML, res.data.EOS.GBP)
          etcPrice.innerHTML = compareValue(etcPrice.innerHTML, res.data.ETC.GBP)


         if (targetPrice.innerHTML && targetPriceVal < res.data.USD) {
           const myNotification = new window.Notification(notification.title, notification)
         }
       })
}

getValues()
setInterval(getValues, 30000);

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

ipc.on('targetPriceVal', function(event, arg){
  targetPriceVal = Number(arg)
  targetPrice.innerHTML = '$' + targetPriceVal.toLocaleString('en')
})