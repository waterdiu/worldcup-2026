import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "/Users/chamcham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const OUT_DIR = "/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/data";
const CSV_PATH = path.join(OUT_DIR, "2026世界杯104场比赛赛程表.csv");
const MD_PATH = path.join(OUT_DIR, "2026世界杯104场比赛赛程表.md");
const XLSX_PATH = path.join(OUT_DIR, "2026世界杯104场比赛赛程表.xlsx");

const scheduleText = `
1|Group A|MEX|RSA|2026-06-11|1:00 PM|Mexico City
2|Group A|KOR|CZE|2026-06-11|8:00 PM|Guadalajara
3|Group A|CZE|RSA|2026-06-18|12:00 PM|Atlanta
4|Group A|MEX|KOR|2026-06-18|7:00 PM|Guadalajara
5|Group A|CZE|MEX|2026-06-24|7:00 PM|Mexico City
6|Group A|RSA|KOR|2026-06-24|7:00 PM|Monterrey
7|Group B|CAN|BIH|2026-06-12|3:00 PM|Toronto
8|Group B|QAT|SUI|2026-06-13|12:00 PM|San Francisco Bay Area
9|Group B|SUI|BIH|2026-06-18|12:00 PM|Los Angeles
10|Group B|CAN|QAT|2026-06-18|3:00 PM|Vancouver
11|Group B|SUI|CAN|2026-06-24|12:00 PM|Vancouver
12|Group B|BIH|QAT|2026-06-24|12:00 PM|Seattle
13|Group C|BRA|MAR|2026-06-13|6:00 PM|New York/New Jersey
14|Group C|HAI|SCO|2026-06-13|9:00 PM|Boston
15|Group C|SCO|MAR|2026-06-19|6:00 PM|Boston
16|Group C|BRA|HAI|2026-06-19|9:00 PM|Philadelphia
17|Group C|SCO|BRA|2026-06-24|6:00 PM|Miami
18|Group C|MAR|HAI|2026-06-24|6:00 PM|Atlanta
19|Group D|USA|PAR|2026-06-12|6:00 PM|Los Angeles
20|Group D|AUS|TUR|2026-06-13|9:00 PM|Vancouver
21|Group D|USA|AUS|2026-06-19|12:00 PM|Seattle
22|Group D|TUR|PAR|2026-06-19|9:00 PM|San Francisco Bay Area
23|Group D|TUR|USA|2026-06-25|7:00 PM|Los Angeles
24|Group D|PAR|AUS|2026-06-25|7:00 PM|San Francisco Bay Area
25|Group E|GER|CUW|2026-06-14|12:00 PM|Houston
26|Group E|CIV|ECU|2026-06-14|7:00 PM|Philadelphia
27|Group E|GER|CIV|2026-06-20|4:00 PM|Toronto
28|Group E|ECU|CUW|2026-06-20|7:00 PM|Kansas City
29|Group E|CUW|CIV|2026-06-25|4:00 PM|Philadelphia
30|Group E|ECU|GER|2026-06-25|4:00 PM|New York/New Jersey
31|Group F|NED|JPN|2026-06-14|3:00 PM|Dallas
32|Group F|SWE|TUN|2026-06-14|8:00 PM|Monterrey
33|Group F|NED|SWE|2026-06-20|12:00 PM|Houston
34|Group F|TUN|JPN|2026-06-20|10:00 PM|Monterrey
35|Group F|JPN|SWE|2026-06-25|6:00 PM|Dallas
36|Group F|TUN|NED|2026-06-25|6:00 PM|Kansas City
37|Group G|BEL|EGY|2026-06-15|12:00 PM|Seattle
38|Group G|IRN|NZL|2026-06-15|6:00 PM|Los Angeles
39|Group G|BEL|IRN|2026-06-21|12:00 PM|Los Angeles
40|Group G|NZL|EGY|2026-06-21|6:00 PM|Vancouver
41|Group G|EGY|IRN|2026-06-26|8:00 PM|Seattle
42|Group G|NZL|BEL|2026-06-26|8:00 PM|Vancouver
43|Group H|ESP|CPV|2026-06-15|12:00 PM|Atlanta
44|Group H|KSA|URU|2026-06-15|6:00 PM|Miami
45|Group H|ESP|KSA|2026-06-21|12:00 PM|Atlanta
46|Group H|URU|CPV|2026-06-21|6:00 PM|Miami
47|Group H|CPV|KSA|2026-06-26|7:00 PM|Houston
48|Group H|URU|ESP|2026-06-26|6:00 PM|Guadalajara
49|Group I|FRA|SEN|2026-06-16|3:00 PM|New York/New Jersey
50|Group I|IRQ|NOR|2026-06-16|6:00 PM|Boston
51|Group I|FRA|IRQ|2026-06-22|5:00 PM|Philadelphia
52|Group I|NOR|SEN|2026-06-22|8:00 PM|New York/New Jersey
53|Group I|NOR|FRA|2026-06-26|3:00 PM|Boston
54|Group I|SEN|IRQ|2026-06-26|3:00 PM|Toronto
55|Group J|ARG|ALG|2026-06-16|8:00 PM|Kansas City
56|Group J|AUT|JOR|2026-06-16|9:00 PM|San Francisco Bay Area
57|Group J|ARG|AUT|2026-06-22|12:00 PM|Dallas
58|Group J|JOR|ALG|2026-06-22|8:00 PM|San Francisco Bay Area
59|Group J|ALG|AUT|2026-06-27|9:00 PM|Kansas City
60|Group J|JOR|ARG|2026-06-27|9:00 PM|Dallas
61|Group K|POR|COD|2026-06-17|12:00 PM|Houston
62|Group K|UZB|COL|2026-06-17|8:00 PM|Mexico City
63|Group K|POR|UZB|2026-06-23|12:00 PM|Houston
64|Group K|COL|COD|2026-06-23|8:00 PM|Guadalajara
65|Group K|COL|POR|2026-06-27|7:30 PM|Miami
66|Group K|COD|UZB|2026-06-27|7:30 PM|Atlanta
67|Group L|ENG|CRO|2026-06-17|3:00 PM|Dallas
68|Group L|GHA|PAN|2026-06-17|7:00 PM|Toronto
69|Group L|ENG|GHA|2026-06-23|4:00 PM|Boston
70|Group L|PAN|CRO|2026-06-23|7:00 PM|Toronto
71|Group L|PAN|ENG|2026-06-27|5:00 PM|New York/New Jersey
72|Group L|CRO|GHA|2026-06-27|5:00 PM|Philadelphia
73|Round of 32|Runner-up Group A|Runner-up Group B|2026-06-28|12:00 PM|Los Angeles
74|Round of 32|Winner Group E|3rd Place (Groups A/B/C/D/F)|2026-06-29|4:30 PM|Boston
75|Round of 32|Winner Group F|Runner-up Group C|2026-06-29|7:00 PM|Monterrey
76|Round of 32|Winner Group C|Runner-up Group F|2026-06-29|12:00 PM|Houston
77|Round of 32|Winner Group I|3rd Place (Groups C/D/F/G/H)|2026-06-30|5:00 PM|New York/New Jersey
78|Round of 32|Runner-up Group E|Runner-up Group I|2026-06-30|12:00 PM|Dallas
79|Round of 32|Winner Group A|3rd Place (Groups C/E/F/H/I)|2026-06-30|7:00 PM|Mexico City
80|Round of 32|Winner Group L|3rd Place (Groups E/H/I/J/K)|2026-07-01|12:00 PM|Atlanta
81|Round of 32|Winner Group D|3rd Place (Groups B/E/F/I/J)|2026-07-01|5:00 PM|San Francisco Bay Area
82|Round of 32|Winner Group G|3rd Place (Groups A/E/H/I/J)|2026-07-01|1:00 PM|Seattle
83|Round of 32|Runner-up Group K|Runner-up Group L|2026-07-02|7:00 PM|Toronto
84|Round of 32|Winner Group H|Runner-up Group J|2026-07-02|12:00 PM|Los Angeles
85|Round of 32|Winner Group B|3rd Place (Groups E/F/G/I/J)|2026-07-02|8:00 PM|Vancouver
86|Round of 32|Winner Group J|Runner-up Group H|2026-07-03|6:00 PM|Miami
87|Round of 32|Winner Group K|3rd Place (Groups D/E/I/J/L)|2026-07-03|8:30 PM|Kansas City
88|Round of 32|Runner-up Group D|Runner-up Group G|2026-07-03|1:00 PM|Dallas
89|Round of 16|Winner Match 74|Winner Match 77|2026-07-04|5:00 PM|Philadelphia
90|Round of 16|Winner Match 73|Winner Match 75|2026-07-04|12:00 PM|Houston
91|Round of 16|Winner Match 76|Winner Match 78|2026-07-05|4:00 PM|New York/New Jersey
92|Round of 16|Winner Match 79|Winner Match 80|2026-07-05|6:00 PM|Mexico City
93|Round of 16|Winner Match 83|Winner Match 84|2026-07-06|2:00 PM|Dallas
94|Round of 16|Winner Match 81|Winner Match 82|2026-07-06|5:00 PM|Seattle
95|Round of 16|Winner Match 86|Winner Match 88|2026-07-07|12:00 PM|Atlanta
96|Round of 16|Winner Match 85|Winner Match 87|2026-07-07|1:00 PM|Vancouver
97|Quarter-final|Winner Match 89|Winner Match 90|2026-07-09|4:00 PM|Boston
98|Quarter-final|Winner Match 93|Winner Match 94|2026-07-10|12:00 PM|Los Angeles
99|Quarter-final|Winner Match 91|Winner Match 92|2026-07-11|5:00 PM|Miami
100|Quarter-final|Winner Match 95|Winner Match 96|2026-07-11|8:00 PM|Kansas City
101|Semi-final|Winner Match 97|Winner Match 98|2026-07-14|2:00 PM|Dallas
102|Semi-final|Winner Match 99|Winner Match 100|2026-07-15|3:00 PM|Atlanta
103|Match for Third Place|Loser Match 101|Loser Match 102|2026-07-18|5:00 PM|Miami
104|Final|Winner Match 101|Winner Match 102|2026-07-19|3:00 PM|New York/New Jersey
`.trim();

const teamZh = {
  MEX: "墨西哥",
  RSA: "南非",
  KOR: "韩国",
  CZE: "捷克共和国",
  CAN: "加拿大",
  BIH: "波斯尼亚和黑塞哥维那",
  USA: "美国",
  PAR: "巴拉圭",
  QAT: "卡塔尔",
  SUI: "瑞士",
  BRA: "巴西",
  MAR: "摩洛哥",
  HAI: "海地",
  SCO: "苏格兰",
  AUS: "澳大利亚",
  TUR: "土耳其",
  GER: "德国",
  CUW: "库拉索",
  CIV: "科特迪瓦",
  ECU: "厄瓜多尔",
  NED: "荷兰",
  JPN: "日本",
  SWE: "瑞典",
  TUN: "突尼斯",
  BEL: "比利时",
  EGY: "埃及",
  IRN: "伊朗",
  NZL: "新西兰",
  ESP: "西班牙",
  CPV: "佛得角",
  KSA: "沙特阿拉伯",
  URU: "乌拉圭",
  FRA: "法国",
  SEN: "塞内加尔",
  IRQ: "伊拉克",
  NOR: "挪威",
  ARG: "阿根廷",
  ALG: "阿尔及利亚",
  AUT: "奥地利",
  JOR: "约旦",
  POR: "葡萄牙",
  COD: "刚果民主共和国",
  UZB: "乌兹别克斯坦",
  COL: "哥伦比亚",
  ENG: "英格兰",
  CRO: "克罗地亚",
  GHA: "加纳",
  PAN: "巴拿马",
};

const teamNick = {
  MEX: "绿白红号角",
  RSA: "彩虹勇士",
  KOR: "太极虎",
  CZE: "波西米亚雄狮",
  CAN: "枫叶军团",
  BIH: "巴尔干龙",
  USA: "星条旗军团",
  PAR: "南美红白军团",
  QAT: "海湾红潮",
  SUI: "阿尔卑斯十字",
  BRA: "桑巴军团",
  MAR: "阿特拉斯雄狮",
  HAI: "加勒比蓝红风暴",
  SCO: "高地军团",
  AUS: "袋鼠军团",
  TUR: "星月军团",
  GER: "日耳曼战车",
  CUW: "加勒比蓝浪",
  CIV: "非洲大象",
  ECU: "安第斯三色",
  NED: "橙衣军团",
  JPN: "蓝武士",
  SWE: "北欧蓝黄",
  TUN: "迦太基雄鹰",
  BEL: "欧洲红魔",
  EGY: "法老之鹰",
  IRN: "波斯勇士",
  NZL: "全白军团",
  ESP: "斗牛士军团",
  CPV: "大西洋蓝鲨",
  KSA: "沙漠绿鹰",
  URU: "天蓝军团",
  FRA: "高卢雄鸡",
  SEN: "特兰加雄狮",
  IRQ: "两河雄狮",
  NOR: "北欧峡湾",
  ARG: "潘帕斯雄鹰",
  ALG: "沙漠之狐",
  AUT: "阿尔卑斯红白",
  JOR: "纳巴泰之星",
  POR: "航海军团",
  COD: "刚果豹影",
  UZB: "中亚蓝狼",
  COL: "咖啡三色",
  ENG: "三狮军团",
  CRO: "格子军团",
  GHA: "黑星军团",
  PAN: "运河红潮",
};

const cityZh = {
  "Mexico City": "墨西哥城",
  Guadalajara: "瓜达拉哈拉",
  Toronto: "多伦多",
  "Los Angeles": "洛杉矶",
  "San Francisco Bay Area": "旧金山湾区",
  "New York/New Jersey": "纽约/新泽西",
  Boston: "波士顿",
  Vancouver: "温哥华",
  "Kansas City": "堪萨斯城",
  Miami: "迈阿密",
  Dallas: "达拉斯",
  Seattle: "西雅图",
  Philadelphia: "费城",
  Monterrey: "蒙特雷",
  Atlanta: "亚特兰大",
  Houston: "休斯敦",
};

const stadiumZh = {
  "Mexico City": "墨西哥城球场（Estadio Azteca）",
  Guadalajara: "瓜达拉哈拉球场（Estadio Akron）",
  Toronto: "多伦多球场（BMO Field）",
  "Los Angeles": "洛杉矶球场（SoFi Stadium）",
  "San Francisco Bay Area": "旧金山湾区球场（Levi's Stadium）",
  "New York/New Jersey": "纽约新泽西球场（MetLife Stadium）",
  Boston: "波士顿球场（Gillette Stadium）",
  Vancouver: "BC Place 温哥华球场",
  "Kansas City": "堪萨斯城球场（Arrowhead Stadium）",
  Miami: "迈阿密球场（Hard Rock Stadium）",
  Dallas: "达拉斯球场（AT&T Stadium）",
  Seattle: "西雅图球场（Lumen Field）",
  Philadelphia: "费城球场（Lincoln Financial Field）",
  Monterrey: "蒙特雷球场（Estadio BBVA）",
  Atlanta: "亚特兰大球场（Mercedes-Benz Stadium）",
  Houston: "休斯敦球场（NRG Stadium）",
};

const cityTimeZone = {
  "Mexico City": "America/Mexico_City",
  Guadalajara: "America/Mexico_City",
  Monterrey: "America/Monterrey",
  Toronto: "America/Toronto",
  "Los Angeles": "America/Los_Angeles",
  "San Francisco Bay Area": "America/Los_Angeles",
  "New York/New Jersey": "America/New_York",
  Boston: "America/New_York",
  Vancouver: "America/Vancouver",
  "Kansas City": "America/Chicago",
  Miami: "America/New_York",
  Dallas: "America/Chicago",
  Seattle: "America/Los_Angeles",
  Philadelphia: "America/New_York",
  Atlanta: "America/New_York",
  Houston: "America/Chicago",
};

const stageZh = {
  "Group A": "小组赛A组",
  "Group B": "小组赛B组",
  "Group C": "小组赛C组",
  "Group D": "小组赛D组",
  "Group E": "小组赛E组",
  "Group F": "小组赛F组",
  "Group G": "小组赛G组",
  "Group H": "小组赛H组",
  "Group I": "小组赛I组",
  "Group J": "小组赛J组",
  "Group K": "小组赛K组",
  "Group L": "小组赛L组",
  "Round of 32": "三十二强赛",
  "Round of 16": "十六强赛",
  "Quarter Final": "四分之一决赛",
  "Quarter-final": "四分之一决赛",
  "Semi Final": "半决赛",
  "Semi-final": "半决赛",
  "Third Place": "三四名决赛",
  "Match for Third Place": "三四名决赛",
  Final: "决赛",
};

function teamName(value) {
  if (teamZh[value]) return teamZh[value];
  return value
    .replace(/^Winner Group ([A-L])$/, "$1组第一")
    .replace(/^Runner-up Group ([A-L])$/, "$1组第二")
    .replace(/^3rd Place \(Groups ([A-L/]+)\)$/, "$1组第三名")
    .replace(/^Winner Match (\d+)$/, "第$1场胜者")
    .replace(/^Loser Match (\d+)$/, "第$1场负者");
}

function parseLocalDateTime(date, time) {
  const [hourText, minuteText] = time.replace(/ AM| PM/, "").split(":");
  const isPm = time.includes("PM");
  let hour = Number(hourText);
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, hour, minute: Number(minuteText) };
}

function partsInZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function zonedLocalToUtc(date, time, timeZone) {
  const local = parseLocalDateTime(date, time);
  const localAsUtc = Date.UTC(local.y, local.m - 1, local.d, local.hour, local.minute);
  let guess = localAsUtc;
  for (let i = 0; i < 4; i += 1) {
    const zoneParts = partsInZone(new Date(guess), timeZone);
    const zoneAsUtc = Date.UTC(zoneParts.y, zoneParts.m - 1, zoneParts.d, zoneParts.hour, zoneParts.minute);
    guess -= zoneAsUtc - localAsUtc;
  }
  return new Date(guess);
}

function formatBeijingTime(date, time, city) {
  const timeZone = cityTimeZone[city];
  if (!timeZone) throw new Error(`Missing timezone for city: ${city}`);
  const beijing = partsInZone(zonedLocalToUtc(date, time, timeZone), "Asia/Shanghai");
  return `${beijing.y}年${beijing.m}月${beijing.d}日 ${String(beijing.hour).padStart(2, "0")}:${String(beijing.minute).padStart(2, "0")}（北京时间）`;
}

function period(time) {
  const [hourText] = time.replace(/ AM| PM/, "").split(":");
  const isPm = time.includes("PM");
  let hour = Number(hourText);
  if (isPm && hour !== 12) hour += 12;
  if (hour < 12) return "晨战";
  if (hour < 15) return "午间战";
  if (hour < 18) return "午后战";
  if (hour < 20) return "黄昏战";
  return "夜战";
}

function theme(match, stage, home, away, date, time, city) {
  const cityName = cityZh[city] || city;
  const when = period(time);
  if (match === 1) return "第1场·墨西哥城开幕之战：东道主号角迎战彩虹勇士";
  if (match === 13) return `第13场·纽约新泽西${when}：桑巴遇见阿特拉斯雄狮`;
  if (stage.startsWith("Group")) {
    return `第${match}场·${cityName}${when}：${teamNick[home] || teamName(home)}对阵${teamNick[away] || teamName(away)}`;
  }
  if (stage === "Round of 32") return `第${match}场·${cityName}三十二强战：淘汰赛门票再洗牌`;
  if (stage === "Round of 16") return `第${match}场·${cityName}十六强战：八强席位争夺`;
  if (stage === "Quarter Final" || stage === "Quarter-final") return `第${match}场·${cityName}八强战：通往四强的硬仗`;
  if (stage === "Semi Final" || stage === "Semi-final") return `第${match}场·${cityName}半决赛：决赛门票之夜`;
  if (stage === "Third Place" || stage === "Match for Third Place") return `第${match}场·迈阿密荣誉之战：季军归属`;
  if (stage === "Final") return `第${match}场·纽约新泽西决赛之夜：冠军加冕`;
  return `第${match}场·${cityName}${when}：关键对决`;
}

const rows = scheduleText.split("\n").map((line) => {
  const [match, stage, home, away, date, time, city] = line.split("|");
  const n = Number(match);
  return {
    序号: n,
    主队: teamName(home),
    客队: teamName(away),
    比赛主题: theme(n, stage, home, away, date, time, city),
    比赛时间: formatBeijingTime(date, time, city),
    比赛城市: cityZh[city] || city,
    比赛场馆: stadiumZh[city] || city,
    阶段: stageZh[stage] || stage,
    数据口径: "比赛时间已换算为北京时间；淘汰赛球队按官方赛程占位写法保留。",
  };
}).sort((a, b) => a.序号 - b.序号);

if (rows.length !== 104) {
  throw new Error(`Expected 104 matches, got ${rows.length}`);
}

const headers = ["序号", "主队", "客队", "比赛主题", "比赛时间", "比赛城市", "比赛场馆"];
const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csv = [
  headers.join(","),
  ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");
await fs.writeFile(CSV_PATH, `\uFEFF${csv}\n`, "utf8");

const md = [
  "| " + headers.join(" | ") + " |",
  "| " + headers.map(() => "---").join(" | ") + " |",
  ...rows.map((row) => "| " + headers.map((header) => String(row[header]).replaceAll("|", "/")).join(" | ") + " |"),
].join("\n");
await fs.writeFile(MD_PATH, md + "\n", "utf8");

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("104场赛程");
const data = [headers, ...rows.map((row) => headers.map((header) => row[header]))];
sheet.getRangeByIndexes(0, 0, data.length, headers.length).values = data;
sheet.freezePanes.freezeRows(1);
sheet.showGridLines = false;
const used = sheet.getRangeByIndexes(0, 0, data.length, headers.length);
used.format.wrapText = true;
used.format.font = { name: "Microsoft YaHei", size: 10, color: "#1E2926" };
sheet.getRange("A1:G1").format.fill = { color: "#1F4D78" };
sheet.getRange("A1:G1").format.font = { name: "Microsoft YaHei", size: 11, color: "#FFFFFF", bold: true };
sheet.getRange("A:A").format.columnWidthPx = 56;
sheet.getRange("B:C").format.columnWidthPx = 150;
sheet.getRange("D:D").format.columnWidthPx = 390;
sheet.getRange("E:E").format.columnWidthPx = 185;
sheet.getRange("F:F").format.columnWidthPx = 120;
sheet.getRange("G:G").format.columnWidthPx = 250;

const notes = workbook.worksheets.add("说明");
notes.getRange("A1:B6").values = [
  ["项目", "说明"],
  ["数据来源", "FIFA 2026赛程页；whatisthetime.now 逐场赛程页"],
  ["时间口径", "比赛时间已按比赛城市时区换算为北京时间"],
  ["淘汰赛", "尚未确定球队，按官方占位写法写为某组第一/第二/第三或某场胜者/负者"],
  ["比赛主题", "由比赛双方、场次、城市、时间段和阶段生成，可用于后续海报批量文案"],
  ["生成日期", "2026年5月11日"],
];
notes.getRange("A1:B1").format.fill = { color: "#1F4D78" };
notes.getRange("A1:B1").format.font = { name: "Microsoft YaHei", size: 11, color: "#FFFFFF", bold: true };
notes.getRange("A:B").format.wrapText = true;
notes.getRange("A:A").format.columnWidthPx = 140;
notes.getRange("B:B").format.columnWidthPx = 620;

const preview = await workbook.inspect({
  kind: "table",
  range: "104场赛程!A1:G8",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 7,
});
console.log(preview.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(XLSX_PATH);

console.log(JSON.stringify({ rows: rows.length, csv: CSV_PATH, markdown: MD_PATH, xlsx: XLSX_PATH }, null, 2));
