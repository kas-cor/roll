// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace auto-roll-user-js
// @description Auto roll in freebitco.in
// @version 020622
// @author kas-cor
// @homepageURL https://github.com/kas-cor/roll
// @supportURL https://github.com/kas-cor/roll/issues
// @updateURL https://raw.githubusercontent.com/kas-cor/roll/master/roll.meta.js
// @downloadURL https://raw.githubusercontent.com/kas-cor/roll/master/roll-script.user.js
// @icon https://raw.githubusercontent.com/kas-cor/roll/master/icon.png
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @include https://blockchain.info/tobtc*
// @match https://freebitco.in/*
// @grant GM_xmlhttpRequest
// @run-at document-end
// ==/UserScript==

(function () {
    'use strict';

    let timer;

    randomTimeRun('roll()');

    function checkReward(cb) {
        let rewards = [];
        let reward_points = parseInt($(".user_reward_points").text().replace(',', ""));
        $(".rewards_link").click();
        $("#fp_bonus_rewards div").each(function() {
            const percent = parseInt($(this).find(".reward_product_name").text());
            const points = parseInt($(this).find(".reward_dollar_value_style").text().replace(',', ""));
            if (percent && points) {
                rewards.push({
                    'points': points, 'func': 'fp_bonus_' + percent,
                });
            }
        });
        if ($("#reward_points_bonuses_main_div").text() === "") {
            rewards.forEach(function (v) {
                if (reward_points >= v.points) {
                    RedeemRPProduct(v.func);
                    cb();
                }
            });
        }
        $(".free_play_link").click();
        cb();
    }

    function roll() {
        const withoutCaptchas = $("#play_without_captchas_button");
        const roll = $("#free_play_form_button");
        checkReward(function () {
            if (withoutCaptchas.is(":visible")) {
                randomTimeRun('clickToRollWithoutCaptchas()');
            } else if (roll.is(":visible")) {
                randomTimeRun('clickToRoll()');
            } else {
                randomTimeRun('roll()');
            }
        });
    }

    function clickToRollWithoutCaptchas() {
        $("#play_without_captchas_button").trigger('click');
        randomTimeRun('roll()');
    }

    function clickToRoll() {
        $("#free_play_form_button").trigger('click');
        randomTimeRun('roll()');
    }

    function randomTimeRun(f) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
            eval(f);
        }, 5000 + Math.random() * 5000);
    }

    // Convert BTC to RUB
    window.setTimeout(function () {
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
            }
        });
    }, 2000);

})();
