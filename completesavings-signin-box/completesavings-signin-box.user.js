// ==UserScript==
// @name         CompleteSavings Open Sign-In Box
// @version      1.0.1
// @description  Open sign-in box for CompleteSavings.co.uk on page load
// @match        https://www.completesavings.co.uk/*
// @license      GPL-3.0-or-later
// @icon         https://dnrd50k6p5ksn.cloudfront.net/CMS/25200/prod/favicon.ico
// @supportURL   https://github.com/bertiewils/userscripts/issues
// ==/UserScript==

document.getElementById("signin-toggle-anchor").checked = true;
