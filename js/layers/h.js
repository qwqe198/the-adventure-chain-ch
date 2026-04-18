addLayer("h", {
    name: "辅助者", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "H", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            autoProgress: new Decimal(0),
            clickables: { 11: new Decimal(0) },
        }
    },

    color: "#FF00FF",
    resource: "辅助者点数", // 声望货币名称
    type: "none",
    requires: new Decimal(100),
    row: 7, // 树状图中的行数
    branches: ['g'],

    layerShown() { return player.b.points.gte(20) || player.h.unlocked },

    // ===== 辅助者点数获取倍率 =====
    gainMult() {
        return new Decimal(1);
    },

    // ===== 可购买项 =====
    buyables: {
        11: {
            title() { return "自动辅助者" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                       "每 " + format(data.effect) + " 刻激活一次<br>" +
                       "下一级消耗：" + format(data.cost) + " 金币";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(2, a);
                return a;
            },
            canAfford() {
                return player.g.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.g.points = player.g.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = player[this.layer].buyables[this.id].pow(0.5).mul(0.1);
                return eff;
            }
        },

        12: {
            title() { return "属性辅助者" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                       "生命 获取、攻击力、防御、伤害倍率 ×" + format(data.effect) + "（基于辅助者点数）<br>" +
                       "下一级消耗：" + format(data.cost) + " 金币";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(3, a).mul(100);
                return a;
            },
            canAfford() {
                return player.g.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.g.points = player.g.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = player[this.layer].buyables[this.id]
                    .mul(player[this.layer].points.add(10).log10())
                    .div(100).add(1);
                return eff;
            },
            unlocked() { return player.b.points.gte(21) }
        },

        13: {
            title() { return "装备辅助者" },
            display() {
                let data = tmp[this.layer].buyables[this.id];
                return "等级：" + format(player[this.layer].buyables[this.id]) + "<br>" +
                       "装备强度 +" + format(data.effect.sub(1).mul(100)) + "%（基于辅助者点数）<br>" +
                       "下一级消耗：" + format(data.cost) + " 金币";
            },
            cost() {
                let a = player[this.layer].buyables[this.id];
                a = Decimal.pow(4, a).mul(1e4);
                return a;
            },
            canAfford() {
                return player.g.points.gte(layers[this.layer].buyables[this.id].cost());
            },
            buy() {
                player.g.points = player.g.points.sub(layers[this.layer].buyables[this.id].cost());
                player[this.layer].buyables[this.id] =
                    player[this.layer].buyables[this.id].add(1);
            },
            effect() {
                let eff = player[this.layer].buyables[this.id]
                    .mul(player[this.layer].points.add(10).log10().pow(1.5))
                    .div(100).add(1);
                return eff;
            },
            unlocked() { return player.b.points.gte(25) }
        }
    },

    // ===== 点击按钮 =====
    clickables: {
        11: {
            title() { return "切换自动辅助者类型" },
            display() {
                if (player.h.clickables[11].eq(0)) {
                    return "当前类型：无。每次辅助者刻获得 2 点基础辅助者点数。";
                } else if (player.h.clickables[11].eq(1)) {
                    return "当前类型：自动连击攻击敌人。每次辅助者刻获得 1 点基础辅助者点数。";
                } else if (player.h.clickables[11].eq(2)) {
                    return "当前类型：自动连击攻击首领。每次辅助者刻获得 1 点基础辅助者点数。";
                }
            },
            canClick() { return true; },
            onClick() {
                player.h.clickables[11] =
                    new Decimal((player.h.clickables[11].toNumber() + 1) % 3);
            },
            style() {
                if (player.h.clickables[11].eq(0)) {
                    return { "background-color": layers.h.color };
                } else if (player.h.clickables[11].eq(1)) {
                    return { "background-color": layers.a.color };
                } else if (player.h.clickables[11].eq(2)) {
                    return { "background-color": layers.b.color };
                }
            },
            unlocked: true,
        }
    },

    // ===== 更新逻辑 =====
    update(diff) {
        if (player.b.points.gte(20)) player.h.unlocked = true;

        player.h.autoProgress =
            player.h.autoProgress.add(buyableEffect("h", 11).mul(diff));

        if (player.h.autoProgress.gte(1)) {
            if (player.h.clickables[11].eq(0)) {
                player.h.points =
                    player.h.points.add(player.h.autoProgress.mul(layers.h.gainMult()));
            } else if (player.h.clickables[11].eq(1)) {
                layers.a.clickables[12].onClick();
            } else if (player.h.clickables[11].eq(2)) {
                layers.b.clickables[12].onClick();
            }
            player.h.points =
                player.h.points.add(player.h.autoProgress.mul(layers.h.gainMult()));
            player.h.autoProgress = new Decimal(0);
        }
    },

    // ===== 快捷键 =====
    hotkeys: [
        {
            key: "h",
            description: "H：切换自动辅助者类型",
            onPress() {
                if (player.b.points.gte(20)) layers.h.clickables[11].onClick();
            }
        },
    ],
});