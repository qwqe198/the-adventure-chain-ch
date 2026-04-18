let modInfo = {
    name: "冒险树",
    id: "the-adventure-chain",
    author: "loader3229",
    pointsName: "生命",
    modFiles: [
        "layers.js",
        "layers/a.js",
        "layers/b.js",
        "layers/c.js",
        "layers/d.js",
        "layers/e.js",
        "layers/f.js",
        "layers/g.js",
        "layers/h.js",
        "tree.js"
    ],

    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal(0),
    offlineLimit: 1, // 单位：小时
}

let VERSION = {
    num: "8.2",
    name: "辅助版本",
}

let changelog = `<h1>更新日志：</h1><br>
<h3>v8.2</h3><br>
        - 汉化游戏，修复领域点数不能获得的bug。<br>
    <h3>v8.0</h3><br>
        - 新增 H 层。<br>
    <h3>v7.0</h3><br>
        - 新增 F 层与 G 层。<br>
    <h3>v5.0</h3><br>
        - 新增装备系统。<br>
    <h3>v4.0</h3><br>
        - 新增领域系统。<br>
    <h3>v3.1</h3><br>
        - 新增平静可购买项。<br>
        - 新增平静升级。<br>
    <h3>v3.0</h3><br>
        - 新增平静点数。<br>
        - 为 A、B、C 层添加快捷键。<br>
    <h3>v2.0</h3><br>
        - 新增 Boss 战。<br>
    <h3>v1.0</h3><br>
        - 新增冒险模式。`

let winText = `恭喜！你已经抵达当前版本的终点并通关，不过就目前而言……`

// 如果你在层内添加了新函数，且这些函数被调用时会产生效果，请将它们加在这里。
// （以下为示例，官方函数已默认处理）
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

// 决定是否显示点数/秒
function canGenPoints() {
    if (inChallenge("d", 12)) return false
    return true
}

// 计算点数/秒！
function getPointGen() {
    if (!canGenPoints())
        return new Decimal(0)

    let gain = getLevel()
    if (hasMilestone("c", 2)) gain = gain.mul(1.1)
    gain = gain.mul(buyableEffect("c", 21))
    if (player.b.points.gte(18)) gain = gain.mul(1.25)
    if (player.b.points.gte(24)) gain = gain.mul(1.25)
    gain = gain.mul(layers.e.equipmentEff(23))

    if (player.b.points.gte(21)) gain = gain.mul(buyableEffect("h", 12))

    return gain
}

// 在此添加应存入 "player" 并随存档保存的非层级变量及其默认值
function addedPlayerData() {
    return {}
}

// 在页面顶部显示额外信息
var displayThings = [
    "残局：击败26首领且等级达到100000",
    function () { return "等级：" + formatWhole(getLevel()) + " / " + formatWhole(getLevelCap()) + "（" + format(getLevelProgress().mul(100)) + "%）" },
    function () { return "攻击：" + format(getATK()) },
    function () { if (player.b.points.gte(1)) return "防御：" + format(getDEF()) },
    function () { if (player.b.points.gte(13)) return "伤害倍率：" + format(getDMG()) + "x" },
"作者:loader3229 汉化:22222",
]

// 判断游戏是否“结束”
function isEndgame() {
    return player.b.points.gte(26) && getLevel().gte(100000)
}

// 背景样式（可以是函数）
var backgroundStyle = {}

// 如果长 Tick 会导致游戏异常，可以在这里限制 Tick 长度
function maxTickLength() {
    return 3600 // 默认为 1 小时，此处设为极大值
}

// 用于修复旧版本的存档问题。如果版本早于修复问题的版本，可以在这里限制资源上限。
function fixOldSave(oldVersion) {
    if (parseInt(oldVersion.split(".")[0]) < 7) {
        player.b.hp = layers.b.getBossHP()
        player.b.y = player.b.points.add(10)
    }
}

// ===== 战斗属性计算 =====

function getATK() {
    if (inChallenge("d", 21)) return new Decimal(1)
    let atk = getLevel()
    if (hasMilestone("c", 2)) atk = atk.mul(1.1)
    if (hasMilestone("c", 15)) atk = atk.mul(1.6)
    atk = atk.mul(buyableEffect("c", 12))
    atk = atk.mul(layers.e.equipmentEff(21))
    if (player.b.points.gte(21)) atk = atk.mul(buyableEffect("h", 12))
    if (inChallenge("d", 22)) atk = atk.sqrt()
    return atk
}

function getDEF() {
    let def = new Decimal(0)
    if (inChallenge("d", 11)) return def
    if (player.b.points.gte(1)) def = def.add(getLevel().mul(0.05))
    if (player.b.points.gte(21)) def = def.add(getLevel().mul(0.02))
    if (hasMilestone("c", 13)) def = def.add(getLevel().mul(0.01))
    if (hasMilestone("c", 2)) def = def.mul(1.1)
    def = def.mul(buyableEffect("c", 13))
    def = def.mul(layers.e.equipmentEff(22))
    if (player.b.points.gte(21)) def = def.mul(buyableEffect("h", 12))
    return def
}

function getDMG() {
    if (inChallenge("d", 21)) return new Decimal(1)
    let dmg = new Decimal(1)
    if (player.b.points.gte(13)) dmg = dmg.add(getLevel().mul(0.0001))
    if (player.b.points.gte(19)) dmg = dmg.mul(1.1)
    dmg = dmg.mul(buyableEffect("c", 32))
    dmg = dmg.mul(layers.e.equipmentEff(24))
    if (player.b.points.gte(21)) dmg = dmg.mul(buyableEffect("h", 12))
    return dmg
}

// ===== 等级系统 =====

function getLevel() {
    return getRealLevel().floor()
}

function getLevelCap() {
    if (player.sac.points.gte(3)) return new Decimal(100000)
    if (player.sac.points.gte(2)) return new Decimal(64000)
    if (player.sac.points.gte(1)) return new Decimal(16000)
    if (player.b.points.gte(10)) return new Decimal(4000)
    if (player.b.points.gte(8)) return new Decimal(3000)
    if (hasMilestone("c", 3)) return new Decimal(2000)
    return new Decimal(1000)
}

function getLevelProgress() {
    return getRealLevel().sub(getLevel())
}

function getLevelScaling() {
    let scaling = new Decimal(1)
    if (hasMilestone("c", 6)) scaling = scaling.add(hasUpgrade("c", 31) ? 1 : 0.2)
    if (hasMilestone("c", 7) && player.sac.points.gte(2)) scaling = scaling.add(0.5)
    if (player.b.points.gte(16)) scaling = scaling.add(player.b.points.div(16).pow(2))
    else if (player.b.points.gte(13)) scaling = scaling.add(player.b.points.mul(0.05))
    else if (player.b.points.gte(7)) scaling = scaling.add(player.b.points.sub(5).mul(0.05))
    scaling = scaling.add(buyableEffect("c", 22))
    scaling = scaling.add(layers.e.equipmentEff(11))
    return scaling
}

function getRealLevel() {
    let scaling = getLevelScaling()

    if (player.sac.points.gte(3)) {
        let level = player.a.points.pow(0.075).div(16).div(scaling.sqrt()).add(1).log(1.0625).mul(scaling.sqrt()).pow(2).add(1)
        if (player.a.points.pow(0.15).lte(scaling)) level = player.a.points.pow(0.15).add(1)
        level = level.min(100000)
        return level
    }

    if (player.sac.points.gte(2)) {
        let level = player.a.points.pow(1 / 12).div(12.5).div(softcap(scaling.sqrt(), new Decimal(player.b.points.gte(21) ? player.b.points.mul(0.1).add(1) : 3)))
            .add(1).log(1.08).mul(softcap(scaling.sqrt(), new Decimal(player.b.points.gte(21) ? player.b.points.mul(0.1).add(1) : 3))).pow(2).add(1)
        if (player.a.points.pow(1 / 6).lte(softcap(scaling.sqrt(), new Decimal(player.b.points.gte(21) ? player.b.points.mul(0.1).add(1) : 3)).pow(2)))
            level = player.a.points.pow(1 / 6).add(1)
        level = level.min(64000)
        return level
    }

    if (player.sac.points.gte(1)) {
        let level = player.a.points.pow(0.2).div(200).div(scaling).add(1).log(1.005).mul(scaling).add(1)
        if (hasMilestone("c", 7)) level = player.a.points.pow(0.2).div(250).div(scaling).add(1).log(1.004).mul(scaling).add(1)
        if (player.a.points.pow(0.2).lte(scaling)) level = player.a.points.pow(0.2).add(1)
        level = level.min(16000)
        return level
    }

    if (hasMilestone("c", 3)) {
        let level = player.a.points.cbrt().div(100).div(scaling).add(1).log(1.01).mul(scaling).add(1)
        if (player.a.points.cbrt().lte(scaling)) level = player.a.points.cbrt().add(1)
        if (level.gte(1225)) level = level.sqrt().mul(35)
        level = level.min(2000)
        if (player.b.points.gte(8)) {
            let level2 = player.a.points.pow(0.25).div(player.b.points.gte(10) ? 250 : 200).div(scaling).add(1).log(1.001).mul(scaling).div(player.b.points.gte(10) ? 4 : 5).add(1)
            if (player.a.points.pow(0.25).lte(scaling.div(player.b.points.gte(10) ? 4 : 5))) level2 = player.a.points.pow(0.25).add(1)
            if (level2.gte(3600)) level2 = level2.sqrt().mul(60)
            level2 = level2.min(player.b.points.gte(10) ? 4000 : 3000)
            level = level.max(level2)
        }
        return level
    }

    return player.a.points.cbrt().add(100).log10().sub(2).mul(200).add(1).min(1000)
}