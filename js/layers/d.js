addLayer("d", {
    name: "领域", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "D", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },

    color: "#999999",
    resource: "领域点数", // 声望货币名称
    type: "none",
    requires: new Decimal(100),
    row: 3, // 树状图中的行数
    branches: ['c'],

    layerShown() { return player.b.points.gte(6) || player.d.unlocked },

    // ===== UI 布局 =====
    tabFormat: {
        "main": {
            content: [
                "main-display",
                ["display-text", "进入领域将强制进行一次平静重置。领域内的经验被动获取会被削弱。"],
                "challenges"
            ]
        }
    },

    // ===== 挑战（领域试炼）=====
    challenges: {
        11: {
            name: "无防领域",
            challengeDescription() {
                return "你的防御为 0。<br>完成次数：" +
                    formatWhole(player.d.challenges[this.id]) + "/" + layers.d.challenges[this.id].completionLimit();
            },
            goal() {
                return Decimal.pow(1.1, softcap(
                    new Decimal(player.d.challenges[11]),
                    new Decimal((hasUpgrade("c", 34) && player.sac.points.gte(3)) ? 30 : 25),
                    2
                )).mul(player.sac.points.gte(1) ? 500 : 600);
            },
            goalDescription() { return "达到等级 " + formatWhole(this.goal().ceil()); },
            currencyDisplayName: "等级",
            canComplete() { return getLevel().gte(this.goal()); },
            onEnter() { doReset("c", true); },
            onExit() {
                player.d.points = new Decimal(
                    player.d.challenges[11] +
                    player.d.challenges[12] +
                    player.d.challenges[21] +
                    player.d.challenges[22]
                );
            },
            completionLimit() { return layers.d.completionLimit(); },
            rewardDescription: "每次完成获得 1 领域点数。"
        },

        12: {
            name: "玻璃大炮",
            challengeDescription() {
                return "进入领域时你只有 100 HP，且无法再获得更多。<br>完成次数：" +
                    formatWhole(player.d.challenges[this.id]) + "/" + layers.d.challenges[this.id].completionLimit();
            },
            goal() {
                return Decimal.pow(1.1, softcap(
                    new Decimal(player.d.challenges[12]),
                    new Decimal((hasUpgrade("c", 34) && player.sac.points.gte(3)) ? 30 : 25),
                    2
                )).mul(500);
            },
            goalDescription() { return "达到等级 " + formatWhole(this.goal().ceil()); },
            currencyDisplayName: "等级",
            canComplete() { return getLevel().gte(this.goal()); },
            completionLimit() { return layers.d.completionLimit(); },
            rewardDescription: "每次完成获得 1 领域点数。",
            onEnter() {
                doReset("c", true);
                player.points = new Decimal(100);
            },
            onExit() {
                player.d.points = new Decimal(
                    player.d.challenges[11] +
                    player.d.challenges[12] +
                    player.d.challenges[21] +
                    player.d.challenges[22]
                );
            },
        },

        21: {
            name: "虚弱攻击",
            challengeDescription() {
                return "你的攻击" +
                    (player.b.points.gte(13) ? "和伤害倍率均为" : "为") +
                    " 1。<br>完成次数：" +
                    formatWhole(player.d.challenges[this.id]) + "/" + layers.d.challenges[this.id].completionLimit();
            },
            goal() {
                return Decimal.pow(1.1, softcap(
                    new Decimal(player.d.challenges[21]),
                    new Decimal((hasUpgrade("c", 34) && player.sac.points.gte(3)) ? 30 : 25),
                    2
                )).mul(player.sac.points.gte(1) ? 500 : 1000);
            },
            goalDescription() { return "达到等级 " + formatWhole(this.goal().ceil()); },
            currencyDisplayName: "等级",
            canComplete() { return getLevel().gte(this.goal()); },
            completionLimit() { return layers.d.completionLimit(); },
            rewardDescription: "每次完成获得 1 领域点数。",
            onEnter() { doReset("c", true); },
            onExit() {
                player.d.points = new Decimal(
                    player.d.challenges[11] +
                    player.d.challenges[12] +
                    player.d.challenges[21] +
                    player.d.challenges[22]
                );
            },
            unlocked() { return hasUpgrade("c", 21) || player.sac.points.gte(3); }
        },

        22: {
            name: "瞬根领域",
            challengeDescription() {
                return "你只能使用 1 次攻击击杀敌人。攻击力被开平方根。<br>完成次数：" +
                    formatWhole(player.d.challenges[this.id]) + "/" + layers.d.challenges[this.id].completionLimit();
            },
            goal() {
                return Decimal.pow(1.1, softcap(
                    new Decimal(player.d.challenges[22]),
                    new Decimal((hasUpgrade("c", 34) && player.sac.points.gte(3)) ? 30 : 25),
                    2
                )).mul(500);
            },
            goalDescription() { return "达到等级 " + formatWhole(this.goal().ceil()); },
            currencyDisplayName: "等级",
            canComplete() { return getLevel().gte(this.goal()); },
            completionLimit() { return layers.d.completionLimit(); },
            rewardDescription: "每次完成获得 1 领域点数。",
            onEnter() { doReset("c", true); },
            onExit() {
                player.d.points = new Decimal(
                    player.d.challenges[11] +
                    player.d.challenges[12] +
                    player.d.challenges[21] +
                    player.d.challenges[22]
                );
            },
            unlocked() { return hasUpgrade("c", 34) || player.sac.points.gte(3); }
        },
    },

    // ===== 领域点数效果 =====
    completionLimit() {
        let d = 12;
        if (player.sac.points.gte(1)) d += 3;
        if (player.sac.points.gte(2)) d += 5;
        if (hasUpgrade("c", 32)) d += 10;
        if (hasUpgrade("g", 15)) d += 5;
        return d;
    },

    update(diff) {
        if (player.b.points.gte(6)) player.d.unlocked = true;

        if (player.sac.points.gte(1)) {
            if (player.d.activeChallenge) {
                if (getLevel().gte(layers.d.challenges[player.d.activeChallenge].goal())) {
                    player.d.challenges[player.d.activeChallenge] =
                        Math.min(
                            layers.d.completionLimit(),
                            player.d.challenges[player.d.activeChallenge] + 1
                        );
                }
            }
        }
    },

    effect() {
        let ret = Decimal.pow(1.1, player.d.points);
        return ret;
    },

    effect2() {
        let ret = player.d.points.pow(1.5).add(1);
        return ret;
    },

    effectDescription() {
        let eff = this.effect();
        let eff2 = this.effect2();
        return "转化为平静点数获取的 " + format(eff) + " 倍乘数，以及首领伤害的 " + format(eff2) + " 倍乘数";
    },
})
