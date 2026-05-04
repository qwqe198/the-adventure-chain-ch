addLayer("i", {
    name: "imaginary",
    symbol: "I",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            y: new Decimal(1024),
            infDmg: new Decimal(0),
            infTime: new Decimal(0),
        }
    },
    color: "#00CCCC",
    resource: "幻想点数", // Prestige currency name
    type: "normal",
    requires() {
        return new Decimal(1e5);
    },
    gainMult() {
        let ret = new Decimal(1);
        if(player.b.points.gte(27))ret = ret.mul(player.b.points.sub(26).pow(0.6).add(1));
        if (hasUpgrade("c", 45))ret = ret.mul(1.1);
        if (hasMilestone("i", 4))ret = ret.mul(1.25);
        if (hasMilestone("i", 6))ret = ret.mul(layers.i.infEff());
        return ret;
    },
    getResetGain() {
        if(getLevel().lt(1e5))return new Decimal(0);
        let ret=getLevel().sub(1e5).div(1e3).root(3).add(1).mul(layers.i.gainMult()).floor();
        return ret;
    },
    getNextAt() {
        let ret = layers.i.getResetGain().add(1).div(layers.i.gainMult()).sub(1).pow(3).mul(1e3).add(1e5).max(1e5);
        return ret;
    },
    baseResource: "等级",
    baseAmount() {
        return getLevel();
    },
    row: 8,
    branches: ['h'],
    layerShown() { return player.b.points.gte(26) || player.i.unlocked },
    hotkeys: [
        { key: "i", description: "i：重置以获得幻想点数", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    effect() {
        let ret = Decimal.pow(10, player.i.points.mul(layers.i.infEff()).add(1).log10().sqrt());
        return ret;
    },
    effectDescription() {
        let eff = this.effect();
        return "转化为 " + format(eff) + " 倍经验获取倍率和对首领的伤害";
    },
    milestones: [
        {
            requirementDescription: "1 点幻想点数",
            done() { return player.i.points.gte(1) },
            effectDescription: "平静点数获取更强，幻想点数增加最大等级。幻想重置时保留辅助点数。自动购买平静可购买项，且购买平静可购买项不再减少平静点数。"
        },
        {
            requirementDescription: "2 点幻想点数",
            done() { return player.i.points.gte(2) },
            effectDescription: "根据幻想点数保留部分领域完成进度。（最低25%，125点幻想点数时达到100%）"
        },
        {
            requirementDescription: "3 点幻想点数",
            done() { return player.i.points.gte(3) },
            effectDescription: "被动宝石更强。初始拥有等级10000、强度1000%的被动宝石。同时初始拥有前8个平静里程碑。"
        },
        {
            requirementDescription: "4 点幻想点数",
            done() { return player.i.points.gte(4) },
            effectDescription: "辅助点数获取变为3倍，幻想重置时保留所有辅助单位。"
        },
        {
            requirementDescription: "5 点幻想点数",
            done() { return player.i.points.gte(5) },
            effectDescription: "幻想点数获取 ×1.25。领域最大完成数 +5。"
        },
        {
            requirementDescription: "7 点幻想点数",
            done() { return player.i.points.gte(7) },
            effectDescription: "幻想点数的效果会提升平静点数。"
        },
        {
            requirementDescription: "10 点幻想点数",
            done() { return player.i.points.gte(10) },
            effectDescription: "解锁无限首领。"
        },
        {
            requirementDescription: "15 点幻想点数",
            done() { return player.i.points.gte(15) },
            effectDescription: "幻想点数的效果会提升装备碎片。"
        },
        {
            requirementDescription: "20 点幻想点数",
            done() { return player.i.points.gte(20) },
            effectDescription: "初始拥有前7个金币升级和前12个平静里程碑。"
        },
    ],
    tabFormat: {
        "main": {
            "content": [
                "main-display",
                "prestige-button",
                "resource-display",
                "upgrades",
                "milestones"
            ]
        },
        "Inf Boss": {
            "content": [
                "main-display",
                "prestige-button",
                "resource-display",
                ["column", [
                    ["raw-html", function () {
                        let y = Math.ceil(player.i.y.toNumber());
                        return "<div style=width:400px;text-align:right;>x" + y + "</div>";
                    }],
                    ["bar", "hp"]
                ]],
                "blank",
                ["display-text", "伤害倍率同样作用于对无限首领的伤害。"],
                ["display-text", "对无限首领的伤害倍率具有时间因子，攻击时重置。"],
                ["display-text", function(){return "对无限首领造成的总伤害："+format(Decimal.pow(2,Decimal.sub(1024,player.i.y)).sub(1))}],
                ["display-text", function(){return "对无限首领造成的总伤害会增强幻想点数的效果，并使幻想点数获取提升至 "+format(layers.i.infEff())+" 倍。"}],
                ["row", [["clickable", "11"]]],
            ],
            unlocked: function () { return hasMilestone("i", 6) }
        }
    },
    bars: {
        hp: {
            fillStyle() {
                let y = Math.ceil(player.i.y.toNumber());
                if (y <= 0) return { 'background-color': "#000000" };
                return { 'background-color': "hsl(" + ((y - 1) * 150) + ",100%," + (40 + 60 * Math.pow(1 / 2, y)) + "%)" };
            },
            baseStyle() {
                let y = Math.ceil(player.i.y.toNumber());
                if (y <= 1) return { 'background-color': "#000000", 'transition-duration': '0s' };
                return { 'background-color': "hsl(" + ((y - 2) * 150) + ",100%," + (40 + 60 * Math.pow(1 / 2, y - 1)) + "%)", 'transition-duration': '0s' };
            },
            textStyle: { 'color': '#ffffff' },
            borderStyle() { return {} },
            direction: RIGHT,
            width: 400,
            height: 30,
            progress() {
                let y = player.i.y.toNumber();
                return y - Math.ceil(y) + 1;
            },
            unlocked: true,
            instant: true,
            display() {
                return `${format(Decimal.pow(2,1024).sub(Decimal.pow(2,Decimal.sub(1024,player.i.y)).sub(1)))} / ${format(Decimal.pow(2,1024))}`;
            },
        }
    },
    update(diff){
        if(hasMilestone("i", 6))player.i.infTime = player.i.infTime.add(diff);
    },
    clickables: {
        11: {
            title() {
                return "攻击";
            },
            display() {
                return "伤害倍率：" + format(layers.i.infMult(),2,true) + "x";
            },
            canClick() {
                return true;
            },
            onClick() {
                if (!layers[this.layer].clickables[this.id].canClick()) return;
                player.i.infDmg = player.i.infDmg.add(getATK().mul(getDMG()).mul(layers.i.infMult()));
                player.i.infTime = new Decimal(0);
            },
            unlocked: true,
        },
    },
    infMult(){
        let ret = layers.b.dmgMult();
        ret = ret.mul(1 - Math.pow(0.99996, player.i.infTime.toNumber() ** 2));
        return ret.max(0).div(1e20);
    },
    infEff(){
        return Decimal.sub(1200, player.i.y).div(176).pow(1.2).min(10);
    }
});


setInterval(function () {
    if (player.i && player.i.y && player.i.infDmg && layers.i) player.i.y = Decimal.sub(1024,player.i.infDmg.add(1).log2()).mul(0.001).add(player.i.y.mul(0.999)).max(0), tmp.i.bars.hp.fillStyle = layers.i.bars.hp.fillStyle(), tmp.i.bars.hp.baseStyle = layers.i.bars.hp.baseStyle(), tmp.i.bars.hp.progress = layers.i.bars.hp.progress(), constructBarStyle("i", "hp");
}, 10);
