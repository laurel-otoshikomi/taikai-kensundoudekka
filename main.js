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
let REALTIME_ENABLED = true; // リアルタイム更新フラグ
let REALTIME_SUBSCRIPTION = null; // Supabaseリアルタイム購読
let RANKING_DISPLAY_COUNT = 10; // 順位表示件数（初期: 10位まで）
let FULL_RANKING = []; // 全ランキングデータ

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
    loadTournamentList(); // 大会一覧を読み込み
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

// 大会一覧を読み込み
async function loadTournamentList() {
    const { data, error } = await client
        .from('tournaments')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    
    const listEl = document.getElementById('tournament-list');
    
    if (error) {
        console.error('大会一覧読み込みエラー:', error);
        listEl.innerHTML = '<div style="color: #e74c3c;">読み込みに失敗しました</div>';
        return;
    }
    
    if (!data || data.length === 0) {
        listEl.innerHTML = '<div style="opacity: 0.6;">まだ大会がありません</div>';
        return;
    }
    
    listEl.innerHTML = data.map(t => `
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${t.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${t.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${t.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join('');
}

// 大会を作成
window.createTournament = async function() {
    const id = document.getElementById('new-tournament-id').value.trim();
    const name = document.getElementById('new-tournament-name').value.trim();
    const adminPassword = document.getElementById('new-tournament-admin-password').value.trim();
    const staffPassword = document.getElementById('new-tournament-staff-password').value.trim();
    
    if (!id || !name || !adminPassword) {
        showToast('大会ID、大会名、管理者パスワードは必須です', true);
        return;
    }
    
    // 大会IDの形式チェック（半角英数字のみ）
    if (!/^[a-zA-Z0-9]+$/.test(id)) {
        showToast('大会IDは半角英数字のみで入力してください', true);
        return;
    }
    
    console.log('🆕 大会作成:', { id, name });
    
    // 大会を作成
    const { data, error } = await client
        .from('tournaments')
        .insert({
            id: id,
            name: name,
            password: adminPassword,
            staff_password: staffPassword || null,
            rule_type: 'limit_total_len',
            limit_count: 0,
            sort1: 'one_max_len',
            sort2: 'one_max_weight',
            sort3: null,
            hide_ranking: false
        })
        .select();
    
    if (error) {
        console.error('❌ 大会作成エラー:', error);
        console.error('エラー詳細:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        
        if (error.code === '23505') {
            showToast('❌ この大会IDは既に使用されています', true);
        } else if (error.message && error.message.includes('Failed to fetch')) {
            showToast('❌ Supabaseへの接続に失敗しました。ネットワークを確認してください。', true);
            alert(`Supabase接続エラー\n\n1. Supabaseプロジェクトが一時停止していないか確認\n2. ネットワーク接続を確認\n3. RLSポリシーが設定されているか確認\n\nURL: ${supabaseUrl}`);
        } else {
            showToast(`❌ 大会の作成に失敗しました: ${error.message || '不明なエラー'}`, true);
        }
        return;
    }
    
    showToast('✅ 大会を作成しました！');
    
    // フォームをリセット
    document.getElementById('new-tournament-id').value = '';
    document.getElementById('new-tournament-name').value = '';
    document.getElementById('new-tournament-admin-password').value = '';
    document.getElementById('new-tournament-staff-password').value = '';
    
    // 大会一覧を再読み込み
    await loadTournamentList();
    
    // 作成した大会に参加
    setTimeout(() => {
        window.location.href = `?id=${id}`;
    }, 1500);
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
    console.log('📋 大会ルール:', CONFIG.rule_type);
    console.log('📊 リミット匹数:', CONFIG.limit_count);
    console.log('🎯 優先順位1:', CONFIG.sort1);
    console.log('🎯 優先順位2:', CONFIG.sort2);
    console.log('🎯 優先順位3:', CONFIG.sort3);
    
    // UIを更新
    document.getElementById('tournament-name').textContent = CONFIG.name;
    const limitText = CONFIG.limit_count > 0 ? `リミット${CONFIG.limit_count}匹` : '総力戦';
    document.getElementById('tournament-info').textContent = limitText;
    
    // ページ表示切り替え
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('tournament-page').style.display = 'block';
    
    // 🔥 ログイン前でも選手データを読み込む
    await loadPlayers();
    
    // ランキング読み込み
    await loadRanking();
    
    // QRコードを生成
    initQRCode();
    
    // 大会管理カードを表示（管理者のみ）
    if (AUTH_LEVEL === 2) {
        document.getElementById('tournament-management-card').style.display = 'block';
        updateTournamentStatusDisplay();
    }
    
    // 大会終了チェック
    updateInputFormVisibility();
    
    // リアルタイム監視
    setupRealtimeSubscription();
}

function setupRealtimeSubscription() {
    // 既存の購読を解除
    if (REALTIME_SUBSCRIPTION) {
        REALTIME_SUBSCRIPTION.unsubscribe();
    }
    
    // 新しい購読を作成
    REALTIME_SUBSCRIPTION = client.channel('tournament-updates')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'catches', filter: `tournament_id=eq.${CURRENT_TOURNAMENT_ID}` },
            () => {
                if (REALTIME_ENABLED) {
                    console.log('⚡ リアルタイム更新');
                    loadRanking();
                    if (AUTH_LEVEL > 0) loadHistory();
                }
            }
        )
        .subscribe();
    
    console.log('📡 リアルタイム購読開始');
}

// リアルタイム更新のON/OFF切り替え
window.toggleRealtimeUpdate = function() {
    REALTIME_ENABLED = document.getElementById('realtime-toggle').checked;
    const refreshBtn = document.getElementById('manual-refresh-btn');
    
    if (REALTIME_ENABLED) {
        refreshBtn.style.display = 'none';
        showToast('✅ リアルタイム更新: ON');
        console.log('📡 リアルタイム更新: ON');
    } else {
        refreshBtn.style.display = 'inline-block';
        showToast('⏸️ リアルタイム更新: OFF（手動更新モード）');
        console.log('⏸️ リアルタイム更新: OFF');
    }
}

// 手動更新
window.manualRefreshRanking = async function() {
    showToast('🔄 更新中...');
    await loadRanking();
    if (AUTH_LEVEL > 0) await loadHistory();
    showToast('✅ 更新しました');
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
        updateLoginStatus('管理者');
    } else if (password === CONFIG.staff_password) {
        AUTH_LEVEL = 1;
        showToast('✅ 運営スタッフとしてログイン');
        updateLoginStatus('運営スタッフ');
    } else {
        showToast('パスワードが違います', true);
        return;
    }
    
    console.log('🔐 ログイン成功 AUTH_LEVEL:', AUTH_LEVEL);
    
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('input-form').style.display = 'block';
    
    // 管理者・運営スタッフの場合、専用UIを表示
    if (AUTH_LEVEL >= 1) {
        // 管理者限定の要素を表示
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // 管理者の場合、大会管理カードを表示
    if (AUTH_LEVEL === 2) {
        const managementCard = document.getElementById('tournament-management-card');
        if (managementCard) {
            managementCard.style.display = 'block';
            updateTournamentStatusDisplay();
        }
    }
    
    loadPlayers();
    loadHistory();
}

// ログアウト
window.logout = function() {
    // カスタム確認ダイアログ（トースト風）
    showConfirmDialog('ログアウトしますか？', () => {
        AUTH_LEVEL = 0;
        
        // リアルタイム購読を解除
        if (REALTIME_SUBSCRIPTION) {
            REALTIME_SUBSCRIPTION.unsubscribe();
            REALTIME_SUBSCRIPTION = null;
        }
        
        showToast('ログアウトしました');
        console.log('🔓 ログアウト');
        
        // トップ画面に戻る
        window.location.href = '/';
    });
}

// ログイン状態を更新
function updateLoginStatus(role) {
    const statusEl = document.getElementById('login-status');
    const textEl = document.getElementById('login-status-text');
    
    textEl.textContent = `${role}としてログイン中`;
    statusEl.style.display = 'block';
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
// 選手検索機能
// ===================================

// 全角英数字を半角に変換
function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// ひらがな⇔カタカナ変換ヘルパー関数
function toHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, function(match) {
        const chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

function toKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

// テキストの正規化（ひらがな・カタカナの両方で検索できるように）
function normalizeText(text) {
    if (!text) return { original: '', hiragana: '', katakana: '', halfWidth: '' };
    const hiragana = toHiragana(text);
    const katakana = toKatakana(text);
    const halfWidth = toHalfWidth(text);
    return { original: text, hiragana, katakana, halfWidth };
}

window.searchPlayer = function() {
    const searchInput = document.getElementById('player-search');
    const clearBtn = document.getElementById('clear-search-btn');
    const resultCount = document.getElementById('search-result-count');
    const select = document.getElementById('player-select');
    
    const searchQuery = searchInput.value.trim();
    
    console.log('🔍 検索クエリ:', searchQuery);
    console.log('🔍 選手データ数:', ALL_PLAYERS.length);
    
    // デバッグ: 最初の3人の選手データを表示
    if (ALL_PLAYERS.length > 0) {
        console.log('📋 選手データサンプル（最初の3人）:');
        ALL_PLAYERS.slice(0, 3).forEach(p => {
            console.log(`  - ${p.zekken}番: ${p.name} (${p.club || '所属なし'})`);
        });
    }
    
    // クリアボタンの表示/非表示
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    
    // 検索なしの場合は全選手を表示
    if (!searchQuery) {
        select.innerHTML = '<option value="">選手を選択してください</option>';
        ALL_PLAYERS.forEach(player => {
            const option = document.createElement('option');
            option.value = player.zekken;
            option.textContent = `${player.zekken}番: ${player.name}${player.club ? ` (${player.club})` : ''}`;
            select.appendChild(option);
        });
        resultCount.textContent = '';
        return;
    }
    
    // 検索実行（ひらがな⇔カタカナ変換、全角→半角変換対応）
    const normalizedQuery = normalizeText(searchQuery);
    
    console.log('🔧 正規化された検索クエリ:', {
        元: normalizedQuery.original,
        ひらがな: normalizedQuery.hiragana,
        カタカナ: normalizedQuery.katakana,
        半角: normalizedQuery.halfWidth
    });
    
    const filteredPlayers = ALL_PLAYERS.filter(player => {
        // ゼッケン番号で検索（完全一致、全角→半角対応）
        if (player.zekken.toString() === searchQuery || player.zekken.toString() === normalizedQuery.halfWidth) {
            console.log('✅ ゼッケン一致:', player.zekken);
            return true;
        }
        
        // 読み仮名で検索（優先検索、部分一致、ひらがな⇔カタカナ対応）
        if (player.reading) {
            const normalizedReading = normalizeText(player.reading);
            
            // 元の文字列で検索
            if (player.reading.includes(searchQuery)) {
                console.log('✅ 読み仮名一致（完全）:', player.reading, '検索:', searchQuery);
                return true;
            }
            
            // ひらがな変換して検索
            if (normalizedReading.hiragana.includes(normalizedQuery.hiragana) && normalizedQuery.hiragana !== '') {
                console.log('✅ 読み仮名一致（ひらがな）:', player.reading, '検索:', searchQuery);
                return true;
            }
            
            // カタカナ変換して検索
            if (normalizedReading.katakana.includes(normalizedQuery.katakana) && normalizedQuery.katakana !== '') {
                console.log('✅ 読み仮名一致（カタカナ）:', player.reading, '検索:', searchQuery);
                return true;
            }
        }
        
        // 選手名で検索（部分一致、ひらがな⇔カタカナ対応）
        if (player.name) {
            const normalizedName = normalizeText(player.name);
            
            // 元の文字列で検索
            if (player.name.includes(searchQuery)) {
                console.log('✅ 名前一致（完全）:', player.name, '検索:', searchQuery);
                return true;
            }
            
            // ひらがな変換して検索
            if (normalizedName.hiragana.includes(normalizedQuery.hiragana) && normalizedQuery.hiragana !== '') {
                console.log('✅ 名前一致（ひらがな）:', player.name, '検索:', searchQuery);
                return true;
            }
            
            // カタカナ変換して検索
            if (normalizedName.katakana.includes(normalizedQuery.katakana) && normalizedQuery.katakana !== '') {
                console.log('✅ 名前一致（カタカナ）:', player.name, '検索:', searchQuery);
                return true;
            }
            
            // 半角変換して検索
            if (normalizedName.halfWidth.includes(normalizedQuery.halfWidth) && normalizedQuery.halfWidth !== '') {
                console.log('✅ 名前一致（半角）:', player.name, '検索:', searchQuery);
                return true;
            }
            
            // 英語の場合は小文字変換して比較
            const playerNameLower = player.name.toLowerCase();
            const queryLower = searchQuery.toLowerCase();
            if (playerNameLower.includes(queryLower)) {
                console.log('✅ 名前一致（英語）:', player.name, '検索:', searchQuery);
                return true;
            }
        }
        
        // 所属で検索（部分一致、ひらがな⇔カタカナ対応）
        if (player.club) {
            const normalizedClub = normalizeText(player.club);
            
            // 元の文字列で検索
            if (player.club.includes(searchQuery)) {
                console.log('✅ 所属一致（完全）:', player.club, '検索:', searchQuery);
                return true;
            }
            
            // ひらがな変換して検索
            if (normalizedClub.hiragana.includes(normalizedQuery.hiragana) && normalizedQuery.hiragana !== '') {
                console.log('✅ 所属一致（ひらがな）:', player.club, '検索:', searchQuery);
                return true;
            }
            
            // カタカナ変換して検索
            if (normalizedClub.katakana.includes(normalizedQuery.katakana) && normalizedQuery.katakana !== '') {
                console.log('✅ 所属一致（カタカナ）:', player.club, '検索:', searchQuery);
                return true;
            }
            
            // 半角変換して検索
            if (normalizedClub.halfWidth.includes(normalizedQuery.halfWidth) && normalizedQuery.halfWidth !== '') {
                console.log('✅ 所属一致（半角）:', player.club, '検索:', searchQuery);
                return true;
            }
            
            // 英語の場合は小文字変換して比較
            const clubLower = player.club.toLowerCase();
            const queryLower = searchQuery.toLowerCase();
            if (clubLower.includes(queryLower)) {
                console.log('✅ 所属一致（英語）:', player.club, '検索:', searchQuery);
                return true;
            }
        }
        
        return false;
    });
    
    console.log('🔍 検索結果:', filteredPlayers.length, '件');
    
    // 検索結果を表示
    select.innerHTML = '<option value="">選手を選択してください</option>';
    
    if (filteredPlayers.length === 0) {
        resultCount.textContent = '該当する選手が見つかりません';
        resultCount.style.color = '#ff6b6b';
    } else {
        filteredPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player.zekken;
            option.textContent = `${player.zekken}番: ${player.name}${player.club ? ` (${player.club})` : ''}`;
            select.appendChild(option);
        });
        
        resultCount.textContent = `${filteredPlayers.length}件の選手が見つかりました`;
        resultCount.style.color = '#51cf66';
        
        // 1件のみの場合は自動選択
        if (filteredPlayers.length === 1) {
            select.value = filteredPlayers[0].zekken;
        }
    }
}

window.clearSearch = function() {
    const searchInput = document.getElementById('player-search');
    const clearBtn = document.getElementById('clear-search-btn');
    const resultCount = document.getElementById('search-result-count');
    const select = document.getElementById('player-select');
    
    // 検索ボックスをクリア
    searchInput.value = '';
    clearBtn.style.display = 'none';
    resultCount.textContent = '';
    
    // 全選手を表示
    select.innerHTML = '<option value="">選手を選択してください</option>';
    ALL_PLAYERS.forEach(player => {
        const option = document.createElement('option');
        option.value = player.zekken;
        option.textContent = `${player.zekken}番: ${player.name}${player.club ? ` (${player.club})` : ''}`;
        select.appendChild(option);
    });
}

// ===================================
// ゼッケン番号入力モード
// ===================================

// 入力モード切り替え
window.switchInputMode = function(mode) {
    const zekkenMode = document.getElementById('zekken-input-mode');
    const searchMode = document.getElementById('search-input-mode');
    const tabZekken = document.getElementById('tab-zekken');
    const tabSearch = document.getElementById('tab-search');
    
    if (mode === 'zekken') {
        // ゼッケン番号入力モードを表示
        zekkenMode.style.display = 'block';
        searchMode.style.display = 'none';
        
        // タブのスタイル切り替え
        tabZekken.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tabZekken.style.color = 'white';
        tabZekken.style.border = 'none';
        tabZekken.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        
        tabSearch.style.background = 'rgba(255, 255, 255, 0.1)';
        tabSearch.style.color = 'rgba(255, 255, 255, 0.6)';
        tabSearch.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        tabSearch.style.boxShadow = 'none';
        
        // ゼッケン番号入力欄にフォーカス
        setTimeout(() => {
            document.getElementById('zekken-input').focus();
        }, 100);
    } else {
        // 検索モードを表示
        zekkenMode.style.display = 'none';
        searchMode.style.display = 'block';
        
        // タブのスタイル切り替え
        tabSearch.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tabSearch.style.color = 'white';
        tabSearch.style.border = 'none';
        tabSearch.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        
        tabZekken.style.background = 'rgba(255, 255, 255, 0.1)';
        tabZekken.style.color = 'rgba(255, 255, 255, 0.6)';
        tabZekken.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        tabZekken.style.boxShadow = 'none';
        
        // 検索ボックスにフォーカス
        setTimeout(() => {
            document.getElementById('player-search').focus();
        }, 100);
    }
}

// ゼッケン番号入力時の処理
window.onZekkenInput = function() {
    const zekkenInput = document.getElementById('zekken-input');
    const playerInfoDisplay = document.getElementById('player-info-display');
    const playerNameDisplay = document.getElementById('player-name-display');
    const playerClubDisplay = document.getElementById('player-club-display');
    const playerErrorDisplay = document.getElementById('player-error-display');
    
    const zekken = parseInt(zekkenInput.value);
    
    // 入力がない場合は何も表示しない
    if (!zekken || isNaN(zekken)) {
        playerInfoDisplay.style.display = 'none';
        playerErrorDisplay.style.display = 'none';
        return;
    }
    
    // 選手を検索
    const player = ALL_PLAYERS.find(p => p.zekken === zekken);
    
    if (player) {
        // 選手が見つかった場合
        playerInfoDisplay.style.display = 'block';
        playerErrorDisplay.style.display = 'none';
        
        playerNameDisplay.textContent = `${player.zekken}番: ${player.name}`;
        playerClubDisplay.textContent = player.club ? `所属: ${player.club}` : '所属なし';
        
        console.log('✅ 選手が見つかりました:', player);
    } else {
        // 選手が見つからない場合
        playerInfoDisplay.style.display = 'none';
        playerErrorDisplay.style.display = 'block';
        
        console.log('❌ 選手が見つかりません:', zekken);
    }
}

// ===================================
// 釣果登録
// ===================================
window.registerCatch = async function() {
    if (AUTH_LEVEL === 0) {
        showToast('ログインが必要です', true);
        return;
    }
    
    // 現在の入力モードを確認
    const isZekkenMode = document.getElementById('zekken-input-mode').style.display !== 'none';
    
    let zekken;
    if (isZekkenMode) {
        // ゼッケン番号入力モード
        zekken = parseInt(document.getElementById('zekken-input').value);
    } else {
        // 検索モード
        zekken = parseInt(document.getElementById('player-select').value);
    }
    
    const length = parseFloat(document.getElementById('length-input').value);
    const weight = parseFloat(document.getElementById('weight-input').value) || 0;
    
    console.log('📝 登録データ:', { zekken, length, weight, mode: isZekkenMode ? 'ゼッケン' : '検索' });
    
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
    if (!player) {
        showToast('選手が見つかりません', true);
        return;
    }
    const playerName = player.name;
    
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
    if (isZekkenMode) {
        document.getElementById('zekken-input').value = '';
        document.getElementById('player-info-display').style.display = 'none';
        document.getElementById('player-error-display').style.display = 'none';
        // ゼッケン番号入力欄にフォーカス
        document.getElementById('zekken-input').focus();
    } else {
        document.getElementById('player-select').value = '';
    }
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
    console.log('👥 ALL_PLAYERS:', ALL_PLAYERS);
    
    // 選手名マップを作成
    const playerMap = {};
    ALL_PLAYERS.forEach(p => {
        playerMap[p.zekken] = p.name;
    });
    console.log('🗺️ playerMap:', playerMap);
    
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
        const date = new Date(item.created_at).toLocaleString('ja-JP', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="history-item" style="
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 4px solid #667eea;
            ">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <strong style="font-size: 18px;">${item.zekken}番</strong>
                        <span style="font-size: 16px;">${playerName}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${item.length}cm</span>
                        ${item.weight > 0 ? `<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${item.weight}g</span>` : ''}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${date}</div>
                </div>
                ${AUTH_LEVEL === 2 ? `
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${item.id}, ${item.zekken}, ${item.length}, ${item.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${item.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 釣果編集
window.editCatch = async function(catchId, zekken, currentLength, currentWeight) {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const player = ALL_PLAYERS.find(p => p.zekken === zekken);
    const playerName = player ? player.name : `${zekken}番`;
    
    // カスタムダイアログを表示
    showEditCatchDialog(catchId, zekken, playerName, currentLength, currentWeight);
}

// 釣果編集ダイアログを表示
function showEditCatchDialog(catchId, zekken, playerName, currentLength, currentWeight) {
    const dialogHtml = `
        <div id="edit-catch-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            ">
                <h2 style="margin-bottom: 20px; color: white; font-size: 24px; text-align: center;">
                    ✏️ 釣果編集
                </h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: white;">${zekken}番: ${playerName}</div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">長寸 (cm) <span style="color: #ff6b6b;">*</span></label>
                        <input type="number" id="edit-length-input" value="${currentLength}" step="0.1" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div>
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">重量 (g)</label>
                        <input type="number" id="edit-weight-input" value="${currentWeight || ''}" placeholder="任意" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="edit-catch-cancel-btn" style="
                        padding: 12px 30px;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.5);
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    ">キャンセル</button>
                    
                    <button id="edit-catch-save-btn" style="
                        padding: 12px 40px;
                        background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    ">✅ 保存</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHtml);
    
    const dialog = document.getElementById('edit-catch-dialog');
    const lengthInput = document.getElementById('edit-length-input');
    const weightInput = document.getElementById('edit-weight-input');
    const cancelBtn = document.getElementById('edit-catch-cancel-btn');
    const saveBtn = document.getElementById('edit-catch-save-btn');
    
    // キャンセルボタン
    cancelBtn.onclick = () => {
        dialog.remove();
    };
    
    // 保存ボタン
    saveBtn.onclick = async () => {
        const newLength = parseFloat(lengthInput.value);
        const newWeight = parseFloat(weightInput.value) || 0;
        
        if (!newLength || newLength <= 0) {
            showToast('長寸を入力してください', true);
            return;
        }
        
        dialog.remove();
        
        // データベース更新
        const { error } = await client
            .from('catches')
            .update({
                length: newLength,
                weight: newWeight
            })
            .eq('id', catchId);
        
        if (error) {
            console.error('❌ 更新エラー:', error);
            showToast('❌ 更新に失敗しました', true);
            return;
        }
        
        showToast(`✅ ${playerName}の釣果を更新しました`);
        await loadHistory();
        await loadRanking();
    };
    
    // Enterキーで保存
    lengthInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveBtn.click();
    });
    weightInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveBtn.click();
    });
    
    // 背景クリックで閉じる
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
    
    // 初期フォーカス
    lengthInput.focus();
    lengthInput.select();
}

window.deleteCatch = async function(id) {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    if (!confirm('この記録を削除しますか？\n削除すると順位表も更新されます。')) return;
    
    const { error } = await client
        .from('catches')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('❌ 削除エラー:', error);
        showToast('❌ 削除に失敗しました', true);
        return;
    }
    
    showToast('✅ 削除しました');
    await loadHistory();
    await loadRanking();
}

// ===================================
// ランキング読み込み
// ===================================
async function loadRanking() {
    console.log('🏆 ランキング計算開始');
    console.log('📋 現在のCONFIG:', CONFIG);
    console.log('📊 リミット匹数:', CONFIG.limit_count);
    console.log('🎯 大会ルール:', CONFIG.rule_type);
    
    // 順位非表示設定を確認（データベースから）
    const isRankingHidden = CONFIG.hide_ranking === true;
    console.log('🔒 順位非表示設定:', isRankingHidden, '(CONFIG.hide_ranking:', CONFIG.hide_ranking, ')');
    
    // 管理者以外で順位が非表示の場合
    if (isRankingHidden && AUTH_LEVEL < 2) {
        console.log('🚫 順位は非表示に設定されています（管理者以外）');
        document.getElementById('ranking-list').style.display = 'none';
        document.getElementById('ranking-hidden-message').style.display = 'block';
        document.getElementById('show-more-btn').style.display = 'none';
        
        // 特別賞も非表示
        document.getElementById('biggest-fish-list').innerHTML = '<div class="empty-state">順位発表までお待ちください</div>';
        document.getElementById('smallest-fish-list').innerHTML = '<div class="empty-state">順位発表までお待ちください</div>';
        return;
    }
    
    // 管理者または順位が表示される場合
    document.getElementById('ranking-list').style.display = 'block';
    document.getElementById('ranking-hidden-message').style.display = 'none';
    
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
        document.getElementById('biggest-fish-list').innerHTML = '<div class="empty-state">まだ釣果がありません</div>';
        document.getElementById('smallest-fish-list').innerHTML = '<div class="empty-state">まだ釣果がありません</div>';
        return;
    }
    
    // 選手データをマップ化
    const playerMap = {};
    ALL_PLAYERS.forEach(p => {
        playerMap[p.zekken] = p;
    });
    
    // 選手ごとに集計
    const stats = {};
    catches.forEach(c => {
        if (!stats[c.zekken]) {
            stats[c.zekken] = {
                zekken: c.zekken,
                lengths: [],
                weights: [],
                min_len: c.length,
                max_len: c.length,
                min_weight: c.weight || 0,
                max_weight: c.weight || 0
            };
        }
        stats[c.zekken].lengths.push(c.length);
        stats[c.zekken].weights.push(c.weight || 0);
        stats[c.zekken].min_len = Math.min(stats[c.zekken].min_len, c.length);
        stats[c.zekken].max_len = Math.max(stats[c.zekken].max_len, c.length);
        stats[c.zekken].min_weight = Math.min(stats[c.zekken].min_weight, c.weight || 0);
        stats[c.zekken].max_weight = Math.max(stats[c.zekken].max_weight, c.weight || 0);
    });
    
    // ランキング配列に変換
    const ranking = Object.values(stats).map(s => {
        const sortedLengths = [...s.lengths].sort((a, b) => b - a);
        const sortedWeights = [...s.weights].sort((a, b) => b - a);
        const limitCount = CONFIG.limit_count || 999;
        
        console.log(`📊 選手${s.zekken}番の計算:`, {
            全釣果数: s.lengths.length,
            リミット匹数: limitCount,
            全長寸: sortedLengths,
            リミット長寸: sortedLengths.slice(0, limitCount)
        });
        
        const limitWeight = sortedWeights.slice(0, limitCount).reduce((sum, w) => sum + w, 0);
        const limitTotalLen = sortedLengths.slice(0, limitCount).reduce((sum, l) => sum + l, 0);
        
        return {
            zekken: s.zekken,
            count: s.lengths.length,
            max_len: s.max_len,
            min_len: s.min_len,
            max_weight: s.max_weight,
            min_weight: s.min_weight,
            one_max_len: s.max_len,
            one_max_weight: s.max_weight,
            total_weight: s.weights.reduce((sum, w) => sum + w, 0),
            total_count: s.lengths.length,
            limit_weight: limitWeight,
            limit_total_len: limitTotalLen
        };
    });
    
    // ソート（rule_typeが主ソート）
    const ruleType = CONFIG.rule_type || 'max_len';
    const sort1 = CONFIG.sort1 || null;
    const sort2 = CONFIG.sort2 || null;
    const sort3 = CONFIG.sort3 || null;
    
    ranking.sort((a, b) => {
        // 大会ルールで比較
        if (a[ruleType] !== b[ruleType]) return b[ruleType] - a[ruleType];
        // 第1優先
        if (sort1 && a[sort1] !== b[sort1]) return b[sort1] - a[sort1];
        // 第2優先
        if (sort2 && a[sort2] !== b[sort2]) return b[sort2] - a[sort2];
        // 第3優先
        if (sort3 && a[sort3] !== b[sort3]) return b[sort3] - a[sort3];
        return 0;
    });
    
    // グローバルに保存
    FULL_RANKING = ranking;
    
    console.log('✅ ランキング計算完了:', ranking.length, '人');
    
    // 大物賞を表示（1匹最大長寸順位、同人物除外、3位まで）
    const showBiggestFish = document.getElementById('show-biggest-fish')?.checked ?? true;
    if (showBiggestFish) {
        document.querySelector('.prize-grid')?.style.setProperty('display', 'grid');
        renderBiggestFish(ranking, playerMap);
    } else {
        document.getElementById('biggest-fish-list').closest('.card').style.display = 'none';
    }
    
    // 最小寸賞を表示（1匹最小長寸順位、同人物除外、3位まで）
    const showSmallestFish = document.getElementById('show-smallest-fish')?.checked ?? true;
    if (showSmallestFish) {
        document.querySelector('.prize-grid')?.style.setProperty('display', 'grid');
        renderSmallestFish(ranking, playerMap);
    } else {
        document.getElementById('smallest-fish-list').closest('.card').style.display = 'none';
    }
    
    // どちらも非表示の場合は prize-grid を非表示
    if (!showBiggestFish && !showSmallestFish) {
        document.querySelector('.prize-grid')?.style.setProperty('display', 'none');
    }
    
    // 大会順位を表示（初期10位まで）
    renderMainRanking(ranking, playerMap);
}

// 大物賞を表示
function renderBiggestFish(ranking, playerMap) {
    const card = document.getElementById('biggest-fish-list').closest('.card');
    card.style.display = 'block';
    
    const biggestRanking = [...ranking].sort((a, b) => {
        // 長寸が同じ場合は重量が重い方が上位
        if (b.max_len === a.max_len) {
            return b.max_weight - a.max_weight;
        }
        return b.max_len - a.max_len;
    });
    const displayedZekkens = new Set();
    const top3 = [];
    
    for (const r of biggestRanking) {
        if (!displayedZekkens.has(r.zekken)) {
            top3.push(r);
            displayedZekkens.add(r.zekken);
            if (top3.length === 3) break;
        }
    }
    
    const container = document.getElementById('biggest-fish-list');
    container.innerHTML = top3.map((r, index) => {
        const player = playerMap[r.zekken] || {};
        const playerName = player.name || '未登録';
        const playerClub = player.club || '';
        
        return `
            <div class="ranking-item ${index === 0 ? 'top3' : ''}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${index + 1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${r.zekken}番: ${playerName}</div>
                        ${playerClub ? `<div style="font-size: 10px; opacity: 0.8;">${playerClub}</div>` : ''}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${r.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 最小寸賞を表示
function renderSmallestFish(ranking, playerMap) {
    const card = document.getElementById('smallest-fish-list').closest('.card');
    card.style.display = 'block';
    
    const smallestRanking = [...ranking].sort((a, b) => {
        // 長寸が同じ場合は重量が軽い方が上位
        if (a.min_len === b.min_len) {
            return a.min_weight - b.min_weight;
        }
        return a.min_len - b.min_len;
    });
    const displayedZekkens = new Set();
    const top3 = [];
    
    for (const r of smallestRanking) {
        if (!displayedZekkens.has(r.zekken)) {
            top3.push(r);
            displayedZekkens.add(r.zekken);
            if (top3.length === 3) break;
        }
    }
    
    const container = document.getElementById('smallest-fish-list');
    container.innerHTML = top3.map((r, index) => {
        const player = playerMap[r.zekken] || {};
        const playerName = player.name || '未登録';
        const playerClub = player.club || '';
        
        return `
            <div class="ranking-item ${index === 0 ? 'top3' : ''}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${index + 1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${r.zekken}番: ${playerName}</div>
                        ${playerClub ? `<div style="font-size: 10px; opacity: 0.8;">${playerClub}</div>` : ''}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${r.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 大会順位を表示
function renderMainRanking(ranking, playerMap) {
    const ruleType = CONFIG.rule_type || 'max_len';
    const sort1 = CONFIG.sort1 || null;
    const sort2 = CONFIG.sort2 || null;
    const limitCount = CONFIG.limit_count || 0;
    
    // 初期表示件数
    const displayCount = Math.min(RANKING_DISPLAY_COUNT, ranking.length);
    const displayRanking = ranking.slice(0, displayCount);
    
    const container = document.getElementById('ranking-list');
    container.innerHTML = displayRanking.map((r, index) => {
        const isTop3 = index < 3;
        const player = playerMap[r.zekken] || {};
        const playerName = player.name || '未登録';
        const playerClub = player.club || '';
        
        // ルールのラベルにリミット匹数を追加
        let ruleLabel = SORT_OPTIONS[ruleType];
        if ((ruleType === 'limit_total_len' || ruleType === 'limit_weight') && limitCount > 0) {
            ruleLabel += ` (${limitCount}匹)`;
        }
        
        // 表示する値を決定
        const ruleValue = formatValue(ruleType, r[ruleType]);
        const sort1Value = sort1 ? formatValue(sort1, r[sort1]) : null;
        const sort2Value = sort2 ? formatValue(sort2, r[sort2]) : null;
        
        return `
            <div class="ranking-item ${isTop3 ? 'top3' : ''}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${index + 1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${r.zekken}番: ${playerName}</div>
                        ${playerClub ? `<div style="font-size: 14px; opacity: 0.8;">${playerClub}</div>` : ''}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${ruleLabel}</div>
                        <div class="stat-value" style="color: #FFD700;">${ruleValue}</div>
                    </div>
                    ${sort1Value ? `
                    <div class="stat">
                        <div class="stat-label">${SORT_OPTIONS[sort1]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${sort1Value}</div>
                    </div>
                    ` : ''}
                    ${sort2Value ? `
                    <div class="stat">
                        <div class="stat-label">${SORT_OPTIONS[sort2]}</div>
                        <div class="stat-value" style="color: #2196F3;">${sort2Value}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // 「続きを見る」ボタンの表示/非表示
    const showMoreBtn = document.getElementById('show-more-btn');
    if (ranking.length > RANKING_DISPLAY_COUNT) {
        showMoreBtn.style.display = 'block';
    } else {
        showMoreBtn.style.display = 'none';
    }
}

// 続きを見る
window.showMoreRankings = function() {
    RANKING_DISPLAY_COUNT += 10;
    
    const playerMap = {};
    ALL_PLAYERS.forEach(p => {
        playerMap[p.zekken] = p;
    });
    
    renderMainRanking(FULL_RANKING, playerMap);
    showToast('10件追加表示しました');
}

// 値のフォーマット
function formatValue(key, value) {
    if (key.includes('len')) {
        return `${value.toFixed(1)}cm`;
    } else if (key.includes('weight')) {
        return `${Math.round(value)}g`;
    } else if (key === 'total_count') {
        return `${value}枚`;
    }
    return value;
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
    
    console.log('📝 編集前の選手情報:', player);
    
    // カスタムダイアログを表示
    showEditPlayerDialog(player, async (updatedData) => {
        if (!updatedData) return; // キャンセル
        
        console.log('📝 更新データ:', updatedData);
        console.log('📝 更新条件:', { tournament_id: CURRENT_TOURNAMENT_ID, zekken: zekken });
        
        const { data, error } = await client
            .from('players')
            .update({
                name: updatedData.name,
                club: updatedData.club,
                reading: updatedData.reading
            })
            .eq('tournament_id', CURRENT_TOURNAMENT_ID)
            .eq('zekken', zekken)
            .select();
        
        if (error) {
            console.error('❌ 選手編集エラー:', error);
            console.error('❌ エラー詳細:', JSON.stringify(error, null, 2));
            showToast(`❌ 編集に失敗しました: ${error.message || error.code || '不明なエラー'}`, true);
            return;
        }
        
        if (!data || data.length === 0) {
            console.error('❌ 更新対象が見つかりませんでした');
            showToast('❌ 更新対象が見つかりませんでした', true);
            return;
        }
        
        console.log('✅ 更新後のデータ:', data);
        showToast('✅ 選手情報を更新しました');
        
        // データを再読み込み
        await loadPlayers();
        await loadPlayerList();
        
        console.log('✅ 再読み込み後のALL_PLAYERS:', ALL_PLAYERS.find(p => p.zekken === zekken));
    });
}

// カスタム編集ダイアログを表示
function showEditPlayerDialog(player, callback) {
    // ダイアログHTML
    const dialogHtml = `
        <div id="edit-player-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            ">
                <h2 style="margin-bottom: 20px; color: white; font-size: 24px; text-align: center;">
                    📝 ${player.zekken}番 選手編集
                </h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">名前 <span style="color: #ff6b6b;">*</span></label>
                        <input type="text" id="edit-name-input" value="${player.name}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">読み仮名（ひらがな）</label>
                        <input type="text" id="edit-reading-input" value="${player.reading || ''}" placeholder="例: やまだたろう" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div>
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">所属</label>
                        <input type="text" id="edit-club-input" value="${player.club || ''}" placeholder="例: Aチーム" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            background: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="edit-cancel-btn" style="
                        padding: 12px 30px;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.5);
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    ">キャンセル</button>
                    
                    <button id="edit-ok-btn" style="
                        padding: 12px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    ">✅ 保存</button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #edit-cancel-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            
            #edit-ok-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
        </style>
    `;
    
    // ダイアログを追加
    document.body.insertAdjacentHTML('beforeend', dialogHtml);
    
    const dialog = document.getElementById('edit-player-dialog');
    const nameInput = document.getElementById('edit-name-input');
    const readingInput = document.getElementById('edit-reading-input');
    const clubInput = document.getElementById('edit-club-input');
    const cancelBtn = document.getElementById('edit-cancel-btn');
    const okBtn = document.getElementById('edit-ok-btn');
    
    // キャンセルボタン
    cancelBtn.onclick = () => {
        dialog.remove();
        callback(null);
    };
    
    // 保存ボタン
    okBtn.onclick = () => {
        const newName = nameInput.value.trim();
        const newReading = readingInput.value.trim();
        const newClub = clubInput.value.trim();
        
        if (!newName) {
            showToast('名前は必須です', true);
            return;
        }
        
        dialog.remove();
        callback({
            name: newName,
            reading: newReading,
            club: newClub
        });
    };
    
    // Enterキーで保存
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') okBtn.click();
    });
    readingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') okBtn.click();
    });
    clubInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') okBtn.click();
    });
    
    // 背景クリックで閉じる
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
            callback(null);
        }
    });
    
    // 初期フォーカス
    nameInput.focus();
    nameInput.select();
}

window.addPlayer = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const zekken = parseInt(document.getElementById('new-zekken').value);
    const name = document.getElementById('new-name').value.trim();
    const club = document.getElementById('new-club').value.trim();
    const reading = document.getElementById('new-reading').value.trim();
    
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
            club: club || '',
            reading: reading || ''
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
    document.getElementById('new-reading').value = '';
    document.getElementById('zekken-warning').style.display = 'none';
    document.getElementById('add-player-btn').disabled = false;
    
    await loadPlayers();
    await loadPlayerList();
}

// ===================================
// CSVインポート機能
// ===================================

let CSV_DATA = []; // パース済みCSVデータ

// CSVファイル選択時の処理
window.handleCSVFile = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📂 CSVファイル選択:', file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
}

// CSVをパースする
function parseCSV(text) {
    try {
        console.log('📊 CSVパース開始');
        
        // 行に分割（改行コードに対応）
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
            showToast('❌ CSVファイルが空です', true);
            return;
        }
        
        // ヘッダー行を取得
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim());
        
        console.log('📋 ヘッダー:', headers);
        
        // ヘッダー検証
        const requiredHeaders = ['ゼッケン番号', '名前'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            showToast(`❌ 必須列が不足: ${missingHeaders.join(', ')}`, true);
            return;
        }
        
        // データ行をパース
        const data = [];
        const errors = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const values = line.split(',').map(v => v.trim());
            
            if (values.length !== headers.length) {
                errors.push(`${i + 1}行目: 列数が一致しません`);
                continue;
            }
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            
            // バリデーション
            const zekken = parseInt(row['ゼッケン番号']);
            const name = row['名前'];
            
            if (!zekken || isNaN(zekken) || zekken <= 0) {
                errors.push(`${i + 1}行目: ゼッケン番号が不正です (${row['ゼッケン番号']})`);
                continue;
            }
            
            if (!name || name.trim() === '') {
                errors.push(`${i + 1}行目: 名前が空です`);
                continue;
            }
            
            // 重複チェック
            const isDuplicate = data.some(d => d.zekken === zekken);
            if (isDuplicate) {
                errors.push(`${i + 1}行目: ゼッケン番号 ${zekken} が重複しています`);
                continue;
            }
            
            // 既存選手との重複チェック
            const existingPlayer = ALL_PLAYERS.find(p => p.zekken === zekken);
            if (existingPlayer) {
                errors.push(`${i + 1}行目: ゼッケン番号 ${zekken} は既に登録されています (${existingPlayer.name})`);
                continue;
            }
            
            data.push({
                zekken: zekken,
                name: name,
                reading: row['読み仮名'] || '',
                club: row['所属'] || ''
            });
        }
        
        console.log('✅ パース完了:', data.length, '件');
        console.log('❌ エラー:', errors.length, '件');
        
        if (errors.length > 0) {
            console.error('エラー詳細:', errors);
            showToast(`⚠️ ${errors.length}件のエラーがあります`, true);
            
            // エラー詳細を表示
            const errorMsg = errors.slice(0, 5).join('\n');
            alert(`CSVインポートエラー:\n\n${errorMsg}${errors.length > 5 ? `\n\n...他${errors.length - 5}件` : ''}`);
        }
        
        if (data.length === 0) {
            showToast('❌ インポート可能なデータがありません', true);
            return;
        }
        
        // データを保存してプレビュー表示
        CSV_DATA = data;
        showCSVPreview(data, errors);
        
    } catch (error) {
        console.error('❌ CSVパースエラー:', error);
        showToast('❌ CSVファイルの読み込みに失敗しました', true);
    }
}

// CSVプレビューを表示
function showCSVPreview(data, errors) {
    const preview = document.getElementById('csv-preview');
    const content = document.getElementById('csv-preview-content');
    
    let html = `
        <div style="margin-bottom: 15px;">
            <strong style="color: #51cf66;">✅ インポート可能: ${data.length}件</strong>
            ${errors.length > 0 ? `<br><strong style="color: #ff6b6b;">❌ エラー: ${errors.length}件</strong>` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: rgba(255, 255, 255, 0.1);">
                    <th style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">ゼッケン</th>
                    <th style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">名前</th>
                    <th style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">読み仮名</th>
                    <th style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">所属</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(row => {
        html += `
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${row.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${row.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${row.reading || '-'}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${row.club || '-'}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    content.innerHTML = html;
    preview.style.display = 'block';
    
    console.log('👁️ プレビュー表示');
}

// CSVインポート実行
window.importCSV = async function() {
    if (CSV_DATA.length === 0) {
        showToast('❌ インポートするデータがありません', true);
        return;
    }
    
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    console.log('🚀 CSVインポート開始:', CSV_DATA.length, '件');
    
    try {
        // 一括登録
        const players = CSV_DATA.map(row => ({
            tournament_id: CURRENT_TOURNAMENT_ID,
            zekken: row.zekken,
            name: row.name,
            reading: row.reading,
            club: row.club
        }));
        
        const { data, error } = await client
            .from('players')
            .insert(players)
            .select();
        
        if (error) {
            console.error('❌ インポートエラー:', error);
            showToast(`❌ インポートに失敗しました: ${error.message}`, true);
            return;
        }
        
        console.log('✅ インポート成功:', data.length, '件');
        showToast(`✅ ${data.length}件の選手を登録しました！`);
        
        // リセット
        CSV_DATA = [];
        document.getElementById('csv-preview').style.display = 'none';
        document.getElementById('csv-file-input').value = '';
        
        // 選手データを再読み込み
        await loadPlayers();
        await loadPlayerList();
        
    } catch (error) {
        console.error('❌ インポート例外:', error);
        showToast('❌ インポートに失敗しました', true);
    }
}

// CSVインポートをキャンセル
window.cancelCSVImport = function() {
    CSV_DATA = [];
    document.getElementById('csv-preview').style.display = 'none';
    document.getElementById('csv-file-input').value = '';
    showToast('インポートをキャンセルしました');
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
        showToast('❌ 削除に失敗しました', true);
        return;
    }
    
    showToast('✅ 削除しました');
    await loadPlayers();
    await loadPlayerList();
}

// ===================================
// 大会ルール設定
// ===================================

// ソート選択肢の定義
const SORT_OPTIONS = {
    // 大会ルール用
    'limit_total_len': 'リミット合計長寸',
    'limit_weight': 'リミット合計重量',
    'total_count': '枚数',
    'total_weight': '総重量',
    // 判定順位用
    'one_max_len': '1匹最大長寸',
    'one_max_weight': '1匹最大重量'
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
        warning.style.color = '#ff6b6b';
        warning.style.fontWeight = 'bold';
        warning.style.display = 'block';
        addBtn.disabled = true;
    } else {
        warning.textContent = `✅ ${zekkenNum}番は利用可能です`;
        warning.style.color = '#4CAF50';
        warning.style.fontWeight = 'normal';
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
    
    // 判定順位用の選択肢
    const judgeOptions = {
        'one_max_len': '1匹最大長寸',
        'one_max_weight': '1匹最大重量',
        'limit_total_len': 'リミット合計長寸',
        'limit_weight': 'リミット合計重量',
        'total_count': '枚数',
        'total_weight': '総重量'
    };
    
    // 利用可能なオプションを追加
    for (const [value, label] of Object.entries(judgeOptions)) {
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
    document.getElementById('rule-type').value = CONFIG.rule_type || 'limit_total_len';
    
    // スクロールピッカーの初期化
    initLimitCountPicker(CONFIG.limit_count || 0);
    
    // 特別賞の表示設定を復元（デフォルトはtrue）
    const showBiggestFish = localStorage.getItem(`${CURRENT_TOURNAMENT_ID}_show_biggest_fish`);
    const showSmallestFish = localStorage.getItem(`${CURRENT_TOURNAMENT_ID}_show_smallest_fish`);
    
    CONFIG.show_biggest_fish = showBiggestFish === null ? true : showBiggestFish === 'true';
    CONFIG.show_smallest_fish = showSmallestFish === null ? true : showSmallestFish === 'true';
    
    document.getElementById('show-biggest-fish').checked = CONFIG.show_biggest_fish;
    document.getElementById('show-smallest-fish').checked = CONFIG.show_smallest_fish;
    
    console.log('🏆 特別賞設定:', { show_biggest_fish: CONFIG.show_biggest_fish, show_smallest_fish: CONFIG.show_smallest_fish });
    
    // 順位非表示設定を復元（デフォルトはfalse）
    CONFIG.hide_ranking = CONFIG.hide_ranking === true;
    
    const hideRankingCheckbox = document.getElementById('hide-ranking');
    if (hideRankingCheckbox) {
        hideRankingCheckbox.checked = CONFIG.hide_ranking;
    }
    
    // 管理者の場合、非表示通知を表示
    if (AUTH_LEVEL === 2) {
        const notice = document.getElementById('ranking-hidden-notice');
        if (notice) {
            notice.style.display = CONFIG.hide_ranking ? 'block' : 'none';
        }
    }
    
    console.log('🔒 順位非表示設定:', CONFIG.hide_ranking);
    
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

// リミット匹数ピッカーの初期化
function initLimitCountPicker(initialValue) {
    const picker = document.getElementById('limit-count-picker');
    const hiddenInput = document.getElementById('limit-count');
    const options = picker.querySelectorAll('.limit-option');
    
    // 初期値を設定
    hiddenInput.value = initialValue;
    
    // 初期スクロール位置を設定
    const initialOption = Array.from(options).find(opt => parseInt(opt.dataset.value) === initialValue);
    if (initialOption) {
        initialOption.scrollIntoView({ block: 'center', behavior: 'auto' });
        updateSelectedOption();
    }
    
    // スクロールイベントで選択状態を更新
    let scrollTimeout;
    picker.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateSelectedOption();
        }, 100);
    });
    
    // オプションクリックで直接スクロール
    options.forEach(option => {
        option.addEventListener('click', function() {
            this.scrollIntoView({ block: 'center', behavior: 'smooth' });
            setTimeout(() => updateSelectedOption(), 300);
        });
    });
    
    function updateSelectedOption() {
        const pickerRect = picker.getBoundingClientRect();
        const centerY = pickerRect.top + pickerRect.height / 2;
        
        let closestOption = null;
        let closestDistance = Infinity;
        
        options.forEach(option => {
            const optionRect = option.getBoundingClientRect();
            const optionCenterY = optionRect.top + optionRect.height / 2;
            const distance = Math.abs(centerY - optionCenterY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestOption = option;
            }
        });
        
        if (closestOption) {
            // すべてのオプションから選択状態を削除
            options.forEach(opt => opt.classList.remove('selected'));
            
            // 最も近いオプションを選択
            closestOption.classList.add('selected');
            hiddenInput.value = closestOption.dataset.value;
            
            console.log('📊 リミット匹数変更:', hiddenInput.value);
        }
    }
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
    
    // 特別賞の表示設定を取得
    const showBiggestFish = document.getElementById('show-biggest-fish').checked;
    const showSmallestFish = document.getElementById('show-smallest-fish').checked;
    
    // 順位非表示設定を取得
    const hideRanking = document.getElementById('hide-ranking').checked;
    
    // localStorageに保存（特別賞のみ）
    localStorage.setItem(`${CURRENT_TOURNAMENT_ID}_show_biggest_fish`, showBiggestFish);
    localStorage.setItem(`${CURRENT_TOURNAMENT_ID}_show_smallest_fish`, showSmallestFish);
    
    console.log('💾 順位非表示設定を保存:', hideRanking);
    
    // バリデーション: 同じ項目が選択されていないかチェック
    const selectedItems = [sort1, sort2, sort3].filter(v => v !== '');
    const uniqueItems = new Set(selectedItems);
    
    if (selectedItems.length !== uniqueItems.size) {
        showToast('判定順位で同じ項目が選択されています', true);
        return;
    }
    
    console.log('💾 設定保存:', { ruleType, limitCount, sort1, sort2, sort3, showBiggestFish, showSmallestFish, hideRanking });
    console.log('💾 更新条件:', { id: CURRENT_TOURNAMENT_ID });
    console.log('💾 更新前のCONFIG.limit_count:', CONFIG.limit_count);
    
    const { data, error } = await client
        .from('tournaments')
        .update({
            rule_type: ruleType,
            limit_count: limitCount,
            sort1: sort1 || null,
            sort2: sort2 || null,
            sort3: sort3 || null,
            hide_ranking: hideRanking
        })
        .eq('id', CURRENT_TOURNAMENT_ID)
        .select();
    
    console.log('💾 UPDATE結果 - data:', data);
    console.log('💾 UPDATE結果 - error:', error);
    
    if (error) {
        console.error('❌ 設定保存エラー:', error);
        console.error('❌ エラー詳細:', JSON.stringify(error, null, 2));
        console.error('❌ エラーコード:', error.code);
        console.error('❌ エラーメッセージ:', error.message);
        alert(`❌ 設定保存エラー: ${error.message}\nコード: ${error.code}\n\n⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。\nCRITICAL_FIX.sqlを実行してください。`);
        showToast(`❌ 設定の保存に失敗しました: ${error.message || error.code || '不明なエラー'}`, true);
        return;
    }
    
    if (!data || data.length === 0) {
        console.error('❌ 更新対象が見つかりませんでした');
        showToast('❌ 更新対象が見つかりませんでした', true);
        return;
    }
    
    console.log('✅ 更新後のデータ:', data);
    
    // 🔥 Supabaseから最新のデータを再取得
    const { data: updatedConfig, error: fetchError } = await client
        .from('tournaments')
        .select('*')
        .eq('id', CURRENT_TOURNAMENT_ID)
        .single();
    
    if (fetchError || !updatedConfig) {
        console.error('❌ 設定再取得エラー:', fetchError);
        showToast('❌ 設定の再取得に失敗しました', true);
        return;
    }
    
    // CONFIGを更新
    CONFIG = updatedConfig;
    CONFIG.show_biggest_fish = showBiggestFish;
    CONFIG.show_smallest_fish = showSmallestFish;
    CONFIG.hide_ranking = hideRanking;
    console.log('✅ 再取得後のCONFIG:', CONFIG);
    
    showToast('✅ 設定を保存しました');
    
    // 大会情報表示を更新
    const limitText = CONFIG.limit_count > 0 ? `リミット${CONFIG.limit_count}匹` : '総力戦';
    document.getElementById('tournament-info').textContent = limitText;
    
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

// ===================================
// カスタム確認ダイアログ
// ===================================
let confirmCallback = null;

function showConfirmDialog(message, callback) {
    confirmCallback = callback;
    document.getElementById('confirm-message').textContent = message;
    const dialog = document.getElementById('confirm-dialog');
    dialog.style.display = 'flex';
}

window.confirmAction = function() {
    const dialog = document.getElementById('confirm-dialog');
    dialog.style.display = 'none';
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
}

window.cancelConfirm = function() {
    const dialog = document.getElementById('confirm-dialog');
    dialog.style.display = 'none';
    confirmCallback = null;
}

console.log('✅ システム準備完了');
// ===================================
// QRコード表示
// ===================================

function initQRCode() {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = ''; // クリア
    
    const currentURL = window.location.origin + window.location.pathname + '?id=' + CURRENT_TOURNAMENT_ID;
    document.getElementById('tournament-url').textContent = currentURL;
    
    new QRCode(qrcodeContainer, {
        text: currentURL,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    console.log('✅ QRコード生成完了');
}

window.copyTournamentURL = function() {
    const url = document.getElementById('tournament-url').textContent;
    navigator.clipboard.writeText(url).then(() => {
        showToast('✅ URLをコピーしました');
    }).catch(err => {
        console.error('コピーエラー:', err);
        showToast('❌ コピーに失敗しました', true);
    });
}

// ===================================
// 大会終了/再開
// ===================================

window.toggleTournamentStatus = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const isEnded = CONFIG.is_ended || false;
    const newStatus = !isEnded;
    const action = newStatus ? '終了' : '再開';
    
    if (!confirm(`大会を${action}しますか？\n${newStatus ? '終了すると釣果の入力ができなくなります。' : '再開すると釣果の入力が可能になります。'}`)) {
        return;
    }
    
    const { error } = await client
        .from('tournaments')
        .update({ is_ended: newStatus })
        .eq('id', CURRENT_TOURNAMENT_ID);
    
    if (error) {
        console.error('❌ 更新エラー:', error);
        showToast(`❌ ${action}に失敗しました`, true);
        return;
    }
    
    CONFIG.is_ended = newStatus;
    updateTournamentStatusDisplay();
    showToast(`✅ 大会を${action}しました`);
    
    // 釣果入力フォームの表示を更新
    updateInputFormVisibility();
}

function updateTournamentStatusDisplay() {
    const isEnded = CONFIG.is_ended || false;
    const statusDisplay = document.getElementById('tournament-status-display');
    const toggleBtn = document.getElementById('toggle-tournament-btn');
    
    if (isEnded) {
        statusDisplay.innerHTML = '🔴 終了';
        statusDisplay.style.background = 'rgba(255, 107, 107, 0.2)';
        statusDisplay.style.borderColor = '#ff6b6b';
        statusDisplay.style.color = '#ff6b6b';
        toggleBtn.innerHTML = '▶️ 大会を再開';
        toggleBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)';
    } else {
        statusDisplay.innerHTML = '🟢 進行中';
        statusDisplay.style.background = 'rgba(81, 207, 102, 0.2)';
        statusDisplay.style.borderColor = '#51cf66';
        statusDisplay.style.color = '#51cf66';
        toggleBtn.innerHTML = '⏸️ 大会を終了';
        toggleBtn.style.background = 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)';
    }
}

function updateInputFormVisibility() {
    const isEnded = CONFIG.is_ended || false;
    const inputForm = document.getElementById('input-form');
    
    if (isEnded && AUTH_LEVEL !== 2) {
        // 大会終了時、管理者以外は入力フォームを非表示
        inputForm.style.display = 'none';
        showToast('⚠️ 大会は終了しました', true);
    }
}

// ===================================
// 大会削除
// ===================================

window.deleteTournament = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    const confirmText = prompt('大会を完全に削除します。\nこの操作は取り消せません。\n\n削除する場合は、大会ID「' + CURRENT_TOURNAMENT_ID + '」を入力してください:');
    
    if (confirmText !== CURRENT_TOURNAMENT_ID) {
        if (confirmText !== null) {
            showToast('❌ 大会IDが一致しません', true);
        }
        return;
    }
    
    try {
        // 釣果を削除
        const { error: catchesError } = await client
            .from('catches')
            .delete()
            .eq('tournament_id', CURRENT_TOURNAMENT_ID);
        
        if (catchesError) throw catchesError;
        
        // 選手を削除
        const { error: playersError } = await client
            .from('players')
            .delete()
            .eq('tournament_id', CURRENT_TOURNAMENT_ID);
        
        if (playersError) throw playersError;
        
        // 大会を削除
        const { error: tournamentError } = await client
            .from('tournaments')
            .delete()
            .eq('id', CURRENT_TOURNAMENT_ID);
        
        if (tournamentError) throw tournamentError;
        
        showToast('✅ 大会を削除しました');
        
        // トップページにリダイレクト
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('❌ 削除エラー:', error);
        showToast('❌ 削除に失敗しました', true);
    }
}

// ===================================
// 結果エクスポート（CSV）
// ===================================
// CSVエクスポート（拡張版）
// ===================================

window.exportResults = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        return;
    }
    
    try {
        // データを取得
        const ranking = FULL_RANKING || [];
        const players = ALL_PLAYERS || [];
        
        if (ranking.length === 0) {
            showToast('❌ エクスポートするデータがありません', true);
            return;
        }
        
        // 全釣果データを取得
        const { data: allCatches, error: catchesError } = await client
            .from('catches')
            .select('*')
            .eq('tournament_id', CURRENT_TOURNAMENT_ID)
            .order('created_at', { ascending: false });
        
        if (catchesError) {
            console.error('釣果取得エラー:', catchesError);
        }
        
        // 特別賞データを取得（3位まで）
        const biggestCatches = await getBiggestCatches(3);
        const smallestCatches = await getSmallestCatches(3);
        
        // CSV生成開始
        let csv = '';
        
        // ===== 大会情報 =====
        csv += '【大会情報】\n';
        csv += `大会名,"${CONFIG.name || '釣り大会'}"\n`;
        csv += `作成日,${new Date().toLocaleDateString('ja-JP')}\n`;
        const ruleTypes = {
            'limit_total_len': 'リミット合計長寸',
            'limit_weight': 'リミット合計重量',
            'total_count': '総枚数',
            'total_weight': '総重量'
        };
        csv += `ルール,"${ruleTypes[CONFIG.rule_type] || 'リミット合計長寸'}"\n`;
        csv += `リミット匹数,${CONFIG.limit_count > 0 ? CONFIG.limit_count + '匹' : '無制限'}\n`;
        csv += '\n';
        
        // ===== 順位表 =====
        csv += '【順位表】\n';
        csv += '順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量\n';
        
        ranking.forEach((r, index) => {
            const player = players.find(p => p.zekken === r.zekken) || {};
            csv += `${index + 1},${r.zekken},"${player.name || '未登録'}","${player.club || ''}",${r.limit_total_len || 0},${r.one_max_len || 0},${r.one_max_weight || 0},${r.total_count || 0},${r.total_weight || 0}\n`;
        });
        csv += '\n';
        
        // ===== 特別賞 =====
        csv += '【特別賞】\n';
        console.log('🏆 特別賞チェック - biggestCatches:', biggestCatches);
        console.log('🏆 特別賞チェック - smallestCatches:', smallestCatches);
        
        // 大物賞（上位3位まで）
        if (biggestCatches.length > 0) {
            csv += '大物賞（長寸上位）\n';
            csv += '順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)\n';
            biggestCatches.forEach((c, index) => {
                const player = players.find(p => p.zekken === c.zekken) || {};
                csv += `${index + 1}位,${c.zekken}番,"${player.name || '未登録'}","${player.club || ''}",${c.length},${c.weight || 0}\n`;
            });
            csv += '\n';
            console.log(`✅ 大物賞を${biggestCatches.length}件追加しました`);
        } else {
            console.log('⚠️ 大物賞データなし');
        }
        
        // 最小寸賞（上位3位まで）
        if (smallestCatches.length > 0) {
            csv += '最小寸賞（長寸下位）\n';
            csv += '順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)\n';
            smallestCatches.forEach((c, index) => {
                const player = players.find(p => p.zekken === c.zekken) || {};
                csv += `${index + 1}位,${c.zekken}番,"${player.name || '未登録'}","${player.club || ''}",${c.length},${c.weight || 0}\n`;
            });
            csv += '\n';
            console.log(`✅ 最小寸賞を${smallestCatches.length}件追加しました`);
        } else {
            console.log('⚠️ 最小寸賞データなし');
        }
        csv += '\n';
        
        // ===== 全釣果データ =====
        if (allCatches && allCatches.length > 0) {
            csv += '【全釣果データ】\n';
            csv += 'ゼッケン番号,名前,所属,長寸(cm),重量(g),登録日時\n';
            
            allCatches.forEach(c => {
                const player = players.find(p => p.zekken === c.zekken) || {};
                const dateStr = new Date(c.created_at).toLocaleString('ja-JP');
                csv += `${c.zekken},"${player.name || '未登録'}","${player.club || ''}",${c.length},${c.weight || 0},"${dateStr}"\n`;
            });
        }
        
        // ファイル名を生成
        const tournamentName = CONFIG.name || 'tournament';
        const date = new Date().toISOString().split('T')[0];
        const filename = `${tournamentName}_完全版_${date}.csv`;
        
        // BOM付きUTF-8でダウンロード
        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        showToast('✅ CSVファイルをダウンロードしました');
        
    } catch (error) {
        console.error('❌ エクスポートエラー:', error);
        showToast('❌ エクスポートに失敗しました', true);
    }
}

// ===================================
// 全角数字の自動変換（入力欄）
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const numberInputIds = ['zekken-number-input', 'length-input', 'weight-input'];
    
    numberInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function(e) {
                const originalValue = e.target.value;
                const convertedValue = toHalfWidth(originalValue);
                if (originalValue !== convertedValue) {
                    e.target.value = convertedValue;
                }
            });
        }
    });
});

// ===================================
// PDF出力機能（日本語対応版）
// ===================================
window.exportPDF = async function() {
    try {
        showToast('📄 PDF生成中...');
        
        // 必要なライブラリが読み込まれているか確認
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            showToast('❌ PDFライブラリが読み込まれていません', true);
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        // データ取得
        const ranking = FULL_RANKING || [];
        const players = ALL_PLAYERS || [];
        
        if (ranking.length === 0) {
            showToast('❌ まだ釣果データがありません', true);
            return;
        }
        
        // ルール情報
        const ruleTypes = {
            'limit_total_len': 'リミット合計長寸',
            'limit_weight': 'リミット合計重量',
            'total_count': '総枚数',
            'total_weight': '総重量'
        };
        const ruleText = ruleTypes[CONFIG.rule_type] || 'リミット合計長寸';
        const limitText = CONFIG.limit_count > 0 ? `(リミット${CONFIG.limit_count}匹)` : '(無制限)';
        
        // HTML要素を動的に作成
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
            color: #333;
        `;
        
        // ヘッダー
        const title = CONFIG.name || '釣り大会';
        const date = new Date().toLocaleDateString('ja-JP');
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #667eea;">${title}</h1>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">作成日: ${date}</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">ルール: ${ruleText} ${limitText}</p>
            </div>
            
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">順位</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">ゼッケン</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">名前</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">所属</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold;">${ruleText}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ranking.map((r, index) => {
                            const player = players.find(p => p.zekken === r.zekken) || {};
                            const ruleValue = formatValue(CONFIG.rule_type, r[CONFIG.rule_type]);
                            const bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
                            
                            return `
                                <tr style="background: ${bgColor};">
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${index + 1}位</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${r.zekken}番</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${player.name || '未登録'}</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${player.club || '-'}</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">${ruleValue}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // 特別賞を追加（3位まで表示）
        const prizesHtml = [];
        
        // 大物賞（上位3位まで）
        const biggestCatches = await getBiggestCatches(3);
        console.log('🏆 PDF大物賞データ:', biggestCatches);
        if (biggestCatches.length > 0) {
            let biggestHtml = `
                <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #667eea; font-size: 16px;">🐟 大物賞（長寸上位）</strong><br>
            `;
            biggestCatches.forEach((c, index) => {
                const player = players.find(p => p.zekken === c.zekken) || {};
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                biggestHtml += `
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${medal} ${index + 1}位: ${player.name || '未登録'} (${c.zekken}番) - 長寸: ${c.length}cm ${c.weight ? `/ 重量: ${c.weight}g` : ''}
                    </div>
                `;
            });
            biggestHtml += `</div>`;
            prizesHtml.push(biggestHtml);
            console.log(`✅ PDF大物賞を${biggestCatches.length}件追加しました`);
        }
        
        // 最小寸賞（上位3位まで）
        const smallestCatches = await getSmallestCatches(3);
        console.log('🏆 PDF最小寸賞データ:', smallestCatches);
        if (smallestCatches.length > 0) {
            let smallestHtml = `
                <div style="background: rgba(255, 183, 77, 0.1); padding: 15px; border-radius: 8px;">
                    <strong style="color: #ff8c00; font-size: 16px;">🎣 最小寸賞（長寸下位）</strong><br>
            `;
            smallestCatches.forEach((c, index) => {
                const player = players.find(p => p.zekken === c.zekken) || {};
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                smallestHtml += `
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${medal} ${index + 1}位: ${player.name || '未登録'} (${c.zekken}番) - 長寸: ${c.length}cm ${c.weight ? `/ 重量: ${c.weight}g` : ''}
                    </div>
                `;
            });
            smallestHtml += `</div>`;
            prizesHtml.push(smallestHtml);
            console.log(`✅ PDF最小寸賞を${smallestCatches.length}件追加しました`);
        }
        
        if (prizesHtml.length > 0) {
            container.innerHTML += `
                <div style="margin-top: 30px;">
                    <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">🏆 特別賞</h2>
                    ${prizesHtml.join('')}
                </div>
            `;
        } else {
            console.log('⚠️ PDF特別賞データがありません');
        }
        
        // 全釣果データを追加
        const { data: allCatches, error: catchesError } = await client
            .from('catches')
            .select('*')
            .eq('tournament_id', CURRENT_TOURNAMENT_ID)
            .order('created_at', { ascending: false });
        
        if (!catchesError && allCatches && allCatches.length > 0) {
            container.innerHTML += `
                <div style="margin-top: 30px; page-break-before: always;">
                    <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">📊 全釣果データ</h2>
                    <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #51cf66; color: white;">
                                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">No.</th>
                                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">ゼッケン</th>
                                    <th style="padding: 10px 8px; text-align: left; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">名前</th>
                                    <th style="padding: 10px 8px; text-align: left; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">所属</th>
                                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">長寸</th>
                                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">重量</th>
                                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold;">登録日時</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allCatches.map((c, index) => {
                                    const player = players.find(p => p.zekken === c.zekken) || {};
                                    const bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
                                    const dateStr = new Date(c.created_at).toLocaleString('ja-JP', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    
                                    return `
                                        <tr style="background: ${bgColor};">
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${index + 1}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${c.zekken}番</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${player.name || '未登録'}</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${player.club || '-'}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #51cf66; font-weight: bold;">${c.length}cm</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #ffd93d; font-weight: bold;">${c.weight || 0}g</td>
                                            <td style="padding: 8px; text-align: center; font-size: 11px; border-bottom: 1px solid #eee; color: #999;">${dateStr}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 10px; text-align: right; font-size: 12px; color: #666;">
                        合計: ${allCatches.length}件の釣果
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(container);
        
        // Canvas化
        const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        // コンテナを削除
        document.body.removeChild(container);
        
        // PDFに変換
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4の幅（mm）
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const doc = new jsPDF({
            orientation: imgHeight > 297 ? 'portrait' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // 画像を追加（複数ページ対応）
        let position = 0;
        const pageHeight = 297; // A4の高さ（mm）
        
        while (position < imgHeight) {
            if (position > 0) {
                doc.addPage();
            }
            doc.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
            position += pageHeight;
        }
        
        // ファイル名生成
        const tournamentName = CONFIG.name || 'tournament';
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${tournamentName}_ranking_${timestamp}.pdf`;
        
        // PDF保存
        doc.save(filename);
        
        showToast('✅ PDFファイルをダウンロードしました');
        
    } catch (error) {
        console.error('❌ PDF生成エラー:', error);
        showToast('❌ PDF生成に失敗しました: ' + error.message, true);
    }
}

// 大物賞データ取得（上位3位まで、重複なし）
async function getBiggestCatches(limit = 3) {
    const { data, error } = await client
        .from('catches')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .order('length', { ascending: false })
        .order('weight', { ascending: false }); // 同寸なら重量が重い方を上位
    
    if (error || !data || data.length === 0) return [];
    
    // 同一人物（同じzekken）の重複を除外
    const uniqueResults = [];
    const seenZekkens = new Set();
    
    for (const catch_ of data) {
        if (!seenZekkens.has(catch_.zekken)) {
            uniqueResults.push(catch_);
            seenZekkens.add(catch_.zekken);
            
            if (uniqueResults.length >= limit) {
                break;
            }
        }
    }
    
    return uniqueResults;
}

// 大物賞データ取得（1位のみ - 後方互換性）
async function getBiggestCatch() {
    const results = await getBiggestCatches(1);
    return results.length > 0 ? results[0] : null;
}

// 最小寸賞データ取得（上位3位まで、重複なし）
async function getSmallestCatches(limit = 3) {
    const { data, error } = await client
        .from('catches')
        .select('*')
        .eq('tournament_id', CURRENT_TOURNAMENT_ID)
        .order('length', { ascending: true })
        .order('weight', { ascending: true }); // 同寸なら重量が軽い方を上位
    
    if (error || !data || data.length === 0) return [];
    
    // 同一人物（同じzekken）の重複を除外
    const uniqueResults = [];
    const seenZekkens = new Set();
    
    for (const catch_ of data) {
        if (!seenZekkens.has(catch_.zekken)) {
            uniqueResults.push(catch_);
            seenZekkens.add(catch_.zekken);
            
            if (uniqueResults.length >= limit) {
                break;
            }
        }
    }
    
    return uniqueResults;
}

// 最小寸賞データ取得（1位のみ - 後方互換性）
async function getSmallestCatch() {
    const results = await getSmallestCatches(1);
    return results.length > 0 ? results[0] : null;
}

// ===================================
// 複数大会管理
// ===================================

// マイ大会一覧を表示
window.showMyTournaments = function() {
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('tournament-list-page').style.display = 'block';
    loadMyTournaments();
}

// トップに戻る
window.backToTop = function() {
    document.getElementById('tournament-list-page').style.display = 'none';
    document.getElementById('top-page').style.display = 'block';
}

// マイ大会を読み込み
async function loadMyTournaments() {
    const myTournaments = JSON.parse(localStorage.getItem('myTournaments') || '[]');
    const container = document.getElementById('my-tournaments-list');
    
    if (myTournaments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ccc;">
                <p style="font-size: 18px; margin-bottom: 10px;">📭 まだ大会がありません</p>
                <p style="font-size: 14px;">「➕ 新規作成」から大会を作成してください</p>
            </div>
        `;
        return;
    }
    
    // 大会データを取得
    const tournaments = [];
    for (const tournamentId of myTournaments) {
        const { data, error } = await client
            .from('tournaments')
            .select('*')
            .eq('id', tournamentId)
            .single();
        
        if (!error && data) {
            // 選手数を取得
            const { data: players, error: playersError } = await client
                .from('players')
                .select('zekken', { count: 'exact' })
                .eq('tournament_id', tournamentId);
            
            // 釣果数を取得
            const { data: catches, error: catchesError } = await client
                .from('catches')
                .select('id', { count: 'exact' })
                .eq('tournament_id', tournamentId);
            
            tournaments.push({
                ...data,
                playerCount: players ? players.length : 0,
                catchCount: catches ? catches.length : 0
            });
        }
    }
    
    // 作成日時の新しい順にソート
    tournaments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = tournaments.map(t => {
        const isEnded = t.is_ended || false;
        const statusBadge = isEnded 
            ? '<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🔴 終了</span>'
            : '<span style="background: rgba(81,207,102,0.2); color: #51cf66; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🟢 進行中</span>';
        
        const createdDate = new Date(t.created_at).toLocaleDateString('ja-JP');
        
        return `
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onclick="enterTournamentById('${t.id}')" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <h3 style="font-size: 18px; margin-bottom: 5px;">${t.name}</h3>
                        <p style="font-size: 13px; color: #ccc;">ID: ${t.id}</p>
                    </div>
                    ${statusBadge}
                </div>
                <div style="display: flex; gap: 20px; font-size: 14px; color: #ccc;">
                    <span>📅 ${createdDate}</span>
                    <span>👥 ${t.playerCount}名</span>
                    <span>🐟 ${t.catchCount}匹</span>
                </div>
            </div>
        `;
    }).join('');
}

// 大会IDで入室
window.enterTournamentById = function(tournamentId) {
    document.getElementById('tournament-id-input').value = tournamentId;
    enterTournament();
}

// 新規大会作成（一覧から）
window.createNewTournament = function() {
    document.getElementById('tournament-list-page').style.display = 'none';
    document.getElementById('top-page').style.display = 'block';
    // 新規作成セクションにフォーカス
    document.getElementById('new-tournament-id').focus();
}

// マイ大会リストに追加
function addToMyTournaments(tournamentId) {
    const myTournaments = JSON.parse(localStorage.getItem('myTournaments') || '[]');
    if (!myTournaments.includes(tournamentId)) {
        myTournaments.push(tournamentId);
        localStorage.setItem('myTournaments', JSON.stringify(myTournaments));
    }
}

// ===================================
// テーマカスタマイズ
// ===================================

// テーマプリセットを適用
window.applyThemePreset = function(element) {
    const primaryColor = element.dataset.primary;
    const secondaryColor = element.dataset.secondary;
    
    // カラーピッカーと入力欄を更新
    document.getElementById('primary-color').value = primaryColor;
    document.getElementById('primary-color-text').value = primaryColor;
    document.getElementById('secondary-color').value = secondaryColor;
    document.getElementById('secondary-color-text').value = secondaryColor;
    
    // CSS変数を即座に更新（プレビュー）
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    // 選択状態を視覚的に表示
    document.querySelectorAll('.theme-preset').forEach(preset => {
        preset.style.border = '2px solid transparent';
        preset.style.transform = 'scale(1)';
    });
    element.style.border = '2px solid white';
    element.style.transform = 'scale(1.05)';
}

// テーマを読み込み
function loadTheme() {
    const theme = JSON.parse(localStorage.getItem('customTheme') || '{}');
    
    if (theme.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        const primaryColorEl = document.getElementById('primary-color');
        const primaryColorTextEl = document.getElementById('primary-color-text');
        if (primaryColorEl) primaryColorEl.value = theme.primaryColor;
        if (primaryColorTextEl) primaryColorTextEl.value = theme.primaryColor;
    }
    
    if (theme.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        const secondaryColorEl = document.getElementById('secondary-color');
        const secondaryColorTextEl = document.getElementById('secondary-color-text');
        if (secondaryColorEl) secondaryColorEl.value = theme.secondaryColor;
        if (secondaryColorTextEl) secondaryColorTextEl.value = theme.secondaryColor;
    }
    
    // ロゴは別管理（saveLogo/removeLogoで管理）
    loadLogo();
}

// テーマを保存（色のみ）
window.saveTheme = function() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    
    const theme = {
        primaryColor,
        secondaryColor
    };
    
    localStorage.setItem('customTheme', JSON.stringify(theme));
    
    // CSS変数を更新
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    showToast('✅ テーマを保存しました');
}

// テーマをリセット（色のみ）
window.resetTheme = function() {
    if (!confirm('テーマをデフォルトに戻しますか？')) return;
    
    localStorage.removeItem('customTheme');
    
    document.documentElement.style.setProperty('--primary-color', '#667eea');
    document.documentElement.style.setProperty('--secondary-color', '#764ba2');
    
    document.getElementById('primary-color').value = '#667eea';
    document.getElementById('primary-color-text').value = '#667eea';
    document.getElementById('secondary-color').value = '#764ba2';
    document.getElementById('secondary-color-text').value = '#764ba2';
    
    // プリセットの選択状態をリセット
    document.querySelectorAll('.theme-preset').forEach(preset => {
        preset.style.border = '2px solid transparent';
        preset.style.transform = 'scale(1)';
    });
    
    showToast('✅ テーマをリセットしました');
}

// ===================================
// ロゴ管理（管理者のみ）
// ===================================

let tempLogoData = null; // 一時的なロゴデータ

// ロゴをアップロード
window.handleLogoUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 画像形式チェック
    if (!file.type.startsWith('image/')) {
        showToast('❌ 画像ファイルを選択してください', true);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Canvasで画像を縮小（最大幅200px、高さ80px）
            const maxWidth = 200;
            const maxHeight = 80;
            let width = img.width;
            let height = img.height;
            
            // アスペクト比を保持して縮小
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Base64に変換
            tempLogoData = canvas.toDataURL('image/png', 0.9);
            
            // プレビュー表示
            document.getElementById('logo-preview').style.display = 'block';
            document.getElementById('logo-preview-img').src = tempLogoData;
            
            showToast('✅ ロゴをプレビューしました（「💾 ロゴを保存」をクリックして保存してください）');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ロゴを保存
window.saveLogo = function() {
    if (!tempLogoData && !localStorage.getItem('customLogo')) {
        showToast('⚠️ ロゴがアップロードされていません', true);
        return;
    }
    
    const logoData = tempLogoData || localStorage.getItem('customLogo');
    localStorage.setItem('customLogo', logoData);
    tempLogoData = null;
    
    // ヘッダーのロゴを更新
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.src = logoData;
        logo.classList.add('visible');
    });
    
    showToast('✅ ロゴを保存しました');
}

// ロゴを削除
window.removeLogo = function() {
    if (!confirm('ロゴを削除しますか？')) return;
    
    localStorage.removeItem('customLogo');
    tempLogoData = null;
    
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.src = '';
        logo.classList.remove('visible');
    });
    
    document.getElementById('logo-preview').style.display = 'none';
    document.getElementById('logo-upload').value = '';
    
    showToast('✅ ロゴを削除しました');
}

// ロゴを読み込み
function loadLogo() {
    const logoData = localStorage.getItem('customLogo');
    if (logoData) {
        const logos = document.querySelectorAll('.logo');
        logos.forEach(logo => {
            logo.src = logoData;
            logo.classList.add('visible');
        });
        
        const previewEl = document.getElementById('logo-preview');
        const previewImgEl = document.getElementById('logo-preview-img');
        if (previewEl && previewImgEl) {
            previewEl.style.display = 'block';
            previewImgEl.src = logoData;
        }
    }
}


// カラーピッカーとテキスト入力を同期
document.addEventListener('DOMContentLoaded', function() {
    const primaryColor = document.getElementById('primary-color');
    const primaryColorText = document.getElementById('primary-color-text');
    const secondaryColor = document.getElementById('secondary-color');
    const secondaryColorText = document.getElementById('secondary-color-text');
    
    if (primaryColor && primaryColorText) {
        primaryColor.addEventListener('input', function() {
            primaryColorText.value = this.value;
        });
        primaryColorText.addEventListener('input', function() {
            primaryColor.value = this.value;
        });
    }
    
    if (secondaryColor && secondaryColorText) {
        secondaryColor.addEventListener('input', function() {
            secondaryColorText.value = this.value;
        });
        secondaryColorText.addEventListener('input', function() {
            secondaryColor.value = this.value;
        });
    }
    
    // テーマを読み込み
    loadTheme();
});

// 大会作成時にマイ大会に追加
const originalCreateTournament = window.createTournament;
window.createTournament = async function() {
    const result = await originalCreateTournament();
    if (result !== false) {
        const tournamentId = document.getElementById('new-tournament-id').value.trim();
        addToMyTournaments(tournamentId);
    }
    return result;
}

// ===================================
// 順位表示制御
// ===================================

// 順位表示の切り替え
window.toggleRankingVisibility = async function() {
    if (AUTH_LEVEL !== 2) {
        showToast('管理者権限が必要です', true);
        document.getElementById('hide-ranking').checked = false;
        return;
    }
    
    const hideRanking = document.getElementById('hide-ranking').checked;
    
    console.log('🔒 順位非表示設定を更新:', hideRanking);
    
    // データベースに即座に保存
    const { data, error } = await client
        .from('tournaments')
        .update({ hide_ranking: hideRanking })
        .eq('id', CURRENT_TOURNAMENT_ID)
        .select();
    
    if (error) {
        console.error('❌ 順位非表示設定の保存エラー:', error);
        showToast('❌ 設定の保存に失敗しました', true);
        return;
    }
    
    // CONFIGを更新
    CONFIG.hide_ranking = hideRanking;
    console.log('✅ CONFIG更新:', CONFIG);
    
    // 管理者通知を更新
    const notice = document.getElementById('ranking-hidden-notice');
    if (notice) {
        notice.style.display = hideRanking ? 'block' : 'none';
    }
    
    if (hideRanking) {
        showToast('🔒 順位表を非表示にしました（参加者から見えません）');
        console.log('🔒 順位非表示に設定');
    } else {
        showToast('🔓 順位表を表示に戻しました');
        console.log('🔓 順位表示に設定');
    }
    
    // 順位表を再読み込み（管理者は常に表示、参加者は非表示）
    await loadRanking();
}

console.log('✅ 順位表示制御機能を読み込みました');

// ===================================
// Supabase接続テスト
// ===================================

// Supabase接続をテスト
window.testSupabaseConnection = async function() {
    console.log('🔌 Supabase接続テスト開始...');
    console.log('URL:', supabaseUrl);
    
    try {
        // シンプルなクエリでテスト
        const { data, error } = await client
            .from('tournaments')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ 接続エラー:', error);
            alert(`Supabase接続失敗\n\nエラー: ${error.message}\nコード: ${error.code}\n\nSupabaseダッシュボードで以下を確認:\n1. プロジェクトが一時停止していないか\n2. RLSポリシーが設定されているか\n3. API Keyが正しいか`);
            return false;
        }
        
        console.log('✅ Supabase接続成功');
        alert('✅ Supabase接続成功！\n\nデータベースに正常に接続できました。');
        return true;
        
    } catch (err) {
        console.error('❌ ネットワークエラー:', err);
        alert(`ネットワークエラー\n\n${err.message}\n\n以下を確認してください:\n1. インターネット接続\n2. Supabaseプロジェクトの状態\n3. ファイアウォール設定`);
        return false;
    }
}

console.log('✅ Supabase接続テスト機能を読み込みました');
console.log('💡 ヒント: testSupabaseConnection() を実行して接続をテストできます');
