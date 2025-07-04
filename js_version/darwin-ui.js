/**
 * Darwin World No.1 - UI界面代码
 * 处理用户界面和交互
 */

// 保存历史记录
const roundHistory = ['none'];
let currentStep = 0;
let autoPlayInterval = null;
const PLAY_SPEED = 200; // 自动播放速度 (毫秒)

// DOM元素引用
const worldGrid = document.getElementById('world-grid');
const infoContent = document.getElementById('info-content');
const roundCounter = document.getElementById('round-counter');
const livesCounter = document.getElementById('lives-counter');
const profileBox = document.getElementById('profile-box');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const autoBtn = document.getElementById('auto-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');

// 条件卡片和位置数据
let conditionCards = {};
let positions = {};

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * 初始化地图
 */
function initializeMap() {
    worldGrid.innerHTML = '';
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const height = DarwinWorld.map[y][x];
            const alpha = Math.abs(height);
            
            // 根据高度设置颜色 (负高度是水，正高度是陆地)
            cell.style.backgroundColor = height < 0 
                ? `rgba(35, 170, 242, ${alpha})` 
                : `rgba(51, 196, 129, ${alpha})`;
                
            worldGrid.appendChild(cell);
        }
    }
}

/**
 * 初始化事件监听
 */
function initializeEventListeners() {
    // 开始按钮
    startBtn.addEventListener('click', () => {
        DarwinWorld.initWorld();
        clearLives();
        roundHistory.length = 1; // 只保留'none'
        currentStep = 0;
        updateCounters();
        nextRound();
    });
    
    // 下一轮按钮
    nextBtn.addEventListener('click', () => {
        nextRound();
    });
    
    // 自动播放按钮
    autoBtn.addEventListener('click', toggleAutoPlay);
    
    // 保存记录按钮
    saveBtn.addEventListener('click', saveRecordToFile);
    
    // 加载记录按钮
    const fileInput = document.getElementById('file-input');
    loadBtn.addEventListener('click', () => {
        fileInput.click(); // 触发文件选择对话框
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', loadRecordFromFile);
    
    // 鼠标移动监听，用于移动配置文件框
    document.addEventListener('mousemove', (e) => {
        if (profileBox.style.display === 'block') {
            profileBox.style.left = `${e.clientX + 15}px`;
            profileBox.style.top = `${e.clientY + 15}px`;
        }
    });
}

/**
 * 进入下一轮
 */
function nextRound() {
    const result = DarwinWorld.runRound();
    
    if (result === "ERROR_OVERLOAD") {
        stopAutoPlay();
        alert("Error!\nToo many lives that over loaded the bio-sphere.\nDarwin-World Closed.");
        return;
    }
    
    roundHistory.push(result);
    currentStep = roundHistory.length - 1;
    
    displayRound(currentStep);
    updateCounters();
}

/**
 * 显示指定轮次的信息
 * @param {number} step - 轮次索引
 */
function displayRound(step) {
    if (step < 1 || step >= roundHistory.length) return;
    
    // clearLives();
    
    conditionCards = {};
    positions = {};
    let inConditionCard = false;
    let movement = '';
    const names = [];

    const stepScript = roundHistory[step].split('\n');
    for (const line of stepScript) {
        if (!line) continue;
        
        var name = inConditionCard;
        
        // 根据行的第一个字符判断行的类型
        switch (line[1]) {
            case 'M': // 移动
            case 'O': // 氧气相关
                movement += line + '\n';
                break;
                
            case '-': // 条件卡片内容
                conditionCards[name] += line + '\n';
                break;
                
            case '·': // 位置信息
                conditionCards[name] += line + '\n';
                if (line[3] === 'P') { // 位置行
                    const match = line.match(/\(\s*(\d+),\s*(\d+)\s*\)/);
                    if (match) {
                        const [_, x, y] = match;
                        positions[name] = [parseInt(x), parseInt(y)];
                        gotoPos(name, positions[name]);
                    }
                }
                break;
                
            case '*': // 其他条件信息
                conditionCards[inConditionCard] += line + '\n';
                break;
                
            case '=': // 条件卡开始/结束
                inConditionCard = !inConditionCard;
                if (inConditionCard) {
                    var idMatch = line.match(/#(\d+)/);
                    if (idMatch) {
                        name = `#${idMatch[1]}`;
                        conditionCards[name] = '';
                        inConditionCard = name;
                        names.push(name);
                    }
                }
                break;
                
            default:
                movement += line + '\n';
        }
    }
    
    // 更新生物显示
    postProcessLives(names);
    
    // 更新信息面板
    infoContent.innerText = movement;
    highlightText(infoContent);
}

/**
 * 更新生物体的视觉显示
 * @param {Array} names - 生物ID列表
 */
function postProcessLives(names) {
    // 更新健康指数显示
    names.forEach(name => {
        const profile = conditionCards[name];
        const healthMatch = profile.match(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/);
        const healthIndex = healthMatch ? Math.max(0, parseFloat(healthMatch[1])) : 1;
        
        const lifeElem = document.getElementById(`life_${name.replace('#', '')}`);
        if (lifeElem) {
            lifeElem.style.backgroundColor = `rgba(0,0,0,${healthIndex})`;
        }
    });
    
    // 隐藏已死亡生物
    for (let i = 0; i < 1000; i++) {
        const name = `#${i}`;
        const lifeElem = document.getElementById(`life_${i}`);
        if (names.indexOf(name) === -1 && lifeElem) {
            lifeElem.style.display = "none";
        }
    }
}

/**
 * 清除所有生物体
 */
function clearLives() {
    const lives = document.querySelectorAll('.life');
    lives.forEach(life => life.remove());
}

/**
 * 将生物体放置到指定位置
 * @param {string} name - 生物ID
 * @param {Array} pos - 位置 [x, y]
 */
function gotoPos(name, pos) {
    const [x, y] = pos;
    
    // 检查生物是否已存在
    let lifeElem = document.getElementById(`life_${name.replace('#', '')}`);
    
    if (lifeElem) {
        // 移动到新位置
        lifeElem.style.left = `${x * 42 + $("#world-grid").offsetLeft + 10}px`;
        lifeElem.style.top = `${y * 42 + $("#world-grid").offsetTop + 10}px`;
    } else {
        // 创建新生物元素
        lifeElem = document.createElement('div');
        lifeElem.className = 'life';
        lifeElem.textContent = name;
        lifeElem.id = `life_${name.replace('#', '')}`;
        lifeElem.style.left = `${x * 42 + $("#world-grid").offsetLeft + 10}px`;
        lifeElem.style.top = `${y * 42 + $("#world-grid").offsetTop + 10}px`;

        // 添加鼠标悬停事件
        lifeElem.addEventListener('mouseover', () => {
            showProfile(name);
        });
        
        lifeElem.addEventListener('mouseleave', () => {
            hideProfile();
        });
        
        worldGrid.appendChild(lifeElem);
    }
}

/**
 * 显示生物体详细信息
 * @param {string} name - 生物ID
 */
function showProfile(name) {
    profileBox.style.display = 'block';
    const profile = conditionCards[name];
    
    if (!profile) return;
    
    profileBox.innerHTML = `${name}\n${profile}`;
    highlightText(profileBox);
    
    // 提取关键信息
    const oxygenMatch = profile.match(/Oxygen:\s([0-9]\.{0,1}[0-9].+?)/);
    const healthMatch = profile.match(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/);
    const heightMatch = profile.match(/Height:\s([-]{0,1}[0-9][\.]{0,1}[0-9]{0,1})/);
    const genderMatch = profile.match(/Gender:\s(true|false)/);
    
    if (oxygenMatch) {
        const oxygen = Math.max(0, parseFloat(oxygenMatch[1]));
        profileBox.innerHTML = profileBox.innerHTML.replace(
            /Oxygen: <span class="purple">([0-9][\.]{0,1}[0-9]{0,100})<\/span><br>/g, 
            `Oxygen: <span class="purple">$1</span><div class='progress-bar' style='border-color: #277add;background: linear-gradient(90deg, #277add ${oxygen*100}%, black 1%);'></div>`
        );
    }
    
    if (healthMatch) {
        const health = Math.max(0, parseFloat(healthMatch[1]));
        profileBox.innerHTML = profileBox.innerHTML.replace(
            /Health_Index: <span class="purple">([0-9][\.]{0,1}[0-9]{0,100})<\/span><br>/g, 
            `Health_Index: <span class="purple">$1</span><div class='progress-bar' style='border-color: red;background: linear-gradient(90deg, red ${health*100}%, black 1%);'></div>`
        );
    }
    
    if (heightMatch) {
        const height = parseFloat(heightMatch[1]);
        profileBox.innerHTML = profileBox.innerHTML.replace(
            /Height: <span class="purple">([-]{0,1}[0-9][\.]{0,1}[0-9]{0,1})<\/span>/g, 
            `Height: <span class="purple">$1</span><div class='progress-bar vertical' style='border-color: ${height<0?'skyblue':'green'};background: linear-gradient(${height<0?'180deg':'0deg'}, ${height<0?'skyblue':'green'} ${Math.abs(height)*100}%, black 1%);'></div>`
        );
    }
    
    if (genderMatch) {
        const gender = genderMatch[1];
        profileBox.innerHTML = profileBox.innerHTML.replace(
            /Gender: (true|false)/g, 
            `Gender: <b>${gender === 'true' ? '<span class="blue">Male ♂</span>' : '<span class="pink">Female ♀</span>'}</b>`
        );
    }
}

/**
 * 隐藏配置文件框
 */
function hideProfile() {
    profileBox.style.display = 'none';
}

/**
 * 高亮显示文本
 * @param {HTMLElement} element - 文本元素
 */
function highlightText(element) {
    let html = element.innerHTML;

    // 添加基本格式
    html = html.replace(/\n/g, '<br>');
    
    // 高亮生物ID
    html = html.replace(/(#\d{1,3})/g, '<span class="orange">$1</span>');
    
    // 高亮位置
    html = html.replace(/(Pos\(\d+, \d+\))/g, '<span class="blue">$1</span>');
    html = html.replace(/(\(\d+, \d+\))/g, '<span class="blue">$1</span>');
    
    // 高亮数字
    html = html.replace(/(-?[0-9]\.?[0-9]*)([\s\]\),<br>])/g, '<span class="purple">$1</span>$2');

    element.innerHTML = html;
}

/**
 * 切换自动播放
 */
function toggleAutoPlay() {
    if (autoPlayInterval) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

/**
 * 开始自动播放
 */
function startAutoPlay() {
    autoBtn.textContent = 'Stop Auto';
    autoPlayInterval = setInterval(() => {
        nextRound();
    }, PLAY_SPEED);
}

/**
 * 停止自动播放
 */
function stopAutoPlay() {
    autoBtn.textContent = 'Auto Play';
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
}

/**
 * 更新计数器
 */
function updateCounters() {
    roundCounter.textContent = DarwinWorld.currentRound() - 1;
    livesCounter.textContent = DarwinWorld.totalLives();
}

/**
 * 保存记录到文件
 */
function saveRecordToFile() {
    // 确保有记录可保存
    if (roundHistory.length <= 1) {
        alert('没有可保存的记录！请先开始模拟。');
        return;
    }

    // 准备记录内容 - 按照Python版本格式
    const seed = Date.now(); // 使用当前时间戳作为种子
    let content = "Start Darwin-World No.1\n";
    content += "Darwin-World No.1 is a simulation of the evolution of life.\n";
    content += "It's a world that only has 10x10 cells, and 20 lives.\n";
    content += `Seed: ${seed}\n`;
    content += "==================== \n\n\n\n";
    
    // 添加每一轮的记录，使用与Python版本相同的格式
    for (let i = 1; i < roundHistory.length; i++) {
        content += `&&&&&&&&&& Round ${i} Start &&&&&&&&&&\n`;
        content += roundHistory[i];
        content += `&&&&&&&&&& Round ${i} End &&&&&&&&&&\n\n\n`;
    }
    
    // 创建并下载文件
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `record.txt`;  // 使用与Python版本相同的文件名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('记录已保存到record.txt！');
}

/**
 * 从文件加载记录
 * @param {Event} event - 文件选择事件
 */
function loadRecordFromFile(event) {
    // 获取选择的文件
    const file = event.target.files[0];
    if (!file) return;
    
    // 确认是文本文件
    if (file.type && !file.type.startsWith('text/') && file.name.toLowerCase().indexOf('.txt') === -1) {
        alert('请选择文本文件 (.txt)');
        return;
    }
    
    // 停止自动播放
    if (autoPlayInterval) {
        stopAutoPlay();
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        parseRecordFile(content);
    };
    reader.onerror = () => {
        alert('读取文件时出错，请重试。');
    };
    reader.readAsText(file);
    
    // 重置文件输入，这样同一文件可以重复选择
    event.target.value = '';
}

/**
 * 解析记录文件内容
 * @param {string} content - 文件内容
 */
function parseRecordFile(content) {
    try {
        // 重置历史记录
        roundHistory.length = 1; // 保留'none'
        
        // 使用正则表达式分割轮次
        const rounds = content.split(/&&&&&&&&&& Round \d+ Start &&&&&&&&&&/);
        
        if (rounds.length <= 1) {
            alert('文件格式无效或不包含轮次记录。');
            return;
        }
        
        // 跳过第一部分（文件头）
        for (let i = 1; i < rounds.length; i++) {
            // 清理轮次结束标记
            let roundContent = rounds[i].split(/&&&&&&&&&& Round \d+ End &&&&&&&&&&/)[0];
            roundHistory.push(roundContent);
        }
        
        // 初始化世界
        DarwinWorld.initWorld();
        clearLives();
        
        // 显示最后一轮
        currentStep = roundHistory.length - 1;
        displayRound(currentStep);
        
        // 更新轮次计数
        roundCounter.textContent = currentStep;
        
        alert(`成功加载了 ${roundHistory.length - 1} 轮记录！`);
    } catch (error) {
        console.error('解析记录文件时出错:', error);
        alert('解析记录文件时出错，请确保文件格式正确。');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeEventListeners();
    
    // 设置初始值
    updateCounters();
});
