// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace auto-roll-user-js
// @description Auto roll in freebitco.in
// @version 061122-2
// @author kas-cor
// @homepageURL https://github.com/kas-cor/roll
// @supportURL https://github.com/kas-cor/roll/issues
// @updateURL https://raw.githubusercontent.com/kas-cor/roll/master/roll.meta.js
// @downloadURL https://raw.githubusercontent.com/kas-cor/roll/master/roll-script.user.js
// @icon https://raw.githubusercontent.com/kas-cor/roll/master/icon.png
// @match https://blockchain.info/tobtc*
// @match https://freebitco.in/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js
// @require https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_registerMenuCommand
// @grant GM_xmlhttpRequest
// @run-at document-end
// ==/UserScript==

/* global GM_config, GM_info, GM_registerMenuCommand */

(function () {
    'use strict';

    GM_config.init({
        id: 'auto_roll_config',
        title: GM_info.script.name + ' Settings',
        fields: {
            DEBUG_MODE: {
                label: 'Debug mode',
                type: 'checkbox',
                default: false,
                title: 'Log debug messages to the console'
            },
        },
    })

    GM_registerMenuCommand('Settings', () => {
        GM_config.open()
    })

    let timer;

    /**
     * Logging
     */
    const logging = msg => {
        if (GM_config.get('DEBUG_MODE')) {
            console.log('Auto roll: ' + new Date().toLocaleString() + ' - ' + msg);
        }
    };

    /**
     * Now days to withdraw
     * @param {number} time
     */
    const delay = time => new Promise(resolve => window.setTimeout(resolve, time));

    /**
     * Check reward
     */
    const checkReward = () => new Promise(resolve => {
        let rewards = [];
        let reward_points = parseInt($(".user_reward_points").text().replace(',', ''));
        logging('Check reward...');
        $("#fp_bonus_rewards div").each(function () {
            const percent = parseInt($(this).find(".reward_product_name").text());
            const points = parseInt($(this).find(".reward_dollar_value_style").text().replace(',', ''));
            if (percent && points) {
                rewards.push({
                    'points': points,
                    'func': 'fp_bonus_' + percent,
                });
            }
        });
        if ($("#reward_points_bonuses_main_div").text() === '') {
            logging('Get reward...');
            rewards.forEach(function (v) {
                if (reward_points >= v.points) {
                    delay(100).then(() => {
                        $(".rewards_link").click();
                        return delay(3000);
                    }).then(() => {
                        RedeemRPProduct(v.func);
                        return delay(3000);
                    }).then(() => {
                        $(".free_play_link").click();
                        return delay(3000);
                    }).then(() => {
                        resolve();
                    });
                }
            });
        } else {
            logging('Check reward - pass');
            resolve();
        }
    });

    /**
     * Random timer run
     */
    const randomTimeRun = f => {
        logging('Random time run ' + f.name + '...');
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            f();
            logging('Random time run ' + f.name + ' - pass');
        }, 5000 + Math.random() * 5000);
    };

    /**
     * Roll
     */
    const roll = () => {
        const play_without_captchas_button = $("#play_without_captchas_button");
        const free_play_form_button = $("#free_play_form_button");
        checkReward().then(() => {
            if (play_without_captchas_button.is(":visible")) {
                logging('Click without captchas button...');
                $("#play_without_captchas_button").trigger('click');
                randomTimeRun(roll);
            } else if (free_play_form_button.is(":visible")) {
                logging('Click free play button...');
                $("#free_play_form_button").trigger('click');
                randomTimeRun(daysForWithdraw);
            }
            logging('Roll - pass');
        });
    };

    /**
     * Days for withdraw
     */
    const daysForWithdraw = () => {
        logging('Days for withdraw...');
        const winnings = parseFloat($("#winnings").text());
        if (winnings) {
            const balance = parseFloat($("#balance").text());
            const withdraw_limit = parseFloat($("#auto_withdraw_option > div > div > div").text().replace(' MIN. WITHDRAW: ', ''));
            const hours = Math.round(((withdraw_limit - balance) / winnings));
            const days = Math.round(((withdraw_limit - balance) / winnings) / 24);
            $(".balanceli").append([
                '<span style="font-size: 10px;position: absolute;top: 28px;right: 38px;">',
                '~ ' + (days > 0 ? days + ' days' : hours + ' hours'),
                '</span>',
            ].join(''));
        } else {
            logging('Days for withdraw - not calculate');
        }
        logging('Days for withdraw - pass');
    };

    /**
     * Convert BTC to RUB
     */
    window.setTimeout(() => {
        logging('Convert BTC to RUB...');
        const balance = parseFloat($("#balance").text());
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://blockchain.info/tobtc?currency=RUB&value=1',
            accept: 'text/xml',
            onload: function (response) {
                if (response.readyState !== 4) {
                    return;
                }
                const rub = (balance / response.responseText).toFixed(2);
                $(".balanceli").append([
                    '<br />',
                    '<span id="balance_rub" style="font-size: 10px;position: absolute;top: 28px;">' + rub + '&nbsp;RUB</span>'
                ].join("\n"));
                logging('Convert BTC to RUB - pass');
            }
        });
    }, 3000);

    randomTimeRun(roll);

})();
