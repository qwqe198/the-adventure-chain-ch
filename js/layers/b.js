addLayer("b", {
    name: "首领", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "B", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            hp: new Decimal(1000),
            y: new Decimal(10)
        }
    },

    color: "#FFCC66",
    resource: "已击败的首领", // 声望货币名称
    type: "none",
    row: 1, // 树状图中的行数
    branches: ['a'],

    layerShown() { return player.b.points.gte(1) || getLevel().gte(10) },

    baseResource: "生命", // 声望所基于的资源
    baseAmount() {
        return player.points;
    },

    // ===== 首领属性 =====
    getBossHP() {
        if (player.b.points.gte(10)) return Decimal.pow(10, player.b.points);
        return Decimal.pow(5, player.b.points).mul(1000);
    },

    getBossATK() {
        if (player.b.points.gte(26))
            return Decimal.pow(3, player.b.points.sub(26)).mul(1e13).div(layers.b.dmgDivide());
        if (player.b.points.gte(16))
            return Decimal.pow(2.5, player.b.points.sub(16)).mul(1e9).div(layers.b.dmgDivide());
        if (player.b.points.gte(10))
            return Decimal.pow(2, player.b.points.sub(7)).mul(1e6).div(layers.b.dmgDivide());
        if (player.b.points.gte(8))
            return Decimal.pow(4, player.b.points).mul(8).div(layers.b.dmgDivide());
        return Decimal.pow(4, player.b.points).mul(10).div(layers.b.dmgDivide());
    },

    // ===== UI 布局 =====
    tabFormat: [
        "main-display",
        ["column", [
            ["raw-html", function () {
                let y = Math.ceil(player.b.y.toNumber());
                return "<div style='width:400px;text-align:right;'>x" + y + "</div>";
            }],
            ["bar", "hp"]
        ]],
        ["row", [["clickable", "11"], ["clickable", "12"]]],
        "resource-display",
        "milestones"
    ],

    // ===== 血条 =====
    bars: {
        hp: {
            fillStyle() {
                let y = Math.ceil(player.b.y.toNumber());
                if (y <= 0) return { 'background-color': "#000000" };
                return { 'background-color': "hsl(" + ((y - 1) * 150) + ",100%," + (40 + 60 * Math.pow(1 / 2, y)) + "%)" };
            },
            baseStyle() {
                let y = Math.ceil(player.b.y.toNumber());
                if (y <= 1) return { 'background-color': "#000000", 'transition-duration': '0s' };
                return { 'background-color': "hsl(" + ((y - 2) * 150) + ",100%," + (40 + 60 * Math.pow(1 / 2, y - 1)) + "%)", 'transition-duration': '0s' };
            },
            textStyle: { 'color': '#ffffff' },
            borderStyle() { return {} },
            direction: RIGHT,
            width: 400,
            height: 30,
            progress() {
                let y = player.b.y.toNumber();
                return y - Math.ceil(y) + 1;
            },
            unlocked: true,
            instant: true
        }
    },

    // ===== 按钮 =====
    clickables: {
        11: {
            title() { return "攻击" },
            display() {
                return "消耗 " + format(layers.b.getBossATK().div(getDEF().add(1))) + " 生命 进行攻击";
            },
            canClick() {
                return player.points.gte(layers.b.getBossATK().div(getDEF().add(1)));
            },
            onClick() {
                if (!layers[this.layer].clickables[this.id].canClick()) return;

                let y = player.b.hp.div(layers.b.getBossHP());
                player.points = player.points.sub(layers.b.getBossATK().div(getDEF().add(1)));
                player.b.hp = player.b.hp.sub(getATK().mul(getDMG()).mul(layers.b.dmgMult()));
            },
            unlocked: true,
        },

        12: {
            title() { return "连击 x" + formatWhole(this.bulk()) },
            bulk() {
                let bulk = player.points.div(layers.b.getBossATK().div(getDEF().add(1))).floor().max(1);
                return bulk;
            },
            display() {
                return "消耗 " + format(layers.b.getBossATK().div(getDEF().add(1)).mul(this.bulk())) + " 生命 进行攻击";
            },
            canClick() {
                return player.points.gte(layers.b.getBossATK().div(getDEF().add(1)));
            },
            onClick() {
                if (!layers[this.layer].clickables[this.id].canClick()) return;

                let bulk = this.bulk();
                let y = player.b.hp.div(layers.b.getBossHP());
                player.points = player.points.sub(layers.b.getBossATK().div(getDEF().add(1)).mul(bulk));
                player.b.hp = player.b.hp.sub(getATK().mul(getDMG()).mul(layers.b.dmgMult()).mul(bulk));
            },
            unlocked() { return player.b.points.gte(3) },
        },
    },

    // ===== 里程碑 =====
    milestones: [
        {
            requirementDescription: "击败 1 个首领",
            unlocked() { return player[this.layer].points.gte(0) },
            done() { return player[this.layer].points.gte(1) },
            effectDescription: "每级 +0.05 防御。",
        },
        {
            requirementDescription: "击败 2 个首领",
            unlocked() { return player[this.layer].points.gte(1) },
            done() { return player[this.layer].points.gte(2) },
            effectDescription: "从敌人处获得更多经验，并在 A 层解锁连击攻击。",
        },
        {
            requirementDescription: "击败 3 个首领",
            unlocked() { return player[this.layer].points.gte(2) },
            done() { return player[this.layer].points.gte(3) },
            effectDescription: "解锁 C 层，并在 B 层解锁连击攻击。",
        },
        {
            requirementDescription: "击败 4 个首领",
            unlocked() { return player[this.layer].points.gte(3) },
            done() { return player[this.layer].points.gte(4) },
            effectDescription: "平静点数获取量乘以已击败首领的数量。",
        },
        {
            requirementDescription: "击败 5 个首领",
            unlocked() { return player[this.layer].points.gte(4) },
            done() { return player[this.layer].points.gte(5) },
            effectDescription: "提升平静点数获取效率，解锁平静升级。",
        },
        {
            requirementDescription: "击败 6 个首领",
            unlocked() { return player[this.layer].points.gte(5) },
            done() { return player[this.layer].points.gte(6) },
            effectDescription: "解锁 D 层。",
        },
        {
            requirementDescription: "击败 7 个首领",
            unlocked() { return player[this.layer].points.gte(6) },
            done() { return player[this.layer].points.gte(7) },
            effectDescription: "根据已击败首领数量减少等级需求，解锁更多平静升级。",
        },
        {
            requirementDescription: "击败 8 个首领",
            unlocked() { return player[this.layer].points.gte(7) },
            done() { return player[this.layer].points.gte(8) },
            effectDescription: "解锁 E 层，提高等级上限。",
        },
        {
            requirementDescription: "击败 9 个首领",
            unlocked() { return player[this.layer].points.gte(8) },
            done() { return player[this.layer].points.gte(9) },
            effectDescription: "解锁一种新的装备类型。",
        },
        {
            requirementDescription: "击败 10 个首领",
            unlocked() { return player[this.layer].points.gte(9) },
            done() { return player[this.layer].points.gte(10) },
            effectDescription: "提高等级上限，并减少等级需求。",
        },
        {
            requirementDescription: "击败 11 个首领",
            unlocked() { return player[this.layer].points.gte(10) },
            done() { return player[this.layer].points.gte(11) },
            effectDescription: "装备碎片获取量乘以已击败首领的数量。每个敌人掉落 2 件装备。解锁 F 层。",
        },
        {
            requirementDescription: "击败 12 个首领",
            unlocked() { return player[this.layer].points.gte(11) },
            done() { return player[this.layer].points.gte(12) },
            effectDescription: "解锁献祭（Sacrifice）。",
        },
        {
            requirementDescription: "击败 13 个首领",
            unlocked() { return player[this.layer].points.gte(12) },
            done() { return player[this.layer].points.gte(13) },
            effectDescription: "每级 +0.0001 伤害倍率，解锁部分平静升级。",
        },
        {
            requirementDescription: "击败 14 个首领",
            unlocked() { return player[this.layer].points.gte(13) },
            done() { return player[this.layer].points.gte(14) },
            effectDescription: "装备碎片效果更强。",
        },
        {
            requirementDescription: "击败 15 个首领",
            unlocked() { return player[this.layer].points.gte(14) },
            done() { return player[this.layer].points.gte(15) },
            effectDescription: "解锁 2 种新装备，每个敌人掉落 3 件装备。",
        },
        {
            requirementDescription: "击败 16 个首领",
            unlocked() { return player[this.layer].points.gte(15) },
            done() { return player[this.layer].points.gte(16) },
            effectDescription: "解锁 G 层。",
        },
        {
            requirementDescription: "击败 17 个首领",
            unlocked() { return player[this.layer].points.gte(16) },
            done() { return player[this.layer].points.gte(17) },
            effectDescription: "金币获取量受已击败首领加成。",
        },
        {
            requirementDescription: "击败 18 个首领",
            unlocked() { return player[this.layer].points.gte(17) },
            done() { return player[this.layer].points.gte(18) },
            effectDescription: "解锁一种新装备。生命 获取量 ×1.25。",
        },
        {
            requirementDescription: "击败 19 个首领",
            unlocked() { return player[this.layer].points.gte(18) },
            done() { return player[this.layer].points.gte(19) },
            effectDescription: "解锁一种新装备。伤害倍率 ×1.1。",
        },
        {
            requirementDescription: "击败 20 个首领",
            unlocked() { return player[this.layer].points.gte(19) },
            done() { return player[this.layer].points.gte(20) },
            effectDescription: "解锁 H 层。",
        },
        {
            requirementDescription: "击败 21 个首领",
            unlocked() { return player[this.layer].points.gte(20) },
            done() { return player[this.layer].points.gte(21) },
            effectDescription: "每级 +0.02 防御。解锁一个新的辅助者。",
        },
        {
            requirementDescription: "击败 22 个首领",
            unlocked() { return player[this.layer].points.gte(21) },
            done() { return player[this.layer].points.gte(22) },
            effectDescription: "装备碎片效果更强。",
        },
        {
            requirementDescription: "击败 23 个首领",
            unlocked() { return player[this.layer].points.gte(22) },
            done() { return player[this.layer].points.gte(23) },
            effectDescription: "你可以使用废料购买 2 阶机器。最大机器阶数 +1。",
        },
        {
            requirementDescription: "击败 24 个首领",
            unlocked() { return player[this.layer].points.gte(23) },
            done() { return player[this.layer].points.gte(24) },
            effectDescription: "生命 获取量 ×1.25。",
        },
        {
            requirementDescription: "击败 25 个首领",
            unlocked() { return player[this.layer].points.gte(24) },
            done() { return player[this.layer].points.gte(25) },
            effectDescription: "解锁一个新的辅助者和金币升级。",
        },
    ],

    // ===== 更新逻辑 =====
    update(diff) {
        if (getLevel().gte(10)) player.b.unlocked = true;
        if (player.b.y.lte(0)) {
            player.b.points = player.b.points.add(1);
            player.b.hp = layers.b.getBossHP();
            player.b.y = player.b.points.add(10);
        }
    },

    dmgMult() {
        let ret = new Decimal(1);
        if (hasUpgrade("c", 13)) ret = ret.mul(upgradeEffect("c", 13));
        if (hasUpgrade("g", 21)) ret = ret.mul(upgradeEffect("g", 21));
        ret = ret.mul(layers.d.effect2());
        if (player.sac.points.gte(1)) ret = ret.mul(10);
        if (player.sac.points.gte(2)) ret = ret.mul(100);
        return ret;
    },

    dmgDivide() {
        let ret = new Decimal(1);
        if (player.sac.points.gte(3)) ret = ret.mul(10);
        if (hasUpgrade("c", 21)) ret = ret.mul(upgradeEffect("c", 21));
        return ret;
    },

    doReset(layer) { },

    hotkeys: [
        {
            key: "b",
            description: "B：攻击首领",
            onPress() {
                if (player.b.points.gte(3)) layers.b.clickables[12].onClick();
                else layers.b.clickables[11].onClick();
            }
        },
    ],
})
setInterval(function () {
    if (player.b && player.b.y && layers.b && layers.b.getBossHP) player.b.y = player.b.points.add(10).mul(Decimal.sub(1, Decimal.sub(1, player.b.hp.div(layers.b.getBossHP()).min(1)).sqrt())).mul(0.01).add(player.b.y.mul(0.99)).max(0), tmp.b.bars.hp.fillStyle = layers.b.bars.hp.fillStyle(), tmp.b.bars.hp.baseStyle = layers.b.bars.hp.baseStyle(), tmp.b.bars.hp.progress = layers.b.bars.hp.progress(), constructBarStyle("b", "hp");
}, 10);