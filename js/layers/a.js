addLayer("a", {
    name: "冒险", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "A", // 显示在层节点上的符号，默认为 ID 首字母大写
    position: 0, // 在行内的水平位置，默认按 ID 字母顺序排序
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            hp: new Decimal(5.05),
            level: new Decimal(1),
            setLevel: new Decimal(1),
            nextEnemyTime: new Decimal(0),
            equipmentShard: false,
        }
    },

    color: "#FF6666",
    resource: "经验值", // 声望货币名称
    type: "none", // normal：获取成本取决于获得量；static：成本取决于已有数量
    row: 0, // 在树状图中的行数（0 为第一行）
    layerShown() { return true },

    baseResource: "生命", // 声望所基于的资源
    baseAmount() {
        return player.points;
    },

    // ===== 敌人属性 =====
    getEnemyHP(level) {
        if (level === undefined) level = player.a.level;
        return level.mul(Decimal.pow(1.01, level.pow(0.5))).mul(5);
    },

    getEnemyATK(level) {
        if (level === undefined) level = player.a.level;
        return level.mul(Decimal.pow(1.01, level.pow(0.5)));
    },

    getEnemyDEF(level) {
        if (level === undefined) level = player.a.level;
        if (player.sac.points.gte(3))
            return level.mul(Decimal.pow(1.01, level.pow(0.5))).mul(0.05).sub(1.05).max(0);
        return level.mul(Decimal.pow(1.01, level.pow(0.5))).mul(0.05).sub(1.05).max(0)
            .max(level.mul(Decimal.pow(1.01, level.pow(0.5))).mul(0.1).sub(70));
    },

    getEnemyDMG(level) {
        if (level === undefined) level = player.a.level;
        return level.mul(Decimal.pow(1.01, level.pow(0.5))).mul(0.0001).max(1);
    },

    getEnemyEXP(level) {
        if (level === undefined) level = player.a.level;
        let exp = level.pow(20 / 9)
            .max(level.pow(3.1).mul(Decimal.pow(1.031, level.pow(0.5))).div(player.b.points.gte(2) ? 5 : 15));

        if (player.c.unlocked)
            exp = level.pow(3.1).mul(Decimal.pow(1.031, level.pow(0.5)))
                .max(level.pow(4.1).mul(Decimal.pow(1.041, level.pow(0.5))).div(4000));

        if (player.sac.points.gte(1)) {
            exp = level.pow(3.1).mul(Decimal.pow(1.031, level.pow(0.5))).mul(20)
                .max(level.pow(4.1).mul(Decimal.pow(1.041, level.pow(0.5))).div(hasMilestone("c", 9) ? 1 : 60));
            if (hasMilestone("c", 0)) exp = exp.mul(3);
            if (hasMilestone("c", 3)) exp = exp.mul(2);
            if (hasMilestone("c", 10)) exp = level.pow(4.1).mul(Decimal.pow(1.041, level.pow(0.5))).mul(100);
        }

        if (player.sac.points.gte(2)) {
            exp = level.pow(4.1).mul(Decimal.pow(1.041, level.pow(0.5))).mul(20);
            if (hasMilestone("c", 0)) exp = exp.mul(2.5);
            if (hasMilestone("c", 3)) exp = exp.mul(2);
            if (hasMilestone("c", 9)) exp = exp.mul(2.5);
            if (hasMilestone("c", 10)) exp = exp.mul(2);
            if (hasMilestone("c", 11)) exp = exp.mul(2);
        }

        exp = exp.mul(layers.a.gainMult());
        return exp;
    },

    getEnemyGold(level) {
        if (level === undefined) level = player.a.level;
        let gold = level.div(1000).mul(player.b.points.sub(15).max(0).pow(0.5))
            .add(1).pow(1.5).mul(player.b.points.sub(15).max(0).pow(0.5));

        if (player.b.points.gte(25))
            gold = level.div(1500).mul(player.b.points.pow(0.5)).add(1).pow(1.5).mul(player.b.points.pow(0.5));

        gold = gold.mul(layers.g.gainMult());
        return gold;
    },

    gainMult() {
        if (!player.c.unlocked) return new Decimal(1);
        let exp = new Decimal(1);
        exp = exp.mul(layers.c.effect());
        exp = exp.mul(buyableEffect("c", 23));
        exp = exp.mul(layers.e.equipmentEff(12));
        if (hasMilestone("c", 8)) exp = exp.mul(layers.f.effect());
        return exp;
    },

    // ===== UI 布局 =====
    tabFormat: [
        "main-display",
        ["row", [
            ["display-text", function () { return "设置敌人等级：" }],
            ["text-input", "setLevel"],
            ["clickable", 21],
            ["clickable", 22]
        ]],
        ["row", [["display-text", function () { return "当前敌人等级：" + formatWhole(player.a.level) }]]],
        ["bar", "hp"],
        ["display-text", function () { return "攻击：" + format(layers.a.getEnemyATK()) }],
        ["display-text", function () { if (player.a.level.gte(20)) return "防御：" + format(layers.a.getEnemyDEF()) }],
        ["display-text", function () { if (player.a.level.gte(4960)) return "伤害倍率：" + format(layers.a.getEnemyDMG()) + "x" }],
        ["display-text", function () { return "经验值（EXP）：" + format(layers.a.getEnemyEXP()) }],
        ["display-text", function () { if (player.b.points.gte(16)) return "金币：" + format(layers.a.getEnemyGold()) }],
        ["display-text", function () { if (!player.b.unlocked) return "达到等级 10 以解锁 B 层" }],
        ["row", [["clickable", "11"], ["clickable", "12"]]],
        "resource-display",
        ["display-text", function () { return player.e.drop }],
        ["clickable", "13"]
    ],

    // ===== 血条 =====
    bars: {
        hp: {
            fillStyle() {
                if (player.a.nextEnemyTime.gte(0)) {
                    return { 'background-color': "#999999" };
                }
                return { 'background-color': "#ff6666" };
            },
            baseStyle: { 'background-color': "#000000" },
            textStyle: { 'color': '#ffffff' },
            borderStyle() { return {} },
            direction: RIGHT,
            width: 400,
            height: 30,
            progress() {
                if (player.a.nextEnemyTime.gte(0)) {
                    return (2 - player.a.nextEnemyTime.toNumber()) / 2;
                }
                return (player.a.hp.div(layers.a.getEnemyHP()).toNumber());
            },
            display() {
                if (player.a.nextEnemyTime.gte(0)) {
                    return "下一个敌人在 " + format(player.a.nextEnemyTime) + " 秒后出现";
                }
                return `${format(player.a.hp)} / ${format(layers.a.getEnemyHP())}`;
            },
            unlocked: true,
        }
    },

    // ===== 按钮 =====
    clickables: {
        11: {
            title() { return "攻击" },
            display() {
                return "消耗 " + format(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1))) +
                       " 生命 造成 " + format(getATK().mul(getDMG()).div(layers.a.getEnemyDEF().add(1))) + " 点伤害";
            },
            canClick() {
                return player.points.gte(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1))) &&
                       player.a.nextEnemyTime.lte(0);
            },
            onClick() {
                if (!layers[this.layer].clickables[this.id].canClick()) return;
                player.points = player.points.sub(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1)));
                player.a.hp = player.a.hp.sub(getATK().mul(getDMG()).div(layers.a.getEnemyDEF().add(1)));
                if (inChallenge("d", 22) && player.a.hp.gt(0)) player.a.hp = layers.a.getEnemyHP();
            },
            unlocked: true,
        },

        12: {
            title() { return "连击 x" + formatWhole(this.bulk()) },
            bulk() {
                if (inChallenge("d", 22)) return new Decimal(1);
                let bulk = player.points.div(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1))).floor();
                let dmg = player.a.hp.div(getATK().mul(getDMG()).div(layers.a.getEnemyDEF().add(1))).ceil();
                bulk = bulk.min(dmg).max(1);
                return bulk;
            },
            display() {
                return "消耗 " + format(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1)).mul(this.bulk())) +
                       " 生命 造成 " + format(getATK().mul(getDMG()).div(layers.a.getEnemyDEF().add(1)).mul(this.bulk())) + " 点伤害";
            },
            canClick() {
                return player.points.gte(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1))) &&
                       player.a.nextEnemyTime.lte(0);
            },
            onClick() {
                if (!layers[this.layer].clickables[this.id].canClick()) return;
                let bulk = this.bulk();
                player.points = player.points.sub(layers.a.getEnemyATK().mul(layers.a.getEnemyDMG()).div(getDEF().add(1)).mul(bulk));
                player.a.hp = player.a.hp.sub(getATK().mul(getDMG()).div(layers.a.getEnemyDEF().add(1)).mul(bulk));
                if (inChallenge("d", 22) && player.a.hp.gt(0)) player.a.hp = layers.a.getEnemyHP();
            },
            unlocked() { return player.b.points.gte(2) },
        },

        13: {
            title() { return "掉落模式" },
            display() { return player.a.equipmentShard ? "装备碎片" : "装备" },
            canClick() { return hasUpgrade("c", 42) },
            onClick() { player.a.equipmentShard = !player.a.equipmentShard; },
            unlocked() { return hasUpgrade("c", 42) },
        },

        21: {
            title() { return "-1" },
            canClick() { return player.a.level.gte(2) },
            onClick() {
                player.a.setLevel = player.a.level = player.a.level.sub(1);
                player.a.nextEnemyTime = new Decimal(2);
                player.a.hp = layers.a.getEnemyHP();
            },
            style: { 'width': "60px", 'min-height': "60px" },
            unlocked: true,
        },

        22: {
            title() { return "+1" },
            canClick() { return true },
            onClick() {
                player.a.setLevel = player.a.level = player.a.level.add(1);
                player.a.nextEnemyTime = new Decimal(2);
                player.a.hp = layers.a.getEnemyHP();
            },
            style: { 'width': "60px", 'min-height': "60px" },
            unlocked: true,
        }
    },

    // ===== 更新逻辑 =====
    update(diff) {
        if (player.a.hp.lte(0)) {
            layers.e.drop(player.a.level);
            player.a.nextEnemyTime = new Decimal(2);
            player.a.hp = layers.a.getEnemyHP();
            player.a.points = player.a.points.add(layers.a.getEnemyEXP());
            player.g.points = player.g.points.add(layers.a.getEnemyGold());
        } else if (inChallenge("d", 22)) {
            player.a.hp = layers.a.getEnemyHP();
        }

        player.a.nextEnemyTime = player.a.nextEnemyTime.sub(diff);
        player.a.setLevel = player.a.setLevel.max(1);

        if (player.a.level.neq(player.a.setLevel)) {
            player.a.level = player.a.setLevel;
            player.a.nextEnemyTime = new Decimal(2);
            player.a.hp = layers.a.getEnemyHP();
        }
    },

    doReset(layer) {
        if (layer == "c" || layer == "d") {
            player.a.points = new Decimal(0);
            player.a.nextEnemyTime = new Decimal(2);
            player.a.hp = layers.a.getEnemyHP();
            updateTemp();
        }
    },

    hotkeys: [
        {
            key: "a",
            description: "A：攻击敌人",
            onPress() {
                if (player.b.points.gte(2)) layers.a.clickables[12].onClick();
                else layers.a.clickables[11].onClick();
            }
        },
    ],
})