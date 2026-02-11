import{createClient as K}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const X="https://pkjvdtvomqzcnfhkqven.supabase.co",ee="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",b=K(X,ee);let k=0,g={},y=null,h=[],R=[],q=!0,S=null,j=10,O=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await te(e):W()});function W(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",Y()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){a("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function Y(){const{data:t,error:e}=await b.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),o=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),o.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){o.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}o.innerHTML=t.map(i=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${i.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${i.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${i.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),o=document.getElementById("new-tournament-admin-password").value.trim(),i=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!o){a("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){a("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:n,error:s}=await b.from("tournaments").insert({id:t,name:e,password:o,staff_password:i||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(s){console.error("大会作成エラー:",s),s.code==="23505"?a("この大会IDは既に使用されています",!0):a("大会の作成に失敗しました",!0);return}a("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await Y(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function te(t){y=t,console.log("📂 大会ID:",y);const{data:e,error:o}=await b.from("tournaments").select("*").eq("id",y).single();if(o||!e){console.error("大会取得エラー:",o),alert("大会が見つかりません"),W();return}g=e,console.log("✅ 大会情報取得:",g),console.log("📋 大会ルール:",g.rule_type),console.log("📊 リミット匹数:",g.limit_count),console.log("🎯 優先順位1:",g.sort1),console.log("🎯 優先順位2:",g.sort2),console.log("🎯 優先順位3:",g.sort3),document.getElementById("tournament-name").textContent=g.name;const i=g.limit_count>0?`リミット${g.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=i,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await z(),await $(),pe(),k===2&&(document.getElementById("tournament-management-card").style.display="block",V()),G(),ne()}function ne(){S&&S.unsubscribe(),S=b.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${y}`},()=>{q&&(console.log("⚡ リアルタイム更新"),$(),k>0&&C())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){q=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");q?(t.style.display="none",a("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",a("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){a("🔄 更新中..."),await $(),k>0&&await C(),a("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((o,i)=>{o.classList.remove("active"),(t==="ranking"&&i===0||t==="input"&&i===1||t==="settings"&&i===2)&&o.classList.add("active")}),document.querySelectorAll(".view").forEach(o=>{o.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),$()):t==="input"?(document.getElementById("input-view").classList.add("active"),k>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",z(),C()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),k===2&&(document.getElementById("rule-settings-card").style.display="block",ue()),k>0&&z().then(()=>D()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===g.password)k=2,a("✅ 管理者としてログイン"),U("管理者");else if(t===g.staff_password)k=1,a("✅ 運営スタッフとしてログイン"),U("運営スタッフ");else{a("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",k),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",k===2&&(document.getElementById("tournament-management-card").style.display="block",V()),z(),C()};window.logout=function(){me("ログアウトしますか？",()=>{k=0,S&&(S.unsubscribe(),S=null),a("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function U(t){const e=document.getElementById("login-status"),o=document.getElementById("login-status-text");o.textContent=`${t}としてログイン中`,e.style.display="block"}async function z(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await b.from("players").select("*").eq("tournament_id",y).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}h=t||[],console.log("✅ 選手データ読み込み完了:",h.length,"人"),h.length>0&&console.log("📋 選手サンプル:",h[0]);const o=document.getElementById("player-select");o.innerHTML='<option value="">選手を選択してください</option>',h.forEach(i=>{const n=document.createElement("option");n.value=i.zekken,n.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,o.appendChild(n)})}function Z(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function oe(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const o=e.charCodeAt(0)-96;return String.fromCharCode(o)})}function ie(t){return t.replace(/[\u3041-\u3096]/g,function(e){const o=e.charCodeAt(0)+96;return String.fromCharCode(o)})}function P(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=oe(t),o=ie(t),i=Z(t);return{original:t,hiragana:e,katakana:o,halfWidth:i}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select"),n=t.value.trim();if(console.log("🔍 検索クエリ:",n),console.log("🔍 選手データ数:",h.length),h.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),h.slice(0,3).forEach(l=>{console.log(`  - ${l.zekken}番: ${l.name} (${l.club||"所属なし"})`)})),e.style.display=n?"block":"none",!n){i.innerHTML='<option value="">選手を選択してください</option>',h.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(r)}),o.textContent="";return}const s=P(n);console.log("🔧 正規化された検索クエリ:",{元:s.original,ひらがな:s.hiragana,カタカナ:s.katakana,半角:s.halfWidth});const c=h.filter(l=>{if(l.zekken.toString()===n||l.zekken.toString()===s.halfWidth)return console.log("✅ ゼッケン一致:",l.zekken),!0;if(l.reading){const r=P(l.reading);if(l.reading.includes(n))return console.log("✅ 読み仮名一致（完全）:",l.reading,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",l.reading,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",l.reading,"検索:",n),!0}if(l.name){const r=P(l.name);if(l.name.includes(n))return console.log("✅ 名前一致（完全）:",l.name,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",l.name,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",l.name,"検索:",n),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 名前一致（半角）:",l.name,"検索:",n),!0;const u=l.name.toLowerCase(),p=n.toLowerCase();if(u.includes(p))return console.log("✅ 名前一致（英語）:",l.name,"検索:",n),!0}if(l.club){const r=P(l.club);if(l.club.includes(n))return console.log("✅ 所属一致（完全）:",l.club,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",l.club,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",l.club,"検索:",n),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 所属一致（半角）:",l.club,"検索:",n),!0;const u=l.club.toLowerCase(),p=n.toLowerCase();if(u.includes(p))return console.log("✅ 所属一致（英語）:",l.club,"検索:",n),!0}return!1});console.log("🔍 検索結果:",c.length,"件"),i.innerHTML='<option value="">選手を選択してください</option>',c.length===0?(o.textContent="該当する選手が見つかりません",o.style.color="#ff6b6b"):(c.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(r)}),o.textContent=`${c.length}件の選手が見つかりました`,o.style.color="#51cf66",c.length===1&&(i.value=c[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select");t.value="",e.style.display="none",o.textContent="",i.innerHTML='<option value="">選手を選択してください</option>',h.forEach(n=>{const s=document.createElement("option");s.value=n.zekken,s.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,i.appendChild(s)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),o=document.getElementById("search-input-mode"),i=document.getElementById("tab-zekken"),n=document.getElementById("tab-search");t==="zekken"?(e.style.display="block",o.style.display="none",i.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",i.style.color="white",i.style.border="none",i.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",o.style.display="block",n.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",n.style.color="white",n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 0.6)",i.style.border="2px solid rgba(255, 255, 255, 0.2)",i.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),o=document.getElementById("player-name-display"),i=document.getElementById("player-club-display"),n=document.getElementById("player-error-display"),s=parseInt(t.value);if(!s||isNaN(s)){e.style.display="none",n.style.display="none";return}const c=h.find(l=>l.zekken===s);c?(e.style.display="block",n.style.display="none",o.textContent=`${c.zekken}番: ${c.name}`,i.textContent=c.club?`所属: ${c.club}`:"所属なし",console.log("✅ 選手が見つかりました:",c)):(e.style.display="none",n.style.display="block",console.log("❌ 選手が見つかりません:",s))};window.registerCatch=async function(){if(k===0){a("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const o=parseFloat(document.getElementById("length-input").value),i=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:o,weight:i,mode:t?"ゼッケン":"検索"}),!e){a("選手を選択してください",!0);return}if(!o||o<=0){a("長寸を入力してください",!0);return}const n=h.find(l=>l.zekken==e);if(!n){a("選手が見つかりません",!0);return}const s=n.name,{error:c}=await b.from("catches").insert({tournament_id:y,zekken:e,length:o,weight:i});if(c){console.error("❌ 登録エラー:",c),a("登録に失敗しました",!0);return}console.log("✅ 登録成功"),a(`✅ ${s}: ${o}cm ${i>0?i+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await C(),await $()};async function C(){console.log("📋 履歴読み込み開始"),console.log("👥 ALL_PLAYERS:",h);const t={};h.forEach(n=>{t[n.zekken]=n.name}),console.log("🗺️ playerMap:",t);const{data:e,error:o}=await b.from("catches").select("*").eq("tournament_id",y).order("created_at",{ascending:!1}).limit(50);if(o){console.error("❌ 履歴読み込みエラー:",o);return}R=e||[],console.log("✅ 履歴読み込み完了:",R.length,"件");const i=document.getElementById("history-list");if(R.length===0){i.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}i.innerHTML=R.map(n=>{const s=t[n.zekken]||"未登録",c=new Date(n.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <strong style="font-size: 18px;">${n.zekken}番</strong>
                        <span style="font-size: 16px;">${s}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${n.length}cm</span>
                        ${n.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${n.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${c}</div>
                </div>
                ${k===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${n.id}, ${n.zekken}, ${n.length}, ${n.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${n.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,o,i){if(k!==2){a("管理者権限が必要です",!0);return}const n=h.find(c=>c.zekken===e),s=n?n.name:`${e}番`;le(t,e,s,o,i)};function le(t,e,o,i,n){const s=`
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
                    <div style="font-size: 20px; font-weight: bold; color: white;">${e}番: ${o}</div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">長寸 (cm) <span style="color: #ff6b6b;">*</span></label>
                        <input type="number" id="edit-length-input" value="${i}" step="0.1" style="
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
                        <input type="number" id="edit-weight-input" value="${n||""}" placeholder="任意" style="
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
    `;document.body.insertAdjacentHTML("beforeend",s);const c=document.getElementById("edit-catch-dialog"),l=document.getElementById("edit-length-input"),r=document.getElementById("edit-weight-input"),u=document.getElementById("edit-catch-cancel-btn"),p=document.getElementById("edit-catch-save-btn");u.onclick=()=>{c.remove()},p.onclick=async()=>{const m=parseFloat(l.value),d=parseFloat(r.value)||0;if(!m||m<=0){a("長寸を入力してください",!0);return}c.remove();const{error:f}=await b.from("catches").update({length:m,weight:d}).eq("id",t);if(f){console.error("❌ 更新エラー:",f),a("❌ 更新に失敗しました",!0);return}a(`✅ ${o}の釣果を更新しました`),await C(),await $()},l.addEventListener("keypress",m=>{m.key==="Enter"&&p.click()}),r.addEventListener("keypress",m=>{m.key==="Enter"&&p.click()}),c.addEventListener("click",m=>{m.target===c&&c.remove()}),l.focus(),l.select()}window.deleteCatch=async function(t){if(k!==2){a("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:e}=await b.from("catches").delete().eq("id",t);if(e){console.error("❌ 削除エラー:",e),a("❌ 削除に失敗しました",!0);return}a("✅ 削除しました"),await C(),await $()};async function $(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",g),console.log("📊 リミット匹数:",g.limit_count),console.log("🎯 大会ルール:",g.rule_type);const{data:t,error:e}=await b.from("catches").select("*").eq("tournament_id",y);if(e){console.error("❌ ランキング読み込みエラー:",e);return}const o=t||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const i={};h.forEach(d=>{i[d.zekken]=d});const n={};o.forEach(d=>{n[d.zekken]||(n[d.zekken]={zekken:d.zekken,lengths:[],weights:[],min_len:d.length,max_len:d.length,min_weight:d.weight||0,max_weight:d.weight||0}),n[d.zekken].lengths.push(d.length),n[d.zekken].weights.push(d.weight||0),n[d.zekken].min_len=Math.min(n[d.zekken].min_len,d.length),n[d.zekken].max_len=Math.max(n[d.zekken].max_len,d.length),n[d.zekken].min_weight=Math.min(n[d.zekken].min_weight,d.weight||0),n[d.zekken].max_weight=Math.max(n[d.zekken].max_weight,d.weight||0)});const s=Object.values(n).map(d=>{const f=[...d.lengths].sort((I,w)=>w-I),x=[...d.weights].sort((I,w)=>w-I),E=g.limit_count||999;console.log(`📊 選手${d.zekken}番の計算:`,{全釣果数:d.lengths.length,リミット匹数:E,全長寸:f,リミット長寸:f.slice(0,E)});const v=x.slice(0,E).reduce((I,w)=>I+w,0),B=f.slice(0,E).reduce((I,w)=>I+w,0);return{zekken:d.zekken,count:d.lengths.length,max_len:d.max_len,min_len:d.min_len,max_weight:d.max_weight,min_weight:d.min_weight,one_max_len:d.max_len,one_max_weight:d.max_weight,total_weight:d.weights.reduce((I,w)=>I+w,0),total_count:d.lengths.length,limit_weight:v,limit_total_len:B}}),c=g.rule_type||"max_len",l=g.sort1||null,r=g.sort2||null,u=g.sort3||null;s.sort((d,f)=>d[c]!==f[c]?f[c]-d[c]:l&&d[l]!==f[l]?f[l]-d[l]:r&&d[r]!==f[r]?f[r]-d[r]:u&&d[u]!==f[u]?f[u]-d[u]:0),O=s,console.log("✅ ランキング計算完了:",s.length,"人");const p=document.getElementById("show-biggest-fish")?.checked??!0;p?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),se(s,i)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const m=document.getElementById("show-smallest-fish")?.checked??!0;m?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),re(s,i)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!p&&!m&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),J(s,i)}function se(t,e){const o=document.getElementById("biggest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,r)=>r.max_len===l.max_len?r.max_weight-l.max_weight:r.max_len-l.max_len),n=new Set,s=[];for(const l of i)if(!n.has(l.zekken)&&(s.push(l),n.add(l.zekken),s.length===3))break;const c=document.getElementById("biggest-fish-list");c.innerHTML=s.map((l,r)=>{const u=e[l.zekken]||{},p=u.name||"未登録",m=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${p}</div>
                        ${m?`<div style="font-size: 10px; opacity: 0.8;">${m}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${l.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function re(t,e){const o=document.getElementById("smallest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,r)=>l.min_len===r.min_len?l.min_weight-r.min_weight:l.min_len-r.min_len),n=new Set,s=[];for(const l of i)if(!n.has(l.zekken)&&(s.push(l),n.add(l.zekken),s.length===3))break;const c=document.getElementById("smallest-fish-list");c.innerHTML=s.map((l,r)=>{const u=e[l.zekken]||{},p=u.name||"未登録",m=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${p}</div>
                        ${m?`<div style="font-size: 10px; opacity: 0.8;">${m}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${l.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function J(t,e){const o=g.rule_type||"max_len",i=g.sort1||null,n=g.sort2||null,s=g.limit_count||0,c=Math.min(j,t.length),l=t.slice(0,c),r=document.getElementById("ranking-list");r.innerHTML=l.map((p,m)=>{const d=m<3,f=e[p.zekken]||{},x=f.name||"未登録",E=f.club||"";let v=N[o];(o==="limit_total_len"||o==="limit_weight")&&s>0&&(v+=` (${s}匹)`);const B=H(o,p[o]),I=i?H(i,p[i]):null,w=n?H(n,p[n]):null;return`
            <div class="ranking-item ${d?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${m+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${p.zekken}番: ${x}</div>
                        ${E?`<div style="font-size: 14px; opacity: 0.8;">${E}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${v}</div>
                        <div class="stat-value" style="color: #FFD700;">${B}</div>
                    </div>
                    ${I?`
                    <div class="stat">
                        <div class="stat-label">${N[i]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${I}</div>
                    </div>
                    `:""}
                    ${w?`
                    <div class="stat">
                        <div class="stat-label">${N[n]}</div>
                        <div class="stat-value" style="color: #2196F3;">${w}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const u=document.getElementById("show-more-btn");t.length>j?u.style.display="block":u.style.display="none"}window.showMoreRankings=function(){j+=10;const t={};h.forEach(e=>{t[e.zekken]=e}),J(O,t),a("10件追加表示しました")};function H(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function D(){const{data:t,error:e}=await b.from("players").select("*").eq("tournament_id",y).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const o=t||[],i=document.getElementById("player-list");if(o.length===0){i.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}i.innerHTML=o.map(n=>`
        <div class="player-item">
            <div>
                <strong>${n.zekken}番:</strong>
                <span style="margin-left: 10px;">${n.name}</span>
                ${n.club?`<span style="color: #aaa; margin-left: 10px;">(${n.club})</span>`:""}
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; margin-right: 5px;" onclick="editPlayer(${n.zekken})">編集</button>
                <button class="btn btn-danger" onclick="deletePlayer(${n.zekken})">削除</button>
            </div>
        </div>
    `).join("")}window.editPlayer=async function(t){const e=h.find(o=>o.zekken===t);if(!e){a("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),ae(e,async o=>{if(!o)return;console.log("📝 更新データ:",o),console.log("📝 更新条件:",{tournament_id:y,zekken:t});const{data:i,error:n}=await b.from("players").update({name:o.name,club:o.club,reading:o.reading}).eq("tournament_id",y).eq("zekken",t).select();if(n){console.error("❌ 選手編集エラー:",n),console.error("❌ エラー詳細:",JSON.stringify(n,null,2)),a(`❌ 編集に失敗しました: ${n.message||n.code||"不明なエラー"}`,!0);return}if(!i||i.length===0){console.error("❌ 更新対象が見つかりませんでした"),a("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",i),a("✅ 選手情報を更新しました"),await z(),await D(),console.log("✅ 再読み込み後のALL_PLAYERS:",h.find(s=>s.zekken===t))})};function ae(t,e){const o=`
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
    `;document.body.insertAdjacentHTML("beforeend",o);const i=document.getElementById("edit-player-dialog"),n=document.getElementById("edit-name-input"),s=document.getElementById("edit-reading-input"),c=document.getElementById("edit-club-input"),l=document.getElementById("edit-cancel-btn"),r=document.getElementById("edit-ok-btn");l.onclick=()=>{i.remove(),e(null)},r.onclick=()=>{const u=n.value.trim(),p=s.value.trim(),m=c.value.trim();if(!u){a("名前は必須です",!0);return}i.remove(),e({name:u,reading:p,club:m})},n.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),s.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),c.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),i.addEventListener("click",u=>{u.target===i&&(i.remove(),e(null))}),n.focus(),n.select()}window.addPlayer=async function(){if(k!==2){a("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),o=document.getElementById("new-club").value.trim(),i=document.getElementById("new-reading").value.trim();if(!t||!e){a("ゼッケン番号と名前は必須です",!0);return}if(h.some(c=>c.zekken===t)){a(`${t}番は既に登録されています`,!0);return}const{error:s}=await b.from("players").insert({tournament_id:y,zekken:t,name:e,club:o||"",reading:i||""});if(s){console.error("選手追加エラー:",s),a("追加に失敗しました（重複の可能性）",!0);return}a("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await z(),await D()};let T=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const o=new FileReader;o.onload=function(i){const n=i.target.result;de(n)},o.readAsText(e,"UTF-8")};function de(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(r=>r.trim());if(e.length<2){a("❌ CSVファイルが空です",!0);return}const i=e[0].split(",").map(r=>r.trim());console.log("📋 ヘッダー:",i);const s=["ゼッケン番号","名前"].filter(r=>!i.includes(r));if(s.length>0){a(`❌ 必須列が不足: ${s.join(", ")}`,!0);return}const c=[],l=[];for(let r=1;r<e.length;r++){const p=e[r].split(",").map(v=>v.trim());if(p.length!==i.length){l.push(`${r+1}行目: 列数が一致しません`);continue}const m={};i.forEach((v,B)=>{m[v]=p[B]});const d=parseInt(m.ゼッケン番号),f=m.名前;if(!d||isNaN(d)||d<=0){l.push(`${r+1}行目: ゼッケン番号が不正です (${m.ゼッケン番号})`);continue}if(!f||f.trim()===""){l.push(`${r+1}行目: 名前が空です`);continue}if(c.some(v=>v.zekken===d)){l.push(`${r+1}行目: ゼッケン番号 ${d} が重複しています`);continue}const E=h.find(v=>v.zekken===d);if(E){l.push(`${r+1}行目: ゼッケン番号 ${d} は既に登録されています (${E.name})`);continue}c.push({zekken:d,name:f,reading:m.読み仮名||"",club:m.所属||""})}if(console.log("✅ パース完了:",c.length,"件"),console.log("❌ エラー:",l.length,"件"),l.length>0){console.error("エラー詳細:",l),a(`⚠️ ${l.length}件のエラーがあります`,!0);const r=l.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${r}${l.length>5?`

...他${l.length-5}件`:""}`)}if(c.length===0){a("❌ インポート可能なデータがありません",!0);return}T=c,ce(c,l)}catch(e){console.error("❌ CSVパースエラー:",e),a("❌ CSVファイルの読み込みに失敗しました",!0)}}function ce(t,e){const o=document.getElementById("csv-preview"),i=document.getElementById("csv-preview-content");let n=`
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
    `;t.forEach(s=>{n+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${s.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.club||"-"}</td>
            </tr>
        `}),n+=`
            </tbody>
        </table>
    `,i.innerHTML=n,o.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(T.length===0){a("❌ インポートするデータがありません",!0);return}if(k!==2){a("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",T.length,"件");try{const t=T.map(i=>({tournament_id:y,zekken:i.zekken,name:i.name,reading:i.reading,club:i.club})),{data:e,error:o}=await b.from("players").insert(t).select();if(o){console.error("❌ インポートエラー:",o),a(`❌ インポートに失敗しました: ${o.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),a(`✅ ${e.length}件の選手を登録しました！`),T=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await z(),await D()}catch(t){console.error("❌ インポート例外:",t),a("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){T=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",a("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await b.from("players").delete().eq("tournament_id",y).eq("zekken",t);if(e){console.error("選手削除エラー:",e),a("❌ 削除に失敗しました",!0);return}a("✅ 削除しました"),await z(),await D()};const N={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),o=document.getElementById("add-player-btn");if(!t){e.style.display="none",o.disabled=!1;return}const i=parseInt(t);h.some(s=>s.zekken===i)?(e.textContent=`⚠️ ${i}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",o.disabled=!0):(e.textContent=`✅ ${i}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",o.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,o=document.getElementById("sort2").value,i=[t];e&&i.push(e),o&&i.push(o),A("sort1",i,[t]),A("sort2",i,[t,e]),A("sort3",i,[t,e,o])};function A(t,e,o){const i=document.getElementById(t),n=i.value;i.innerHTML='<option value="">選択しない</option>';const s={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[c,l]of Object.entries(s))if(!o.includes(c)||c===n){const r=document.createElement("option");r.value=c,r.textContent=l,c===n&&(r.selected=!0),i.appendChild(r)}}async function ue(){if(console.log("⚙️ 大会設定読み込み開始"),!g||!g.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=g.rule_type||"limit_total_len",ge(g.limit_count||0);const t=localStorage.getItem(`${y}_show_biggest_fish`),e=localStorage.getItem(`${y}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=e===null?!0:e==="true",updateSortOptions(),document.getElementById("sort1").value=g.sort1||"",document.getElementById("sort2").value=g.sort2||"",document.getElementById("sort3").value=g.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",g)}function ge(t){const e=document.getElementById("limit-count-picker"),o=document.getElementById("limit-count"),i=e.querySelectorAll(".limit-option");o.value=t;const n=Array.from(i).find(l=>parseInt(l.dataset.value)===t);n&&(n.scrollIntoView({block:"center",behavior:"auto"}),c());let s;e.addEventListener("scroll",function(){clearTimeout(s),s=setTimeout(()=>{c()},100)}),i.forEach(l=>{l.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>c(),300)})});function c(){const l=e.getBoundingClientRect(),r=l.top+l.height/2;let u=null,p=1/0;i.forEach(m=>{const d=m.getBoundingClientRect(),f=d.top+d.height/2,x=Math.abs(r-f);x<p&&(p=x,u=m)}),u&&(i.forEach(m=>m.classList.remove("selected")),u.classList.add("selected"),o.value=u.dataset.value,console.log("📊 リミット匹数変更:",o.value))}}window.updateTournamentSettings=async function(){if(k!==2){a("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,o=document.getElementById("sort1").value,i=document.getElementById("sort2").value,n=document.getElementById("sort3").value,s=document.getElementById("show-biggest-fish").checked,c=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${y}_show_biggest_fish`,s),localStorage.setItem(`${y}_show_smallest_fish`,c);const l=[o,i,n].filter(x=>x!==""),r=new Set(l);if(l.length!==r.size){a("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:o,sort2:i,sort3:n,showBiggestFish:s,showSmallestFish:c}),console.log("💾 更新条件:",{id:y}),console.log("💾 更新前のCONFIG.limit_count:",g.limit_count);const{data:u,error:p}=await b.from("tournaments").update({rule_type:t,limit_count:e,sort1:o||null,sort2:i||null,sort3:n||null}).eq("id",y).select();if(console.log("💾 UPDATE結果 - data:",u),console.log("💾 UPDATE結果 - error:",p),p){console.error("❌ 設定保存エラー:",p),console.error("❌ エラー詳細:",JSON.stringify(p,null,2)),console.error("❌ エラーコード:",p.code),console.error("❌ エラーメッセージ:",p.message),alert(`❌ 設定保存エラー: ${p.message}
コード: ${p.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),a(`❌ 設定の保存に失敗しました: ${p.message||p.code||"不明なエラー"}`,!0);return}if(!u||u.length===0){console.error("❌ 更新対象が見つかりませんでした"),a("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",u);const{data:m,error:d}=await b.from("tournaments").select("*").eq("id",y).single();if(d||!m){console.error("❌ 設定再取得エラー:",d),a("❌ 設定の再取得に失敗しました",!0);return}g=m,console.log("✅ 再取得後のCONFIG:",g),a("✅ 設定を保存しました");const f=g.limit_count>0?`リミット${g.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=f,await $(),console.log("✅ 設定保存完了")};function a(t,e=!1){const o=document.getElementById("toast");o.textContent=t,o.className="toast"+(e?" error":""),o.style.display="block",setTimeout(()=>{o.style.display="none"},3e3)}let F=null;function me(t,e){F=e,document.getElementById("confirm-message").textContent=t;const o=document.getElementById("confirm-dialog");o.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",F&&(F(),F=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",F=null};console.log("✅ システム準備完了");function pe(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+y;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{a("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),a("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(k!==2){a("管理者権限が必要です",!0);return}const e=!(g.is_ended||!1),o=e?"終了":"再開";if(!confirm(`大会を${o}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:i}=await b.from("tournaments").update({is_ended:e}).eq("id",y);if(i){console.error("❌ 更新エラー:",i),a(`❌ ${o}に失敗しました`,!0);return}g.is_ended=e,V(),a(`✅ 大会を${o}しました`),G()};function V(){const t=g.is_ended||!1,e=document.getElementById("tournament-status-display"),o=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",o.innerHTML="▶️ 大会を再開",o.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",o.innerHTML="⏸️ 大会を終了",o.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function G(){const t=g.is_ended||!1,e=document.getElementById("input-form");t&&k!==2&&(e.style.display="none",a("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(k!==2){a("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+y+"」を入力してください:");if(t!==y){t!==null&&a("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await b.from("catches").delete().eq("tournament_id",y);if(e)throw e;const{error:o}=await b.from("players").delete().eq("tournament_id",y);if(o)throw o;const{error:i}=await b.from("tournaments").delete().eq("id",y);if(i)throw i;a("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),a("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(k!==2){a("管理者権限が必要です",!0);return}try{const t=O||[],e=h||[];if(t.length===0){a("❌ エクスポートするデータがありません",!0);return}let o=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`;t.forEach((u,p)=>{const m=e.find(d=>d.zekken===u.zekken)||{};o+=`${p+1},${u.zekken},"${m.name||"未登録"}","${m.club||""}",${u.limit_total_len||0},${u.one_max_len||0},${u.one_max_weight||0},${u.total_count||0},${u.total_weight||0}
`});const i=g.name||"tournament",n=new Date().toISOString().split("T")[0],s=`${i}_result_${n}.csv`,c="\uFEFF",l=new Blob([c+o],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a");r.href=URL.createObjectURL(l),r.download=s,r.click(),a("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),a("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const o=document.getElementById(e);o&&o.addEventListener("input",function(i){const n=i.target.value,s=Z(n);n!==s&&(i.target.value=s)})})});window.exportPDF=async function(){try{if(a("📄 PDF生成中..."),typeof window.jspdf>"u"||typeof html2canvas>"u"){a("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:t}=window.jspdf,e=O||[],o=h||[];if(e.length===0){a("❌ まだ釣果データがありません",!0);return}const n={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[g.rule_type]||"リミット合計長寸",s=g.limit_count>0?`(リミット${g.limit_count}匹)`:"(無制限)",c=document.createElement("div");c.style.cssText=`
            position: absolute;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
            color: #333;
        `;const l=g.name||"釣り大会",r=new Date().toLocaleDateString("ja-JP");if(c.innerHTML=`
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #667eea;">${l}</h1>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">作成日: ${r}</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">ルール: ${n} ${s}</p>
            </div>
            
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">順位</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">ゼッケン</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">名前</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">所属</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold;">${n}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${e.map((w,_)=>{const L=o.find(Q=>Q.zekken===w.zekken)||{},M=H(g.rule_type,w[g.rule_type]);return`
                                <tr style="background: ${_%2===0?"#f9f9f9":"white"};">
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${_+1}位</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${w.zekken}番</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${L.name||"未登録"}</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${L.club||"-"}</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">${M}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            </div>
        `,g.show_biggest_fish||g.show_smallest_fish){const w=[];if(g.show_biggest_fish){const _=await fe();if(_){const L=o.find(M=>M.zekken===_.zekken)||{};w.push(`
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <strong style="color: #667eea; font-size: 16px;">🐟 大物賞</strong><br>
                            <span style="font-size: 14px; margin-top: 5px; display: inline-block;">
                                ${L.name||"未登録"} (${_.zekken}番) - ${_.length}cm
                            </span>
                        </div>
                    `)}}if(g.show_smallest_fish){const _=await ye();if(_){const L=o.find(M=>M.zekken===_.zekken)||{};w.push(`
                        <div style="background: rgba(255, 183, 77, 0.1); padding: 15px; border-radius: 8px;">
                            <strong style="color: #ff8c00; font-size: 16px;">🎣 最小寸賞</strong><br>
                            <span style="font-size: 14px; margin-top: 5px; display: inline-block;">
                                ${L.name||"未登録"} (${_.zekken}番) - ${_.length}cm
                            </span>
                        </div>
                    `)}}w.length>0&&(c.innerHTML+=`
                    <div style="margin-top: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">🏆 特別賞</h2>
                        ${w.join("")}
                    </div>
                `)}document.body.appendChild(c);const u=await html2canvas(c,{scale:2,backgroundColor:"#ffffff",logging:!1});document.body.removeChild(c);const p=u.toDataURL("image/png"),m=210,d=u.height*m/u.width,f=new t({orientation:(d>297,"portrait"),unit:"mm",format:"a4"});let x=0;const E=297;for(;x<d;)x>0&&f.addPage(),f.addImage(p,"PNG",0,-x,m,d),x+=E;const v=g.name||"tournament",B=new Date().toISOString().split("T")[0],I=`${v}_ranking_${B}.pdf`;f.save(I),a("✅ PDFファイルをダウンロードしました")}catch(t){console.error("❌ PDF生成エラー:",t),a("❌ PDF生成に失敗しました: "+t.message,!0)}};async function fe(){const{data:t,error:e}=await b.from("catches").select("*").eq("tournament_id",y).order("length",{ascending:!1}).limit(1);return e||!t||t.length===0?null:t[0]}async function ye(){const{data:t,error:e}=await b.from("catches").select("*").eq("tournament_id",y).order("length",{ascending:!0}).limit(1);return e||!t||t.length===0?null:t[0]}
