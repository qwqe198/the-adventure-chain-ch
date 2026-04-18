addLayer("g", {
    name: "金币", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "G", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            shop: [
                { type: 11, level: new Decimal(1), power: new Decimal(1) }
            ],
        }
    },

    color: "#FFFF00",
    resource: "金币", // 声望货币名称
    type: "none",
    requires: new Decimal(100),
    row: 6, // 树状图中的行数
    branches: ['f'],

    layerShown() { return player.b.points.gte(16) || player.g.unlocked },

    // ===== 金币获取倍率 =====
    gainMult() {
        return new Decimal(1);
    },

    update(diff) {
        if (player.b.points.gte(16)) player.g.unlocked = true;
    },

    // ===== UI 布局 =====
    tabFormat: {
        "主界面": {
            content: [
                "main-display",
                "upgrades",
                "milestones"
            ]
        },
        "装备商店": {
            content: [
                "main-display",
                ["display-text", function () {
                    return layers.e.clickables[player.g.shop[0].type].title +
                           " 等级 " + formatWhole(player.g.shop[0].level) +
                           "，强度：" + formatWhole(player.g.shop[0].power.mul(100)) + "%";
                }],
                ["display-text", function () {
                    return "消耗：" + formatWhole(layers.g.shopcost(0)) + " 金币";
                }],
                ["row", [["clickable", 11], ["clickable", 12]]]
            ],
            unlocked: function () { return hasUpgrade("g", 12) || player.sac.points.gte(3) }
        }
    },

    // ===== 升级 =====
    upgrades: {
        11: {
            description: "每个金币升级使平静点数获取翻倍。",
            cost: new Decimal(300),
            effect: function () { return Decimal.pow(2, player.g.upgrades.length) },
            effectDisplay: function () { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        12: {
            description() {
                if (player.sac.points.gte(3)) return "装备商店中装备强度 +30%。";
                return "解锁装备商店。";
            },
            cost: new Decimal(2000),
        },
        13: {
            description: "新装备的装备强度 +50%，并在装备商店中额外 +10%。",
            cost: new Decimal(6000),
            unlocked() { return player.sac.points.gte(2) },
        },
        14: {
            description: "武器、护甲、头盔和鞋子的效果更强。",
            cost: new Decimal(30000),
            unlocked() { return player.sac.points.gte(2) },
        },
        15: {
            description: "提高领域最大完成次数。",
            cost: new Decimal(100000),
            unlocked() { return player.sac.points.gte(2) },
        },
        21: {
            description: "根据金币升级数量，对首领造成更多伤害。",
            cost: new Decimal(3e5),
            effect: function () { return Decimal.pow(2, player.g.upgrades.length) },
            effectDisplay: function () { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        22: {
            description: "新装备的装备强度 +50%，并在装备商店中额外 +10%。",
            cost: new Decimal(1e6),
            unlocked() { return player.sac.points.gte(2) },
        },
        23: {
            description: "根据金币数量，在装备商店中获得更多装备强度。",
            cost: new Decimal(2e6),
            unlocked() { return player.b.points.gte(25) },
        },
    },

    // ===== 点击按钮 =====
    clickables: {
        11: {
            title() { return "刷新商店" },
            onClick() {
                let i = 0;
                let types = layers.e.types();
                let type = types[Math.floor(types.length * Math.random())];
                let x = Decimal.mul(
                    player.e.equipment[type].level,
                    player.e.equipment[type].power
                ).max(1);

                let level = new Decimal(1);
                let power = new Decimal(1);

                while (i <= 5 && level.mul(power).lt(x)) {
                    type = types[Math.floor(types.length * Math.random())];
                    level = getLevel().mul(Math.random() * 0.25 + 1);
                    x = Decimal.mul(
                        player.e.equipment[type].level,
                        player.e.equipment[type].power
                    ).max(1);
                    power = x.mul(Math.random() * 0.1 + 1.05)
                        .div(level)
                        .max(
                            layers.e.effect2()
                                .add(layers.e.effect().mul(Math.random() * 0.5))
                                .min(
                                    layers.e.effect()
                                        .add(layers.e.effect2())
                                        .mul(Math.random() * 0.05 + 1)
                                )
                        );

                    if (hasUpgrade("g", 12) && player.sac.points.gte(3))
                        power = power.add(0.3);
                    if (hasUpgrade("g", 13)) power = power.add(0.1);
                    if (hasUpgrade("g", 22)) power = power.add(0.1);
                    if (hasUpgrade("g", 23))
                        power = power.mul(
                            player.g.points
                                .div(level.mul(power).pow(1.5).div(100000).add(100))
                                .max(1)
                                .pow(0.05)
                        );

                    i++;
                }

                player.g.shop[0].type = type;
                player.g.shop[0].level = level;
                player.g.shop[0].power = power;
            },
            canClick: true,
            unlocked: true,
        },

        12: {
            title() { return "购买" },
            onClick() {
                player.g.points = player.g.points.sub(layers.g.shopcost(0));
                layers.e.equip(
                    player.g.shop[0].type,
                    player.g.shop[0].level,
                    player.g.shop[0].power
                );
                layers.g.clickables[11].onClick();
            },
            canClick() {
                return player.g.points.gte(layers.g.shopcost(0));
            },
            unlocked: true,
        },
    },

    // ===== 商店价格 =====
    shopcost(x) {
        if (x === undefined) x = 0;
        return player.g.shop[x].level
            .mul(player.g.shop[x].power)
            .pow(1.5)
            .div(100000)
            .add(100);
    },
});
