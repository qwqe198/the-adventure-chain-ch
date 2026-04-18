addLayer("c", {
    name: "平静", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "C", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },

    color: "#66FF66",
    resource: "平静点数", // 声望货币名称
    type: "normal", // normal：成本取决于获得量；static：成本取决于已有数量
    requires() {
        if (player.sac.points.gte(3)) return new Decimal(1);
        if (player.sac.points.gte(2)) return new Decimal(10);
        if (player.sac.points.gte(1)) return new Decimal(20);
        return new Decimal(100);
    },
    exponent() {
        let ret = new Decimal(2);
        if (hasMilestone("c", 5)) ret = ret.add(player.sac.points.gte(1) ? 0.1 : 0.6);
        if (player.b.points.gte(5) && player.sac.points.lte(2)) ret = ret.add(player.sac.points.gte(2) ? 0.1 : 0.4);
        return ret;
    },
    baseResource: "等级", // 声望所基于的资源
    baseAmount() {
        return getLevel();
    },
    row: 2, // 树状图中的行数
    branches: ['b'],

    layerShown() { return player.b.points.gte(3) || player.c.unlocked },

    // ===== UI 布局 =====
    tabFormat: {
        "主界面": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "upgrades",
                "milestones"
            ]
        },
        "可购买项": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "buyables"
            ],
            unlocked: function () { return hasMilestone("c", 4) }
        }
    },

    roundUpCost: true,

    hotkeys: [
        { key: "c", description: "C：重置以获取平静点数", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // ===== 平静点数获取 =====
    gainMult() {
        let ret = new Decimal(1);
        if (player.b.points.gte(4)) ret = ret.mul(player.b.points);
        ret = ret.mul(buyableEffect("c", 11));
        if (hasUpgrade("c", 11)) ret = ret.mul(upgradeEffect("c", 11));
        if (hasUpgrade("g", 11)) ret = ret.mul(upgradeEffect("g", 11));
        ret = ret.mul(layers.d.effect());
        ret = ret.mul(layers.e.equipmentEff(14));
        ret = ret.mul(layers.f.effect());
        if (player.sac.points.gte(3)) ret = ret.div(1000);
        else if (player.sac.points.gte(1)) ret = ret.div(12);
        return ret;
    },

    effect() {
        let ret = player.c.points.add(1);
        if (ret.gte(10)) ret = Decimal.pow(10, ret.log10().sqrt().mul(2).sub(1));
        if (hasUpgrade("c", 35)) ret = Decimal.pow(10, player.c.points.add(1).log10().sqrt().mul(2));
        return ret;
    },
    effectDescription() {
        let eff = this.effect();
        return "转化为经验值获取量的 " + format(eff) + " 倍乘数";
    },

    // ===== 里程碑 =====
    milestones: [
        {
            requirementDescription: "1 平静点数",
            done() { return player.c.points.gte(1) },
            effectDescription: "从敌人处获得更多经验值。",
        },
        {
            requirementDescription: "5 平静点数",
            done() { return player.c.points.gte(5) },
            effectDescription: "根据等级被动获得经验值。",
        },
        {
            requirementDescription: "20 平静点数",
            done() { return player.c.points.gte(20) },
            effectDescription: "HP、攻击和防御均 ×1.1。",
        },
        {
            requirementDescription: "100 平静点数",
            done() { return player.c.points.gte(100) },
            effectDescription() {
                if (player.sac.points.gte(1)) return "减少等级需求并提高等级上限。";
                return "减少等级需求并提高等级上限。";
            },
        },
        {
            requirementDescription: "300 平静点数",
            done() { return player.c.points.gte(300) },
            effectDescription: "解锁平静可购买项。",
        },
        {
            requirementDescription: "1000 平静点数",
            done() { return player.c.points.gte(1000) },
            effectDescription: "提升平静点数的获取效率。",
        },
        {
            requirementDescription: "4000 平静点数",
            done() { return player.c.points.gte(4000) },
            effectDescription: "减少等级需求。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(3)) return "1e5 平静点数"; if (player.sac.points.gte(2)) return "1e6 平静点数"; return "1e14 平静点数"; },
            done() { return (player.c.points.gte(1e14) && player.sac.points.gte(1)) || (player.c.points.gte(1e6) && player.sac.points.gte(2)) || (player.c.points.gte(1e5) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(1) },
            effectDescription: "减少等级需求。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(2)) return "1e8 平静点数"; return "1e16 平静点数"; },
            done() { return (player.c.points.gte(1e16) && player.sac.points.gte(1)) || (player.c.points.gte(1e8) && player.sac.points.gte(2)); },
            unlocked() { return player.sac.points.gte(1) },
            effectDescription: "废料效果增强经验值获取。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(2)) return "1e11 平静点数"; return "1e18 平静点数"; },
            done() { return (player.c.points.gte(1e18) && player.sac.points.gte(1)) || (player.c.points.gte(1e11) && player.sac.points.gte(2)); },
            unlocked() { return player.sac.points.gte(1) },
            effectDescription: "从敌人处获得更多经验值。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(2)) return "1e14 平静点数"; return "1e20 平静点数"; },
            done() { return (player.c.points.gte(1e20) && player.sac.points.gte(1)) || (player.c.points.gte(1e14) && player.sac.points.gte(2)); },
            unlocked() { return player.sac.points.gte(1) },
            effectDescription: "从敌人处获得更多经验值。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(3)) return "1e17 平静点数"; return "1e18 平静点数"; },
            done() { return (player.c.points.gte(1e18) && player.sac.points.gte(2)) || (player.c.points.gte(1e17) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(2) },
            effectDescription: "从敌人处获得更多经验值。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(3)) return "1e20 平静点数"; return "1e21 平静点数"; },
            done() { return (player.c.points.gte(1e21) && player.sac.points.gte(2)) || (player.c.points.gte(1e20) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(2) },
            effectDescription: "废料效果更强。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(3)) return "1e23 平静点数"; return "1e24 平静点数"; },
            done() { return (player.c.points.gte(1e24) && player.sac.points.gte(2)) || (player.c.points.gte(1e23) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(2) },
            effectDescription: "每级 +0.01 防御。",
        },
        {
            requirementDescription() { if (player.sac.points.gte(3)) return "1e26 平静点数"; return "1e29 平静点数"; },
            done() { return (player.c.points.gte(1e29) && player.sac.points.gte(2)) || (player.c.points.gte(1e26) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(2) },
            effectDescription: "装备强度 +50%。",
        },
        {
            requirementDescription() { return "1e29 平静点数"; },
            done() { return (player.c.points.gte(1e29) && player.sac.points.gte(3)); },
            unlocked() { return player.sac.points.gte(3) },
            effectDescription: "攻击力 ×1.6。",
        },
    ],

    // ===== 更新逻辑 =====
    update(diff) {
        if (hasMilestone("c", 1)) {
            player.a.points = player.a.points.add(
                getLevel().pow(player.d.activeChallenge ? 0.5 : 2)
                    .pow(player.sac.points.gte(1) ? 1.75 : 1)
                    .mul(diff)
                    .mul(layers.a.gainMult())
            );
        }
    },

    // ===== 升级 =====
    upgrades: {
        11: {
            description: "每个平静升级使平静点数获取翻倍。",
            cost: new Decimal(1e4),
            effect: function () { return Decimal.pow(2, player.c.upgrades.length) },
            effectDisplay: function () { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        12: {
            description: "解锁新的平静可购买项。",
            cost: new Decimal(1e5)
        },
        13: {
            description: "根据已购买的平静升级，对首领造成更多伤害。",
            cost: new Decimal(1e6),
            effect: function () { return Decimal.pow(2, player.c.upgrades.length) },
            effectDisplay: function () { return format(upgradeEffect(this.layer, this.id)) + "x" }
        },
        14: {
            description: "解锁新的平静可购买项。",
            cost: new Decimal(1e7),
            unlocked() { return player.b.points.gte(7) }
        },
        15: {
            description() { if (player.sac.points.gte(3)) return "装备碎片效果更强。"; return "解锁一种新的装备类型，装备碎片效果更强。"; },
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e9); return new Decimal(3e8); },
            unlocked() { return player.e.unlocked }
        },
        21: {
            description() { if (player.sac.points.gte(3)) return "领域点数减少攻击首领时的伤害承受。"; return "解锁一个新的领域。领域点数减少攻击首领时的伤害承受。"; },
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e11); return new Decimal(1e10); },
            unlocked() { return player.e.unlocked },
            effect: function () { return player.d.points.mul(0.05).add(1) },
            effectDisplay: function () { return "/" + format(upgradeEffect(this.layer, this.id)) }
        },
        22: {
            description() { if (player.sac.points.gte(3)) return "解锁一个新的平静可购买项。"; return "解锁一种新的装备类型和一个新的平静可购买项。"; },
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e13); return new Decimal(3e11); },
            unlocked() { return player.e.unlocked },
        },
        23: {
            description: "解锁更高阶的机器。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e15); return new Decimal(2e13); },
            unlocked() { return player.f.unlocked },
        },
        24: {
            description: "新装备的装备强度 +50%。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e17); return new Decimal(5e14); },
            unlocked() { return player.f.unlocked },
        },
        25: {
            description: "废料效果更强。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e19); return new Decimal(3e10); },
            unlocked() { return player.sac.points.gte(1) },
        },
        31: {
            description: "4000 平静点数里程碑效果更强。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e21); return new Decimal(1e17); },
            unlocked() { return player.b.points.gte(13) }
        },
        32: {
            description: "提高领域最大完成次数。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e23); return new Decimal(3e18); },
            unlocked() { return player.b.points.gte(13) }
        },
        33: {
            description: "等级宝石与平静宝石效果更强。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e25); return new Decimal(4e20); },
            unlocked() { return player.b.points.gte(13) }
        },
        34: {
            description() { if (player.sac.points.gte(3)) return "领域目标增长延迟。"; return "解锁一个新的领域。"; },
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e27); return new Decimal(2e22); },
            unlocked() { return player.b.points.gte(16) }
        },
        35: {
            description: "平静点数效果更强。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e29); return new Decimal(1e24); },
            unlocked() { return player.b.points.gte(16) }
        },
        41: {
            description: "解锁一个新的平静可购买项。",
            cost: new Decimal(1e26),
            unlocked() { return player.sac.points.gte(2) },
        },
        42: {
            description: "在冒险模式中可以让敌人掉落装备碎片而非装备。该模式下掉落的装备碎片多于从装备分解获得的碎片。",
            cost: new Decimal(1e28),
            unlocked() { return player.sac.points.gte(2) },
        },
        43: {
            description: "解锁一个新的平静可购买项。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e30); return new Decimal(3e29); },
            unlocked() { return player.sac.points.gte(2) },
        },
        44: {
            description: "生命 获取、攻击力、防御和伤害倍率的可购买项更便宜。",
            cost() { if (player.sac.points.gte(3)) return new Decimal(1e32); return new Decimal(3e31); },
            unlocked() { return player.sac.points.gte(2) },
        },
    },

    // ===== 可购买项 =====
    buyables: {
        11: {
            title() { return "平静点数"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "平静点数获取 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(2, a).mul((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 1 : 100);
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id]);
                if (player.sac.points.gte(3)) eff = new Decimal(1).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            }
        },
        12: {
            title() { return "攻击"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "攻击力 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 2 : 3, a)
                    .mul((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 1.2 : (hasUpgrade("c", 44) ? 1 : 100));
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            }
        },
        13: {
            title() { return "防御"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "防御 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 2 : 3, a)
                    .mul((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 1.4 : (hasUpgrade("c", 44) ? 1.5 : 150));
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            }
        },
        21: {
            title() { return "生命 获取"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "生命 获取 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 2 : 3, a)
                    .mul((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 1.6 : (hasUpgrade("c", 44) ? 2 : 200));
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            }
        },
        22: {
            title() { return "等级折算"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "等级折算因子 +" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(4, a).mul(1e4);
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(0).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            },
            unlocked() { return hasUpgrade("c", 12) }
        },
        23: {
            title() { return "经验值获取"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "经验值获取 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(3, a).mul(1e6);
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id]);
                return eff;
            },
            unlocked() { return hasUpgrade("c", 14) }
        },
        31: {
            title() { return "装备碎片获取"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "装备碎片获取 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(2, a).mul(1e10);
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id]);
                return eff;
            },
            unlocked() { return hasUpgrade("c", 22) }
        },
        32: {
            title() { return "伤害倍率"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "伤害倍率 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 2 : 3, a)
                    .mul((hasUpgrade("c", 44) && player.sac.points.gte(3)) ? 1.8 : (hasUpgrade("c", 44) ? 2.5 : 250));
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id].div(20));
                return eff;
            },
            unlocked() { return hasUpgrade("c", 41) }
        },
        33: {
            title() { return "所有工厂机器速度"; },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                    "所有工厂机器速度 ×" + format(data.effect) + "<br>" +
                    "下一级消耗：" + format(data.cost) + " 平静点数";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(10, a).mul(1e25);
                return a;
            },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = new Decimal(1).add(player[this.layer].buyables[this.id]);
                return eff;
            },
            unlocked() { return hasUpgrade("c", 43) }
        },
    },

    doReset(layer) { },

    passiveGeneration() {
        if (player.b.points.gte(9)) return layers.e.equipmentEff(13).toNumber();
        else return 0;
    },
})
