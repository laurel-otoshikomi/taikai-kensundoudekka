// ===================================
// 🎣 釣果管理システム - 完全新規版
// ===================================

// Supabaseをインポート
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase接続（新しいプロジェクト）
const supabaseUrl = 'https://pkjvdtvomqzcnfhkqven.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38';
const client = createClient(supabaseUrl, supabaseKey);

// グローバル状態
let AUTH_LEVEL = 0; // 0: Guest, 1: Staff, 2: Admin
let CONFIG = {};
let CURRENT_TOURNAMENT_ID = null;
let ALL_PLAYERS = [];
let ALL_HISTORY = [];

console.log('🎣 システム起動');

// ===================================
// 初期化
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('id');
    
    if (tournamentId) {
        await openTournament(tournamentId);
    } else {
        showTopPage();
    }
});

function showTopPage() {
    document.getElementById('top-page').style.display = 'flex';
    document.getElementById('tournament-page').style.display = 'none';
}

// ===================================
// トップページ機能
// ===================================
window.enterTournament = function() {
    const id = document.getElementById('tournament-id-input').value.trim();
    if (!id) {
        showToast('大会IDを入力してください', true);
        return;
    }
    window.location.href = `?id=${id}`;
}

// ===================================
// 大会ページ初期化
// ===================================
async function openTournament(tournamentId) {
    CURRENT_TOURNAMENT_ID = tournamentId;
    console.log('📂 大会ID:', CURRENT_TOURNAMENT_ID);
    
    // 大会情報を取得
    const { data, error } = await client
        .from('tournaments')
        .select('*')
        .eq('id', CURRENT_TOURNAMENT_ID)
        .single();
    
    if (error || !data) {
        console.error('大会取得エラー:', error);
        alert('大会が見つかりません');
        showTopPage();
        return;
    }
    
    CONFIG = data;
    console.log('✅ 大会情報取得:', CONFIG);
    
    // UIを更新
    document.getElementById('tournament-name').textContent = CONFIG.name;
    const limitText = CONFIG.limit_count > 0 ? `リミット${CONFIG.limit_count}匹` : '総力戦';
    document.getElementById('tournament-info').textContent = `${CONFIG.rule_type}ルール / ${limitText}`;
    
    // ページ表示切り替え
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('tournament-page').style.display = 'block';
    
    // ランキング読み込み
    await loadRanking();
    
    // リアルタイム監視
    setupRealtimeSubscription();
}

function setupRealtimeSubscription() {
    client.channel('tournament-updates')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'catches', filter: `tournament_id=eq.${CURRENT_TOURNAMENT_ID}` },
            () => {
                console.log('⚡ 釣果更新');
                loadRanking();
                if (AUTH_LEVEL > 0) loadHistory();
            }
        )
        .subscribe();
}

// ===================================
// タブ切り替え
// ===================================
window.switchTab = function(tabName) {
    // タブのアクティブ状態を更新
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.classList.remove('active');
        if ((tabName === 'ranking' && index === 0) ||
            (tabName === 'input' && index === 1) ||
            (tabName === 'settings' && index === 2)) {
            tab.classList.add('active');
        }
    });
    
    // ビューの表示切り替え
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    if (tabName === 'ranking') {
        document.getElementById('ranking-view').classList.add('active');
        loadRanking();
    } else if (tabName === 'input') {
        document.getElementById('input-view').classList.add('active');
        if (AUTH_LEVEL > 0) {
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('input-form').style.display = 'block';
            loadPlayers();
            loadHistory();
        } else {
            document.getElementById('login-box').style.display = 'block';
            document.getElementById('input-form').style.display = 'none';
        }
    } else if (tabName === 'settings') {
        document.getElementById('settings-view').classList.add('active');
        if (AUTH_LEVEL === 2) {
            // 管理者のみルール設定を表示
            document.getElementById('rule-settings-card').style.display = 'block';
            loadTournamentSettings();
        }
        if (AUTH_LEVEL > 0) {
            // ログインユーザーは選手管理可能
            loadPlayers().then(() => loadPlayerList());
        }
    }
}

// ===================================
// ログイン
// ===================================
window.login = function() {
    const password = document.getElementById('password-input').value;
    
    if (password === CONFIG.password) {
        AUTH_LEVEL = 2;
        showToast('✅ 管理者としてログイン');
    } else if (password === CONFIG.staff_password) {
        AUTH_LEVEL = 1;
        showToast('✅ 運営スタッフとしてログイン');
    } else {
        showToast('パスワードが違います', true);
        return;
    }
    
    console.log('🔐 ログイン成功 AUTH_LEVEL:', AUTH_LEVEL);
    
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('input-form').style.display = 'block';
    
    loadPlayers();
    loadHistory();
}

// ===================================
// 選手データ読み込み
// ===================================
async function loadPlayers() {
    console.log('👥 選手データ読み込み開始');
    
    const { data, error } = await client
        .from('players')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .order('zekken');
    
    if (error) {
        console.error('❌ 選手読み込みエラー:', error);
        return;
    }
    
    ALL_PLAYERS = data || [];
    console.log('✅ 選手データ読み込み完了:', ALL_PLAYERS.length, '人');
    
    if (ALL_PLAYERS.length > 0) {
        console.log('📋 選手サンプル:', ALL_PLAYERS[0]);
    }
    
    // selectタグを更新
    const select = document.getElementById('player-select');
    select.innerHTML = '<option value="">選手を選択してください</option>';
    
    ALL_PLAYERS.forEach(player => {
        const option = document.createElement('option');
        option.value = player.zekken;
        option.textContent = `${player.zekken}番: ${player.name}${player.club ? ` (${player.club})` : ''}`;
        select.appendChild(option);
    });
}

// ===================================
// 釣果登録
// ===================================
window.registerCatch = async function() {
    if (AUTH_LEVEL === 0) {
        showToast('ログインが必要です', true);
        return;
    }
    
    const zekken = parseInt(document.getElementById('player-select').value);
    const length = parseFloat(document.getElementById('length-input').value);
    const weight = parseFloat(document.getElementById('weight-input').value) || 0;
    
    console.log('📝 登録データ:', { zekken, length, weight });
    
    if (!zekken) {
        showToast('選手を選択してください', true);
        return;
    }
    
    if (!length || length <= 0) {
        showToast('長寸を入力してください', true);
        return;
    }
    
    // 選手名取得
    const player = ALL_PLAYERS.find(p => p.zekken == zekken);
    const playerName = player ? player.name : `${zekken}番`;
    
    // データベースに登録（確認ダイアログなし）
    const { error } = await client
        .from('catches')
        .insert({
            tournament_id: CURRENT_TOURNAMENT_ID,
            zekken: zekken,
            length: length,
            weight: weight
        });
    
    if (error) {
        console.error('❌ 登録エラー:', error);
        showToast('登録に失敗しました', true);
        return;
    }
    
    console.log('✅ 登録成功');
    
    // トーストで綺麗に表示
    showToast(`✅ ${playerName}: ${length}cm ${weight > 0 ? weight + 'g' : ''} を登録しました！`);
    
    // フォームをリセット
    document.getElementById('player-select').value = '';
    document.getElementById('length-input').value = '';
    document.getElementById('weight-input').value = '';
    
    // データを再読み込み
    await loadHistory();
    await loadRanking();
}

// ===================================
// 履歴読み込み
// ===================================
async function loadHistory() {
    console.log('📋 履歴読み込み開始');
    
    // 選手名マップを作成
    const playerMap = {};
    ALL_PLAYERS.forEach(p => {
        playerMap[p.zekken] = p.name;
    });
    
    // 釣果を取得
    const { data, error } = await client
        .from('catches')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) {
        console.error('❌ 履歴読み込みエラー:', error);
        return;
    }
    
    ALL_HISTORY = data || [];
    console.log('✅ 履歴読み込み完了:', ALL_HISTORY.length, '件');
    
    // 表示
    const container = document.getElementById('history-list');
    
    if (ALL_HISTORY.length === 0) {
        container.innerHTML = '<div class="empty-state">まだ履歴がありません</div>';
        return;
    }
    
    container.innerHTML = ALL_HISTORY.map(item => {
        const playerName = playerMap[item.zekken] || '未登録';
        const date = new Date(item.created_at).toLocaleString('ja-JP');
        
        return `
            <div class="history-item">
                <div>
                    <strong>${item.zekken}番: ${playerName}</strong>
                    <span style="margin-left: 15px; color: #4CAF50;">${item.length}cm</span>
                    ${item.weight > 0 ? `<span style="margin-left: 10px; color: #ccc;">${item.weight}g</span>` : ''}
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">${date}</div>
                </div>
                ${AUTH_LEVEL === 2 ? `<button class="btn btn-danger" onclick="deleteCatch(${item.id})">削除</button>` : ''}
            </div>
        `;
    }).join('');
}

window.deleteCatch = async function(id) {
    if (!confirm('この記録を削除しますか？')) return;
    
    const { error } = await client
        .from('catches')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('❌ 削除エラー:', error);
        showToast('削除に失敗しました', true);
        return;
    }
    
    showToast('削除しました');
    await loadHistory();
    await loadRanking();
}

// ===================================
// ランキング読み込み
// ===================================
async function loadRanking() {
    console.log('🏆 ランキング計算開始');
    
    const { data, error } = await client
        .from('catches')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID);
    
    if (error) {
        console.error('❌ ランキング読み込みエラー:', error);
        return;
    }
    
    const catches = data || [];
    console.log('📊 釣果データ:', catches.length, '件');
    
    if (catches.length === 0) {
        document.getElementById('ranking-list').innerHTML = '<div class="empty-state">まだ釣果がありません</div>';
        return;
    }
    
    // 選手ごとに集計
    const stats = {};
    catches.forEach(c => {
        if (!stats[c.zekken]) {
            stats[c.zekken] = {
                zekken: c.zekken,
                lengths: [],
                weights: []
            };
        }
        stats[c.zekken].lengths.push(c.length);
        stats[c.zekken].weights.push(c.weight || 0);
    });
    
    // ランキング配列に変換
    const ranking = Object.values(stats).map(s => {
        const sortedWeights = [...s.weights].sort((a, b) => b - a);
        const limitCount = CONFIG.limit_count || 999;
        const limitWeight = sortedWeights.slice(0, limitCount).reduce((sum, w) => sum + w, 0);
        
        return {
            zekken: s.zekken,
            count: s.lengths.length,
            max_len: Math.max(...s.lengths),
            total_weight: s.weights.reduce((sum, w) => sum + w, 0),
            limit_weight: limitWeight
        };
    });
    
    // ソート
    const sort1 = CONFIG.sort1 || 'max_len';
    const sort2 = CONFIG.sort2 || 'limit_weight';
    const sort3 = CONFIG.sort3 || 'count';
    
    ranking.sort((a, b) => {
        if (a[sort1] !== b[sort1]) return b[sort1] - a[sort1];
        if (a[sort2] !== b[sort2]) return b[sort2] - a[sort2];
        return b[sort3] - a[sort3];
    });
    
    console.log('✅ ランキング計算完了:', ranking.length, '人');
    
    // 表示
    const container = document.getElementById('ranking-list');
    container.innerHTML = ranking.map((r, index) => {
        const isTop3 = index < 3;
        return `
            <div class="ranking-item ${isTop3 ? 'top3' : ''}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${index + 1}位</div>
                    <div style="font-size: 24px; font-weight: bold;">${r.zekken}番</div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">最大</div>
                        <div class="stat-value" style="color: #4CAF50;">${r.max_len}cm</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">匹数</div>
                        <div class="stat-value" style="color: #2196F3;">${r.count}匹</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">重量</div>
                        <div class="stat-value" style="color: #FF9800;">${r.limit_weight}g</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// 選手管理
// ===================================
async function loadPlayerList() {
    const { data, error } = await client
        .from('players')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .order('zekken');
    
    if (error) {
        console.error('選手リスト読み込みエラー:', error);
        return;
    }
    
    const players = data || [];
    const container = document.getElementById('player-list');
    
    if (players.length === 0) {
        container.innerHTML = '<div class="empty-state">選手が登録されていません</div>';
        return;
    }
    
    container.innerHTML = players.map(p => `
        <div class="player-item">
            <div>
                <strong>${p.zekken}番:</strong>
                <span style="margin-left: 10px;">${p.name}</span>
                ${p.club ? `<span style="color: #aaa; margin-left: 10px;">(${p.club})</span>` : ''}
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; margin-right: 5px;" onclick="editPlayer(${p.zekken})">編集</button>
                <button class="btn btn-danger" onclick="deletePlayer(${p.zekken})">削除</button>
            </div>
        </div>
    `).join('');
}

// 選手情報を編集
window.editPlayer = async function(zekken) {
    const player = ALL_PLAYERS.find(p => p.zekken === zekken);
    if (!player) {
        showToast('選手が見つかりません', true);
        return;
    }
    
    // 編集フォームに現在の値をセット
    const newName = prompt(`${zekken}番の新しい名前を入力してください`, player.name);
    if (newName === null) return; // キャンセル
    
    const newClub = prompt(`${zekken}番の新しい所属を入力してください（空欄可）`, player.club || '');
    if (newClub === null) return; // キャンセル
    
    if (!newName.trim()) {
        showToast('名前は必須です', true);
        return;
    }
    
    const { error } = await client
        .from('players')
        .update({
            name: newName.trim(),
            club: newClub.trim()
        })
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .eq('zekken', zekken);
    
    if (error) {
        console.error('選手編集エラー:', error);
        showToast('編集に失敗しました', true);
        return;
    }
    
    showToast('✅ 選手情報を更新しました');
    await loadPlayers();
    await loadPlayerList();
}

window.addPlayer = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const zekken = parseInt(document.getElementById('new-zekken').value);
    const name = document.getElementById('new-name').value.trim();
    const club = document.getElementById('new-club').value.trim();
    
    if (!zekken || !name) {
        showToast('ゼッケン番号と名前は必須です', true);
        return;
    }
    
    // 重複チェック
    const isDuplicate = ALL_PLAYERS.some(p => p.zekken === zekken);
    if (isDuplicate) {
        showToast(`${zekken}番は既に登録されています`, true);
        return;
    }
    
    const { error } = await client
        .from('players')
        .insert({
            tournament_id: CURRENT_TOURNAMENT_ID,
            zekken: zekken,
            name: name,
            club: club || ''
        });
    
    if (error) {
        console.error('選手追加エラー:', error);
        showToast('追加に失敗しました（重複の可能性）', true);
        return;
    }
    
    showToast('✅ 選手を追加しました');
    
    document.getElementById('new-zekken').value = '';
    document.getElementById('new-name').value = '';
    document.getElementById('new-club').value = '';
    document.getElementById('zekken-warning').style.display = 'none';
    document.getElementById('add-player-btn').disabled = false;
    
    await loadPlayers();
    await loadPlayerList();
}

window.deletePlayer = async function(zekken) {
    if (!confirm(`${zekken}番を削除しますか？`)) return;
    
    const { error } = await client
        .from('players')
        .delete()
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .eq('zekken', zekken);
    
    if (error) {
        console.error('選手削除エラー:', error);
        showToast('削除に失敗しました', true);
        return;
    }
    
    showToast('削除しました');
    await loadPlayers();
    await loadPlayerList();
}

// ===================================
// 大会ルール設定
// ===================================

// ソート選択肢の定義
const SORT_OPTIONS = {
    'max_len': '最大長寸',
    'max_weight': '最大重量',
    'total_count': '匹数総合計',
    'total_weight': '総重量',
    'limit_weight': 'リミット合計重量'
};

// ゼッケン番号の重複チェック
window.checkZekkenDuplicate = function(zekken) {
    const warning = document.getElementById('zekken-warning');
    const addBtn = document.getElementById('add-player-btn');
    
    if (!zekken) {
        warning.style.display = 'none';
        addBtn.disabled = false;
        return;
    }
    
    const zekkenNum = parseInt(zekken);
    const isDuplicate = ALL_PLAYERS.some(p => p.zekken === zekkenNum);
    
    if (isDuplicate) {
        warning.textContent = `⚠️ ${zekkenNum}番は既に登録されています`;
        warning.style.display = 'block';
        addBtn.disabled = true;
    } else {
        warning.textContent = `✅ ${zekkenNum}番は利用可能です`;
        warning.style.color = '#4CAF50';
        warning.style.display = 'block';
        addBtn.disabled = false;
    }
};

// ソート選択肢を更新（重複を除外）
window.updateSortOptions = function() {
    const ruleType = document.getElementById('rule-type').value;
    const sort1 = document.getElementById('sort1').value;
    const sort2 = document.getElementById('sort2').value;
    
    // 使用済みの選択肢を収集
    const usedOptions = [ruleType];
    if (sort1) usedOptions.push(sort1);
    if (sort2) usedOptions.push(sort2);
    
    // 各selectを更新
    updateSelectOptions('sort1', usedOptions, [ruleType]);
    updateSelectOptions('sort2', usedOptions, [ruleType, sort1]);
    updateSelectOptions('sort3', usedOptions, [ruleType, sort1, sort2]);
}

function updateSelectOptions(selectId, allUsed, excludeList) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // オプションをクリア
    select.innerHTML = '<option value="">選択しない</option>';
    
    // 利用可能なオプションを追加
    for (const [value, label] of Object.entries(SORT_OPTIONS)) {
        // 除外リストに含まれていなければ追加
        if (!excludeList.includes(value) || value === currentValue) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            if (value === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        }
    }
}

// 設定を読み込み
async function loadTournamentSettings() {
    console.log('⚙️ 大会設定読み込み開始');
    
    if (!CONFIG || !CONFIG.id) {
        console.error('❌ CONFIG が存在しません');
        return;
    }
    
    // フォームに現在の設定値を反映
    document.getElementById('rule-type').value = CONFIG.rule_type || CONFIG.sort1 || 'max_len';
    document.getElementById('limit-count').value = CONFIG.limit_count || 0;
    
    // 初期選択肢を設定
    updateSortOptions();
    
    // ソート条件を設定
    document.getElementById('sort1').value = CONFIG.sort1 || '';
    document.getElementById('sort2').value = CONFIG.sort2 || '';
    document.getElementById('sort3').value = CONFIG.sort3 || '';
    
    // 選択肢を再更新
    updateSortOptions();
    
    console.log('✅ 大会設定読み込み完了:', CONFIG);
}

// 設定を保存
window.updateTournamentSettings = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const ruleType = document.getElementById('rule-type').value;
    const limitCount = parseInt(document.getElementById('limit-count').value) || 0;
    const sort1 = document.getElementById('sort1').value;
    const sort2 = document.getElementById('sort2').value;
    const sort3 = document.getElementById('sort3').value;
    
    // バリデーション: 同じ項目が選択されていないかチェック
    const selectedItems = [sort1, sort2, sort3].filter(v => v !== '');
    const uniqueItems = new Set(selectedItems);
    
    if (selectedItems.length !== uniqueItems.size) {
        showToast('判定順位で同じ項目が選択されています', true);
        return;
    }
    
    console.log('💾 設定保存:', { ruleType, limitCount, sort1, sort2, sort3 });
    
    const { error } = await client
        .from('tournaments')
        .update({
            rule_type: ruleType,
            limit_count: limitCount,
            sort1: sort1 || null,
            sort2: sort2 || null,
            sort3: sort3 || null
        })
        .eq('id', CURRENT_TOURNAMENT_ID);
    
    if (error) {
        console.error('❌ 設定保存エラー:', error);
        showToast('設定の保存に失敗しました', true);
        return;
    }
    
    // CONFIGを更新
    CONFIG.rule_type = ruleType;
    CONFIG.limit_count = limitCount;
    CONFIG.sort1 = sort1 || null;
    CONFIG.sort2 = sort2 || null;
    CONFIG.sort3 = sort3 || null;
    
    showToast('✅ 設定を保存しました');
    
    // 大会情報表示を更新
    const limitText = limitCount > 0 ? `リミット${limitCount}匹` : '無制限';
    const ruleName = SORT_OPTIONS[ruleType] || ruleType;
    document.getElementById('tournament-info').textContent = `${ruleName} / ${limitText}`;
    
    // ランキングを再計算
    await loadRanking();
    
    console.log('✅ 設定保存完了');
}

// ===================================
// トースト通知
// ===================================
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

console.log('✅ システム準備完了');
