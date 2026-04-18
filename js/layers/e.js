addLayer("e", {
    name: "装备", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "E", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            drop: "",
            equipment: {
                11: { level: new Decimal(0), power: new Decimal(0) }, // 等级宝石
                12: { level: new Decimal(0), power: new Decimal(0) }, // 经验宝石
                13: { level: new Decimal(0), power: new Decimal(0) }, // 被动宝石
                14: { level: new Decimal(0), power: new Decimal(0) }, // 平静宝石
                21: { level: new Decimal(0), power: new Decimal(0) }, // 武器
                22: { level: new Decimal(0), power: new Decimal(0) }, // 护甲
                23: { level: new Decimal(0), power: new Decimal(0) }, // 头盔
                24: { level: new Decimal(0), power: new Decimal(0) }, // 鞋子
            },
        }
    },

    color: "#6699FF",
    resource: "装备碎片", // 声望货币名称
    type: "none",
    requires: new Decimal(100),
    row: 4, // 树状图中的行数
    branches: ['d'],

    layerShown() { return player.b.points.gte(8) || player.e.unlocked },

    // ===== UI 布局 =====
    tabFormat: {
        "main": {
            content: [
                "main-display",
                ["display-text", "冒险中的敌人现在会掉落装备。"],
                ["display-text", "卸下装备时会将其转换为装备碎片。"],
                "clickables"
            ]
        }
    },

    // ===== 装备碎片获取倍率 =====
    gainMult(x) {
        if (x === undefined) x = new Decimal(0);
        x = x.pow(2).div(300000);
        x = x.mul(buyableEffect("c", 31));
        if (player.b.points.gte(11)) x = x.mul(player.b.points);
        x = x.mul(layers.f.effect());
        return x;
    },

    update(diff) {
        if (player.b.points.gte(8)) player.e.unlocked = true;
    },

    // ===== 可用装备类型 =====
    types() {
        let types = [11]; // 等级宝石
        if (hasUpgrade("c", 15) || player.sac.points.gte(3)) types.push(12); // 经验宝石
        if (player.b.points.gte(9)) types.push(13); // 被动宝石
        if (hasUpgrade("c", 22) || player.sac.points.gte(3)) types.push(14); // 平静宝石
        if (player.b.points.gte(15)) types.push(21); // 武器
        if (player.b.points.gte(15)) types.push(22); // 护甲
        if (player.b.points.gte(18)) types.push(23); // 头盔
        if (player.b.points.gte(19)) types.push(24); // 鞋子
        return types;
    },

    // ===== 敌人掉落装备 =====
    drop(level) {
        if (level === undefined) return "哈哈";
        player.e.drop = "敌人掉落：";
        let types = layers.e.types();
        let count = 1;
        if (player.b.points.gte(11)) count++;
        if (player.b.points.gte(15)) count++;

        // 装备碎片模式
        if (player.a.equipmentShard) {
            let power = layers.e.effect().add(layers.e.effect2());
            let gain = layers.e.gainMult(level.mul(power)).mul(count ** 1.1).mul(1.1);
            player.e.points = player.e.points.add(gain);
            player.e.drop += format(gain) + " 个装备碎片";
            return player.e.drop;
        }

        // 正常掉落装备
        for (let i = 0; i < count; i++) {
            let type = types[Math.floor(types.length * Math.random())];
            let power = layers.e.effect().mul(Math.random()).add(layers.e.effect2());

            if (i > 0) player.e.drop += "；";
            player.e.drop += layers.e.clickables[type].title + " 等级 " + formatWhole(level) + "，强度：" + formatWhole(power.mul(100)) + "%";
            layers.e.equip(type, level, power);
        }
        return player.e.drop;
    },

    // ===== 装备穿戴逻辑 =====
    equip(type, level, power) {
        if (type === undefined) return new Decimal(0);
        let current = Decimal.mul(player.e.equipment[type].level, player.e.equipment[type].power);
        let incoming = level.mul(power);

        if (incoming.gte(current)) {
            player.e.equipment[type].level = level;
            player.e.equipment[type].power = power;
        }
        player.e.points = player.e.points.add(layers.e.gainMult(current.min(incoming)));
    },

    // ===== 单件装备效果 =====
    equipmentEff(type) {
        if (type === undefined) return new Decimal(0);
        let x = Decimal.mul(player.e.equipment[type].level, player.e.equipment[type].power);

        if (type == 11) { // 等级宝石
            return softcap(
                softcap(x.div(hasUpgrade("c", 33) ? 50000 : 60000), new Decimal(2)),
                new Decimal(8),
                1/3
            );
        }
        if (type == 12) { // 经验宝石
            return Decimal.pow(1.01, x.pow(0.5));
        }
        if (type == 13) { // 被动宝石
            return new Decimal(1).sub(Decimal.pow(0.995, x.pow(0.5)));
        }
        if (type == 14) { // 平静宝石
            return x.div(hasUpgrade("c", 33) ? 2000 : 3000).add(1);
        }
        if (type >= 21 && type <= 24) { // 武器/护甲/头盔/鞋子
            if (player.sac.points.gte(3))
                return Decimal.pow(1.01, x.pow(hasUpgrade("g", 14) ? 0.306 : 0.302));
            if (hasUpgrade("g", 14))
                return Decimal.pow(1.01, x.pow(0.3)).max(x.pow(0.3).div(90).add(1));
            return Decimal.pow(1.01, x.pow(0.3).sub(20)).max(x.pow(0.3).div(100).add(1));
        }
        return new Decimal(0);
    },

    // ===== 全局装备效果 =====
    effect() {
        let ret = player.e.points.add(10).log10().div(hasUpgrade("c", 15) ? 4 : 10);
        return ret;
    },

    effect2() {
        let ret = new Decimal(1);
        if (hasUpgrade("c", 24)) ret = ret.add(0.5);
        if (hasUpgrade("g", 13)) ret = ret.add(0.5);
        if (hasUpgrade("g", 22)) ret = ret.add(0.5);
        if (hasMilestone("c", 14)) ret = ret.add(0.5);
        if (player.b.points.gte(14)) ret = ret.add(player.e.points.add(10).log10().div(player.b.points.gte(22) ? 8 : 10));
        if (player.b.points.gte(25)) ret = ret.add(buyableEffect("h", 13).sub(1));
        return ret;
    },

    effectDescription() {
        return "装备强度范围：" +
               formatWhole(layers.e.effect2().mul(100)) + "% - " +
               formatWhole(layers.e.effect().add(layers.e.effect2()).mul(100)) + "%";
    },

    // ===== 点击按钮（装备展示）=====
    clickables: {
        11: {
            title: "等级宝石",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：等级折算 +${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" }
        },
        12: {
            title: "经验宝石",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：经验获取 ×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return hasUpgrade("c", 15) || player.sac.points.gte(3); }
        },
        13: {
            title: "被动宝石",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：每秒获得 ${format(layers[this.layer].equipmentEff(this.id).mul(100))}% 的平静点数`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return player.b.points.gte(9); }
        },
        14: {
            title: "平静宝石",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：平静点数获取 ×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return hasUpgrade("c", 22) || player.sac.points.gte(3); }
        },
        21: {
            title: "武器",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：攻击×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return player.b.points.gte(15); }
        },
        22: {
            title: "护甲",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：防御×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return player.b.points.gte(15); }
        },
        23: {
            title: "头盔",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：HP 获取 ×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return player.b.points.gte(18); }
        },
        24: {
            title: "鞋子",
            display() {
                return `等级：${formatWhole(player[this.layer].equipment[this.id].level)}<br>` +
                       `强度：${formatWhole(player[this.layer].equipment[this.id].power.mul(100))}%<br>` +
                       `效果：伤害倍率×${format(layers[this.layer].equipmentEff(this.id))}`;
            },
            canClick: false,
            style: { "background-color": "#6699FF" },
            unlocked() { return player.b.points.gte(19); }
        },
    },
})
