addLayer("f", {
    name: "工厂", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "F", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            t1: new Decimal(0),      // 1 阶机器产量
            t2: new Decimal(0),      // 2 阶机器产量
            maxTier: new Decimal(1), // 最大机器阶数
        }
    },

    color: "#CCCCCC",
    resource: "废料", // 声望货币名称
    type: "none",
    requires: new Decimal(100),
    row: 5, // 树状图中的行数
    branches: ['e'],

    layerShown() { return player.b.points.gte(11) || player.f.unlocked },

    // ===== UI 布局 =====
    tabFormat: {
        "主界面": {
            content: [
                "main-display",
                ["display-text", function () { return "工厂、铸造厂与锻造炉。你可以使用装备碎片购买机器并生产废料。" }],
                ["display-text", function () { return "你拥有 " + formatWhole(player.f.t1.add(player.f.buyables[11])) + " 台 1 阶机器" }],
                ["display-text", function () { if (player.f.maxTier.gte(2)) return "你拥有 " + formatWhole(player.f.t2.add(player.f.buyables[13])) + " 台 2 阶机器"; return "" }],
                ["display-text", function () { if (player.f.maxTier.gte(3)) return "你拥有 1 台 " + formatWhole(player.f.maxTier) + " 阶机器"; return "" }],
                ["row", [["buyable", 11], ["buyable", 13], ["buyable", 12]]],
            ]
        }
    },

    // ===== 产量倍率 =====
    gainMult() {
        let ret = buyableEffect("f", 11);
        if (hasUpgrade("c", 43)) ret = ret.mul(buyableEffect("c", 33));
        return ret;
    },

    gainMultT1() {
        let ret = buyableEffect("f", 13);
        if (hasUpgrade("c", 43)) ret = ret.mul(buyableEffect("c", 33));
        return ret;
    },

    gainMultT2() {
        let ret = new Decimal(1);
        if (hasUpgrade("c", 43)) ret = ret.mul(buyableEffect("c", 33));
        return ret;
    },

    // ===== 更新逻辑 =====
    update(diff) {
        if (player.b.points.gte(11)) {
            player.f.unlocked = true;

            // 废料生成
            player.f.points = player.f.points.add(
                layers.f.gainMult().mul(diff).mul(
                    player.f.t1.add(player.f.buyables[11])
                )
            );

            // 1 阶机器生成
            player.f.t1 = player.f.t1.add(
                layers.f.gainMultT1().mul(diff).mul(
                    player.f.t2.add(player.f.buyables[13])
                )
            );

            // 最大阶数
            player.f.maxTier = player.f.maxTier.max(
                player.f.buyables[12].add(player.b.points.gte(23) ? 2 : 1)
            );

            // 2 阶及以上
            if (player.f.maxTier.gte(2) && player.b.points.lt(23)) player.f.t2 = player.f.t2.max(1);
            if (player.f.maxTier.gte(3)) {
                player.f.t2 = player.f.t2.root(player.f.maxTier.sub(2))
                    .add(layers.f.gainMultT2().mul(diff))
                    .pow(player.f.maxTier.sub(2));
            }
        }
    },

    // ===== 全局效果 =====
    effect() {
        let base = new Decimal(2);
        if (hasUpgrade("c", 25)) base = base.add(1);
        if (hasMilestone("c", 12)) base = base.add(1);
        return Decimal.pow(base, player.f.points.add(1).log10().sqrt());
    },

    effectDescription() {
        return "转化为平静点数与装备碎片的 " + format(layers.f.effect()) + " 倍乘数";
    },

    // ===== 可购买项 =====
    buyables: {
        11: {
            title() { return "1 阶机器" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "已购买 " + formatWhole(player[this.layer].buyables[this.id]) + " 次<br>" +
                       "1 阶机器速度 ×" + format(data.effect) + "<br>" +
                       "消耗：" + format(data.cost) + " 装备碎片";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(3, a).mul(
                    player.sac.points.gte(3) ? 1 :
                    player.sac.points.gte(2) ? 100 :
                    player.sac.points.gte(1) ? 1e3 : 1e5
                );
                return a;
            },
            canAfford() {
                return player.e.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.e.points = player.e.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = Decimal.pow(2, player[this.layer].buyables[this.id]);
                return eff;
            }
        },

        12: {
            title() { return "提升最大阶数" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "已购买 " + formatWhole(player[this.layer].buyables[this.id]) + " 次<br>" +
                       "最大阶数：" + formatWhole(player[this.layer].maxTier) + "<br>" +
                       "消耗：" + format(data.cost) + " 装备碎片";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(10, a.pow(2)).mul(1e6);
                return a;
            },
            canAfford() {
                return player.e.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.e.points = player.e.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            unlocked() { return hasUpgrade("c", 23) }
        },

        13: {
            title() { return "2 阶机器" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "已购买 " + formatWhole(player[this.layer].buyables[this.id]) + " 次<br>" +
                       "2 阶机器速度 ×" + format(data.effect) + "<br>" +
                       "消耗：" + format(data.cost) + " 废料";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(4, a.pow(1.5));
                return a;
            },
            canAfford() {
                return player.f.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.f.points = player.f.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = Decimal.pow(2, player[this.layer].buyables[this.id]);
                return eff;
            },
            unlocked() { return player.b.points.gte(23) }
        },
    }
});
