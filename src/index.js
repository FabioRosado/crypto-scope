const electron = require('electron')
const path = require('path')
const axios = require('axios')
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const notifyBtn = document.getElementById('notifyBtn')
const price = document.getElementById('btcPrice')
const targetPrice = document.getElementById('targetPrice')
let targetPriceVal

const notification = {
  title: 'BTC Alert',
  body: 'BTC just beat your target price!',
  icon: path.join(__dirname, '../assets/images/bitcoin.png')
}

function getBTC() {
  axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,ETC,LTC,EOS,BCH,&tsyms=GBP')
       .then(res => {
         const btc = res.data.BTC.GBP
         const eth = res.data.ETH.GBP
         const ltc = res.data.LTC.GBP
         const bch = res.data.BCH.GBP
         const eos = res.data.EOS.GBP
         const etc = res.data.ETC.GBP

         btcPrice.innerHTML = '£' + btc.toLocaleString('en')
         ethPrice.innerHTML = '£' + eth.toLocaleString('en')
         ltcPrice.innerHTML = '£' + ltc.toLocaleString('en')
         bchPrice.innerHTML = '£' + bch.toLocaleString('en')
         eosPrice.innerHTML = '£' + eos.toLocaleString('en')
         etcPrice.innerHTML = '£' + etc.toLocaleString('en')

         if (targetPrice.innerHTML && targetPriceVal < res.data.USD) {
           const myNotification = new window.Notification(notification.title, notification)
         }
       })
}

getBTC()
setInterval(getBTC, 30000);

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