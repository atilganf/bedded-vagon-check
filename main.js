const puppeteer = require('puppeteer');

(async () => {
    let fifteenMinutes = 15*60*1000
    checkBeddedVaggons()
    setInterval(() => {
        checkBeddedVaggons()
    }, fifteenMinutes);

    let browser;
    let page;
    
    async function checkBeddedVaggons() {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        console.log("started")
        await goToTicketPage(`31.05.2022`)

        let pullmanInfo = await getPullmanInfoForAllDates()
        let checkTime = new Date()
        console.log("Check Time:",checkTime.toLocaleTimeString())
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
        let isLoaded = liTexts[1].includes("2 Yataklı 1.Mevki")
        return isLoaded
    }

    async function getPullmanInfoForAllDates() {
        let date = new Date();
        const currentDay = date.getDate()
        const questionDay = 31

        let checkLength = questionDay - currentDay
        const previousDayButton = (await page.$$("button"))[1]
        const nextDayButton = (await page.$$("button"))[2]

        let pullmanInfoArray = [];

        for (let i = 0; i < checkLength; i++) {
            let info = await getPullmanInfo()
            pullmanInfoArray.push({ day: questionDay - i, text: info })
            console.log(`checking day: ${questionDay - i}`)
            await goToPreviousTicketPage()
        }

        return pullmanInfoArray
    }

    async function getPullmanInfo() {
        let liTexts = await getLiTexts()
        const vagonLiText = liTexts[1];
        // let isBuyable = !(vagonLiText.includes("0"))
        return vagonLiText
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

})();

const delay = ms => new Promise(res => setTimeout(res, ms));