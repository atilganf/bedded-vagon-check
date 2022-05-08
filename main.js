const puppeteer = require('puppeteer');

(async () => {
    let fifteenMinutes = 15 * 60 * 1000

    checkBeddedVaggons()
    setInterval(() => {
        checkBeddedVaggons()
    }, fifteenMinutes);

    let browser;
    let page;

    async function checkBeddedVaggons() {
        console.clear()
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        console.log("started")
        let lastCheckDate = getLastCheckDateText()
        await goToTicketPage(lastCheckDate)

        let pullmanInfo = await getPullmanInfoForAllDates()
        let checkTime = new Date()
        console.log("Check Time:", checkTime.toLocaleTimeString())
        console.log(pullmanInfo)

        await browser.close();
    }

    async function goToTicketPage(questionDay) {
        await page.goto('https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf');
        await page.screenshot({ path: 'example.png' });
        await delay(1000)
        await page.keyboard.press("Tab", { delay: 50 })
        await page.keyboard.type("Manisa", { delay: 100 })
        await page.keyboard.press("Tab", { delay: 50 })
        await page.keyboard.type("Ankara Gar", { delay: 100 })

        await page.keyboard.press("Tab", { delay: 50 })
        await page.keyboard.type(questionDay, { delay: 100 })
        await page.keyboard.press("Tab", { delay: 50 })
        await page.keyboard.press("Tab", { delay: 50 })
        await page.keyboard.press("Enter", { delay: 50 })
        await page.screenshot({ path: 'example.png' });
        console.log("info entered")

        await delay(2000)
        await page.goto('https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/int_sat_001.jsf');

        await page.screenshot({ path: 'example.png' });

        if (!await isTicketPageLoaded()) {
            await goToTicketPage(questionDay)
        }
    }

    async function isTicketPageLoaded() {
        let liTexts = await getLiTexts()
        let pullmanText = liTexts[1] ?? ""
        let isLoaded = pullmanText.includes("2 Yataklı 1.Mevki")

        return isLoaded
    }

    async function getPullmanInfoForAllDates() {

        let pullmanInfoArray = [];
        let checkLength = 29

        let checkDate = getLastCheckDate()
        for (let i = 0; i < checkLength; i++) {
            let info = await getPullmanInfo()
            console.log(`checking day: ${dateToText(checkDate)}`)
            if (info) {
                pullmanInfoArray.push({ date: dateToText(checkDate), text: info })
            }
            checkDate.setDate(checkDate.getDate() - 1)
            await goToPreviousTicketPage()
        }

        return pullmanInfoArray
    }

    async function getPullmanInfo() {
        let liTexts = await getLiTexts()
        const vagonLiText = liTexts[1];
        let isBuyable = !(vagonLiText.includes("0"))
        if (isBuyable) {
            return vagonLiText
        }
        return false
    }

    async function goToPreviousTicketPage() {
        const previousDayButton = (await page.$$("button"))[1]
        await previousDayButton.click()
        await delay(2000)
        await page.goto('https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/int_sat_001.jsf');
        await page.screenshot({ path: 'example.png' });
    }

    async function getLiTexts() {
        const queryName = 'ul > li.ui-selectonemenu-item.ui-selectonemenu-list-item.ui-corner-all';
        let liTexts = await page.$$eval(queryName, (options) => options.map((option) => option.textContent))
        return liTexts;
    }

    function getLastCheckDate() {
        let lastDate = new Date()
        lastDate.setDate(lastDate.getDate() + 29)
        return lastDate
    }

    function getLastCheckDateText() {
        let lastDate = getLastCheckDate()
        lastDate = dateToText(lastDate)
        return lastDate
    }

    function dateToText(date) {
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        date = `${day}.${month}.${year}`
        return date
    }

})();

const delay = ms => new Promise(res => setTimeout(res, ms));