addLayer("sac", {
    name: "献祭", // 可选，仅在少数地方显示，留空则使用层 ID
    symbol: "Sac", // 显示在层节点上的符号
    position: 0, // 在行内的水平位置

    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },

    color: "#FFFFFF",
    resource: "献祭次数", // 声望货币名称
    baseResource: "等级", // 声望所基于的资源
    baseAmount() { return getLevel(); }, // 获取当前资源数量

    requires() {
        if (player.sac.points.gte(3)) return new Decimal("10^^10");
        return new Decimal(4000);
    },

    type: "static", // static：成本取决于已有数量
    exponent: 1,
    base: 4,

    row: "side", // 位于侧边栏

    // ===== 热键 =====
    hotkeys: [
        { key: "`", description: "`: 进行献祭", onPress() { if (canReset(this.layer)) doReset(this.layer); } },
    ],

    layerShown() { return player.b.points.gte(12) || player.sac.unlocked },

    // ===== 里程碑 =====
    milestones: [
        {
            requirementDescription: "献祭 1 次",
            unlocked() { return player[this.layer].points.gte(0); },
            done() { return player[this.layer].points.gte(1); },
            effectDescription: "提高等级上限与经验值获取，但增加升级所需经验。降低 F 层 1 阶机器的成本。你可以在不退出领域的情况下完成领域挑战。对首领造成 10 倍伤害。"
        },
        {
            requirementDescription: "献祭 2 次",
            unlocked() { return player[this.layer].points.gte(1); },
            done() { return player[this.layer].points.gte(2); },
            effectDescription: "提高等级上限与经验值获取，但增加升级所需经验。降低 F 层 1 阶机器的成本。对首领造成 100 倍伤害。"
        },
        {
            requirementDescription: "献祭 3 次",
            unlocked() { return player[this.layer].points.gte(2); },
            done() { return player[this.layer].points.gte(3); },
            effectDescription: "提高等级上限与经验值获取，但增加升级所需经验。当等级 > 1000 时降低敌人防御。降低 F 层 1 阶机器的成本。在献祭开始时解锁全部 8 种装备类型与全部 4 个领域。承受来自首领的伤害降低至 0.1 倍。"
        },
    ],

    // ===== 重置逻辑 =====
    doReset(layer) {
        if (layer == "sac") {
            // 重置除 Sacrifice 外的所有前置层数据
            layerDataReset("a");
            layerDataReset("c");
            layerDataReset("d");
            layerDataReset("e");
            layerDataReset("f");
            layerDataReset("g");
            layerDataReset("h");

            // 强制更新临时数据以确保显示正确
            updateTemp();
            updateTemp();
            updateTemp();
        }
    },
});
