// Supabaseに接続する
const supabaseUrl = 'https://pajzsgbnoqdinvfmvlog.supabase.co'
const supabaseKey = 'sb_publishable_oP9HcAQrGbVNS7dHN4G8UQ_0r5gUTzD'
const client = supabase.createClient(supabaseUrl, supabaseKey)
// --- ここから下はそのままでOK ---
// --- 以下、プログラム本体 ---

let isLoggedIn = false;
let CONFIG = {};

// ★全角→半角変換ロジック
function normalizeNum(str) {
    if (!str) return "";
    return str.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// ★HTMLから呼び出される自動変換関数
window.autoNormalize = function(input) {
    input.value = normalizeNum(input.value);
}

function showToast(message, isError = false) {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: isError ? '#e74c3c' : '#2ecc71', color: 'white',
        padding: '12px 24px', borderRadius: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: '10000', fontSize: '14px', fontWeight: 'bold', transition: 'opacity 0.5s', opacity: '0'
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const msg = document.getElementById('confirm-msg');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');

        msg.innerText = message;
        modal.style.display = 'flex';

        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };
        const cleanup = () => {
            modal.style.display = 'none';
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
        };

        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    });
}

// 1. 設定読み込み
async function loadConfig() {
    try {
        const { data, error } = await client.from('config').select('*').single();
        if (error) throw error;
        CONFIG = data;
        
        if (CONFIG.title) {
            document.getElementById('app-title').innerText = CONFIG.title;
            const r = CONFIG.rule_type;
            const l = CONFIG.limit_count;
            let text = (r === "長寸") ? `ルール: ${r} / リミット: ${l}匹` : `ルール: ${r} (総力戦)`;
            document.getElementById('rule-info').innerText = text;

            document.getElementById('conf-title').value = CONFIG.title;
            document.getElementById('conf-rule').value = CONFIG.rule_type;
            document.getElementById('conf-limit').value = CONFIG.limit_count;
            document.getElementById('conf-sort1').value = CONFIG.sort1;
            document.getElementById('conf-sort2').value = CONFIG.sort2;
            document.getElementById('conf-sort3').value = CONFIG.sort3;
            toggleLimitField();
        }
    } catch(e) { console.error(e); }
}

// 2. ランキング計算
window.loadRanking = async function() {
    const list = document.getElementById('ranking-list');
    const big = document.getElementById('big-fish-list');
    const small = document.getElementById('small-fish-list');
    list.innerHTML = "<p style='text-align:center;'>読み込み中...</p>"; 
    if(big) big.innerHTML = "..."; if(small) small.innerHTML = "...";

    try {
        const { data: players } = await client.from('players').select('*');
        const { data: catches } = await client.from('catches').select('*');
        if (!players || !catches) return;

        let rankingList = [];
        let allFishList = [];

        players.forEach(p => {
            const myCatches = catches.filter(c => c.zecken === p.zecken);
            myCatches.forEach(f => {
                allFishList.push({ zecken: p.zecken, name: p.name, club: p.club, length: f.length, weight: f.weight });
            });
            myCatches.sort((a, b) => b.length - a.length);

            let targetFish = (CONFIG.rule_type === '長寸') ? myCatches.slice(0, CONFIG.limit_count) : myCatches;

            let totalLen = 0, totalWeight = 0, maxLen = 0, maxWeight = 0;
            targetFish.forEach(f => {
                totalLen += f.length; totalWeight += f.weight;
                if(f.length > maxLen) maxLen = f.length;
                if(f.weight > maxWeight) maxWeight = f.weight;
            });
            totalLen = Math.round(totalLen * 10) / 10;

            let displayScore = totalLen + "cm";
            if (CONFIG.rule_type === '重量') displayScore = totalWeight + "g";
            if (CONFIG.rule_type === '枚数') displayScore = myCatches.length + "枚";

            rankingList.push({
                zecken: p.zecken, name: p.name, club: p.club,
                totalLen, maxLen, totalWeight, maxWeight, count: myCatches.length,
                displayScore
            });
        });

        const getSortValue = (item, type) => {
            if (type === "合計長寸") return item.totalLen;
            if (type === "最大長寸") return item.maxLen;
            if (type === "合計重量") return item.totalWeight;
            if (type === "最大重量") return item.maxWeight;
            if (type === "枚数") return item.count;
            return 0;
        };

        rankingList.sort((a, b) => {
            let vA = getSortValue(a, CONFIG.sort1), vB = getSortValue(b, CONFIG.sort1);
            if (vB !== vA) return vB - vA;
            vA = getSortValue(a, CONFIG.sort2); vB = getSortValue(b, CONFIG.sort2);
            if (vB !== vA) return vB - vA;
            vA = getSortValue(a, CONFIG.sort3); vB = getSortValue(b, CONFIG.sort3);
            return vB - vA;
        });

        rankingList.forEach((item, index) => item.rank = index + 1);

        list.innerHTML = "";
        let hasData = false;
        
        rankingList.forEach((item, index) => {
            if (item.count === 0) return;
            hasData = true;
            
            let rankClass = "";
            let rankIcon = item.rank;
            if (item.rank === 1) { rankClass = "rank-1"; rankIcon = "👑 1"; }
            else if (item.rank === 2) { rankClass = "rank-2"; rankIcon = "🥈 2"; }
            else if (item.rank === 3) { rankClass = "rank-3"; rankIcon = "🥉 3"; }

            const delay = index * 0.1; 
            const html = `
                <div class="card ${rankClass}" style="animation-delay: ${delay}s">
                    <div class="rank">${rankIcon}</div>
                    <div class="info"><div class="name">${item.name}</div><div class="club">${item.club}</div></div>
                    <div class="score"><div class="total">${item.displayScore}</div><div class="detail">最大:${item.maxLen}cm / ${item.count}枚</div></div>
                </div>`;
            list.innerHTML += html;
        });

        if (!hasData) list.innerHTML = "<p style='text-align:center; padding:20px; color:#888;'>まだ釣果はありません</p>";

        const bigFish = [...allFishList].sort((a, b) => b.length - a.length).slice(0, 3);
        const smallFish = [...allFishList].filter(f => f.length > 0).sort((a, b) => a.length - b.length).slice(0, 3);
        
        const renderS = (l, c) => {
            if(!c) return;
            if(!l || l.length==0) { c.innerHTML="<span style='color:#666'>該当なし</span>"; return; }
            let h=""; l.forEach((f,i)=>{ 
                const icon = (i===0) ? "🥇" : (i===1) ? "🥈" : "🥉";
                h+=`<div class="award-row"><span>${icon} <b style="color:var(--gold)">${f.length}cm</b></span><span>${f.name}</span></div>`; 
            });
            c.innerHTML=h;
        };
        renderS(bigFish, big); renderS(smallFish, small);

        const now = new Date();
        const timeStr = now.toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const timeText = `(更新: ${timeStr})`;
        let timeSpan = document.getElementById('last-update-time');
        if (timeSpan) timeSpan.innerText = timeText;
        else document.getElementById('rule-info').innerHTML += ` <span id="last-update-time" style="margin-left:10px; font-weight:bold; color:var(--gold);">${timeText}</span>`;

    } catch(e) { console.error(e); }
}

// 3. 釣果登録
window.sendData = async function() {
    const i = document.getElementById('zekken-input').value; 
    const l = document.getElementById('length').value; // 既に半角化済み
    const w = document.getElementById('weight').value || 0; // 既に半角化済み

    if(!i || !l) { showToast("入力不足です", true); return; }
    const m = i.match(/^(\d+):/);
    if (!m) { showToast("リストから選択してください", true); return; }
    
    if(!await showConfirm(`登録しますか？\n\n選手: ${i}\n長寸: ${l}cm\n重量: ${w}g`)) return;
    
    const btn = document.querySelector('.submit-btn'); btn.disabled=true; btn.innerText="送信中...";
    try {
        const { error } = await client.from('catches').insert({ zecken: m[1], length: l, weight: w });
        if(error) throw error;
        
        showToast("登録しました！");
        document.getElementById('zekken-input').value=""; 
        document.getElementById('length').value=""; 
        document.getElementById('weight').value="";
        loadHistory();
    } catch(e) { showToast("エラー: " + e.message, true); }
    finally { btn.disabled=false; btn.innerText="登録する"; }
}

// 4. 履歴＆削除
async function loadHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = "更新中...";
    try {
        const { data, error } = await client.from('catches').select('*, players(name)').order('id', { ascending: false }).limit(20);
        if(error) throw error;
        let html = "";
        data.forEach(item => {
            const playerName = item.players ? item.players.name : "不明";
            const time = new Date(item.created_at).toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'});
            html += `
                <div style="background:#252525; border:1px solid #444; border-radius:5px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div><div style="font-weight:bold; font-size:14px; color:#fff;">${playerName} (${item.zecken})</div><div style="font-size:13px; color:#aaa;">${item.length}cm / ${item.weight}g</div><div style="font-size:11px; color:#666;">${time}</div></div>
                    <button onclick="deleteCatch('${item.id}')" style="background:var(--accent-red); color:white; border:none; padding:8px 12px; border-radius:4px; font-size:12px; cursor:pointer;">削除</button>
                </div>`;
        });
        list.innerHTML = html;
    } catch(e) { console.error(e); }
}

window.deleteCatch = async function(id) {
    if(!await showConfirm("本当に削除しますか？")) return;
    try {
        const { error } = await client.from('catches').delete().eq('id', id);
        if(error) throw error;
        showToast("削除しました"); loadHistory();
    } catch(e) { showToast("エラー", true); }
}

// 5. 選手リスト
async function loadPlayerList() {
    const dataList = document.getElementById('player-options');
    dataList.innerHTML = "";
    try {
        const { data: players } = await client.from('players').select('*').order('zecken');
        players.forEach(p => {
            const option = document.createElement('option');
            option.value = `${p.zecken}: ${p.name} (${p.club || ''})`;
            dataList.appendChild(option);
        });
    } catch(e) {}
}

// 6. 設定・選手管理
window.saveConfig = async function() {
    if(!await showConfirm("設定を保存しますか？")) return;
    const updates = {
        title: document.getElementById('conf-title').value,
        rule_type: document.getElementById('conf-rule').value,
        limit_count: document.getElementById('conf-limit').value,
        sort1: document.getElementById('conf-sort1').value,
        sort2: document.getElementById('conf-sort2').value,
        sort3: document.getElementById('conf-sort3').value
    };
    await client.from('config').update(updates).eq('id', 1);
    showToast("保存しました"); loadConfig();
}

window.addPlayer = async function() {
    const z = document.getElementById('new-p-zecken').value;
    const n = document.getElementById('new-p-name').value;
    const c = document.getElementById('new-p-club').value;
    if(!z || !n) { showToast("入力不足です", true); return; }
    
    const { error } = await client.from('players').insert({ zecken: z, name: n, club: c });
    if(error) showToast("エラー: " + error.message, true);
    else {
        showToast("選手を追加しました");
        document.getElementById('new-p-zecken').value = ""; document.getElementById('new-p-name').value = "";
        loadSettings();
    }
}

window.deletePlayer = async function(zecken) {
    if(!await showConfirm(`ゼッケン${zecken}番を削除しますか？`)) return;
    await client.from('players').delete().eq('zecken', zecken);
    showToast("削除しました"); loadSettings();
}

async function loadSettings() {
    const pList = document.getElementById('player-list-manage');
    pList.innerHTML = "読み込み中...";
    try {
        const { data: players } = await client.from('players').select('*').order('zecken');
        let html = "";
        players.forEach(p => {
            html += `<div style="border-bottom:1px solid #444; padding:5px; display:flex; justify-content:space-between; color:#fff;">
                <span>${p.zecken}: ${p.name} (${p.club || ''})</span>
                <button onclick="deletePlayer(${p.zecken})" style="color:var(--accent-red); border:none; background:none; cursor:pointer;">🗑️</button>
            </div>`;
        });
        pList.innerHTML = html;
        if(players.length > 0) document.getElementById('new-p-zecken').value = Math.max(...players.map(p=>p.zecken)) + 1;
    } catch(e) {}
}

window.switchTab = function(tabName) {
    document.getElementById('ranking-view').style.display = 'none';
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('settings-view').style.display = 'none';
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    if(tabName === 'ranking') {
        document.getElementById('ranking-view').style.display = 'block';
        document.querySelectorAll('.tab')[0].classList.add('active');
        loadConfig(); window.loadRanking();
    } else if(tabName === 'input') {
        document.getElementById('input-view').style.display = 'block';
        document.querySelectorAll('.tab')[1].classList.add('active');
        loadPlayerList(); if(isLoggedIn) loadHistory();
    } else if(tabName === 'settings') {
        document.getElementById('settings-view').style.display = 'block';
        document.querySelectorAll('.tab')[2].classList.add('active');
        if(isLoggedIn) {
            document.getElementById('settings-login-msg').style.display = 'none';
            document.getElementById('settings-form').style.display = 'block';
            loadSettings();
        } else {
            document.getElementById('settings-login-msg').style.display = 'block';
            document.getElementById('settings-form').style.display = 'none';
        }
    }
}

window.adminLogin = function() {
    if(document.getElementById('admin-pass').value === CONFIG.password) {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('input-form').style.display = 'block';
        isLoggedIn = true; loadHistory(); loadPlayerList();
    } else { showToast("パスワードが違います", true); }
}

window.toggleLimitField = function() {
    const rule = document.getElementById('conf-rule').value;
    const div = document.getElementById('limit-container');
    if (rule === "長寸") div.style.display = "block"; else div.style.display = "none";
}

window.addEventListener('DOMContentLoaded', () => { loadConfig(); window.loadRanking(); });