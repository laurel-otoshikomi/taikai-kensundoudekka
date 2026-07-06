import{createClient as he}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function l(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=l(o);fetch(o.href,i)}})();function be(t,e,l,n,o){return t.sort((i,a)=>i[e]!==a[e]?a[e]-i[e]:l&&i[l]!==a[l]?a[l]-i[l]:n&&i[n]!==a[n]?a[n]-i[n]:o&&i[o]!==a[o]?a[o]-i[o]:0)}function xe(t,e=3){return[...t||[]].sort((l,n)=>n.total_count===l.total_count?n.max_len===l.max_len?n.total_weight-l.total_weight:n.max_len-l.max_len:n.total_count-l.total_count).slice(0,e)}const ee="https://pkjvdtvomqzcnfhkqven.supabase.co",ke="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",w=he(ee,ke);let k=0,d={},x=null,E=[],W=[],X=!0,N=null,K=10,H=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await we(e):ie()});function ie(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",re()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){c("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function re(){const{data:t,error:e}=await w.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),l=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),l.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){l.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}l.innerHTML=t.map(n=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${n.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${n.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${n.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),l=document.getElementById("new-tournament-admin-password").value.trim(),n=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!l){c("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){c("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:o,error:i}=await w.from("tournaments").insert({id:t,name:e,password:l,staff_password:n||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null,hide_ranking:!1}).select();if(i){console.error("❌ 大会作成エラー:",i),console.error("エラー詳細:",{message:i.message,details:i.details,hint:i.hint,code:i.code}),i.code==="23505"?c("❌ この大会IDは既に使用されています",!0):i.message&&i.message.includes("Failed to fetch")?(c("❌ Supabaseへの接続に失敗しました。ネットワークを確認してください。",!0),alert(`Supabase接続エラー

1. Supabaseプロジェクトが一時停止していないか確認
2. ネットワーク接続を確認
3. RLSポリシーが設定されているか確認

URL: ${ee}`)):c(`❌ 大会の作成に失敗しました: ${i.message||"不明なエラー"}`,!0);return}c("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await re(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function we(t){x=t,console.log("📂 大会ID:",x);const{data:e,error:l}=await w.from("tournaments").select("*").eq("id",x).single();if(l||!e){console.error("大会取得エラー:",l),alert("大会が見つかりません"),ie();return}if(d=e,console.log("✅ 大会情報取得:",d),console.log("📋 大会ルール:",d.rule_type),console.log("📊 リミット匹数:",d.limit_count),console.log("🎯 優先順位1:",d.sort1),console.log("🎯 優先順位2:",d.sort2),console.log("🎯 優先順位3:",d.sort3),d.logo){console.log("🖼️ ロゴを読み込み中..."),document.querySelectorAll(".logo").forEach(r=>{r.src=d.logo,r.classList.add("visible")});const i=document.getElementById("logo-preview"),a=document.getElementById("logo-preview-img");i&&a&&(i.style.display="block",a.src=d.logo)}document.getElementById("tournament-name").textContent=d.name;const n=d.limit_count>0?`リミット${d.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=n,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",Y("ranking"),await F(),await T(),Ae(),k===2&&(document.getElementById("tournament-management-card").style.display="block",te()),de(),ve()}function ve(){N&&N.unsubscribe(),N=w.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${x}`},()=>{X&&(console.log("⚡ リアルタイム更新"),T(),k>0&&M())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){X=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");X?(t.style.display="none",c("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",c("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){c("🔄 更新中..."),await T(),k>0&&await M(),c("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((l,n)=>{l.classList.remove("active"),(t==="ranking"&&n===0||t==="input"&&n===1||t==="settings"&&n===2)&&l.classList.add("active")}),document.querySelectorAll(".view").forEach(l=>{l.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),T()):t==="input"?(document.getElementById("input-view").classList.add("active"),k>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",F(),M()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),k===2&&(document.getElementById("rule-settings-card").style.display="block",De()),k>0&&F().then(()=>q())),Y(t)};function Y(t="ranking"){const e=document.getElementById("mode-title"),l=document.getElementById("mode-desc"),n=document.getElementById("operator-login-shortcut"),o=document.getElementById("input-tab"),i=document.getElementById("settings-tab"),a=document.getElementById("csv-export-btn"),r=document.getElementById("pdf-export-btn");if(k===0){e&&l&&(t==="input"?(e.textContent="運営者ログイン",l.textContent="パスワード入力後に検量・設定を操作できます"):t==="settings"?(e.textContent="共有モード",l.textContent="大会URLとQRコードを共有できます"):(e.textContent="観戦モード",l.textContent="参加者向けに順位と特別賞を見やすく表示しています")),n&&(n.style.display="block",n.textContent="運営者ログイン"),o&&(o.textContent="🔐 運営者ログイン"),i&&(i.textContent="📱 共有"),a&&(a.style.display="none"),r&&(r.style.display="none");return}const s=k===2?"管理者モード":"運営者モード";e&&l&&(e.textContent=s,l.textContent=k===2?"検量入力、大会設定、結果出力ができます":"検量入力と登録履歴の確認ができます"),n&&(n.style.display="block",n.textContent=t==="input"?"順位表へ":"検量入力へ",n.onclick=()=>switchTab(t==="input"?"ranking":"input")),o&&(o.textContent="📝 検量入力"),i&&(i.textContent=k===2?"⚙️ 設定":"📱 共有"),a&&(a.style.display=k===2?"block":"none"),r&&(r.style.display=k===2?"block":"none")}window.login=function(){const t=document.getElementById("password-input").value;if(t===d.password)k=2,c("✅ 管理者としてログイン"),ne("管理者");else if(t===d.staff_password)k=1,c("✅ 運営スタッフとしてログイン"),ne("運営スタッフ");else{c("パスワードが違います",!0);return}if(console.log("🔐 ログイン成功 AUTH_LEVEL:",k),Y("input"),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",k>=1&&document.querySelectorAll(".admin-only").forEach(e=>{e.style.display="block"}),k===2){const e=document.getElementById("tournament-management-card");e&&(e.style.display="block",te())}F(),M()};window.logout=function(){Me("ログアウトしますか？",()=>{k=0,N&&(N.unsubscribe(),N=null),c("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function ne(t){const e=document.getElementById("login-status"),l=document.getElementById("login-status-text");l.textContent=`${t}としてログイン中`,e.style.display="block",Y()}async function F(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await w.from("players").select("*").eq("tournament_id",x).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}E=t||[],console.log("✅ 選手データ読み込み完了:",E.length,"人"),E.length>0&&console.log("📋 選手サンプル:",E[0]);const l=document.getElementById("player-select");l.innerHTML='<option value="">選手を選択してください</option>',E.forEach(n=>{const o=document.createElement("option");o.value=n.zekken,o.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,l.appendChild(o)})}function ae(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function Ee(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const l=e.charCodeAt(0)-96;return String.fromCharCode(l)})}function $e(t){return t.replace(/[\u3041-\u3096]/g,function(e){const l=e.charCodeAt(0)+96;return String.fromCharCode(l)})}function j(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=Ee(t),l=$e(t),n=ae(t);return{original:t,hiragana:e,katakana:l,halfWidth:n}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),l=document.getElementById("search-result-count"),n=document.getElementById("player-select"),o=t.value.trim();if(console.log("🔍 検索クエリ:",o),console.log("🔍 選手データ数:",E.length),E.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),E.slice(0,3).forEach(r=>{console.log(`  - ${r.zekken}番: ${r.name} (${r.club||"所属なし"})`)})),e.style.display=o?"block":"none",!o){n.innerHTML='<option value="">選手を選択してください</option>',E.forEach(r=>{const s=document.createElement("option");s.value=r.zekken,s.textContent=`${r.zekken}番: ${r.name}${r.club?` (${r.club})`:""}`,n.appendChild(s)}),l.textContent="";return}const i=j(o);console.log("🔧 正規化された検索クエリ:",{元:i.original,ひらがな:i.hiragana,カタカナ:i.katakana,半角:i.halfWidth});const a=E.filter(r=>{if(r.zekken.toString()===o||r.zekken.toString()===i.halfWidth)return console.log("✅ ゼッケン一致:",r.zekken),!0;if(r.reading){const s=j(r.reading);if(r.reading.includes(o))return console.log("✅ 読み仮名一致（完全）:",r.reading,"検索:",o),!0;if(s.hiragana.includes(i.hiragana)&&i.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",r.reading,"検索:",o),!0;if(s.katakana.includes(i.katakana)&&i.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",r.reading,"検索:",o),!0}if(r.name){const s=j(r.name);if(r.name.includes(o))return console.log("✅ 名前一致（完全）:",r.name,"検索:",o),!0;if(s.hiragana.includes(i.hiragana)&&i.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",r.name,"検索:",o),!0;if(s.katakana.includes(i.katakana)&&i.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",r.name,"検索:",o),!0;if(s.halfWidth.includes(i.halfWidth)&&i.halfWidth!=="")return console.log("✅ 名前一致（半角）:",r.name,"検索:",o),!0;const g=r.name.toLowerCase(),h=o.toLowerCase();if(g.includes(h))return console.log("✅ 名前一致（英語）:",r.name,"検索:",o),!0}if(r.club){const s=j(r.club);if(r.club.includes(o))return console.log("✅ 所属一致（完全）:",r.club,"検索:",o),!0;if(s.hiragana.includes(i.hiragana)&&i.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",r.club,"検索:",o),!0;if(s.katakana.includes(i.katakana)&&i.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",r.club,"検索:",o),!0;if(s.halfWidth.includes(i.halfWidth)&&i.halfWidth!=="")return console.log("✅ 所属一致（半角）:",r.club,"検索:",o),!0;const g=r.club.toLowerCase(),h=o.toLowerCase();if(g.includes(h))return console.log("✅ 所属一致（英語）:",r.club,"検索:",o),!0}return!1});console.log("🔍 検索結果:",a.length,"件"),n.innerHTML='<option value="">選手を選択してください</option>',a.length===0?(l.textContent="該当する選手が見つかりません",l.style.color="#ff6b6b"):(a.forEach(r=>{const s=document.createElement("option");s.value=r.zekken,s.textContent=`${r.zekken}番: ${r.name}${r.club?` (${r.club})`:""}`,n.appendChild(s)}),l.textContent=`${a.length}件の選手が見つかりました`,l.style.color="#51cf66",a.length===1&&(n.value=a[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),l=document.getElementById("search-result-count"),n=document.getElementById("player-select");t.value="",e.style.display="none",l.textContent="",n.innerHTML='<option value="">選手を選択してください</option>',E.forEach(o=>{const i=document.createElement("option");i.value=o.zekken,i.textContent=`${o.zekken}番: ${o.name}${o.club?` (${o.club})`:""}`,n.appendChild(i)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),l=document.getElementById("search-input-mode"),n=document.getElementById("tab-zekken"),o=document.getElementById("tab-search"),i=getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim(),a=getComputedStyle(document.documentElement).getPropertyValue("--secondary-color").trim(),r=getComputedStyle(document.documentElement).getPropertyValue("--heading-color").trim();t==="zekken"?(e.style.display="block",l.style.display="none",n.style.background=`linear-gradient(135deg, ${i} 0%, ${a} 100%)`,n.style.color=r,n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",o.style.background="rgba(255, 255, 255, 0.1)",o.style.color="rgba(255, 255, 255, 0.6)",o.style.border="2px solid rgba(255, 255, 255, 0.2)",o.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",l.style.display="block",o.style.background=`linear-gradient(135deg, ${i} 0%, ${a} 100%)`,o.style.color=r,o.style.border="none",o.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),l=document.getElementById("player-name-display"),n=document.getElementById("player-club-display"),o=document.getElementById("player-error-display"),i=parseInt(t.value);if(!i||isNaN(i)){e.style.display="none",o.style.display="none";return}const a=E.find(r=>r.zekken===i);a?(e.style.display="block",o.style.display="none",l.textContent=`${a.zekken}番: ${a.name}`,n.textContent=a.club?`所属: ${a.club}`:"所属なし",console.log("✅ 選手が見つかりました:",a)):(e.style.display="none",o.style.display="block",console.log("❌ 選手が見つかりません:",i))};window.registerCatch=async function(){if(k===0){c("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const l=parseFloat(document.getElementById("length-input").value),n=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:l,weight:n,mode:t?"ゼッケン":"検索"}),!e){c("選手を選択してください",!0);return}if(!l||l<=0){c("長寸を入力してください",!0);return}const o=E.find(r=>r.zekken==e);if(!o){c("選手が見つかりません",!0);return}const i=o.name,{error:a}=await w.from("catches").insert({tournament_id:x,zekken:e,length:l,weight:n});if(a){console.error("❌ 登録エラー:",a),c("登録に失敗しました",!0);return}console.log("✅ 登録成功"),c(`✅ ${i}: ${l}cm ${n>0?n+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await M(),await T()};async function M(){console.log("📋 履歴読み込み開始"),console.log("👥 ALL_PLAYERS:",E);const t={};E.forEach(o=>{t[o.zekken]=o.name}),console.log("🗺️ playerMap:",t);const{data:e,error:l}=await w.from("catches").select("*").eq("tournament_id",x).order("created_at",{ascending:!1}).limit(50);if(l){console.error("❌ 履歴読み込みエラー:",l);return}W=e||[],console.log("✅ 履歴読み込み完了:",W.length,"件");const n=document.getElementById("history-list");if(W.length===0){n.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}n.innerHTML=W.map(o=>{const i=t[o.zekken]||"未登録",a=new Date(o.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <strong style="font-size: 18px; color: var(--heading-color);">${o.zekken}番</strong>
                        <span style="font-size: 16px; color: var(--heading-color);">${i}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${o.length}cm</span>
                        ${o.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${o.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: var(--heading-color); opacity: 0.7; margin-top: 5px;">🕐 ${a}</div>
                </div>
                ${k>=1?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${o.id}, ${o.zekken}, ${o.length}, ${o.weight})" style="padding: 8px 15px; font-size: 14px; display: flex; align-items: center; gap: 4px; justify-content: center; white-space: nowrap;">
                        <span style="font-size: 16px;">✏️</span>
                        <span>編集</span>
                    </button>
                    <button class="btn btn-danger" onclick="deleteCatch(${o.id})" style="padding: 8px 15px; font-size: 14px; display: flex; align-items: center; gap: 4px; justify-content: center; white-space: nowrap;">
                        <span style="font-size: 16px;">🗑️</span>
                        <span>削除</span>
                    </button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,l,n){if(k<1){c("運営者または管理者権限が必要です",!0);return}const o=E.find(a=>a.zekken===e),i=o?o.name:`${e}番`;Ie(t,e,i,l,n)};function Ie(t,e,l,n,o){const i=`
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
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
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
                    <div style="font-size: 20px; font-weight: bold; color: white;">${e}番: ${l}</div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">長寸 (cm) <span style="color: #ff6b6b;">*</span></label>
                        <input type="number" id="edit-length-input" value="${n}" step="0.1" style="
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
                        <input type="number" id="edit-weight-input" value="${o||""}" placeholder="任意" style="
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
    `;document.body.insertAdjacentHTML("beforeend",i);const a=document.getElementById("edit-catch-dialog"),r=document.getElementById("edit-length-input"),s=document.getElementById("edit-weight-input"),g=document.getElementById("edit-catch-cancel-btn"),h=document.getElementById("edit-catch-save-btn");g.onclick=()=>{a.remove()},h.onclick=async()=>{const y=parseFloat(r.value),m=parseFloat(s.value)||0;if(!y||y<=0){c("長寸を入力してください",!0);return}a.remove();const{error:b}=await w.from("catches").update({length:y,weight:m}).eq("id",t);if(b){console.error("❌ 更新エラー:",b),c("❌ 更新に失敗しました",!0);return}c(`✅ ${l}の釣果を更新しました`),await M(),await T()},r.addEventListener("keypress",y=>{y.key==="Enter"&&h.click()}),s.addEventListener("keypress",y=>{y.key==="Enter"&&h.click()}),a.addEventListener("click",y=>{y.target===a&&a.remove()}),r.focus(),r.select()}window.deleteCatch=async function(t){if(k<1){c("運営者または管理者権限が必要です",!0);return}_e(t)};function _e(t){document.body.insertAdjacentHTML("beforeend",`
        <div id="delete-confirm-dialog" style="
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
            animation: fadeIn 0.2s ease-out;
        ">
            <div style="
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            " onclick="event.stopPropagation()">
                <h2 style="margin-bottom: 20px; color: white; font-size: 24px; text-align: center;">
                    🗑️ 削除確認
                </h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                        この記録を削除しますか？<br>
                        <span style="font-size: 14px; opacity: 0.9; margin-top: 10px; display: block;">削除すると順位表も更新されます。</span>
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="delete-cancel-btn" style="
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
                    
                    <button id="delete-confirm-btn" style="
                        padding: 12px 40px;
                        background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                    ">削除する</button>
                </div>
            </div>
        </div>
    `);const l=document.getElementById("delete-confirm-dialog"),n=document.getElementById("delete-cancel-btn"),o=document.getElementById("delete-confirm-btn");n.onclick=()=>{l.remove()},l.onclick=()=>{l.remove()},o.onclick=async()=>{l.remove();const{error:i}=await w.from("catches").delete().eq("id",t);if(i){console.error("❌ 削除エラー:",i),c("❌ 削除に失敗しました",!0);return}c("✅ 削除しました"),await M(),await T()},n.onmouseenter=()=>{n.style.background="rgba(255, 255, 255, 0.3)",n.style.transform="translateY(-2px)"},n.onmouseleave=()=>{n.style.background="rgba(255, 255, 255, 0.2)",n.style.transform="translateY(0)"},o.onmouseenter=()=>{o.style.transform="translateY(-2px)",o.style.boxShadow="0 6px 20px rgba(255, 107, 107, 0.6)"},o.onmouseleave=()=>{o.style.transform="translateY(0)",o.style.boxShadow="0 4px 15px rgba(255, 107, 107, 0.4)"}}async function T(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",d),console.log("📊 リミット匹数:",d.limit_count),console.log("🎯 大会ルール:",d.rule_type);const t=d.hide_ranking===!0;if(console.log("🔒 順位非表示設定:",t,"(CONFIG.hide_ranking:",d.hide_ranking,")"),t&&k<2){console.log("🚫 順位は非表示に設定されています（管理者以外）"),document.getElementById("ranking-list").style.display="none",document.getElementById("ranking-hidden-message").style.display="block",document.getElementById("show-more-btn").style.display="none",document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>',document.getElementById("total-count-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>';return}document.getElementById("ranking-list").style.display="block",document.getElementById("ranking-hidden-message").style.display="none";const{data:e,error:l}=await w.from("catches").select("*").eq("tournament_id",x);if(l){console.error("❌ ランキング読み込みエラー:",l);return}const n=e||[];if(console.log("📊 釣果データ:",n.length,"件"),oe(n,0),n.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("total-count-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const o={};E.forEach(u=>{o[u.zekken]=u});const i={};n.forEach(u=>{i[u.zekken]||(i[u.zekken]={zekken:u.zekken,lengths:[],weights:[],min_len:u.length,max_len:u.length,min_weight:u.weight||0,max_weight:u.weight||0}),i[u.zekken].lengths.push(u.length),i[u.zekken].weights.push(u.weight||0),i[u.zekken].min_len=Math.min(i[u.zekken].min_len,u.length),i[u.zekken].max_len=Math.max(i[u.zekken].max_len,u.length),i[u.zekken].min_weight=Math.min(i[u.zekken].min_weight,u.weight||0),i[u.zekken].max_weight=Math.max(i[u.zekken].max_weight,u.weight||0)});const a=Object.values(i).map(u=>{const v=[...u.lengths].sort((C,f)=>f-C),I=[...u.weights].sort((C,f)=>f-C),L=d.limit_count||999;console.log(`📊 選手${u.zekken}番の計算:`,{全釣果数:u.lengths.length,リミット匹数:L,全長寸:v,リミット長寸:v.slice(0,L)});const D=I.slice(0,L).reduce((C,f)=>C+f,0),z=v.slice(0,L).reduce((C,f)=>C+f,0);return{zekken:u.zekken,count:u.lengths.length,max_len:u.max_len,min_len:u.min_len,max_weight:u.max_weight,min_weight:u.min_weight,one_max_len:u.max_len,one_max_weight:u.max_weight,total_weight:u.weights.reduce((C,f)=>C+f,0),total_count:u.lengths.length,limit_weight:D,limit_total_len:z}}),r=d.rule_type||"max_len",s=d.sort1||null,g=d.sort2||null,h=d.sort3||null;be(a,r,s,g,h),H=a,oe(n,a.length),console.log("✅ ランキング計算完了:",a.length,"人");const y=document.getElementById("show-biggest-fish")?.checked??!0;y?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),Be(a,o)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const m=document.getElementById("show-smallest-fish")?.checked??!0;m?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ze(a,o)):document.getElementById("smallest-fish-list").closest(".card").style.display="none";const b=document.getElementById("show-total-count")?.checked??!0;b?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),Se(a,o)):document.getElementById("total-count-list").closest(".card").style.display="none",!y&&!m&&!b&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),ce(a,o)}function oe(t,e){const l=document.getElementById("summary-players"),n=document.getElementById("summary-scored-players"),o=document.getElementById("summary-catches"),i=document.getElementById("summary-updated"),a=document.getElementById("summary-rule");if(!l||!n||!o||!i||!a)return;const r=t.reduce((y,m)=>m.created_at?y?new Date(m.created_at)>new Date(y.created_at)?m:y:m:y,null);l.textContent=`${E.length}名`,n.textContent=`${e}名`,o.textContent=`${t.length}枚`,i.textContent=r?Ce(r.created_at):"-";const s=d.rule_type||"limit_total_len",g=U[s]||"リミット合計長寸",h=d.limit_count>0?` / ${d.limit_count}匹リミット`:" / 無制限";a.textContent=`${g}${h}`}function Ce(t){const e=new Date(t);return Number.isNaN(e.getTime())?"-":e.toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function Be(t,e){const l=document.getElementById("biggest-fish-list").closest(".card");l.style.display="block";const n=Z(t),o=[...t].sort((s,g)=>g.max_len===s.max_len?ge(s,g,n):g.max_len-s.max_len),i=new Set,a=[];for(const s of o)if(!i.has(s.zekken)&&(a.push(s),i.add(s.zekken),a.length===3))break;const r=document.getElementById("biggest-fish-list");r.innerHTML=a.map((s,g)=>{const h=e[s.zekken]||{},y=h.name||"未登録",m=h.club||"";let b,u,v,I;return g===0?(b="linear-gradient(135deg, #FFD700, #FFA500)",u="#FFD700",v="#000",I="🥇"):g===1?(b="linear-gradient(135deg, #C0C0C0, #A8A8A8)",u="#C0C0C0",v="#000",I="🥈"):(b="linear-gradient(135deg, #CD7F32, #B87333)",u="#CD7F32",v="#FFF",I="🥉"),`
            <div class="ranking-item" style="
                padding: 12px;
                margin-bottom: 10px;
                background: ${b};
                border: 3px solid ${u};
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <div class="ranking-header">
                    <div style="font-size: 20px; font-weight: bold; color: ${v};">
                        ${I} ${g+1}位
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${v};">${s.zekken}番: ${y}</div>
                        ${m?`<div style="font-size: 12px; opacity: 0.8; color: ${v};">${m}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${v}; opacity: 0.9;">最大長寸</div>
                        <div class="stat-value" style="color: ${v}; font-size: 20px; font-weight: bold;">${s.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function ze(t,e){const l=document.getElementById("smallest-fish-list").closest(".card");l.style.display="block";const n=[...t].sort((r,s)=>r.min_len===s.min_len?r.min_weight-s.min_weight:r.min_len-s.min_len),o=new Set,i=[];for(const r of n)if(!o.has(r.zekken)&&(i.push(r),o.add(r.zekken),i.length===3))break;const a=document.getElementById("smallest-fish-list");a.innerHTML=i.map((r,s)=>{const g=e[r.zekken]||{},h=g.name||"未登録",y=g.club||"";let m,b,u,v;return s===0?(m="linear-gradient(135deg, #FFD700, #FFA500)",b="#FFD700",u="#000",v="🥇"):s===1?(m="linear-gradient(135deg, #C0C0C0, #A8A8A8)",b="#C0C0C0",u="#000",v="🥈"):(m="linear-gradient(135deg, #CD7F32, #B87333)",b="#CD7F32",u="#FFF",v="🥉"),`
            <div class="ranking-item" style="
                padding: 12px;
                margin-bottom: 10px;
                background: ${m};
                border: 3px solid ${b};
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <div class="ranking-header">
                    <div style="font-size: 20px; font-weight: bold; color: ${u};">
                        ${v} ${s+1}位
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${u};">${r.zekken}番: ${h}</div>
                        ${y?`<div style="font-size: 12px; opacity: 0.8; color: ${u};">${y}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${u}; opacity: 0.9;">最小長寸</div>
                        <div class="stat-value" style="color: ${u}; font-size: 20px; font-weight: bold;">${r.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function Se(t,e){const l=document.getElementById("total-count-list").closest(".card");l.style.display="block";const n=[...t].sort((i,a)=>a.total_count===i.total_count?a.max_len===i.max_len?a.total_weight-i.total_weight:a.max_len-i.max_len:a.total_count-i.total_count).slice(0,3),o=document.getElementById("total-count-list");o.innerHTML=n.map((i,a)=>{const r=e[i.zekken]||{},s=r.name||"未登録",g=r.club||"";let h,y,m,b;return a===0?(h="linear-gradient(135deg, #FFD700, #FFA500)",y="#FFD700",m="#000",b="🥇"):a===1?(h="linear-gradient(135deg, #C0C0C0, #A8A8A8)",y="#C0C0C0",m="#000",b="🥈"):(h="linear-gradient(135deg, #CD7F32, #B87333)",y="#CD7F32",m="#FFF",b="🥉"),`
            <div class="ranking-item" style="
                padding: 12px;
                margin-bottom: 10px;
                background: ${h};
                border: 3px solid ${y};
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <div class="ranking-header">
                    <div style="font-size: 20px; font-weight: bold; color: ${m};">
                        ${b} ${a+1}位
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${m};">${i.zekken}番: ${s}</div>
                        ${g?`<div style="font-size: 12px; opacity: 0.8; color: ${m};">${g}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${m}; opacity: 0.9;">累計枚数</div>
                        <div class="stat-value" style="color: ${m}; font-size: 20px; font-weight: bold;">${i.total_count}枚</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${m}; opacity: 0.9;">最大長寸</div>
                        <div class="stat-value" style="color: ${m}; font-size: 20px; font-weight: bold;">${i.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function se(){const e=getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim().replace("#",""),l=parseInt(e.substr(0,2),16),n=parseInt(e.substr(2,2),16),o=parseInt(e.substr(4,2),16);return(l*299+n*587+o*114)/1e3>180}function ce(t,e){const l=d.rule_type||"max_len",n=d.sort1||null,o=d.sort2||null,i=d.limit_count||0,a=se(),r=a?"#1a1a1a":"white",s=a?"0.7":"0.9",g=Math.min(K,t.length),h=t.slice(0,g),y=document.getElementById("ranking-list");y.innerHTML=h.map((b,u)=>{const v=u<3,I=e[b.zekken]||{},L=I.name||"未登録",D=I.club||"";let z="",C="transparent",f="2px",_="0 4px 8px rgba(0,0,0,0.2)";u===0?(z="🏆",C="#FFD700",f="4px",_="0 6px 16px rgba(255, 215, 0, 0.4)"):u===1?(z="🥈",C="#C0C0C0",f="4px",_="0 6px 16px rgba(192, 192, 192, 0.4)"):u===2&&(z="🥉",C="#CD7F32",f="4px",_="0 6px 16px rgba(205, 127, 50, 0.4)");let p=U[l];(l==="limit_total_len"||l==="limit_weight")&&i>0&&(p+=` (${i}匹)`);const $=V(l,b[l]),B=n?V(n,b[n]):null,S=o?V(o,b[o]):null;return`
            <div class="ranking-item ${v?"top3":""}" onclick="showPlayerDetail(${b.zekken})" style="cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 12px; padding: 15px; margin-bottom: 12px; box-shadow: ${_}; border: ${f} solid ${C};">
                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        ${z?`<span style="font-size: 36px; line-height: 1;">${z}</span>`:""}
                        <span style="font-size: 32px; font-weight: bold; color: ${r}; white-space: nowrap;">${u+1}位</span>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 20px; font-weight: bold; color: ${r}; margin-bottom: 4px;">${b.zekken}番: ${L}</div>
                        ${D?`<div style="font-size: 14px; opacity: ${s}; color: ${r};">${D}</div>`:""}
                    </div>
                    <div style="font-size: 12px; opacity: ${s}; color: ${r}; white-space: nowrap; flex-shrink: 0;">
                        👆 タップで<br>詳細
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="color: ${r};">${p}</div>
                        <div class="stat-value" style="color: ${a?"#D4AF37":"#FFD700"};">${$}</div>
                    </div>
                    ${B?`
                    <div class="stat">
                        <div class="stat-label" style="color: ${r};">${U[n]}</div>
                        <div class="stat-value" style="color: ${a?"#2E7D32":"#4CAF50"};">${B}</div>
                    </div>
                    `:""}
                    ${S?`
                    <div class="stat">
                        <div class="stat-label" style="color: ${r};">${U[o]}</div>
                        <div class="stat-value" style="color: ${a?"#1565C0":"#2196F3"};">${S}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const m=document.getElementById("show-more-btn");t.length>K?m.style.display="block":m.style.display="none"}window.showMoreRankings=function(){K+=10;const t={};E.forEach(e=>{t[e.zekken]=e}),ce(H,t),c("10件追加表示しました")};function V(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function q(){const{data:t,error:e}=await w.from("players").select("*").eq("tournament_id",x).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const l=t||[],n=document.getElementById("player-list");if(l.length===0){n.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}n.innerHTML=l.map(o=>`
        <div class="player-item">
            <div>
                <strong>${o.zekken}番:</strong>
                <span style="margin-left: 10px;">${o.name}</span>
                ${o.club?`<span style="color: #aaa; margin-left: 10px;">(${o.club})</span>`:""}
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; margin-right: 5px;" onclick="editPlayer(${o.zekken})">編集</button>
                <button class="btn btn-danger" onclick="deletePlayer(${o.zekken})">削除</button>
            </div>
        </div>
    `).join("")}window.editPlayer=async function(t){const e=E.find(l=>l.zekken===t);if(!e){c("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),Le(e,async l=>{if(!l)return;console.log("📝 更新データ:",l),console.log("📝 更新条件:",{tournament_id:x,zekken:t});const{data:n,error:o}=await w.from("players").update({name:l.name,club:l.club,reading:l.reading}).eq("tournament_id",x).eq("zekken",t).select();if(o){console.error("❌ 選手編集エラー:",o),console.error("❌ エラー詳細:",JSON.stringify(o,null,2)),c(`❌ 編集に失敗しました: ${o.message||o.code||"不明なエラー"}`,!0);return}if(!n||n.length===0){console.error("❌ 更新対象が見つかりませんでした"),c("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",n),c("✅ 選手情報を更新しました"),await F(),await q(),console.log("✅ 再読み込み後のALL_PLAYERS:",E.find(i=>i.zekken===t))})};function Le(t,e){const l=`
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
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            ">
                <h2 style="margin-bottom: 20px; color: white; font-size: 24px; text-align: center;">
                    📝 ${t.zekken}番 選手編集
                </h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">名前 <span style="color: #ff6b6b;">*</span></label>
                        <input type="text" id="edit-name-input" value="${t.name}" style="
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
                        <input type="text" id="edit-reading-input" value="${t.reading||""}" placeholder="例: やまだたろう" style="
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
                        <input type="text" id="edit-club-input" value="${t.club||""}" placeholder="例: Aチーム" style="
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
                        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
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
    `;document.body.insertAdjacentHTML("beforeend",l);const n=document.getElementById("edit-player-dialog"),o=document.getElementById("edit-name-input"),i=document.getElementById("edit-reading-input"),a=document.getElementById("edit-club-input"),r=document.getElementById("edit-cancel-btn"),s=document.getElementById("edit-ok-btn");r.onclick=()=>{n.remove(),e(null)},s.onclick=()=>{const g=o.value.trim(),h=i.value.trim(),y=a.value.trim();if(!g){c("名前は必須です",!0);return}n.remove(),e({name:g,reading:h,club:y})},o.addEventListener("keypress",g=>{g.key==="Enter"&&s.click()}),i.addEventListener("keypress",g=>{g.key==="Enter"&&s.click()}),a.addEventListener("keypress",g=>{g.key==="Enter"&&s.click()}),n.addEventListener("click",g=>{g.target===n&&(n.remove(),e(null))}),o.focus(),o.select()}window.addPlayer=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),l=document.getElementById("new-club").value.trim(),n=document.getElementById("new-reading").value.trim();if(!t||!e){c("ゼッケン番号と名前は必須です",!0);return}if(E.some(a=>a.zekken===t)){c(`${t}番は既に登録されています`,!0);return}const{error:i}=await w.from("players").insert({tournament_id:x,zekken:t,name:e,club:l||"",reading:n||""});if(i){console.error("選手追加エラー:",i),c("追加に失敗しました（重複の可能性）",!0);return}c("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await F(),await q()};let A=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const l=new FileReader;l.onload=function(n){const o=n.target.result;Te(o)},l.readAsText(e,"UTF-8")};function Te(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(s=>s.trim());if(e.length<2){c("❌ CSVファイルが空です",!0);return}const n=e[0].split(",").map(s=>s.trim());console.log("📋 ヘッダー:",n);const i=["ゼッケン番号","名前"].filter(s=>!n.includes(s));if(i.length>0){c(`❌ 必須列が不足: ${i.join(", ")}`,!0);return}const a=[],r=[];for(let s=1;s<e.length;s++){const h=e[s].split(",").map(I=>I.trim());if(h.length!==n.length){r.push(`${s+1}行目: 列数が一致しません`);continue}const y={};n.forEach((I,L)=>{y[I]=h[L]});const m=parseInt(y.ゼッケン番号),b=y.名前;if(!m||isNaN(m)||m<=0){r.push(`${s+1}行目: ゼッケン番号が不正です (${y.ゼッケン番号})`);continue}if(!b||b.trim()===""){r.push(`${s+1}行目: 名前が空です`);continue}if(a.some(I=>I.zekken===m)){r.push(`${s+1}行目: ゼッケン番号 ${m} が重複しています`);continue}const v=E.find(I=>I.zekken===m);if(v){r.push(`${s+1}行目: ゼッケン番号 ${m} は既に登録されています (${v.name})`);continue}a.push({zekken:m,name:b,reading:y.読み仮名||"",club:y.所属||""})}if(console.log("✅ パース完了:",a.length,"件"),console.log("❌ エラー:",r.length,"件"),r.length>0){console.error("エラー詳細:",r),c(`⚠️ ${r.length}件のエラーがあります`,!0);const s=r.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${s}${r.length>5?`

...他${r.length-5}件`:""}`)}if(a.length===0){c("❌ インポート可能なデータがありません",!0);return}A=a,Fe(a,r)}catch(e){console.error("❌ CSVパースエラー:",e),c("❌ CSVファイルの読み込みに失敗しました",!0)}}function Fe(t,e){const l=document.getElementById("csv-preview"),n=document.getElementById("csv-preview-content");let o=`
        <div style="margin-bottom: 15px;">
            <strong style="color: #51cf66;">✅ インポート可能: ${t.length}件</strong>
            ${e.length>0?`<br><strong style="color: #ff6b6b;">❌ エラー: ${e.length}件</strong>`:""}
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
    `;t.forEach(i=>{o+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${i.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${i.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${i.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${i.club||"-"}</td>
            </tr>
        `}),o+=`
            </tbody>
        </table>
    `,n.innerHTML=o,l.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(A.length===0){c("❌ インポートするデータがありません",!0);return}if(k!==2){c("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",A.length,"件");try{const t=A.map(n=>({tournament_id:x,zekken:n.zekken,name:n.name,reading:n.reading,club:n.club})),{data:e,error:l}=await w.from("players").insert(t).select();if(l){console.error("❌ インポートエラー:",l),c(`❌ インポートに失敗しました: ${l.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),c(`✅ ${e.length}件の選手を登録しました！`),A=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await F(),await q()}catch(t){console.error("❌ インポート例外:",t),c("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){A=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",c("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await w.from("players").delete().eq("tournament_id",x).eq("zekken",t);if(e){console.error("選手削除エラー:",e),c("❌ 削除に失敗しました",!0);return}c("✅ 削除しました"),await F(),await q()};const U={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),l=document.getElementById("add-player-btn");if(!t){e.style.display="none",l.disabled=!1;return}const n=parseInt(t);E.some(i=>i.zekken===n)?(e.textContent=`⚠️ ${n}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",l.disabled=!0):(e.textContent=`✅ ${n}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",l.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,l=document.getElementById("sort2").value,n=[t];e&&n.push(e),l&&n.push(l),G("sort1",n,[t]),G("sort2",n,[t,e]),G("sort3",n,[t,e,l])};function G(t,e,l){const n=document.getElementById(t),o=n.value;n.innerHTML='<option value="">選択しない</option>';const i={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[a,r]of Object.entries(i))if(!l.includes(a)||a===o){const s=document.createElement("option");s.value=a,s.textContent=r,a===o&&(s.selected=!0),n.appendChild(s)}}async function De(){if(console.log("⚙️ 大会設定読み込み開始"),!d||!d.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=d.rule_type||"limit_total_len",Pe(d.limit_count||0);const t=localStorage.getItem(`${x}_show_biggest_fish`),e=localStorage.getItem(`${x}_show_smallest_fish`),l=localStorage.getItem(`${x}_show_total_count`);d.show_biggest_fish=t===null?!0:t==="true",d.show_smallest_fish=e===null?!0:e==="true",d.show_total_count=l===null?!0:l==="true",document.getElementById("show-biggest-fish").checked=d.show_biggest_fish,document.getElementById("show-smallest-fish").checked=d.show_smallest_fish,document.getElementById("show-total-count").checked=d.show_total_count,console.log("🏆 特別賞設定:",{show_biggest_fish:d.show_biggest_fish,show_smallest_fish:d.show_smallest_fish,show_total_count:d.show_total_count}),d.hide_ranking=d.hide_ranking===!0;const n=document.getElementById("hide-ranking");if(n&&(n.checked=d.hide_ranking),k===2){const o=document.getElementById("ranking-hidden-notice");o&&(o.style.display=d.hide_ranking?"block":"none")}console.log("🔒 順位非表示設定:",d.hide_ranking),updateSortOptions(),document.getElementById("sort1").value=d.sort1||"",document.getElementById("sort2").value=d.sort2||"",document.getElementById("sort3").value=d.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",d)}function Pe(t){const e=document.getElementById("limit-count-picker"),l=document.getElementById("limit-count"),n=e.querySelectorAll(".limit-option");l.value=t;const o=Array.from(n).find(r=>parseInt(r.dataset.value)===t);o&&(o.scrollIntoView({block:"center",behavior:"auto"}),a());let i;e.addEventListener("scroll",function(){clearTimeout(i),i=setTimeout(()=>{a()},100)}),n.forEach(r=>{r.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>a(),300)})});function a(){const r=e.getBoundingClientRect(),s=r.top+r.height/2;let g=null,h=1/0;n.forEach(y=>{const m=y.getBoundingClientRect(),b=m.top+m.height/2,u=Math.abs(s-b);u<h&&(h=u,g=y)}),g&&(n.forEach(y=>y.classList.remove("selected")),g.classList.add("selected"),l.value=g.dataset.value,console.log("📊 リミット匹数変更:",l.value))}}window.updateTournamentSettings=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,l=document.getElementById("sort1").value,n=document.getElementById("sort2").value,o=document.getElementById("sort3").value,i=document.getElementById("show-biggest-fish").checked,a=document.getElementById("show-smallest-fish").checked,r=document.getElementById("show-total-count").checked,s=document.getElementById("hide-ranking").checked;localStorage.setItem(`${x}_show_biggest_fish`,i),localStorage.setItem(`${x}_show_smallest_fish`,a),localStorage.setItem(`${x}_show_total_count`,r),console.log("💾 順位非表示設定を保存:",s);const g=[l,n,o].filter(I=>I!==""),h=new Set(g);if(g.length!==h.size){c("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:l,sort2:n,sort3:o,showBiggestFish:i,showSmallestFish:a,showTotalCount:r,hideRanking:s}),console.log("💾 更新条件:",{id:x}),console.log("💾 更新前のCONFIG.limit_count:",d.limit_count);const{data:y,error:m}=await w.from("tournaments").update({rule_type:t,limit_count:e,sort1:l||null,sort2:n||null,sort3:o||null,hide_ranking:s}).eq("id",x).select();if(console.log("💾 UPDATE結果 - data:",y),console.log("💾 UPDATE結果 - error:",m),m){console.error("❌ 設定保存エラー:",m),console.error("❌ エラー詳細:",JSON.stringify(m,null,2)),console.error("❌ エラーコード:",m.code),console.error("❌ エラーメッセージ:",m.message),alert(`❌ 設定保存エラー: ${m.message}
コード: ${m.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),c(`❌ 設定の保存に失敗しました: ${m.message||m.code||"不明なエラー"}`,!0);return}if(!y||y.length===0){console.error("❌ 更新対象が見つかりませんでした"),c("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",y);const{data:b,error:u}=await w.from("tournaments").select("*").eq("id",x).single();if(u||!b){console.error("❌ 設定再取得エラー:",u),c("❌ 設定の再取得に失敗しました",!0);return}d=b,d.show_biggest_fish=i,d.show_smallest_fish=a,d.show_total_count=r,d.hide_ranking=s,console.log("✅ 再取得後のCONFIG:",d),c("✅ 設定を保存しました");const v=d.limit_count>0?`リミット${d.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=v,await T(),console.log("✅ 設定保存完了")};function c(t,e=!1){const l=document.getElementById("toast");l.textContent=t,l.className="toast"+(e?" error":""),l.style.display="block",setTimeout(()=>{l.style.display="none"},3e3)}let O=null;function Me(t,e){O=e,document.getElementById("confirm-message").textContent=t;const l=document.getElementById("confirm-dialog");l.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",O&&(O(),O=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",O=null};console.log("✅ システム準備完了");function Ae(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+x;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{c("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),c("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const e=!(d.is_ended||!1),l=e?"終了":"再開";if(!confirm(`大会を${l}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:n}=await w.from("tournaments").update({is_ended:e}).eq("id",x);if(n){console.error("❌ 更新エラー:",n),c(`❌ ${l}に失敗しました`,!0);return}d.is_ended=e,te(),c(`✅ 大会を${l}しました`),de()};function te(){const t=d.is_ended||!1,e=document.getElementById("tournament-status-display"),l=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",l.innerHTML="▶️ 大会を再開",l.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",l.innerHTML="⏸️ 大会を終了",l.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function de(){const t=d.is_ended||!1,e=document.getElementById("input-form");t&&k!==2&&(e.style.display="none",c("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+x+"」を入力してください:");if(t!==x){t!==null&&c("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await w.from("catches").delete().eq("tournament_id",x);if(e)throw e;const{error:l}=await w.from("players").delete().eq("tournament_id",x);if(l)throw l;const{error:n}=await w.from("tournaments").delete().eq("id",x);if(n)throw n;c("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),c("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(k!==2){c("管理者権限が必要です",!0);return}try{const t=H||[],e=E||[];if(t.length===0){c("❌ エクスポートするデータがありません",!0);return}const{data:l,error:n}=await w.from("catches").select("*").eq("tournament_id",x).order("created_at",{ascending:!1});n&&console.error("釣果取得エラー:",n);const o=await me(3),i=await pe(3),a=ue(3);let r="";r+=`【大会情報】
`,r+=`大会名,"${d.name||"釣り大会"}"
`,r+=`作成日,${new Date().toLocaleDateString("ja-JP")}
`;const g={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[d.rule_type]||"リミット合計長寸",h=d.limit_count>0?`${d.limit_count}匹`:"無制限",y=new Set((l||[]).map(f=>f.zekken)).size,m=(l||[]).reduce((f,_)=>_.created_at?f?new Date(_.created_at)>new Date(f.created_at)?_:f:_:f,null),b=m?new Date(m.created_at).toLocaleString("ja-JP"):"-",u=`${g} / ${h==="無制限"?"無制限":`${h}リミット`}`;r+=`ルール,"${g}"
`,r+=`リミット匹数,${h}
`,r+=`参加者数,${e.length}名
`,r+=`検量済み人数,${y}名
`,r+=`総釣果,${(l||[]).length}枚
`,r+=`最終更新,"${b}"
`,r+=`集計ルール,"${u}"
`,r+=`
`,r+=`【順位表】
`,r+=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`,t.forEach((f,_)=>{const p=e.find($=>$.zekken===f.zekken)||{};r+=`${_+1},${f.zekken},"${p.name||"未登録"}","${p.club||""}",${f.limit_total_len||0},${f.one_max_len||0},${f.one_max_weight||0},${f.total_count||0},${f.total_weight||0}
`}),r+=`
`,r+=`【特別賞】
`,console.log("🏆 特別賞チェック - biggestCatches:",o),console.log("🏆 特別賞チェック - smallestCatches:",i),o.length>0?(r+=`大物賞（長寸上位）
`,r+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,o.forEach((f,_)=>{const p=e.find($=>$.zekken===f.zekken)||{};r+=`${_+1}位,${f.zekken}番,"${p.name||"未登録"}","${p.club||""}",${f.length},${f.weight||0}
`}),r+=`
`,console.log(`✅ 大物賞を${o.length}件追加しました`)):console.log("⚠️ 大物賞データなし"),i.length>0?(r+=`最小寸賞（長寸下位）
`,r+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,i.forEach((f,_)=>{const p=e.find($=>$.zekken===f.zekken)||{};r+=`${_+1}位,${f.zekken}番,"${p.name||"未登録"}","${p.club||""}",${f.length},${f.weight||0}
`}),r+=`
`,console.log(`✅ 最小寸賞を${i.length}件追加しました`)):console.log("⚠️ 最小寸賞データなし"),a.length>0?(r+=`累計枚数賞（総釣果数上位）
`,r+=`順位,ゼッケン番号,名前,所属,累計枚数,最大長寸(cm),総重量(g)
`,a.forEach((f,_)=>{const p=e.find($=>$.zekken===f.zekken)||{};r+=`${_+1}位,${f.zekken}番,"${p.name||"未登録"}","${p.club||""}",${f.total_count||0},${f.max_len||0},${f.total_weight||0}
`}),r+=`
`,console.log(`✅ 累計枚数賞を${a.length}件追加しました`)):console.log("⚠️ 累計枚数賞データなし"),r+=`
`,l&&l.length>0&&(r+=`【全釣果データ】
`,r+=`ゼッケン番号,名前,所属,長寸(cm),重量(g),登録日時
`,l.forEach(f=>{const _=e.find($=>$.zekken===f.zekken)||{},p=new Date(f.created_at).toLocaleString("ja-JP");r+=`${f.zekken},"${_.name||"未登録"}","${_.club||""}",${f.length},${f.weight||0},"${p}"
`}));const v=d.name||"tournament",I=new Date().toISOString().split("T")[0],L=`${v}_完全版_${I}.csv`,D="\uFEFF",z=new Blob([D+r],{type:"text/csv;charset=utf-8;"}),C=document.createElement("a");C.href=URL.createObjectURL(z),C.download=L,C.click(),c("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),c("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const l=document.getElementById(e);l&&l.addEventListener("input",function(n){const o=n.target.value,i=ae(o);o!==i&&(n.target.value=i)})})});let Q=null;function Ne(t){const e=new Uint8Array(t),l=32768;let n="";for(let o=0;o<e.length;o+=l)n+=String.fromCharCode.apply(null,e.subarray(o,o+l));return btoa(n)}async function Re(t){if(!Q){const e=await fetch("/fonts/NotoSansJP-Regular.ttf");if(!e.ok)throw new Error("日本語フォントを読み込めませんでした");Q=Ne(await e.arrayBuffer())}t.addFileToVFS("NotoSansJP-Regular.ttf",Q),t.addFont("NotoSansJP-Regular.ttf","NotoSansJP","normal"),t.setFont("NotoSansJP","normal")}function P(t,e="-"){return t==null||t===""?e:String(t)}function He(t,e){return t.lastAutoTable?t.lastAutoTable.finalY:e}function J(t,e,l,n,o={}){const i=o.startY||He(t,24)+8;t.setFont("NotoSansJP","normal"),t.setFontSize(12),t.setTextColor(40,40,40),t.text(e,14,i),t.autoTable({startY:i+4,head:[l],body:n,theme:"grid",styles:{font:"NotoSansJP",fontStyle:"normal",fontSize:o.fontSize||8,cellPadding:2,lineColor:[220,220,220],lineWidth:.1,overflow:"linebreak",valign:"middle"},headStyles:{fillColor:o.headColor||[102,126,234],textColor:[255,255,255],font:"NotoSansJP",fontStyle:"normal"},alternateRowStyles:{fillColor:[248,249,250]},margin:{left:14,right:14},columnStyles:o.columnStyles||{},pageBreak:o.pageBreak||"auto"})}window.exportPDF=async function(){try{if(k!==2){c("❌ PDF出力には管理者権限が必要です",!0);return}if(c("📄 PDF生成中..."),typeof window.jspdf>"u"){c("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:t}=window.jspdf,e=new t({orientation:"portrait",unit:"mm",format:"a4"});if(typeof e.autoTable!="function"){c("❌ PDF表作成ライブラリが読み込まれていません",!0);return}await Re(e);const l=H||[],n=E||[];if(l.length===0){c("❌ まだ釣果データがありません",!0);return}const{data:o,error:i}=await w.from("catches").select("*").eq("tournament_id",x).order("created_at",{ascending:!1});if(i)throw i;const a=o||[],s={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[d.rule_type]||"リミット合計長寸",g=d.limit_count>0?`${d.limit_count}匹リミット`:"無制限",h=d.name||"釣り大会",y=new Date().toLocaleString("ja-JP"),m=a.reduce((p,$)=>p?new Date($.created_at)>new Date(p.created_at)?$:p:$,null),b=m?new Date(m.created_at).toLocaleString("ja-JP"):"-",u=new Set(a.map(p=>p.zekken)).size;e.setFont("NotoSansJP","normal"),e.setFontSize(18),e.setTextColor(40,40,40),e.text(h,14,16),e.setFontSize(9),e.setTextColor(90,90,90),e.text(`作成日時: ${y}`,14,23),J(e,"大会情報",["項目","内容"],[["参加者数",`${n.length}名`],["検量済み人数",`${u}名`],["総釣果",`${a.length}枚`],["最終更新",b],["集計ルール",`${s} / ${g}`]],{startY:30,headColor:[81,207,102],columnStyles:{0:{cellWidth:42},1:{cellWidth:136}}}),J(e,"順位表",["順位","ゼッケン","名前","所属",s,"累計枚数","最大長寸","総重量"],l.map((p,$)=>{const B=n.find(S=>S.zekken===p.zekken)||{};return[`${$+1}位`,`${p.zekken}番`,P(B.name,"未登録"),P(B.club),V(d.rule_type,p[d.rule_type]),`${p.total_count||0}枚`,`${Number(p.max_len||0).toFixed(1)}cm`,`${p.total_weight||0}g`]}),{columnStyles:{0:{cellWidth:15,halign:"center"},1:{cellWidth:20,halign:"center"},2:{cellWidth:30},3:{cellWidth:30},4:{cellWidth:28,halign:"right"},5:{cellWidth:20,halign:"right"},6:{cellWidth:20,halign:"right"},7:{cellWidth:20,halign:"right"}}});const v=[];(await me(3)).forEach((p,$)=>{const B=n.find(S=>S.zekken===p.zekken)||{};v.push(["大物賞",`${$+1}位`,`${p.zekken}番`,P(B.name,"未登録"),`長寸 ${p.length}cm${p.weight?` / 重量 ${p.weight}g`:""}`])}),(await pe(3)).forEach((p,$)=>{const B=n.find(S=>S.zekken===p.zekken)||{};v.push(["最小寸賞",`${$+1}位`,`${p.zekken}番`,P(B.name,"未登録"),`長寸 ${p.length}cm${p.weight?` / 重量 ${p.weight}g`:""}`])}),ue(3).forEach((p,$)=>{const B=n.find(S=>S.zekken===p.zekken)||{};v.push(["累計枚数賞",`${$+1}位`,`${p.zekken}番`,P(B.name,"未登録"),`累計 ${p.total_count}枚 / 最大長寸 ${Number(p.max_len||0).toFixed(1)}cm`])}),v.length>0&&J(e,"特別賞",["賞","順位","ゼッケン","名前","内容"],v,{headColor:[245,87,108],columnStyles:{0:{cellWidth:28},1:{cellWidth:15,halign:"center"},2:{cellWidth:20,halign:"center"},3:{cellWidth:35},4:{cellWidth:85}}}),a.length>0&&(e.addPage(),e.setFont("NotoSansJP","normal"),J(e,"全釣果データ",["No.","ゼッケン","名前","所属","長寸","重量","登録日時"],a.map((p,$)=>{const B=n.find(fe=>fe.zekken===p.zekken)||{},S=new Date(p.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return[String($+1),`${p.zekken}番`,P(B.name,"未登録"),P(B.club),`${p.length}cm`,`${p.weight||0}g`,S]}),{startY:16,headColor:[81,207,102],fontSize:7,columnStyles:{0:{cellWidth:12,halign:"center"},1:{cellWidth:20,halign:"center"},2:{cellWidth:32},3:{cellWidth:32},4:{cellWidth:20,halign:"right"},5:{cellWidth:20,halign:"right"},6:{cellWidth:40,halign:"center"}}}));const z=e.internal.getNumberOfPages();for(let p=1;p<=z;p++)e.setPage(p),e.setFont("NotoSansJP","normal"),e.setFontSize(8),e.setTextColor(120,120,120),e.text(`${p} / ${z}`,196,287,{align:"right"});const C=d.name||"tournament",f=new Date().toISOString().split("T")[0],_=`${C}_ranking_${f}.pdf`;e.save(_),c("✅ PDFファイルをダウンロードしました")}catch(t){console.error("❌ PDF生成エラー:",t),c("❌ PDF生成に失敗しました: "+t.message,!0)}};function ue(t=3){return xe(H,t)}function Z(t=H){const e=new Map;return(t||[]).forEach((l,n)=>{e.set(Number(l.zekken),n)}),e}function Oe(t,e,l=Z()){const n=l.has(Number(t))?l.get(Number(t)):Number.MAX_SAFE_INTEGER,o=l.has(Number(e))?l.get(Number(e)):Number.MAX_SAFE_INTEGER;return n-o}function le(t){const e=Number(t.weight??t.max_weight??0);return e>0?e:null}function ge(t,e,l=Z()){const n=le(t),o=le(e);if(n!==null&&o!==null&&n!==o)return o-n;const i=Oe(t.zekken,e.zekken,l);return i!==0?i:n!==null&&o!==null?o-n:Number(t.zekken)-Number(e.zekken)}async function me(t=3){const{data:e,error:l}=await w.from("catches").select("*").eq("tournament_id",x).order("length",{ascending:!1}).order("weight",{ascending:!1});if(l||!e||e.length===0)return[];const n=new Map,o=new Set;for(const a of e)o.has(a.zekken)||(n.set(a.zekken,a),o.add(a.zekken));const i=Z();return[...n.values()].sort((a,r)=>r.length!==a.length?r.length-a.length:ge(a,r,i)).slice(0,t)}async function pe(t=3){const{data:e,error:l}=await w.from("catches").select("*").eq("tournament_id",x).order("length",{ascending:!0}).order("weight",{ascending:!0});if(l||!e||e.length===0)return[];const n=[],o=new Set;for(const i of e)if(!o.has(i.zekken)&&(n.push(i),o.add(i.zekken),n.length>=t))break;return n}window.showMyTournaments=function(){document.getElementById("top-page").style.display="none",document.getElementById("tournament-list-page").style.display="block",qe()};window.backToTop=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block"};async function qe(){const t=JSON.parse(localStorage.getItem("myTournaments")||"[]"),e=document.getElementById("my-tournaments-list");if(t.length===0){e.innerHTML=`
            <div style="text-align: center; padding: 40px; color: #ccc;">
                <p style="font-size: 18px; margin-bottom: 10px;">📭 まだ大会がありません</p>
                <p style="font-size: 14px;">「➕ 新規作成」から大会を作成してください</p>
            </div>
        `;return}const l=[];for(const n of t){const{data:o,error:i}=await w.from("tournaments").select("*").eq("id",n).single();if(!i&&o){const{data:a,error:r}=await w.from("players").select("zekken",{count:"exact"}).eq("tournament_id",n),{data:s,error:g}=await w.from("catches").select("id",{count:"exact"}).eq("tournament_id",n);l.push({...o,playerCount:a?a.length:0,catchCount:s?s.length:0})}}l.sort((n,o)=>new Date(o.created_at)-new Date(n.created_at)),e.innerHTML=l.map(n=>{const i=n.is_ended||!1?'<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🔴 終了</span>':'<span style="background: rgba(81,207,102,0.2); color: #51cf66; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🟢 進行中</span>',a=new Date(n.created_at).toLocaleDateString("ja-JP");return`
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onclick="enterTournamentById('${n.id}')" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <h3 style="font-size: 18px; margin-bottom: 5px;">${n.name}</h3>
                        <p style="font-size: 13px; color: #ccc;">ID: ${n.id}</p>
                    </div>
                    ${i}
                </div>
                <div style="display: flex; gap: 20px; font-size: 14px; color: #ccc;">
                    <span>📅 ${a}</span>
                    <span>👥 ${n.playerCount}名</span>
                    <span>🐟 ${n.catchCount}匹</span>
                </div>
            </div>
        `}).join("")}window.enterTournamentById=function(t){document.getElementById("tournament-id-input").value=t,enterTournament()};window.createNewTournament=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block",document.getElementById("new-tournament-id").focus()};function We(t){const e=JSON.parse(localStorage.getItem("myTournaments")||"[]");e.includes(t)||(e.push(t),localStorage.setItem("myTournaments",JSON.stringify(e)))}window.applyThemePreset=function(t){const e=t.dataset.primary,l=t.dataset.secondary;document.getElementById("primary-color").value=e,document.getElementById("primary-color-text").value=e,document.getElementById("secondary-color").value=l,document.getElementById("secondary-color-text").value=l,document.documentElement.style.setProperty("--primary-color",e),document.documentElement.style.setProperty("--secondary-color",l);const n=e.replace("#",""),o=parseInt(n.substr(0,2),16),i=parseInt(n.substr(2,2),16),a=parseInt(n.substr(4,2),16),s=(o*299+i*587+a*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",s),document.querySelectorAll(".theme-preset").forEach(g=>{g.style.border="2px solid transparent",g.style.transform="scale(1)"}),t.style.border="2px solid white",t.style.transform="scale(1.05)"};function je(){const t=JSON.parse(localStorage.getItem("customTheme")||"{}");if(t.primaryColor){document.documentElement.style.setProperty("--primary-color",t.primaryColor);const e=document.getElementById("primary-color"),l=document.getElementById("primary-color-text");e&&(e.value=t.primaryColor),l&&(l.value=t.primaryColor);const n=t.primaryColor.replace("#",""),o=parseInt(n.substr(0,2),16),i=parseInt(n.substr(2,2),16),a=parseInt(n.substr(4,2),16),s=(o*299+i*587+a*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",s)}if(t.secondaryColor){document.documentElement.style.setProperty("--secondary-color",t.secondaryColor);const e=document.getElementById("secondary-color"),l=document.getElementById("secondary-color-text");e&&(e.value=t.secondaryColor),l&&(l.value=t.secondaryColor)}Je()}window.saveTheme=function(){const t=document.getElementById("primary-color").value,e=document.getElementById("secondary-color").value,l={primaryColor:t,secondaryColor:e};localStorage.setItem("customTheme",JSON.stringify(l)),document.documentElement.style.setProperty("--primary-color",t),document.documentElement.style.setProperty("--secondary-color",e);const n=t.replace("#",""),o=parseInt(n.substr(0,2),16),i=parseInt(n.substr(2,2),16),a=parseInt(n.substr(4,2),16),s=(o*299+i*587+a*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",s),c("✅ テーマを保存しました")};window.resetTheme=function(){confirm("テーマをデフォルトに戻しますか？")&&(localStorage.removeItem("customTheme"),document.documentElement.style.setProperty("--primary-color","#667eea"),document.documentElement.style.setProperty("--secondary-color","#764ba2"),document.getElementById("primary-color").value="#667eea",document.getElementById("primary-color-text").value="#667eea",document.getElementById("secondary-color").value="#764ba2",document.getElementById("secondary-color-text").value="#764ba2",document.querySelectorAll(".theme-preset").forEach(t=>{t.style.border="2px solid transparent",t.style.transform="scale(1)"}),c("✅ テーマをリセットしました"))};let R=null;window.handleLogoUpload=function(t){const e=t.target.files[0];if(!e)return;if(!e.type.startsWith("image/")){c("❌ 画像ファイルを選択してください",!0);return}const l=new FileReader;l.onload=function(n){const o=new Image;o.onload=function(){let r=o.width,s=o.height;r>200&&(s=200/r*s,r=200),s>80&&(r=80/s*r,s=80);const g=document.createElement("canvas");g.width=r,g.height=s,g.getContext("2d").drawImage(o,0,0,r,s),R=g.toDataURL("image/png",.9),document.getElementById("logo-preview").style.display="block",document.getElementById("logo-preview-img").src=R,c("✅ ロゴをプレビューしました（「💾 ロゴを保存」をクリックして保存してください）")},o.src=n.target.result},l.readAsDataURL(e)};window.saveLogo=async function(){if(!R&&!localStorage.getItem("customLogo")){c("⚠️ ロゴがアップロードされていません",!0);return}if(k!==2){c("⚠️ 管理者権限が必要です",!0);return}const t=R||localStorage.getItem("customLogo");try{const{error:e}=await w.from("tournaments").update({logo:t}).eq("id",x);if(e)throw e;localStorage.setItem("customLogo",t),R=null,document.querySelectorAll(".logo").forEach(n=>{n.src=t,n.classList.add("visible")}),c("✅ ロゴを保存しました（全ユーザーに反映されます）")}catch(e){console.error("ロゴ保存エラー:",e),c("❌ ロゴの保存に失敗しました",!0)}};window.removeLogo=async function(){if(confirm("ロゴを削除しますか？（全ユーザーに反映されます）")){if(k!==2){c("⚠️ 管理者権限が必要です",!0);return}try{const{error:t}=await w.from("tournaments").update({logo:null}).eq("id",x);if(t)throw t;localStorage.removeItem("customLogo"),R=null,document.querySelectorAll(".logo").forEach(l=>{l.src="",l.classList.remove("visible")}),document.getElementById("logo-preview").style.display="none",document.getElementById("logo-upload").value="",c("✅ ロゴを削除しました")}catch(t){console.error("ロゴ削除エラー:",t),c("❌ ロゴの削除に失敗しました",!0)}}};function Je(){const t=localStorage.getItem("customLogo");if(t){document.querySelectorAll(".logo").forEach(o=>{o.src=t,o.classList.add("visible")});const l=document.getElementById("logo-preview"),n=document.getElementById("logo-preview-img");l&&n&&(l.style.display="block",n.src=t)}}document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("primary-color"),e=document.getElementById("primary-color-text"),l=document.getElementById("secondary-color"),n=document.getElementById("secondary-color-text");t&&e&&(t.addEventListener("input",function(){e.value=this.value}),e.addEventListener("input",function(){t.value=this.value})),l&&n&&(l.addEventListener("input",function(){n.value=this.value}),n.addEventListener("input",function(){l.value=this.value})),je()});const Ve=window.createTournament;window.createTournament=async function(){const t=await Ve();if(t!==!1){const e=document.getElementById("new-tournament-id").value.trim();We(e)}return t};window.toggleRankingVisibility=async function(){if(k!==2){c("管理者権限が必要です",!0),document.getElementById("hide-ranking").checked=!1;return}const t=document.getElementById("hide-ranking").checked;console.log("🔒 順位非表示設定を更新:",t);const{data:e,error:l}=await w.from("tournaments").update({hide_ranking:t}).eq("id",x).select();if(l){console.error("❌ 順位非表示設定の保存エラー:",l),c("❌ 設定の保存に失敗しました",!0);return}d.hide_ranking=t,console.log("✅ CONFIG更新:",d);const n=document.getElementById("ranking-hidden-notice");n&&(n.style.display=t?"block":"none"),t?(c("🔒 順位表を非表示にしました（参加者から見えません）"),console.log("🔒 順位非表示に設定")):(c("🔓 順位表を表示に戻しました"),console.log("🔓 順位表示に設定")),await T()};console.log("✅ 順位表示制御機能を読み込みました");window.testSupabaseConnection=async function(){console.log("🔌 Supabase接続テスト開始..."),console.log("URL:",ee);try{const{data:t,error:e}=await w.from("tournaments").select("count").limit(1);return e?(console.error("❌ 接続エラー:",e),alert(`Supabase接続失敗

エラー: ${e.message}
コード: ${e.code}

Supabaseダッシュボードで以下を確認:
1. プロジェクトが一時停止していないか
2. RLSポリシーが設定されているか
3. API Keyが正しいか`),!1):(console.log("✅ Supabase接続成功"),alert(`✅ Supabase接続成功！

データベースに正常に接続できました。`),!0)}catch(t){return console.error("❌ ネットワークエラー:",t),alert(`ネットワークエラー

${t.message}

以下を確認してください:
1. インターネット接続
2. Supabaseプロジェクトの状態
3. ファイアウォール設定`),!1}};console.log("✅ Supabase接続テスト機能を読み込みました");console.log("💡 ヒント: testSupabaseConnection() を実行して接続をテストできます");window.showPlayerDetail=async function(t){console.log("📊 選手詳細表示:",t);const e=E.find(i=>i.zekken===t);if(!e){c("❌ 選手が見つかりません",!0);return}const{data:l,error:n}=await w.from("catches").select("*").eq("tournament_id",x).eq("zekken",t).order("created_at",{ascending:!1});if(n){console.error("❌ 釣果取得エラー:",n),c("❌ 釣果データの取得に失敗しました",!0);return}const o=Ue(l);Ye(e,l,o)};function Ue(t){if(!t||t.length===0)return{totalCount:0,totalWeight:0,totalLength:0,maxLength:0,maxWeight:0,secondMaxLength:0,cumulativeCount:0};const e=t.map(r=>r.length),l=t.map(r=>r.weight||0),n=[...e].sort((r,s)=>s-r),o=[...l].sort((r,s)=>s-r),i=e.reduce((r,s)=>r+s,0),a=l.reduce((r,s)=>r+s,0);return{totalCount:t.length,totalWeight:Math.round(a),totalLength:i.toFixed(1),maxLength:n[0]?n[0].toFixed(1):"0.0",maxWeight:Math.round(o[0]||0),secondMaxLength:n[1]?n[1].toFixed(1):"0.0",cumulativeCount:t.length}}function Ye(t,e,l){const n=se(),o=n?"#1a1a1a":"white",i=n?"rgba(0, 0, 0, 0.1)":"rgba(255, 255, 255, 0.2)",a=n?"rgba(0, 0, 0, 0.2)":"rgba(255, 255, 255, 0.3)",r=n?"#333":"white",s=`
        <div id="player-detail-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        " onclick="closePlayerDetail(event)">
            <div style="
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            " onclick="event.stopPropagation()">
                <!-- ヘッダー -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0; font-size: 28px; color: ${o};">
                            ${t.zekken}番: ${t.name}
                        </h2>
                        ${t.club?`<div style="margin-top: 5px; font-size: 16px; opacity: 0.9; color: ${o};">${t.club}</div>`:""}
                        ${t.reading?`<div style="margin-top: 3px; font-size: 14px; opacity: 0.7; color: ${o};">(${t.reading})</div>`:""}
                    </div>
                    <button onclick="closePlayerDetail()" style="
                        background: ${i};
                        border: 2px solid ${r};
                        color: ${o};
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 24px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='${a}'" onmouseout="this.style.background='${i}'">
                        ✕
                    </button>
                </div>
                
                <!-- 統計サマリー -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                ">
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">累計獲得枚数</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${o};">${l.cumulativeCount}枚</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">総重量</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${o};">${l.totalWeight}g</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">最大長寸</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${n?"#D4AF37":"#FFD700"};">${l.maxLength}cm</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">最大重量</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${n?"#D4AF37":"#FFD700"};">${l.maxWeight}g</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">2番目長寸</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">${l.secondMaxLength}cm</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">累計獲得枚数</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">${l.cumulativeCount}枚</div>
                    </div>
                </div>
                
                <!-- 全釣果リスト -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: ${o}; margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"}; padding-bottom: 10px;">
                        📋 全釣果記録 (${e.length}件)
                    </h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${e.length===0?`<div style="text-align: center; padding: 20px; color: ${o}; opacity: 0.7;">まだ釣果がありません</div>`:e.map((g,h)=>{const y=e.length-h;return`
                                <div style="
                                    background: ${n?"rgba(0, 0, 0, 0.05)":"rgba(255, 255, 255, 0.1)"};
                                    padding: 15px;
                                    border-radius: 10px;
                                    margin-bottom: 10px;
                                    border-left: 4px solid ${h===0?n?"#D4AF37":"#FFD700":n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-size: 18px; font-weight: bold; color: ${o};">
                                                ${y}匹目
                                                ${h===0?`<span style="color: ${n?"#D4AF37":"#FFD700"};">🏆 最新</span>`:""}
                                            </div>
                                            <div style="font-size: 14px; opacity: 0.7; color: ${o}; margin-top: 3px;">
                                                ${new Date(g.created_at).toLocaleString("ja-JP",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">
                                                ${g.length.toFixed(1)}cm
                                            </div>
                                            ${g.weight>0?`
                                                <div style="font-size: 16px; color: ${o}; opacity: 0.9;">
                                                    ${Math.round(g.weight)}g
                                                </div>
                                            `:""}
                                        </div>
                                    </div>
                                </div>
                            `}).join("")}
                    </div>
                </div>
                
                <!-- 閉じるボタン -->
                <button onclick="closePlayerDetail()" style="
                    width: 100%;
                    padding: 15px;
                    background: ${i};
                    border: 2px solid ${r};
                    border-radius: 12px;
                    color: ${o};
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='${a}'" onmouseout="this.style.background='${i}'">
                    閉じる
                </button>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #player-detail-modal > div::-webkit-scrollbar {
                width: 8px;
            }
            
            #player-detail-modal > div::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            #player-detail-modal > div::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            #player-detail-modal > div::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        </style>
    `;document.body.insertAdjacentHTML("beforeend",s)}window.closePlayerDetail=function(t){if(t&&t.target.id!=="player-detail-modal")return;const e=document.getElementById("player-detail-modal");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>e.remove(),300))};const ye=document.createElement("style");ye.textContent=`
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;document.head.appendChild(ye);console.log("✅ 選手詳細表示機能を読み込みました");
