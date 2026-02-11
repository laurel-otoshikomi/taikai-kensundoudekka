// ===================================
// 🎣 釣果管理システム - 完全新規版
// ===================================

// Supabaseをインポート
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase接続
const supabaseUrl = 'https://pajzsgbnoqdinvfmvlog.supabase.co';
const supabaseKey = 'sb_publishable_oP9HcAQrGbVNS7dHN4G8UQ_0r5gUTzD';
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
            loadPlayers();
            loadPlayerList();
        } else {
            showToast('管理者権限が必要です', true);
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
    
    const confirmed = confirm(`登録しますか？\n\n${playerName}\n長寸: ${length}cm\n重量: ${weight}g`);
    if (!confirmed) return;
    
    // データベースに登録
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
    showToast('✅ 登録しました！');
    
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
            <button class="btn btn-danger" onclick="deletePlayer(${p.zekken})">削除</button>
        </div>
    `).join('');
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
