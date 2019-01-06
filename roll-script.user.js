// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace auto-roll-user-js
// @description Auto roll in freebitco.in
// @version 190106_1
// @author kas-cor
// @homepageURL https://github.com/kas-cor/roll
// @supportURL https://github.com/kas-cor/roll/issues
// @updateURL https://raw.githubusercontent.com/kas-cor/roll/master/roll.meta.js
// @downloadURL https://raw.githubusercontent.com/kas-cor/roll/master/roll-script.user.js
// @icon https://raw.githubusercontent.com/kas-cor/roll/master/icon.png
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @match https://freebitco.in/*
// @grant none
// @run-at document-start
// ==/UserScript==

(function () {
    'use strict';

    var timer = {};
    var rewards = [
        {'points': 3200, 'func': 'fp_bonus_1000'},
        {'points': 1600, 'func': 'fp_bonus_500'},
        {'points': 320, 'func': 'fp_bonus_100'},
        {'points': 160, 'func': 'fp_bonus_50'},
        {'points': 32, 'func': 'fp_bonus_10'}
    ];

    function checkReward(cb) {
        var reward_points = parseInt($(".user_reward_points").text().replace(',', ""));
        var reward_active = $("#reward_points_bonuses_main_div").is(":visible");
        if (!reward_active) {
            rewards.forEach(function (v) {
                if (reward_points >= v.points) {
                    RedeemRPProduct(v.func);
                    cb();
                }
            });
        }
        cb();
    }

    function clickToRoll() {
        var roll = $("#free_play_form_button");
        if (roll.is(":visible")) {
            checkReward(function() {
                roll.trigger('click');
            });
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(clickToRoll, 5000 + Math.random() * 5000);
    }

    clickToRoll();
})();
