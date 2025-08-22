/**
 * Darwin World No.1 - JavaScript版本
 * 一个模拟生物进化的简单系统
 */

// 随机种子设置
let seed = Date.now();
// 使用种子的简单随机函数
let rdseed = seed;
function seededRandom() {
  rdseed = (rdseed * 9301 + 49297) % 233280;
  return rdseed / 233280;
}

// 全局变量
let ID = 0;
let lives = [];
let roundID = 1;
let records = '';

// 地图数据
const map_lst = [
  [0.5, 0.0, 0.3, 0.3, 0.1, 0.9, 0.3, 0.9, 0.3, 0.4],
  [0.0, 0.4, 0.5, 0.1, 0.6, 0.3, 0.4, 0.1, 0.4, 0.4],
  [0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.3, 0.2, 0.0, 0.0],
  [0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1],
  [-0.3, -0.3, -0.2, -0.2, -0.1, -0.2, -0.1, 0.0, -0.2, -0.2],
  [-0.1, -0.3, -0.2, -0.3, -0.4, -0.4, -0.1, 0.0, -0.1, -0.2],
  [-0.1, -0.6, -0.3, -0.7, -0.5, 0.0, -0.3, -0.3, -0.5, -0.4],
  [-1.0, -0.2, -0.6, -0.3, -0.5, -0.8, -0.3, -0.6, -0.2, -0.5],
  [-0.6, -0.9, -0.7, -0.7, -0.9, 0.0, -0.6, -0.2, -0.5, -0.2],
  [-0.5, -0.3, -0.9, -0.9, -0.8, -0.9, -0.1, -0.9, -0.5, -0.2]
];

// 创建二维数组作为土地
const land = Array(10).fill().map(() => Array(10).fill().map(() => []));

/**
 * 根据高度获取氧气量
 * @param {number} height - 地形高度
 * @returns {number} - 可用氧气量
 */
function getOxygen(height) {
  if (height >= 0) { // 在陆地上
    return 1 - height;
  } else { // 在水下
    return -1 - height;
  }
}

/**
 * 获取指定位置的高度
 * @param {Array} pos - 位置坐标 [x, y]
 * @returns {number} - 高度值
 */
function getHeight(pos) {
  return map_lst[pos[1]][pos[0]];
}

/**
 * DNA类，表示生物的基因组
 */
class DNA {
  /**
   * 创建DNA
   * @param {Array} dna - DNA数组 
   */
  constructor(dna) {
    /**
     * DNA:
     * - DNA[0]: 游泳能力
     * - DNA[1]: 陆地移动能力
     * - DNA[2]: 外壳能力
     * - DNA[3]: 氧气能力（如果为负，则为水下氧气能力）
     * - DNA[4]: 性别（false=雌性 / true=雄性）
     */
    this.dna = dna;
    this.oxygenRequirement = (dna.slice(0, 3).reduce((a, b) => a + b, 0) / 3) * 0.5 + Math.abs(dna[3]) * 0.05;
  }

  /**
   * 创建随机DNA
   * @returns {DNA} - 随机DNA实例
   */
  static random() {
    return new DNA([
      seededRandom(), 
      seededRandom(), 
      seededRandom(), 
      seededRandom() * 2 - 1, 
      seededRandom() < 0.5
    ]);
  }

  /**
   * 获取DNA的字符串表示
   * @returns {string} - DNA的字符串表示
   */
  toString() {
    return JSON.stringify(this.dna);
  }

  /**
   * 获取特定位置的DNA值
   * @param {number} index - DNA索引
   * @returns {number|boolean} - DNA值
   */
  get(index) {
    return this.dna[index];
  }

  /**
   * 繁殖DNA（两个生物的DNA结合）
   * @param {Array} mum - 母亲的DNA数组
   * @param {Array} dad - 父亲的DNA数组
   * @returns {Array} - [子代DNA数组, 变异信息]
   */
  static breed(mum, dad) {
    const babyDna = [];

    // 遗传
    for (let i = 0; i < mum.length; i++) {
      babyDna.push((mum[i] + dad[i]) / 2);
    }

    // 变异
    const vIndex = Math.floor(seededRandom() * babyDna.length);
    const vDelta = seededRandom() * 0.1 * (seededRandom() < 0.5 ? 1 : -1);
    babyDna[vIndex] += vDelta;
    
    // 限制值范围
    const limited = (vIndex === 3) ? [-1, 1] : [0, 1];
    babyDna[vIndex] = Math.max(limited[0], Math.min(limited[1], babyDna[vIndex]));

    // 随机性别
    babyDna[4] = seededRandom() < 0.5;

    return [babyDna, [vIndex, vDelta]];
  }
}

/**
 * 生命类，表示一个生物体
 */
class Life {
  /**
   * 创建生命
   * @param {DNA} dna - 生物的DNA
   */
  constructor(dna) {
    ID++;
    this.dna = dna;
    this.oxygen = 1;
    this.id = ID;
    this.pos = [Math.floor(seededRandom() * 10), Math.floor(seededRandom() * 10)];
    land[this.pos[1]][this.pos[0]].push(this);
  }

  /**
   * 呼吸动作
   * @param {number} height - 当前位置的高度
   */
  actionBreathe(height) {
    // 使用氧气
    const oxy2 = this.dna.oxygenRequirement;
    this.oxygen -= oxy2;

    // 呼吸氧气
    const oxy1 = this.dna.get(3) * getOxygen(height);
    this.oxygen = Math.min(1, this.oxygen + oxy1);

    print(`  O #${this.id} Breathe ${oxy1} Oxygen, and Use ${oxy2} Oxygen, ${oxy1 - oxy2} in total.`);

    // 检查是否死亡
    if (this.oxygen <= 0) {
      this.actionDead('No Oxygen');
    }
  }

  /**
   * 移动动作
   */
  actionMove() {
    const height = getHeight(this.pos);
    const currMovingAbility = (height < 0) ? this.dna.get(0) : this.dna.get(1);
    const moveOrNot = (seededRandom() <= currMovingAbility);
    
    if (moveOrNot) {
      // 从原位置移除
      const index = land[this.pos[1]][this.pos[0]].indexOf(this);
      land[this.pos[1]][this.pos[0]].splice(index, 1);
      
      // 计算新位置
      const x = this.pos[0] + Math.floor(seededRandom() * 3) - 1; // -1, 0, 1
      const y = this.pos[1] + Math.floor(seededRandom() * 3) - 1; // -1, 0, 1
      
      // 确保在地图范围内 (0-9)
      this.pos = [
        Math.min(9, Math.max(0, x)), 
        Math.min(9, Math.max(0, y))
      ];
      
      this.oxygen -= 0.05;
      print(`  M #${this.id} Moved to Pos(${this.pos[0]}, ${this.pos[1]}), used 0.05 Oxygen.`);
      
      // 添加到新位置
      land[this.pos[1]][this.pos[0]].push(this);
    } else {
      print(`  M #${this.id} Didn't move at all.`);
    }
  }

  /**
   * 死亡动作
   * @param {string} reason - 死亡原因
   */
  actionDead(reason = 'Unknown Reason') {
    print(`@ D #${this.id} Dead because of '${reason}' at Pos(${this.pos[0]}, ${this.pos[1]}).`);
    
    // 从地图和生命列表中移除
    const index = land[this.pos[1]][this.pos[0]].indexOf(this);
    if (index !== -1) {
      land[this.pos[1]][this.pos[0]].splice(index, 1);
    }
    
    const lifeIndex = lives.indexOf(this);
    if (lifeIndex !== -1) {
      lives.splice(lifeIndex, 1);
    }
  }

  /**
   * 生命周期移动
   */
  move() {
    this.actionMove();
    this.actionBreathe(getHeight(this.pos));
  }

  /**
   * 显示生命状态
   */
  conditions() {
    print(`========== Self Condition of #${this.id} ==========`);
    print(` - DNA: ${this.dna.toString()}`);
    print(` - Gender: ${this.dna.get(4)}`);
    print(` - Oxygen Requirement: ${this.dna.oxygenRequirement}`);
    print(` · Position: (${this.pos[0]}, ${this.pos[1]})`);
    print(` · Height: ${getHeight(this.pos)}`);
    print(` * Oxygen: ${this.oxygen}`);
    print(` * Health_Index: ${this.healthIndex()}`);
    print(`========== Self Condition ended ==========`);
  }

  /**
   * 交配行为
   */
  mate() {
    if (this.dna.get(4)) { // 如果是雄性
      const currentLand = land[this.pos[1]][this.pos[0]];
      if (currentLand.length >= 2) { // 如果附近有其他生物
        if (seededRandom() < 0.3) { // 不想交配
          return;
        }

        // 寻找雌性
        const girlfriends = currentLand.filter(life => !life.dna.get(4));
        if (girlfriends.length === 0) return; // 如果没有雌性

        const wife = girlfriends[Math.floor(seededRandom() * girlfriends.length)];
        wife.breed(this.dna.dna, this.id);
        this.oxygen -= 0.1;
      }
    }
  }

  /**
   * 繁殖后代
   * @param {Array} dad - 父亲的DNA数组
   * @param {number} dadId - 父亲的ID
   */
  breed(dad, dadId) {
    const [babyDna, variation] = DNA.breed(this.dna.dna, dad);

    // 生成新生命
    lives.push(new Life(new DNA(babyDna)));
    
    print(`  X #${this.id} and #${dadId} have mated. They've got a baby #${lives[lives.length-1].id}. #${lives[lives.length-1].id} variate at DNA[${variation[0]}] for ${variation[1]}`);

    this.oxygen -= 0.1;
  }

  /**
   * 健康指数
   * @returns {number} - 健康指数
   */
  healthIndex() {
    return this.oxygen;
  }
}

/**
 * 打印到记录
 * @param {...string} args - 打印内容
 */
function print(...args) {
  records += args.join(' ') + '\n';
}

/**
 * 初始化世界
 */
function initWorld() {
  ID = 0;
  lives = [];
  roundID = 1;
  records = '';
  seed = Date.now();
  print(`SEED: ${seed}`);

  // 清空土地
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      land[y][x] = [];
    }
  }
  
  // 创建初始生命
  for (let i = 0; i < 20; i++) {
    lives.push(new Life(DNA.random()));
  }
}

/**
 * 执行一轮
 * @returns {string} - 本轮记录
 */
function runRound() {
  records = '';
  print(`\n\n\n`);
  print(`&&&&&&&&&& Round ${roundID} Start &&&&&&&&&&`);
  
  // 复制一份生命列表，因为在迭代过程中列表可能会改变
  const livesCopy = [...lives];
  for (const life of livesCopy) {
    if (lives.includes(life)) { // 确保生命仍然存活
      life.move();
      life.conditions();
      life.mate();
      print();
    }
  }
  
  print(`${lives.length} Lives Remaining.`);
  print(`&&&&&&&&&& Round ${roundID} End &&&&&&&&&&`);
  roundID++;
  print('\n\n');
  
  // 检查生命数量是否过多
  if (lives.length >= 30) {
    print("!!!!!!!!!!", "Error", "!!!!!!!!!!");
    print("Too many lives that over loaded the bio-sphere.");
    print("Darwin-World Closed.");
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    return "ERROR_OVERLOAD";
  }
  
  return records;
}

// 导出对象和函数
window.DarwinWorld = {
  map: map_lst,
  lives: lives,
  initWorld: initWorld,
  runRound: runRound,
  getHeight: getHeight,
  currentRound: () => roundID,
  totalLives: () => lives.length
};
