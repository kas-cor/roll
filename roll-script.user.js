// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace auto-roll-user-js
// @description Auto roll in freebitco.in
// @version 20242203
// @author kas-cor
// @homepageURL https://github.com/kas-cor/roll
// @supportURL https://github.com/kas-cor/roll/issues
// @updateURL https://raw.githubusercontent.com/kas-cor/roll/master/roll.meta.js
// @downloadURL https://raw.githubusercontent.com/kas-cor/roll/master/roll-script.user.js
// @icon https://raw.githubusercontent.com/kas-cor/roll/master/icon.png
// @match https://blockchain.info/tobtc*
// @match https://freebitco.in/*
// @require https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.js
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_registerMenuCommand
// @grant GM_xmlhttpRequest
// @run-at document-end
// ==/UserScript==

/* global GM_config, GM_info, GM_registerMenuCommand */

(() => {
    'use strict';

    GM_config.init({
        id: 'auto_roll_config',
        title: GM_info.script.name + ' Settings',
        fields: {
            FIAT_FOR_CONVERT: {
                label: 'Fiat',
                type: 'text',
                default: 'USD',
                title: 'Fiat for convert BTC',
            },
            SPEND_REWARD_POINTS: {
                label: 'Spend reward points',
                type: 'checkbox',
                default: true,
                title: 'Not collect reward, spend them',
            },
            DEBUG_MODE: {
                label: 'Debug mode',
                type: 'checkbox',
                default: false,
                title: 'Log debug messages to the console',
            },
        },
    });

    GM_registerMenuCommand('Settings', () => {
        GM_config.open();
    });

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
        logging('Check reward...');
        if (document.querySelector('#reward_points_bonuses_main_div').innerText === '' && GM_config.get('SPEND_REWARD_POINTS')) {
            logging('Get reward...');
            delay(1000).then(() => {
                logging('Go to rewards page...');
                document.querySelector('a.rewards_link').click();
                return delay(3000);
            }).then(() => {
                logging('Get bonus rewards...');
                for(let v of document.querySelectorAll('#fp_bonus_rewards > div')) {
                    const points = parseInt(v.querySelector('.reward_dollar_value_style').innerText.replace(',', ''));
                    const redeem = v.querySelector('button.reward_link_redeem_button_style').attributes.onclick.nodeValue;
                    rewards.push({
                        'points': points,
                        'func': redeem,
                    });
                }
                return delay(1000);
            }).then(() => {
                const reward_points = parseInt(document.querySelector('.user_reward_points').innerText.replace(',', ''));
                let break_flag = true;
                rewards.forEach(function (v) {
                    if (reward_points >= v.points && break_flag) {
                        break_flag = false;
                        delay(1000).then(() => {
                            logging('Click redeem [' + v.func + '] button...');
                            eval(v.func);
                            return delay(1000);
                        }).then(() => {
                            logging('Go to free play page...');
                            document.querySelector('a.free_play_link').click();
                            return delay(1000);
                        }).then(() => {
                            resolve();
                        });
                    }
                });
                if (break_flag) {
                    resolve();
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
        const play_without_captchas_button = document.querySelector('#play_without_captchas_button');
        const free_play_form_button = document.querySelector('#free_play_form_button');
        checkReward().then(() => {
            if (play_without_captchas_button && getComputedStyle(play_without_captchas_button).display !== 'none') {
                logging('Click without captchas button...');
                document.querySelector('#play_without_captchas_button').click();
                randomTimeRun(roll);
            } else if (free_play_form_button && getComputedStyle(free_play_form_button).display !== 'none') {
                logging('Click free play button...');
                document.querySelector('#free_play_form_button').click();
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
        const winnings = parseFloat(document.querySelector('#winnings').innerText);
        if (winnings) {
            const balance = parseFloat(document.querySelector('#balance').innerText);
            const withdraw_limit = parseFloat(document.querySelector('#auto_withdraw_option > div > div > div').innerText.replace(' MIN. WITHDRAW: ', ''));
            const hours = Math.round(((withdraw_limit - balance) / winnings));
            const days = Math.round(((withdraw_limit - balance) / winnings) / 24);
            document.querySelector('.balanceli').innerHTML = document.querySelector('.balanceli').innerHTML + [
                '<span style="font-size:10px; position:absolute; top:28px; right:38px;">',
                '~&nbsp;' + (days > 0 ? days + '&nbsp;days' : (hours > 0 ? hours : '0') + '&nbsp;hours'),
                '</span>',
            ].join('');
        } else {
            logging('Days for withdraw - not calculate');
        }
        logging('Days for withdraw - pass');
    };

    /**
     * Convert BTC to RUB
     */
    window.setTimeout(() => {
        logging('Convert BTC to fiat...');
        const balance = parseFloat(document.querySelector('#balance').innerText);
        const fiat = GM_config.get('FIAT_FOR_CONVERT') || 'USD';
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://blockchain.info/tobtc?currency=' + fiat + '&value=1',
            accept: 'text/xml',
            onload: function (response) {
                if (response.readyState !== 4) {
                    return;
                }
                document.querySelector('.balanceli').innerHTML = document.querySelector('.balanceli').innerHTML + [
                    '<br/>',
                    '<span style="font-size:10px; position:absolute; top:28px;">',
                    (balance / response.responseText).toFixed(2) + '&nbsp;' + fiat,
                    '</span>'
                ].join('');
                logging('Convert BTC to fiat - pass');
            }
        });
    }, 3000);

    randomTimeRun(roll);

})();
