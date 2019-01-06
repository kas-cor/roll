// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace auto-roll-user-js
// @description Auto roll in freebitco.in
// @version 190106
// @homepageURL https://github.com/kas-cor/roll
// @supportURL https://github.com/kas-cor/roll/issues
// @updateURL https://raw.githubusercontent.com/kas-cor/roll/master/roll.meta.js
// @downloadURL https://raw.githubusercontent.com/kas-cor/roll/master/roll-script.user.js
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @match https://freebitco.in/
// @grant GM_listValues
// @grant GM_getValue
// @run-at document-start
// ==/UserScript==

$(function () {
    var timer = {};
    var rewards = [
        {'points': 3200, 'func': 'fp_bonus_1000'},
        {'points': 1600, 'func': 'fp_bonus_500'},
        {'points': 320, 'func': 'fp_bonus_100'},
        {'points': 160, 'func': 'fp_bonus_50'},
        {'points': 32, 'func': 'fp_bonus_10'}
    ];

    function checkReward() {
        var while_reward = parseInt(GM_getValue('rewards'));
        var reward_points = parseInt($(".user_reward_points").text());
        var reward_active = $("#reward_points_bonuses_main_div").is(":visible");
        if (while_reward && !reward_active) {
            rewards.forEach(function (v) {
                if (while_reward === v.points && reward_points >= while_reward) {
                    RedeemRPProduct(v.func);
                }
            });
        }
    }

    function clickToRoll() {
        var roll = $("#free_play_form_button");
        checkReward();
        if (roll.is(":visible")) {
            roll.click();
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(clickToRoll, 5000 * Math.random() * 5000);
    }

    clickToRoll();
});
