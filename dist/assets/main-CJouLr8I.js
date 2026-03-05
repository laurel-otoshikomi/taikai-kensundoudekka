import{createClient as ae}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(i){if(i.ep)return;i.ep=!0;const l=n(i);fetch(i.href,l)}})();const Z="https://pkjvdtvomqzcnfhkqven.supabase.co",de="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",h=ae(Z,de);let k=0,u={},f=null,w=[],O=[],J=!0,F=null,Y=10,V=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await ce(e):K()});function K(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",X()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){d("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function X(){const{data:t,error:e}=await h.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),n=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),n.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){n.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}n.innerHTML=t.map(o=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${o.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${o.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${o.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),n=document.getElementById("new-tournament-admin-password").value.trim(),o=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!n){d("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){d("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:i,error:l}=await h.from("tournaments").insert({id:t,name:e,password:n,staff_password:o||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null,hide_ranking:!1}).select();if(l){console.error("❌ 大会作成エラー:",l),console.error("エラー詳細:",{message:l.message,details:l.details,hint:l.hint,code:l.code}),l.code==="23505"?d("❌ この大会IDは既に使用されています",!0):l.message&&l.message.includes("Failed to fetch")?(d("❌ Supabaseへの接続に失敗しました。ネットワークを確認してください。",!0),alert(`Supabase接続エラー

1. Supabaseプロジェクトが一時停止していないか確認
2. ネットワーク接続を確認
3. RLSポリシーが設定されているか確認

URL: ${Z}`)):d(`❌ 大会の作成に失敗しました: ${l.message||"不明なエラー"}`,!0);return}d("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await X(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function ce(t){f=t,console.log("📂 大会ID:",f);const{data:e,error:n}=await h.from("tournaments").select("*").eq("id",f).single();if(n||!e){console.error("大会取得エラー:",n),alert("大会が見つかりません"),K();return}u=e,console.log("✅ 大会情報取得:",u),console.log("📋 大会ルール:",u.rule_type),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 優先順位1:",u.sort1),console.log("🎯 優先順位2:",u.sort2),console.log("🎯 優先順位3:",u.sort3),document.getElementById("tournament-name").textContent=u.name;const o=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=o,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await S(),await C(),Ee(),k===2&&(document.getElementById("tournament-management-card").style.display="block",G()),ne(),ue()}function ue(){F&&F.unsubscribe(),F=h.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${f}`},()=>{J&&(console.log("⚡ リアルタイム更新"),C(),k>0&&D())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){J=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");J?(t.style.display="none",d("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",d("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){d("🔄 更新中..."),await C(),k>0&&await D(),d("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((n,o)=>{n.classList.remove("active"),(t==="ranking"&&o===0||t==="input"&&o===1||t==="settings"&&o===2)&&n.classList.add("active")}),document.querySelectorAll(".view").forEach(n=>{n.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),C()):t==="input"?(document.getElementById("input-view").classList.add("active"),k>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",S(),D()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),k===2&&(document.getElementById("rule-settings-card").style.display="block",ke()),k>0&&S().then(()=>q()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===u.password)k=2,d("✅ 管理者としてログイン"),Q("管理者");else if(t===u.staff_password)k=1,d("✅ 運営スタッフとしてログイン"),Q("運営スタッフ");else{d("パスワードが違います",!0);return}if(console.log("🔐 ログイン成功 AUTH_LEVEL:",k),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",k>=1&&document.querySelectorAll(".admin-only").forEach(e=>{e.style.display="block"}),k===2){const e=document.getElementById("tournament-management-card");e&&(e.style.display="block",G())}S(),D()};window.logout=function(){ve("ログアウトしますか？",()=>{k=0,F&&(F.unsubscribe(),F=null),d("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function Q(t){const e=document.getElementById("login-status"),n=document.getElementById("login-status-text");n.textContent=`${t}としてログイン中`,e.style.display="block"}async function S(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await h.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}w=t||[],console.log("✅ 選手データ読み込み完了:",w.length,"人"),w.length>0&&console.log("📋 選手サンプル:",w[0]);const n=document.getElementById("player-select");n.innerHTML='<option value="">選手を選択してください</option>',w.forEach(o=>{const i=document.createElement("option");i.value=o.zekken,i.textContent=`${o.zekken}番: ${o.name}${o.club?` (${o.club})`:""}`,n.appendChild(i)})}function ee(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function ge(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const n=e.charCodeAt(0)-96;return String.fromCharCode(n)})}function me(t){return t.replace(/[\u3041-\u3096]/g,function(e){const n=e.charCodeAt(0)+96;return String.fromCharCode(n)})}function A(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=ge(t),n=me(t),o=ee(t);return{original:t,hiragana:e,katakana:n,halfWidth:o}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),n=document.getElementById("search-result-count"),o=document.getElementById("player-select"),i=t.value.trim();if(console.log("🔍 検索クエリ:",i),console.log("🔍 選手データ数:",w.length),w.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),w.slice(0,3).forEach(r=>{console.log(`  - ${r.zekken}番: ${r.name} (${r.club||"所属なし"})`)})),e.style.display=i?"block":"none",!i){o.innerHTML='<option value="">選手を選択してください</option>',w.forEach(r=>{const a=document.createElement("option");a.value=r.zekken,a.textContent=`${r.zekken}番: ${r.name}${r.club?` (${r.club})`:""}`,o.appendChild(a)}),n.textContent="";return}const l=A(i);console.log("🔧 正規化された検索クエリ:",{元:l.original,ひらがな:l.hiragana,カタカナ:l.katakana,半角:l.halfWidth});const s=w.filter(r=>{if(r.zekken.toString()===i||r.zekken.toString()===l.halfWidth)return console.log("✅ ゼッケン一致:",r.zekken),!0;if(r.reading){const a=A(r.reading);if(r.reading.includes(i))return console.log("✅ 読み仮名一致（完全）:",r.reading,"検索:",i),!0;if(a.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",r.reading,"検索:",i),!0;if(a.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",r.reading,"検索:",i),!0}if(r.name){const a=A(r.name);if(r.name.includes(i))return console.log("✅ 名前一致（完全）:",r.name,"検索:",i),!0;if(a.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",r.name,"検索:",i),!0;if(a.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",r.name,"検索:",i),!0;if(a.halfWidth.includes(l.halfWidth)&&l.halfWidth!=="")return console.log("✅ 名前一致（半角）:",r.name,"検索:",i),!0;const m=r.name.toLowerCase(),y=i.toLowerCase();if(m.includes(y))return console.log("✅ 名前一致（英語）:",r.name,"検索:",i),!0}if(r.club){const a=A(r.club);if(r.club.includes(i))return console.log("✅ 所属一致（完全）:",r.club,"検索:",i),!0;if(a.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",r.club,"検索:",i),!0;if(a.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",r.club,"検索:",i),!0;if(a.halfWidth.includes(l.halfWidth)&&l.halfWidth!=="")return console.log("✅ 所属一致（半角）:",r.club,"検索:",i),!0;const m=r.club.toLowerCase(),y=i.toLowerCase();if(m.includes(y))return console.log("✅ 所属一致（英語）:",r.club,"検索:",i),!0}return!1});console.log("🔍 検索結果:",s.length,"件"),o.innerHTML='<option value="">選手を選択してください</option>',s.length===0?(n.textContent="該当する選手が見つかりません",n.style.color="#ff6b6b"):(s.forEach(r=>{const a=document.createElement("option");a.value=r.zekken,a.textContent=`${r.zekken}番: ${r.name}${r.club?` (${r.club})`:""}`,o.appendChild(a)}),n.textContent=`${s.length}件の選手が見つかりました`,n.style.color="#51cf66",s.length===1&&(o.value=s[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),n=document.getElementById("search-result-count"),o=document.getElementById("player-select");t.value="",e.style.display="none",n.textContent="",o.innerHTML='<option value="">選手を選択してください</option>',w.forEach(i=>{const l=document.createElement("option");l.value=i.zekken,l.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,o.appendChild(l)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),n=document.getElementById("search-input-mode"),o=document.getElementById("tab-zekken"),i=document.getElementById("tab-search");t==="zekken"?(e.style.display="block",n.style.display="none",o.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",o.style.color="white",o.style.border="none",o.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 0.6)",i.style.border="2px solid rgba(255, 255, 255, 0.2)",i.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",n.style.display="block",i.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",i.style.color="white",i.style.border="none",i.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",o.style.background="rgba(255, 255, 255, 0.1)",o.style.color="rgba(255, 255, 255, 0.6)",o.style.border="2px solid rgba(255, 255, 255, 0.2)",o.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),n=document.getElementById("player-name-display"),o=document.getElementById("player-club-display"),i=document.getElementById("player-error-display"),l=parseInt(t.value);if(!l||isNaN(l)){e.style.display="none",i.style.display="none";return}const s=w.find(r=>r.zekken===l);s?(e.style.display="block",i.style.display="none",n.textContent=`${s.zekken}番: ${s.name}`,o.textContent=s.club?`所属: ${s.club}`:"所属なし",console.log("✅ 選手が見つかりました:",s)):(e.style.display="none",i.style.display="block",console.log("❌ 選手が見つかりません:",l))};window.registerCatch=async function(){if(k===0){d("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const n=parseFloat(document.getElementById("length-input").value),o=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:n,weight:o,mode:t?"ゼッケン":"検索"}),!e){d("選手を選択してください",!0);return}if(!n||n<=0){d("長寸を入力してください",!0);return}const i=w.find(r=>r.zekken==e);if(!i){d("選手が見つかりません",!0);return}const l=i.name,{error:s}=await h.from("catches").insert({tournament_id:f,zekken:e,length:n,weight:o});if(s){console.error("❌ 登録エラー:",s),d("登録に失敗しました",!0);return}console.log("✅ 登録成功"),d(`✅ ${l}: ${n}cm ${o>0?o+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await D(),await C()};async function D(){console.log("📋 履歴読み込み開始"),console.log("👥 ALL_PLAYERS:",w);const t={};w.forEach(i=>{t[i.zekken]=i.name}),console.log("🗺️ playerMap:",t);const{data:e,error:n}=await h.from("catches").select("*").eq("tournament_id",f).order("created_at",{ascending:!1}).limit(50);if(n){console.error("❌ 履歴読み込みエラー:",n);return}O=e||[],console.log("✅ 履歴読み込み完了:",O.length,"件");const o=document.getElementById("history-list");if(O.length===0){o.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}o.innerHTML=O.map(i=>{const l=t[i.zekken]||"未登録",s=new Date(i.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <strong style="font-size: 18px;">${i.zekken}番</strong>
                        <span style="font-size: 16px;">${l}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${i.length}cm</span>
                        ${i.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${i.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${s}</div>
                </div>
                ${k===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${i.id}, ${i.zekken}, ${i.length}, ${i.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${i.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,n,o){if(k!==2){d("管理者権限が必要です",!0);return}const i=w.find(s=>s.zekken===e),l=i?i.name:`${e}番`;pe(t,e,l,n,o)};function pe(t,e,n,o,i){const l=`
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
                    <div style="font-size: 20px; font-weight: bold; color: white;">${e}番: ${n}</div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">長寸 (cm) <span style="color: #ff6b6b;">*</span></label>
                        <input type="number" id="edit-length-input" value="${o}" step="0.1" style="
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
                        <input type="number" id="edit-weight-input" value="${i||""}" placeholder="任意" style="
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
    `;document.body.insertAdjacentHTML("beforeend",l);const s=document.getElementById("edit-catch-dialog"),r=document.getElementById("edit-length-input"),a=document.getElementById("edit-weight-input"),m=document.getElementById("edit-catch-cancel-btn"),y=document.getElementById("edit-catch-save-btn");m.onclick=()=>{s.remove()},y.onclick=async()=>{const g=parseFloat(r.value),x=parseFloat(a.value)||0;if(!g||g<=0){d("長寸を入力してください",!0);return}s.remove();const{error:c}=await h.from("catches").update({length:g,weight:x}).eq("id",t);if(c){console.error("❌ 更新エラー:",c),d("❌ 更新に失敗しました",!0);return}d(`✅ ${n}の釣果を更新しました`),await D(),await C()},r.addEventListener("keypress",g=>{g.key==="Enter"&&y.click()}),a.addEventListener("keypress",g=>{g.key==="Enter"&&y.click()}),s.addEventListener("click",g=>{g.target===s&&s.remove()}),r.focus(),r.select()}window.deleteCatch=async function(t){if(k!==2){d("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:e}=await h.from("catches").delete().eq("id",t);if(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await D(),await C()};async function C(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",u),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 大会ルール:",u.rule_type);const t=u.hide_ranking===!0;if(console.log("🔒 順位非表示設定:",t,"(CONFIG.hide_ranking:",u.hide_ranking,")"),t&&k<2){console.log("🚫 順位は非表示に設定されています（管理者以外）"),document.getElementById("ranking-list").style.display="none",document.getElementById("ranking-hidden-message").style.display="block",document.getElementById("show-more-btn").style.display="none",document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>';return}document.getElementById("ranking-list").style.display="block",document.getElementById("ranking-hidden-message").style.display="none";const{data:e,error:n}=await h.from("catches").select("*").eq("tournament_id",f);if(n){console.error("❌ ランキング読み込みエラー:",n);return}const o=e||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const i={};w.forEach(c=>{i[c.zekken]=c});const l={};o.forEach(c=>{l[c.zekken]||(l[c.zekken]={zekken:c.zekken,lengths:[],weights:[],min_len:c.length,max_len:c.length,min_weight:c.weight||0,max_weight:c.weight||0}),l[c.zekken].lengths.push(c.length),l[c.zekken].weights.push(c.weight||0),l[c.zekken].min_len=Math.min(l[c.zekken].min_len,c.length),l[c.zekken].max_len=Math.max(l[c.zekken].max_len,c.length),l[c.zekken].min_weight=Math.min(l[c.zekken].min_weight,c.weight||0),l[c.zekken].max_weight=Math.max(l[c.zekken].max_weight,c.weight||0)});const s=Object.values(l).map(c=>{const p=[...c.lengths].sort((I,B)=>B-I),v=[...c.weights].sort((I,B)=>B-I),b=u.limit_count||999;console.log(`📊 選手${c.zekken}番の計算:`,{全釣果数:c.lengths.length,リミット匹数:b,全長寸:p,リミット長寸:p.slice(0,b)});const E=v.slice(0,b).reduce((I,B)=>I+B,0),L=p.slice(0,b).reduce((I,B)=>I+B,0);return{zekken:c.zekken,count:c.lengths.length,max_len:c.max_len,min_len:c.min_len,max_weight:c.max_weight,min_weight:c.min_weight,one_max_len:c.max_len,one_max_weight:c.max_weight,total_weight:c.weights.reduce((I,B)=>I+B,0),total_count:c.lengths.length,limit_weight:E,limit_total_len:L}}),r=u.rule_type||"max_len",a=u.sort1||null,m=u.sort2||null,y=u.sort3||null;s.sort((c,p)=>c[r]!==p[r]?p[r]-c[r]:a&&c[a]!==p[a]?p[a]-c[a]:m&&c[m]!==p[m]?p[m]-c[m]:y&&c[y]!==p[y]?p[y]-c[y]:0),V=s,console.log("✅ ランキング計算完了:",s.length,"人");const g=document.getElementById("show-biggest-fish")?.checked??!0;g?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ye(s,i)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const x=document.getElementById("show-smallest-fish")?.checked??!0;x?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),fe(s,i)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!g&&!x&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),te(s,i)}function ye(t,e){const n=document.getElementById("biggest-fish-list").closest(".card");n.style.display="block";const o=[...t].sort((r,a)=>a.max_len===r.max_len?a.max_weight-r.max_weight:a.max_len-r.max_len),i=new Set,l=[];for(const r of o)if(!i.has(r.zekken)&&(l.push(r),i.add(r.zekken),l.length===3))break;const s=document.getElementById("biggest-fish-list");s.innerHTML=l.map((r,a)=>{const m=e[r.zekken]||{},y=m.name||"未登録",g=m.club||"";return`
            <div class="ranking-item ${a===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${a+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${r.zekken}番: ${y}</div>
                        ${g?`<div style="font-size: 10px; opacity: 0.8;">${g}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${r.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function fe(t,e){const n=document.getElementById("smallest-fish-list").closest(".card");n.style.display="block";const o=[...t].sort((r,a)=>r.min_len===a.min_len?r.min_weight-a.min_weight:r.min_len-a.min_len),i=new Set,l=[];for(const r of o)if(!i.has(r.zekken)&&(l.push(r),i.add(r.zekken),l.length===3))break;const s=document.getElementById("smallest-fish-list");s.innerHTML=l.map((r,a)=>{const m=e[r.zekken]||{},y=m.name||"未登録",g=m.club||"";return`
            <div class="ranking-item ${a===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${a+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${r.zekken}番: ${y}</div>
                        ${g?`<div style="font-size: 10px; opacity: 0.8;">${g}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${r.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function te(t,e){const n=u.rule_type||"max_len",o=u.sort1||null,i=u.sort2||null,l=u.limit_count||0,s=Math.min(Y,t.length),r=t.slice(0,s),a=document.getElementById("ranking-list");a.innerHTML=r.map((y,g)=>{const x=g<3,c=e[y.zekken]||{},p=c.name||"未登録",v=c.club||"";let b=U[n];(n==="limit_total_len"||n==="limit_weight")&&l>0&&(b+=` (${l}匹)`);const E=j(n,y[n]),L=o?j(o,y[o]):null,I=i?j(i,y[i]):null;return`
            <div class="ranking-item ${x?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${g+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${y.zekken}番: ${p}</div>
                        ${v?`<div style="font-size: 14px; opacity: 0.8;">${v}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${b}</div>
                        <div class="stat-value" style="color: #FFD700;">${E}</div>
                    </div>
                    ${L?`
                    <div class="stat">
                        <div class="stat-label">${U[o]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${L}</div>
                    </div>
                    `:""}
                    ${I?`
                    <div class="stat">
                        <div class="stat-label">${U[i]}</div>
                        <div class="stat-value" style="color: #2196F3;">${I}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const m=document.getElementById("show-more-btn");t.length>Y?m.style.display="block":m.style.display="none"}window.showMoreRankings=function(){Y+=10;const t={};w.forEach(e=>{t[e.zekken]=e}),te(V,t),d("10件追加表示しました")};function j(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function q(){const{data:t,error:e}=await h.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const n=t||[],o=document.getElementById("player-list");if(n.length===0){o.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}o.innerHTML=n.map(i=>`
        <div class="player-item">
            <div>
                <strong>${i.zekken}番:</strong>
                <span style="margin-left: 10px;">${i.name}</span>
                ${i.club?`<span style="color: #aaa; margin-left: 10px;">(${i.club})</span>`:""}
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; margin-right: 5px;" onclick="editPlayer(${i.zekken})">編集</button>
                <button class="btn btn-danger" onclick="deletePlayer(${i.zekken})">削除</button>
            </div>
        </div>
    `).join("")}window.editPlayer=async function(t){const e=w.find(n=>n.zekken===t);if(!e){d("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),he(e,async n=>{if(!n)return;console.log("📝 更新データ:",n),console.log("📝 更新条件:",{tournament_id:f,zekken:t});const{data:o,error:i}=await h.from("players").update({name:n.name,club:n.club,reading:n.reading}).eq("tournament_id",f).eq("zekken",t).select();if(i){console.error("❌ 選手編集エラー:",i),console.error("❌ エラー詳細:",JSON.stringify(i,null,2)),d(`❌ 編集に失敗しました: ${i.message||i.code||"不明なエラー"}`,!0);return}if(!o||o.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",o),d("✅ 選手情報を更新しました"),await S(),await q(),console.log("✅ 再読み込み後のALL_PLAYERS:",w.find(l=>l.zekken===t))})};function he(t,e){const n=`
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
    `;document.body.insertAdjacentHTML("beforeend",n);const o=document.getElementById("edit-player-dialog"),i=document.getElementById("edit-name-input"),l=document.getElementById("edit-reading-input"),s=document.getElementById("edit-club-input"),r=document.getElementById("edit-cancel-btn"),a=document.getElementById("edit-ok-btn");r.onclick=()=>{o.remove(),e(null)},a.onclick=()=>{const m=i.value.trim(),y=l.value.trim(),g=s.value.trim();if(!m){d("名前は必須です",!0);return}o.remove(),e({name:m,reading:y,club:g})},i.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),l.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),s.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),o.addEventListener("click",m=>{m.target===o&&(o.remove(),e(null))}),i.focus(),i.select()}window.addPlayer=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),n=document.getElementById("new-club").value.trim(),o=document.getElementById("new-reading").value.trim();if(!t||!e){d("ゼッケン番号と名前は必須です",!0);return}if(w.some(s=>s.zekken===t)){d(`${t}番は既に登録されています`,!0);return}const{error:l}=await h.from("players").insert({tournament_id:f,zekken:t,name:e,club:n||"",reading:o||""});if(l){console.error("選手追加エラー:",l),d("追加に失敗しました（重複の可能性）",!0);return}d("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await S(),await q()};let P=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const n=new FileReader;n.onload=function(o){const i=o.target.result;be(i)},n.readAsText(e,"UTF-8")};function be(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(a=>a.trim());if(e.length<2){d("❌ CSVファイルが空です",!0);return}const o=e[0].split(",").map(a=>a.trim());console.log("📋 ヘッダー:",o);const l=["ゼッケン番号","名前"].filter(a=>!o.includes(a));if(l.length>0){d(`❌ 必須列が不足: ${l.join(", ")}`,!0);return}const s=[],r=[];for(let a=1;a<e.length;a++){const y=e[a].split(",").map(b=>b.trim());if(y.length!==o.length){r.push(`${a+1}行目: 列数が一致しません`);continue}const g={};o.forEach((b,E)=>{g[b]=y[E]});const x=parseInt(g.ゼッケン番号),c=g.名前;if(!x||isNaN(x)||x<=0){r.push(`${a+1}行目: ゼッケン番号が不正です (${g.ゼッケン番号})`);continue}if(!c||c.trim()===""){r.push(`${a+1}行目: 名前が空です`);continue}if(s.some(b=>b.zekken===x)){r.push(`${a+1}行目: ゼッケン番号 ${x} が重複しています`);continue}const v=w.find(b=>b.zekken===x);if(v){r.push(`${a+1}行目: ゼッケン番号 ${x} は既に登録されています (${v.name})`);continue}s.push({zekken:x,name:c,reading:g.読み仮名||"",club:g.所属||""})}if(console.log("✅ パース完了:",s.length,"件"),console.log("❌ エラー:",r.length,"件"),r.length>0){console.error("エラー詳細:",r),d(`⚠️ ${r.length}件のエラーがあります`,!0);const a=r.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${a}${r.length>5?`

...他${r.length-5}件`:""}`)}if(s.length===0){d("❌ インポート可能なデータがありません",!0);return}P=s,xe(s,r)}catch(e){console.error("❌ CSVパースエラー:",e),d("❌ CSVファイルの読み込みに失敗しました",!0)}}function xe(t,e){const n=document.getElementById("csv-preview"),o=document.getElementById("csv-preview-content");let i=`
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
    `;t.forEach(l=>{i+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${l.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.club||"-"}</td>
            </tr>
        `}),i+=`
            </tbody>
        </table>
    `,o.innerHTML=i,n.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(P.length===0){d("❌ インポートするデータがありません",!0);return}if(k!==2){d("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",P.length,"件");try{const t=P.map(o=>({tournament_id:f,zekken:o.zekken,name:o.name,reading:o.reading,club:o.club})),{data:e,error:n}=await h.from("players").insert(t).select();if(n){console.error("❌ インポートエラー:",n),d(`❌ インポートに失敗しました: ${n.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),d(`✅ ${e.length}件の選手を登録しました！`),P=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await S(),await q()}catch(t){console.error("❌ インポート例外:",t),d("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){P=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",d("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await h.from("players").delete().eq("tournament_id",f).eq("zekken",t);if(e){console.error("選手削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await S(),await q()};const U={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),n=document.getElementById("add-player-btn");if(!t){e.style.display="none",n.disabled=!1;return}const o=parseInt(t);w.some(l=>l.zekken===o)?(e.textContent=`⚠️ ${o}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",n.disabled=!0):(e.textContent=`✅ ${o}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",n.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,n=document.getElementById("sort2").value,o=[t];e&&o.push(e),n&&o.push(n),W("sort1",o,[t]),W("sort2",o,[t,e]),W("sort3",o,[t,e,n])};function W(t,e,n){const o=document.getElementById(t),i=o.value;o.innerHTML='<option value="">選択しない</option>';const l={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[s,r]of Object.entries(l))if(!n.includes(s)||s===i){const a=document.createElement("option");a.value=s,a.textContent=r,s===i&&(a.selected=!0),o.appendChild(a)}}async function ke(){if(console.log("⚙️ 大会設定読み込み開始"),!u||!u.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=u.rule_type||"limit_total_len",we(u.limit_count||0);const t=localStorage.getItem(`${f}_show_biggest_fish`),e=localStorage.getItem(`${f}_show_smallest_fish`);u.show_biggest_fish=t===null?!0:t==="true",u.show_smallest_fish=e===null?!0:e==="true",document.getElementById("show-biggest-fish").checked=u.show_biggest_fish,document.getElementById("show-smallest-fish").checked=u.show_smallest_fish,console.log("🏆 特別賞設定:",{show_biggest_fish:u.show_biggest_fish,show_smallest_fish:u.show_smallest_fish}),u.hide_ranking=u.hide_ranking===!0;const n=document.getElementById("hide-ranking");if(n&&(n.checked=u.hide_ranking),k===2){const o=document.getElementById("ranking-hidden-notice");o&&(o.style.display=u.hide_ranking?"block":"none")}console.log("🔒 順位非表示設定:",u.hide_ranking),updateSortOptions(),document.getElementById("sort1").value=u.sort1||"",document.getElementById("sort2").value=u.sort2||"",document.getElementById("sort3").value=u.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",u)}function we(t){const e=document.getElementById("limit-count-picker"),n=document.getElementById("limit-count"),o=e.querySelectorAll(".limit-option");n.value=t;const i=Array.from(o).find(r=>parseInt(r.dataset.value)===t);i&&(i.scrollIntoView({block:"center",behavior:"auto"}),s());let l;e.addEventListener("scroll",function(){clearTimeout(l),l=setTimeout(()=>{s()},100)}),o.forEach(r=>{r.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>s(),300)})});function s(){const r=e.getBoundingClientRect(),a=r.top+r.height/2;let m=null,y=1/0;o.forEach(g=>{const x=g.getBoundingClientRect(),c=x.top+x.height/2,p=Math.abs(a-c);p<y&&(y=p,m=g)}),m&&(o.forEach(g=>g.classList.remove("selected")),m.classList.add("selected"),n.value=m.dataset.value,console.log("📊 リミット匹数変更:",n.value))}}window.updateTournamentSettings=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,n=document.getElementById("sort1").value,o=document.getElementById("sort2").value,i=document.getElementById("sort3").value,l=document.getElementById("show-biggest-fish").checked,s=document.getElementById("show-smallest-fish").checked,r=document.getElementById("hide-ranking").checked;localStorage.setItem(`${f}_show_biggest_fish`,l),localStorage.setItem(`${f}_show_smallest_fish`,s),console.log("💾 順位非表示設定を保存:",r);const a=[n,o,i].filter(v=>v!==""),m=new Set(a);if(a.length!==m.size){d("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:n,sort2:o,sort3:i,showBiggestFish:l,showSmallestFish:s,hideRanking:r}),console.log("💾 更新条件:",{id:f}),console.log("💾 更新前のCONFIG.limit_count:",u.limit_count);const{data:y,error:g}=await h.from("tournaments").update({rule_type:t,limit_count:e,sort1:n||null,sort2:o||null,sort3:i||null,hide_ranking:r}).eq("id",f).select();if(console.log("💾 UPDATE結果 - data:",y),console.log("💾 UPDATE結果 - error:",g),g){console.error("❌ 設定保存エラー:",g),console.error("❌ エラー詳細:",JSON.stringify(g,null,2)),console.error("❌ エラーコード:",g.code),console.error("❌ エラーメッセージ:",g.message),alert(`❌ 設定保存エラー: ${g.message}
コード: ${g.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),d(`❌ 設定の保存に失敗しました: ${g.message||g.code||"不明なエラー"}`,!0);return}if(!y||y.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",y);const{data:x,error:c}=await h.from("tournaments").select("*").eq("id",f).single();if(c||!x){console.error("❌ 設定再取得エラー:",c),d("❌ 設定の再取得に失敗しました",!0);return}u=x,u.show_biggest_fish=l,u.show_smallest_fish=s,u.hide_ranking=r,console.log("✅ 再取得後のCONFIG:",u),d("✅ 設定を保存しました");const p=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=p,await C(),console.log("✅ 設定保存完了")};function d(t,e=!1){const n=document.getElementById("toast");n.textContent=t,n.className="toast"+(e?" error":""),n.style.display="block",setTimeout(()=>{n.style.display="none"},3e3)}let H=null;function ve(t,e){H=e,document.getElementById("confirm-message").textContent=t;const n=document.getElementById("confirm-dialog");n.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",H&&(H(),H=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",H=null};console.log("✅ システム準備完了");function Ee(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+f;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{d("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),d("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const e=!(u.is_ended||!1),n=e?"終了":"再開";if(!confirm(`大会を${n}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:o}=await h.from("tournaments").update({is_ended:e}).eq("id",f);if(o){console.error("❌ 更新エラー:",o),d(`❌ ${n}に失敗しました`,!0);return}u.is_ended=e,G(),d(`✅ 大会を${n}しました`),ne()};function G(){const t=u.is_ended||!1,e=document.getElementById("tournament-status-display"),n=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",n.innerHTML="▶️ 大会を再開",n.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",n.innerHTML="⏸️ 大会を終了",n.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function ne(){const t=u.is_ended||!1,e=document.getElementById("input-form");t&&k!==2&&(e.style.display="none",d("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+f+"」を入力してください:");if(t!==f){t!==null&&d("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await h.from("catches").delete().eq("tournament_id",f);if(e)throw e;const{error:n}=await h.from("players").delete().eq("tournament_id",f);if(n)throw n;const{error:o}=await h.from("tournaments").delete().eq("id",f);if(o)throw o;d("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(k!==2){d("管理者権限が必要です",!0);return}try{const t=V||[],e=w||[];if(t.length===0){d("❌ エクスポートするデータがありません",!0);return}const{data:n,error:o}=await h.from("catches").select("*").eq("tournament_id",f).order("created_at",{ascending:!1});o&&console.error("釣果取得エラー:",o);const i=await oe(3),l=await ie(3);let s="";s+=`【大会情報】
`,s+=`大会名,"${u.name||"釣り大会"}"
`,s+=`作成日,${new Date().toLocaleDateString("ja-JP")}
`,s+=`ルール,"${{limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[u.rule_type]||"リミット合計長寸"}"
`,s+=`リミット匹数,${u.limit_count>0?u.limit_count+"匹":"無制限"}
`,s+=`
`,s+=`【順位表】
`,s+=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`,t.forEach((p,v)=>{const b=e.find(E=>E.zekken===p.zekken)||{};s+=`${v+1},${p.zekken},"${b.name||"未登録"}","${b.club||""}",${p.limit_total_len||0},${p.one_max_len||0},${p.one_max_weight||0},${p.total_count||0},${p.total_weight||0}
`}),s+=`
`,s+=`【特別賞】
`,console.log("🏆 特別賞チェック - biggestCatches:",i),console.log("🏆 特別賞チェック - smallestCatches:",l),i.length>0?(s+=`大物賞（長寸上位）
`,s+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,i.forEach((p,v)=>{const b=e.find(E=>E.zekken===p.zekken)||{};s+=`${v+1}位,${p.zekken}番,"${b.name||"未登録"}","${b.club||""}",${p.length},${p.weight||0}
`}),s+=`
`,console.log(`✅ 大物賞を${i.length}件追加しました`)):console.log("⚠️ 大物賞データなし"),l.length>0?(s+=`最小寸賞（長寸下位）
`,s+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,l.forEach((p,v)=>{const b=e.find(E=>E.zekken===p.zekken)||{};s+=`${v+1}位,${p.zekken}番,"${b.name||"未登録"}","${b.club||""}",${p.length},${p.weight||0}
`}),s+=`
`,console.log(`✅ 最小寸賞を${l.length}件追加しました`)):console.log("⚠️ 最小寸賞データなし"),s+=`
`,n&&n.length>0&&(s+=`【全釣果データ】
`,s+=`ゼッケン番号,名前,所属,長寸(cm),重量(g),登録日時
`,n.forEach(p=>{const v=e.find(E=>E.zekken===p.zekken)||{},b=new Date(p.created_at).toLocaleString("ja-JP");s+=`${p.zekken},"${v.name||"未登録"}","${v.club||""}",${p.length},${p.weight||0},"${b}"
`}));const a=u.name||"tournament",m=new Date().toISOString().split("T")[0],y=`${a}_完全版_${m}.csv`,g="\uFEFF",x=new Blob([g+s],{type:"text/csv;charset=utf-8;"}),c=document.createElement("a");c.href=URL.createObjectURL(x),c.download=y,c.click(),d("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),d("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const n=document.getElementById(e);n&&n.addEventListener("input",function(o){const i=o.target.value,l=ee(i);i!==l&&(o.target.value=l)})})});window.exportPDF=async function(){try{if(d("📄 PDF生成中..."),typeof window.jspdf>"u"||typeof html2canvas>"u"){d("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:t}=window.jspdf,e=V||[],n=w||[];if(e.length===0){d("❌ まだ釣果データがありません",!0);return}const i={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[u.rule_type]||"リミット合計長寸",l=u.limit_count>0?`(リミット${u.limit_count}匹)`:"(無制限)",s=document.createElement("div");s.style.cssText=`
            position: absolute;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
            color: #333;
        `;const r=u.name||"釣り大会",a=new Date().toLocaleDateString("ja-JP");s.innerHTML=`
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #667eea;">${r}</h1>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">作成日: ${a}</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">ルール: ${i} ${l}</p>
            </div>
            
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">順位</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">ゼッケン</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">名前</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">所属</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold;">${i}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${e.map((_,$)=>{const z=n.find(M=>M.zekken===_.zekken)||{},T=j(u.rule_type,_[u.rule_type]);return`
                                <tr style="background: ${$%2===0?"#f9f9f9":"white"};">
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${$+1}位</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${_.zekken}番</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${z.name||"未登録"}</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${z.club||"-"}</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">${T}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            </div>
        `;const m=[],y=await oe(3);if(console.log("🏆 PDF大物賞データ:",y),y.length>0){let _=`
                <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #667eea; font-size: 16px;">🐟 大物賞（長寸上位）</strong><br>
            `;y.forEach(($,z)=>{const T=n.find(M=>M.zekken===$.zekken)||{};_+=`
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${z===0?"🥇":z===1?"🥈":"🥉"} ${z+1}位: ${T.name||"未登録"} (${$.zekken}番) - 長寸: ${$.length}cm ${$.weight?`/ 重量: ${$.weight}g`:""}
                    </div>
                `}),_+="</div>",m.push(_),console.log(`✅ PDF大物賞を${y.length}件追加しました`)}const g=await ie(3);if(console.log("🏆 PDF最小寸賞データ:",g),g.length>0){let _=`
                <div style="background: rgba(255, 183, 77, 0.1); padding: 15px; border-radius: 8px;">
                    <strong style="color: #ff8c00; font-size: 16px;">🎣 最小寸賞（長寸下位）</strong><br>
            `;g.forEach(($,z)=>{const T=n.find(M=>M.zekken===$.zekken)||{};_+=`
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${z===0?"🥇":z===1?"🥈":"🥉"} ${z+1}位: ${T.name||"未登録"} (${$.zekken}番) - 長寸: ${$.length}cm ${$.weight?`/ 重量: ${$.weight}g`:""}
                    </div>
                `}),_+="</div>",m.push(_),console.log(`✅ PDF最小寸賞を${g.length}件追加しました`)}m.length>0?s.innerHTML+=`
                <div style="margin-top: 30px;">
                    <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">🏆 特別賞</h2>
                    ${m.join("")}
                </div>
            `:console.log("⚠️ PDF特別賞データがありません");const{data:x,error:c}=await h.from("catches").select("*").eq("tournament_id",f).order("created_at",{ascending:!1});!c&&x&&x.length>0&&(s.innerHTML+=`
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
                                ${x.map((_,$)=>{const z=n.find(M=>M.zekken===_.zekken)||{},T=$%2===0?"#f9f9f9":"white",N=new Date(_.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
                                        <tr style="background: ${T};">
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${$+1}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${_.zekken}番</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${z.name||"未登録"}</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${z.club||"-"}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #51cf66; font-weight: bold;">${_.length}cm</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #ffd93d; font-weight: bold;">${_.weight||0}g</td>
                                            <td style="padding: 8px; text-align: center; font-size: 11px; border-bottom: 1px solid #eee; color: #999;">${N}</td>
                                        </tr>
                                    `}).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 10px; text-align: right; font-size: 12px; color: #666;">
                        合計: ${x.length}件の釣果
                    </div>
                </div>
            `),document.body.appendChild(s);const p=await html2canvas(s,{scale:2,backgroundColor:"#ffffff",logging:!1});document.body.removeChild(s);const v=p.toDataURL("image/png"),b=210,E=p.height*b/p.width,L=new t({orientation:(E>297,"portrait"),unit:"mm",format:"a4"});let I=0;const B=297;for(;I<E;)I>0&&L.addPage(),L.addImage(v,"PNG",0,-I,b,E),I+=B;const le=u.name||"tournament",re=new Date().toISOString().split("T")[0],se=`${le}_ranking_${re}.pdf`;L.save(se),d("✅ PDFファイルをダウンロードしました")}catch(t){console.error("❌ PDF生成エラー:",t),d("❌ PDF生成に失敗しました: "+t.message,!0)}};async function oe(t=3){const{data:e,error:n}=await h.from("catches").select("*").eq("tournament_id",f).order("length",{ascending:!1}).order("weight",{ascending:!1});if(n||!e||e.length===0)return[];const o=[],i=new Set;for(const l of e)if(!i.has(l.zekken)&&(o.push(l),i.add(l.zekken),o.length>=t))break;return o}async function ie(t=3){const{data:e,error:n}=await h.from("catches").select("*").eq("tournament_id",f).order("length",{ascending:!0}).order("weight",{ascending:!0});if(n||!e||e.length===0)return[];const o=[],i=new Set;for(const l of e)if(!i.has(l.zekken)&&(o.push(l),i.add(l.zekken),o.length>=t))break;return o}window.showMyTournaments=function(){document.getElementById("top-page").style.display="none",document.getElementById("tournament-list-page").style.display="block",Ie()};window.backToTop=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block"};async function Ie(){const t=JSON.parse(localStorage.getItem("myTournaments")||"[]"),e=document.getElementById("my-tournaments-list");if(t.length===0){e.innerHTML=`
            <div style="text-align: center; padding: 40px; color: #ccc;">
                <p style="font-size: 18px; margin-bottom: 10px;">📭 まだ大会がありません</p>
                <p style="font-size: 14px;">「➕ 新規作成」から大会を作成してください</p>
            </div>
        `;return}const n=[];for(const o of t){const{data:i,error:l}=await h.from("tournaments").select("*").eq("id",o).single();if(!l&&i){const{data:s,error:r}=await h.from("players").select("zekken",{count:"exact"}).eq("tournament_id",o),{data:a,error:m}=await h.from("catches").select("id",{count:"exact"}).eq("tournament_id",o);n.push({...i,playerCount:s?s.length:0,catchCount:a?a.length:0})}}n.sort((o,i)=>new Date(i.created_at)-new Date(o.created_at)),e.innerHTML=n.map(o=>{const l=o.is_ended||!1?'<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🔴 終了</span>':'<span style="background: rgba(81,207,102,0.2); color: #51cf66; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🟢 進行中</span>',s=new Date(o.created_at).toLocaleDateString("ja-JP");return`
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onclick="enterTournamentById('${o.id}')" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <h3 style="font-size: 18px; margin-bottom: 5px;">${o.name}</h3>
                        <p style="font-size: 13px; color: #ccc;">ID: ${o.id}</p>
                    </div>
                    ${l}
                </div>
                <div style="display: flex; gap: 20px; font-size: 14px; color: #ccc;">
                    <span>📅 ${s}</span>
                    <span>👥 ${o.playerCount}名</span>
                    <span>🐟 ${o.catchCount}匹</span>
                </div>
            </div>
        `}).join("")}window.enterTournamentById=function(t){document.getElementById("tournament-id-input").value=t,enterTournament()};window.createNewTournament=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block",document.getElementById("new-tournament-id").focus()};function _e(t){const e=JSON.parse(localStorage.getItem("myTournaments")||"[]");e.includes(t)||(e.push(t),localStorage.setItem("myTournaments",JSON.stringify(e)))}window.applyThemePreset=function(t){const e=t.dataset.primary,n=t.dataset.secondary;document.getElementById("primary-color").value=e,document.getElementById("primary-color-text").value=e,document.getElementById("secondary-color").value=n,document.getElementById("secondary-color-text").value=n,document.documentElement.style.setProperty("--primary-color",e),document.documentElement.style.setProperty("--secondary-color",n),document.querySelectorAll(".theme-preset").forEach(o=>{o.style.border="2px solid transparent",o.style.transform="scale(1)"}),t.style.border="2px solid white",t.style.transform="scale(1.05)"};function $e(){const t=JSON.parse(localStorage.getItem("customTheme")||"{}");if(t.primaryColor){document.documentElement.style.setProperty("--primary-color",t.primaryColor);const e=document.getElementById("primary-color"),n=document.getElementById("primary-color-text");e&&(e.value=t.primaryColor),n&&(n.value=t.primaryColor)}if(t.secondaryColor){document.documentElement.style.setProperty("--secondary-color",t.secondaryColor);const e=document.getElementById("secondary-color"),n=document.getElementById("secondary-color-text");e&&(e.value=t.secondaryColor),n&&(n.value=t.secondaryColor)}ze()}window.saveTheme=function(){const t=document.getElementById("primary-color").value,e=document.getElementById("secondary-color").value,n={primaryColor:t,secondaryColor:e};localStorage.setItem("customTheme",JSON.stringify(n)),document.documentElement.style.setProperty("--primary-color",t),document.documentElement.style.setProperty("--secondary-color",e),d("✅ テーマを保存しました")};window.resetTheme=function(){confirm("テーマをデフォルトに戻しますか？")&&(localStorage.removeItem("customTheme"),document.documentElement.style.setProperty("--primary-color","#667eea"),document.documentElement.style.setProperty("--secondary-color","#764ba2"),document.getElementById("primary-color").value="#667eea",document.getElementById("primary-color-text").value="#667eea",document.getElementById("secondary-color").value="#764ba2",document.getElementById("secondary-color-text").value="#764ba2",document.querySelectorAll(".theme-preset").forEach(t=>{t.style.border="2px solid transparent",t.style.transform="scale(1)"}),d("✅ テーマをリセットしました"))};let R=null;window.handleLogoUpload=function(t){const e=t.target.files[0];if(!e)return;if(!e.type.startsWith("image/")){d("❌ 画像ファイルを選択してください",!0);return}const n=new FileReader;n.onload=function(o){const i=new Image;i.onload=function(){let r=i.width,a=i.height;r>200&&(a=200/r*a,r=200),a>80&&(r=80/a*r,a=80);const m=document.createElement("canvas");m.width=r,m.height=a,m.getContext("2d").drawImage(i,0,0,r,a),R=m.toDataURL("image/png",.9),document.getElementById("logo-preview").style.display="block",document.getElementById("logo-preview-img").src=R,d("✅ ロゴをプレビューしました（「💾 ロゴを保存」をクリックして保存してください）")},i.src=o.target.result},n.readAsDataURL(e)};window.saveLogo=function(){if(!R&&!localStorage.getItem("customLogo")){d("⚠️ ロゴがアップロードされていません",!0);return}const t=R||localStorage.getItem("customLogo");localStorage.setItem("customLogo",t),R=null,document.querySelectorAll(".logo").forEach(n=>{n.src=t,n.classList.add("visible")}),d("✅ ロゴを保存しました")};window.removeLogo=function(){if(!confirm("ロゴを削除しますか？"))return;localStorage.removeItem("customLogo"),R=null,document.querySelectorAll(".logo").forEach(e=>{e.src="",e.classList.remove("visible")}),document.getElementById("logo-preview").style.display="none",document.getElementById("logo-upload").value="",d("✅ ロゴを削除しました")};function ze(){const t=localStorage.getItem("customLogo");if(t){document.querySelectorAll(".logo").forEach(i=>{i.src=t,i.classList.add("visible")});const n=document.getElementById("logo-preview"),o=document.getElementById("logo-preview-img");n&&o&&(n.style.display="block",o.src=t)}}document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("primary-color"),e=document.getElementById("primary-color-text"),n=document.getElementById("secondary-color"),o=document.getElementById("secondary-color-text");t&&e&&(t.addEventListener("input",function(){e.value=this.value}),e.addEventListener("input",function(){t.value=this.value})),n&&o&&(n.addEventListener("input",function(){o.value=this.value}),o.addEventListener("input",function(){n.value=this.value})),$e()});const Be=window.createTournament;window.createTournament=async function(){const t=await Be();if(t!==!1){const e=document.getElementById("new-tournament-id").value.trim();_e(e)}return t};window.toggleRankingVisibility=async function(){if(k!==2){d("管理者権限が必要です",!0),document.getElementById("hide-ranking").checked=!1;return}const t=document.getElementById("hide-ranking").checked;console.log("🔒 順位非表示設定を更新:",t);const{data:e,error:n}=await h.from("tournaments").update({hide_ranking:t}).eq("id",f).select();if(n){console.error("❌ 順位非表示設定の保存エラー:",n),d("❌ 設定の保存に失敗しました",!0);return}u.hide_ranking=t,console.log("✅ CONFIG更新:",u);const o=document.getElementById("ranking-hidden-notice");o&&(o.style.display=t?"block":"none"),t?(d("🔒 順位表を非表示にしました（参加者から見えません）"),console.log("🔒 順位非表示に設定")):(d("🔓 順位表を表示に戻しました"),console.log("🔓 順位表示に設定")),await C()};console.log("✅ 順位表示制御機能を読み込みました");window.testSupabaseConnection=async function(){console.log("🔌 Supabase接続テスト開始..."),console.log("URL:",Z);try{const{data:t,error:e}=await h.from("tournaments").select("count").limit(1);return e?(console.error("❌ 接続エラー:",e),alert(`Supabase接続失敗

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
3. ファイアウォール設定`),!1}};console.log("✅ Supabase接続テスト機能を読み込みました");console.log("💡 ヒント: testSupabaseConnection() を実行して接続をテストできます");
