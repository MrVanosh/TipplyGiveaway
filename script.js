const losowanie = document.getElementsByClassName('losowanie')[0];
const win = document.getElementsByClassName('win')[0];
document.getElementById("losuj").addEventListener('click', () => {
    losowanie.innerHTML += `<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>`;
    win.innerHTML = '';
    startDate = document.getElementById('start').value;
    endDate = document.getElementById('end').value;
    function modifyDOM(startDate, endDate) {
        getRandom = (min,max) => {
            return Math.random() * (max - min) + min;
        }
        let osoby = [];
        let dateFrom = new Date(startDate);
        let dateTo = new Date(endDate);
        let breakWhile = false;
        const giveawayPromise =  new Promise(resolve => {
            const doGiveaway = () => {
                setTimeout(() => {
                    const boxesArray = Array.from(document.querySelectorAll('.box .donator'))
                    boxesArray.forEach((el, index) => {
                        const donateDate = new Date(el.querySelector('time').dateTime).setHours(0, 0, 0, 0)
                        if(donateDate >= dateFrom.setHours(0, 0, 0, 0) && donateDate <= dateTo.setHours(0, 0, 0, 0)) {
                            const osoba = {
                                name: el.querySelector('.noto-sans').innerText,
                                time: el.querySelector('time').dateTime
                            }
                            osoby.push(osoba)
                        } else {
                            breakWhile = true
                        }
                    })
                    if(!breakWhile) {
                        document.querySelector('.right').click()
                        if(document.querySelectorAll('.box .donator time')[document.querySelectorAll('.box .donator time').length-1].dateTime === osoby[osoby.length-1].time) {
                            breakWhile = true;
                        }
                        doGiveaway()
                    }
                    if(breakWhile) {
                        resolve()
                    }
                }, 2000)
            }
            doGiveaway()
        })
        giveawayPromise.then(() => {
            const chances = osoby.map(osoba => osoba.name.replace('@', ''));
            const uniqueChances = [...new Set(chances)]
            const random = Math.round(getRandom(0, uniqueChances.length-1));
            chrome.runtime.sendMessage(uniqueChances[random]);
            window.location.reload();
        })
    }
    chrome.tabs.executeScript({
        code: '(' + modifyDOM + ')("' + startDate +'","'+ endDate+'");' //argument here is a string but function.toString() returns function's code
    });
    chrome.runtime.onMessage.addListener(doStuff = (response, sender, sendResponse) => {
        if(response) {
            endLoading(response);
        } else {
            endLoading('Nikt nie wygrał');
        }
        chrome.extension.onRequest.removeListener(doStuff);
    });
});
endLoading = (winner) => {
    losowanie.innerHTML = '';
    win.innerHTML = `<h2>Zwycięzca: ${winner}</h2><h2>Gratulacje !</h2><div class="pyro"><div class="before"></div><div class="after"></div></div>`;
}
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
document.getElementById('start').value = new Date().toDateInputValue();
document.getElementById('end').value = new Date().toDateInputValue();
