// This runs on a SERVER, not the browser
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/fetch-webetu', async (req, res) => {
    const { user, pass } = req.query;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // 1. Go to Webetu Login
    await page.goto('https://webetu.ummto.dz/'); // Example URL
    await page.type('#username', user);
    await page.type('#password', pass);
    await page.click('#loginBtn');
    
    // 2. Wait for the grades table
    await page.waitForSelector('.grades-table');
    
    // 3. Scrape the modules and coefficients
    const data = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        return rows.map(r => ({
            name: r.cells[0].innerText,
            coef: parseFloat(r.cells[1].innerText),
            hasTD: r.cells.length > 3
        }));
    });

    await browser.close();
    res.json(data); // Send the list back to your App!
});
