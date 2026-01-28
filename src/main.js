// Supabaseに接続する
const supabaseUrl = 'https://pajzsgbnoqdinvfmvlog.supabase.co'
const supabaseKey = 'sb_publishable_oP9HcAQrGbVNS7dHN4G8UQ_0r5gUTzD'
const client = supabase.createClient(supabaseUrl, supabaseKey)

// --- グローバル変数 ---
let isLoggedIn = false;
let CONFIG = {};
let CURRENT_TOURNAMENT_ID = null;

// --- 起動処理 ---
const params = new URLSearchParams(window.location.search);
const urlId = params.get('id');

window.addEventListener('DOMContentLoaded', () => {
    if (urlId) openTournament(urlId);
    else document.getElementById('top-page').style.display = 'flex';
});

// --- ナビゲーション関数 ---
window.enterTournament = function() {
    const id = document.getElementById('tournament-id-input').value;
    if(!id) { showToast("IDを入力してください", true); return; }
    window.location.search = `?id=${id}`;
}

window.showCreateModal = () => document.getElementById('create-modal').style.display = 'flex';
window.closeCreateModal = () => document.getElementById('create-modal').style.display = 'none';
window.goTop = () => window.location.href = window.location.pathname;

// ★ 手動更新（ヘッダーアイコン用）
window.manualRefresh = function() {
    const btn = document.getElementById('header-refresh-btn');
    if(btn) btn.style.transform = 'rotate(360deg)';
    setTimeout(() => { if(btn) btn.style.transform = 'rotate(0deg)'; }, 500);
    
    window.loadRanking();
    if(isLoggedIn) loadHistory();
}

// --- 大会作成 ---
window.createTournament = async function() {
    const id = document.getElementById('create-id').value;
    const name = document.getElementById('create-name').value;
    const pass = document.getElementById('create-pass').value;
    
    if(!id || !name || !pass) { showToast("全項目入力してください", true); return; }
    
    const { data: exist } = await client.from('tournaments').select('id').eq('id', id).single();
    if(exist) { showToast("そのIDは既に使用されています", true); return; }

    const { error } = await client.from('tournaments').insert({
        id: id, name: name, password: pass,
        rule_type: '長寸', limit_count: 0, 
        sort1: 'max_len', sort2: 'limit_weight', sort3: 'count'
    });

    if(error) showToast("作成エラー: " + error.message, true);
    else {
        alert("大会を作成しました！");
        window.location.search = `?id=${id}`;
    }
}

// --- 大会ページ初期化 ---
async function openTournament(id) {
    CURRENT_TOURNAMENT_ID = id;
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('tournament-page').style.display = 'block';
    
    await loadConfig();
    window.loadRanking();

    // リアルタイム監視
    client.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'catches', filter: `tournament_id=eq.${CURRENT_TOURNAMENT_ID}` },
        () => { showToast("⚡ 釣果情報更新"); window.loadRanking(); if(isLoggedIn) loadHistory(); }
    ).subscribe();
}

// --- 設定読み込み & UI制御 ---
async function loadConfig() {
    try {
        const { data, error } = await client.from('tournaments').select('*').eq('id', CURRENT_TOURNAMENT_ID).single();
        if (error || !data) { alert("大会が見つかりません"); window.goTop(); return; }
        CONFIG = data;
        
        document.getElementById('app-title').innerText = CONFIG.name;
        document.getElementById('conf-id').innerText = CONFIG.id;
        
        let limitText = (CONFIG.limit_count > 0) ? `リミット${CONFIG.limit_count}匹` : "総力戦";
        document.getElementById('rule-info').innerText = `${CONFIG.rule_type}ルール / ${limitText}`;

        document.getElementById('conf-title').value = CONFIG.name;
        document.getElementById('conf-rule').value = CONFIG.rule_type;
        document.getElementById('conf-limit').value = CONFIG.limit_count;

        initSortDropdowns(); 
        document.getElementById('conf-sort1').value = CONFIG.sort1 || "";
        document.getElementById('conf-sort2').value = CONFIG.sort2 || "";
        document.getElementById('conf-sort3').value = CONFIG.sort3 || "";
        
        updateFormUI(); 
        updateSortOptions(); 

    } catch(e) { console.error(e); }
}

const SORT_OPTIONS = [
    { value: 'max_len', text: '1匹の長寸 (最大長寸)' },
    { value: 'max_weight', text: '1匹の重量 (最大重量)' },
    { value: 'count', text: '釣った枚数' },
    { value: 'limit_len', text: 'リミット合計長寸' },
    { value: 'limit_weight', text: 'リミット合計重量' }
];

function initSortDropdowns() {
    ['conf-sort1', 'conf-sort2', 'conf-sort3'].forEach(id => {
        const sel = document.getElementById(id);
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">なし</option>'; 
        SORT_OPTIONS.forEach(opt => {
            const op = document.createElement('option');
            op.value = opt.value;
            op.innerText = opt.text;
            sel.appendChild(op);
        });
        sel.value = currentVal;
    });
}

window.updateFormUI = function() {
    updateSortOptions();
}

window.updateSortOptions = function(changedLevel) {
    const s1 = document.getElementById('conf-sort1');
    const s2 = document.getElementById('conf-sort2');
    const s3 = document.getElementById('conf-sort3');
    
    const vals = [s1.value, s2.value, s3.value];

    [s1, s2, s3].forEach(sel => {
        Array.from(sel.options).forEach(opt => opt.disabled = false);
    });

    [s1, s2, s3].forEach((sel, myIdx) => {
        vals.forEach((val, otherIdx) => {
            if (myIdx !== otherIdx && val !== "") {
                const opt = sel.querySelector(`option[value="${val}"]`);
                if (opt) opt.disabled = true;
            }
        });
    });
}

// --- ★ランキング集計ロジック ---
window.loadRanking = async function() {
    const list = document.getElementById('ranking-list');
    const big = document.getElementById('big-fish-list');
    const small = document.getElementById('small-fish-list');
    
    list.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>集計中...</p>"; 
    if(big) big.innerHTML = "..."; if(small) small.innerHTML = "...";

    try {
        const { data: players } = await client.from('players').select('*').eq('tournament_id', CURRENT_TOURNAMENT_ID);
        const { data: catches } = await client.from('catches').select('*').eq('tournament_id', CURRENT_TOURNAMENT_ID);
        
        if (!players || !catches) return;

        let rankingList = [];
        let allFishList = [];

        players.forEach(p => {
            const myCatches = catches.filter(c => c.zecken === p.zecken);
            myCatches.forEach(f => allFishList.push({ ...f, name: p.name }));

            const count = myCatches.length;
            let max_len = 0;
            let max_weight = 0;

            myCatches.forEach(c => {
                if(c.length > max_len) max_len = c.length;
                if(c.weight > max_weight) max_weight = c.weight;
            });

            const lenSorted = [...myCatches].sort((a, b) => b.length - a.length);
            const limitN = (CONFIG.limit_count && CONFIG.limit_count > 0) ? CONFIG.limit_count : 9999;
            const targetLenFish = lenSorted.slice(0, limitN);
            
            let limit_len = targetLenFish.reduce((sum, f) => sum + f.length, 0);
            limit_len = Math.round(limit_len * 10) / 10; 

            const weightSorted = [...myCatches].sort((a, b) => b.weight - a.weight);
            const targetWeightFish = weightSorted.slice(0, limitN);
            
            let limit_weight = targetWeightFish.reduce((sum, f) => sum + f.weight, 0);

            let mainScore = 0;
            let displayScore = "";
            
            if (CONFIG.rule_type === '長寸') {
                mainScore = limit_len;
                displayScore = limit_len + "cm";
            } else if (CONFIG.rule_type === '重量') {
                mainScore = limit_weight;
                displayScore = limit_weight + "g";
            } else if (CONFIG.rule_type === '枚数') {
                mainScore = count;
                displayScore = count + "枚";
            }

            rankingList.push({
                zecken: p.zecken, name: p.name, club: p.club,
                max_len, max_weight, count, limit_len, limit_weight,
                mainScore, displayScore
            });
        });

        const getVal = (item, key) => {
            if (key === 'max_len') return item.max_len;
            if (key === 'max_weight') return item.max_weight;
            if (key === 'count') return item.count;
            if (key === 'limit_len') return item.limit_len;
            if (key === 'limit_weight') return item.limit_weight;
            return 0;
        };

        rankingList.sort((a, b) => {
            if (b.mainScore !== a.mainScore) return b.mainScore - a.mainScore;
            if (CONFIG.sort1) {
                let vA = getVal(a, CONFIG.sort1), vB = getVal(b, CONFIG.sort1);
                if (vB !== vA) return vB - vA;
            }
            if (CONFIG.sort2) {
                let vA = getVal(a, CONFIG.sort2), vB = getVal(b, CONFIG.sort2);
                if (vB !== vA) return vB - vA;
            }
            if (CONFIG.sort3) {
                let vA = getVal(a, CONFIG.sort3), vB = getVal(b, CONFIG.sort3);
                if (vB !== vA) return vB - vA;
            }
            return a.zecken - b.zecken;
        });

        rankingList.forEach((item, index) => item.rank = index + 1);

        list.innerHTML = "";
        let hasData = false;

        rankingList.forEach((item, index) => {
            if (item.mainScore === 0 && item.count === 0) return; 
            hasData = true;

            let rankClass = ""; let rankIcon = item.rank;
            if (item.rank === 1) { rankClass = "rank-1"; rankIcon = "👑 1"; }
            else if (item.rank === 2) { rankClass = "rank-2"; rankIcon = "🥈 2"; }
            else if (item.rank === 3) { rankClass = "rank-3"; rankIcon = "🥉 3"; }

            let details = [];
            const labels = {
                'max_len': `最長:${item.max_len}cm`,
                'max_weight': `最重:${item.max_weight}g`,
                'count': `${item.count}枚`,
                'limit_len': `合計長:${item.limit_len}cm`,
                'limit_weight': `合計重:${item.limit_weight}g`
            };

            [CONFIG.sort1, CONFIG.sort2, CONFIG.sort3].forEach(sortKey => {
                if (sortKey && labels[sortKey]) {
                    let isDup = false;
                    if (CONFIG.rule_type === '長寸' && sortKey === 'limit_len') isDup = true;
                    if (CONFIG.rule_type === '重量' && sortKey === 'limit_weight') isDup = true;
                    if (CONFIG.rule_type === '枚数' && sortKey === 'count') isDup = true;
                    if (!isDup && !details.includes(labels[sortKey])) details.push(labels[sortKey]);
                }
            });
            if (details.length === 0) details.push(`${item.count}枚`);

            const html = `
                <div class="card ${rankClass}" style="animation-delay: ${index * 0.05}s">
                    <div class="rank">${rankIcon}</div>
                    <div class="info">
                        <div class="name">${item.name}</div>
                        <div class="club">${item.club || ''}</div>
                    </div>
                    <div class="score">
                        <div class="total">${item.displayScore}</div>
                        <div class="detail" style="color:#bbb; font-size:0.75rem;">${details.join(' / ')}</div>
                    </div>
                </div>`;
            list.innerHTML += html;
        });

        if (!hasData) list.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>まだ釣果はありません</p>";

        updateSpecialAwards(allFishList);
        updateTime();

    } catch(e) { console.error(e); }
}

function updateSpecialAwards(allFish) {
    const bigBox = document.getElementById('big-fish-list');
    const smallBox = document.getElementById('small-fish-list');
    
    const getUniqueWinners = (list, limit) => {
        const winners = [];
        const seenZeckens = new Set();
        for (const fish of list) {
            if (winners.length >= limit) break;
            if (!seenZeckens.has(fish.zecken)) {
                winners.push(fish);
                seenZeckens.add(fish.zecken);
            }
        }
        return winners;
    };

    const sortedBig = [...allFish].sort((a,b) => {
        let diff = b.length - a.length;
        if(diff !== 0) return diff;
        return b.weight - a.weight;
    });
    const big = getUniqueWinners(sortedBig, 3);

    const sortedSmall = [...allFish]
        .filter(f => f.length > 0)
        .sort((a,b) => {
            let diff = a.length - b.length;
            if(diff !== 0) return diff;
            return a.weight - b.weight;
        });
    const small = getUniqueWinners(sortedSmall, 3);

    const render = (list, container) => {
        if(!list.length) { container.innerHTML="<span style='color:#666'>該当なし</span>"; return; }
        let h = "";
        list.forEach((f, i) => {
            const icon = ["🥇","🥈","🥉"][i] || "";
            h += `<div class="award-row">
                    <span>${icon} <b style="color:var(--gold)">${f.length}cm</b> (${f.weight}g)</span>
                    <span>${f.name}</span>
                  </div>`;
        });
        container.innerHTML = h;
    };
    render(big, bigBox);
    render(small, smallBox);
}

function updateTime() {
    const now = new Date();
    const str = now.toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'});
    const el = document.getElementById('rule-info');
    const existing = document.getElementById('update-time-tag');
    if(existing) existing.remove();
    el.innerHTML += ` <span id="update-time-tag" style="color:var(--gold); margin-left:10px; font-weight:bold;">(更新 ${str})</span>`;
}

// --- データ保存系 ---
window.saveConfig = async function() {
    if(!await showConfirm("設定を保存しますか？")) return;
    
    const updates = {
        name: document.getElementById('conf-title').value,
        rule_type: document.getElementById('conf-rule').value,
        limit_count: document.getElementById('conf-limit').value || 0,
        sort1: document.getElementById('conf-sort1').value,
        sort2: document.getElementById('conf-sort2').value,
        sort3: document.getElementById('conf-sort3').value
    };

    await client.from('tournaments').update(updates).eq('id', CURRENT_TOURNAMENT_ID);
    showToast("設定を保存しました");
    loadConfig(); 
}

// --- 検量データ送信 ---
window.sendData = async function() {
    const i = document.getElementById('zekken-input').value; 
    const l = normalizeNum(document.getElementById('length').value);
    const w = normalizeNum(document.getElementById('weight').value) || 0;
    
    if(!i || !l) { showToast("入力不足です", true); return; }
    const m = i.match(/^(\d+):/);
    if (!m) { showToast("リストから選手を選択してください", true); return; }
    
    if(!await showConfirm(`登録しますか？\n\n選手: ${m[1]}番\n長寸: ${l}cm\n重量: ${w}g`)) return;
    
    const btn = document.querySelector('.submit-btn'); 
    btn.disabled = true; btn.innerText = "送信中...";

    try {
        const { error } = await client.from('catches').insert({ 
            tournament_id: CURRENT_TOURNAMENT_ID,
            zecken: m[1], length: l, weight: w 
        });
        if(error) throw error;
        
        showToast("登録しました！");
        document.getElementById('zekken-input').value=""; 
        document.getElementById('length').value=""; 
        document.getElementById('weight').value="";
        loadHistory();
    } catch(e) { showToast("エラー: " + e.message, true); }
    finally { btn.disabled=false; btn.innerText="登録する"; }
}

// --- ★ 履歴表示の修正版（結合バグ修正） ---
async function loadHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = "<p style='text-align:center; color:#666;'>読み込み中...</p>";
    try {
        // 1. まず全選手を取得してマップを作る（{1: "ローレル", 2: "モップ"} のような辞書）
        const { data: players } = await client.from('players').select('zecken, name').eq('tournament_id', CURRENT_TOURNAMENT_ID);
        const playerMap = {};
        if(players) players.forEach(p => playerMap[p.zecken] = p.name);

        // 2. 釣果を取得する（players(name)は使わない）
        const { data: catches, error } = await client.from('catches')
            .select('*')
            .eq('tournament_id', CURRENT_TOURNAMENT_ID)
            .order('created_at', { ascending: false }).limit(20);
            
        if(error) throw error;
        
        if(!catches || catches.length === 0) {
            list.innerHTML = "<p style='text-align:center; padding:10px; color:#666;'>履歴はありません</p>";
            return;
        }

        let html = "";
        catches.forEach(item => {
            const pName = playerMap[item.zecken] || "未登録選手";
            const t = new Date(item.created_at).toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'});
            html += `
                <div style="background:#252525; border:1px solid #444; border-radius:5px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:bold; font-size:14px; color:#fff;">${pName} (${item.zecken})</div>
                        <div style="font-size:13px; color:#aaa;">${item.length}cm / ${item.weight}g</div>
                        <div style="font-size:11px; color:#666;">${t}</div>
                    </div>
                    <button onclick="deleteCatch('${item.id}')" style="background:var(--accent-red); color:white; border:none; padding:5px 10px; border-radius:4px; font-size:12px; cursor:pointer;">削除</button>
                </div>`;
        });
        list.innerHTML = html;
    } catch(e) { 
        console.error(e);
        list.innerHTML = "<p style='color:red;'>読み込みエラー</p>";
    }
}

window.deleteCatch = async function(id) {
    if(!await showConfirm("本当に削除しますか？")) return;
    await client.from('catches').delete().eq('id', id);
    showToast("削除しました"); loadHistory();
}

// --- 選手管理・CSV ---
async function loadPlayerList() {
    const dl = document.getElementById('player-options');
    dl.innerHTML = "";
    const { data } = await client.from('players').select('*').eq('tournament_id', CURRENT_TOURNAMENT_ID).order('zecken');
    if(data) data.forEach(p => {
        const op = document.createElement('option');
        op.value = `${p.zecken}: ${p.name} (${p.club||''})`;
        dl.appendChild(op);
    });
}

window.importPlayers = async function() {
    const input = document.getElementById('player-csv');
    if (!input.files[0]) { showToast("ファイルを選択してください", true); return; }
    if(!await showConfirm("CSVを取り込みますか？")) return;

    const reader = new FileReader();
    reader.readAsText(input.files[0], 'Shift_JIS');
    reader.onload = async (e) => {
        const lines = e.target.result.split(/\r\n|\n/);
        const inserts = [];
        lines.forEach(l => {
            const c = l.split(',');
            if(c.length>=2 && c[0] && c[1]) {
                inserts.push({ tournament_id: CURRENT_TOURNAMENT_ID, zecken: parseInt(c[0]), name: c[1].trim(), club: c[2]?c[2].trim():"" });
            }
        });
        if(inserts.length===0) { showToast("データがありません", true); return; }
        const { error } = await client.from('players').insert(inserts);
        if(error) showToast("登録エラー(重複など)", true);
        else { showToast(`${inserts.length}件登録しました`); loadSettings(); }
    };
}

// --- 選手追加・削除 ---
window.addPlayer = async function() {
    const z = document.getElementById('new-p-zecken').value;
    const n = document.getElementById('new-p-name').value;
    const c = document.getElementById('new-p-club').value;
    if(!z||!n) return;
    await client.from('players').insert({tournament_id:CURRENT_TOURNAMENT_ID, zecken:z, name:n, club:c});
    showToast("追加しました"); loadSettings();
}
window.deletePlayer = async function(z) {
    if(!await showConfirm("削除しますか？")) return;
    await client.from('players').delete().eq('tournament_id',CURRENT_TOURNAMENT_ID).eq('zecken',z);
    showToast("削除しました"); loadSettings();
}
async function loadSettings() {
    const div = document.getElementById('player-list-manage');
    div.innerHTML = "...";
    const { data } = await client.from('players').select('*').eq('tournament_id',CURRENT_TOURNAMENT_ID).order('zecken');
    let h = "";
    if(data) data.forEach(p => {
        h += `<div style="border-bottom:1px solid #333; padding:8px; display:flex; justify-content:space-between;">
                <span>${p.zecken}: ${p.name}</span>
                <button onclick="deletePlayer(${p.zecken})" style="color:#e74c3c; border:none; background:none;">×</button>
              </div>`;
    });
    div.innerHTML = h;
}

// --- ユーティリティ ---
window.switchTab = function(t) {
    document.querySelectorAll('.content-view').forEach(e=>e.style.display='none');
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
    
    if(t==='ranking') {
        document.getElementById('ranking-view').style.display='block';
        document.querySelectorAll('.tab')[0].classList.add('active');
        loadConfig(); window.loadRanking();
    } else if(t==='input') {
        document.getElementById('input-view').style.display='block';
        document.querySelectorAll('.tab')[1].classList.add('active');
        loadPlayerList(); if(isLoggedIn) loadHistory();
    } else if(t==='settings') {
        document.getElementById('settings-view').style.display='block';
        document.querySelectorAll('.tab')[2].classList.add('active');
        if(isLoggedIn) {
            document.getElementById('settings-login-msg').style.display='none';
            document.getElementById('settings-form').style.display='block';
            loadSettings();
        } else {
            document.getElementById('settings-login-msg').style.display='block';
            document.getElementById('settings-form').style.display='none';
        }
    }
}

window.adminLogin = function() {
    if(document.getElementById('admin-pass').value === CONFIG.password) {
        document.getElementById('login-box').style.display='none';
        document.getElementById('input-form').style.display='block';
        isLoggedIn = true; loadHistory(); loadPlayerList();
    } else showToast("パスワード違い", true);
}

// ★ ログアウト機能
window.adminLogout = function() {
    isLoggedIn = false;
    document.getElementById('input-form').style.display = 'none';
    document.getElementById('login-box').style.display = 'block';
    document.getElementById('admin-pass').value = ""; // パスワードクリア
    showToast("ログアウトしました");
}

function normalizeNum(str) {
    if (!str) return "";
    return str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}
window.autoNormalize = function(e) { e.value = normalizeNum(e.value); }

function showToast(msg, isErr=false) {
    const t = document.createElement('div');
    t.innerText = msg;
    Object.assign(t.style, {
        position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)',
        background: isErr?'#c0392b':'#27ae60', color:'white', padding:'10px 20px',
        borderRadius:'20px', zIndex:99999, transition:'opacity 0.5s', opacity:0
    });
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.style.opacity=1);
    setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),500); }, 2000);
}

function showConfirm(msg) {
    return new Promise(resolve => {
        const m = document.getElementById('custom-confirm-modal');
        document.getElementById('confirm-msg').innerText = msg;
        m.style.display='flex';
        const yBtn = document.getElementById('btn-confirm-yes');
        const nBtn = document.getElementById('btn-confirm-no');
        const hY = () => { m.style.display='none'; cleanup(); resolve(true); };
        const hN = () => { m.style.display='none'; cleanup(); resolve(false); };
        const cleanup = () => { yBtn.removeEventListener('click', hY); nBtn.removeEventListener('click', hN); };
        yBtn.addEventListener('click', hY); nBtn.addEventListener('click', hN);
    });
}
