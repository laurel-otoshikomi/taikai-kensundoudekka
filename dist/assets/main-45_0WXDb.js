import{createClient as Z}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const J="https://pkjvdtvomqzcnfhkqven.supabase.co",G="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",k=Z(J,G);let b=0,m={},f=null,h=[],M=[],A=!0,C=null,H=10,q=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await Q(e):V()});function V(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",j()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){d("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function j(){const{data:t,error:e}=await k.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),o=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),o.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){o.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}o.innerHTML=t.map(i=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${i.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${i.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${i.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),o=document.getElementById("new-tournament-admin-password").value.trim(),i=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!o){d("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){d("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:n,error:s}=await k.from("tournaments").insert({id:t,name:e,password:o,staff_password:i||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(s){console.error("大会作成エラー:",s),s.code==="23505"?d("この大会IDは既に使用されています",!0):d("大会の作成に失敗しました",!0);return}d("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await j(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function Q(t){f=t,console.log("📂 大会ID:",f);const{data:e,error:o}=await k.from("tournaments").select("*").eq("id",f).single();if(o||!e){console.error("大会取得エラー:",o),alert("大会が見つかりません"),V();return}m=e,console.log("✅ 大会情報取得:",m),console.log("📋 大会ルール:",m.rule_type),console.log("📊 リミット匹数:",m.limit_count),console.log("🎯 優先順位1:",m.sort1),console.log("🎯 優先順位2:",m.sort2),console.log("🎯 優先順位3:",m.sort3),document.getElementById("tournament-name").textContent=m.name;const i=m.limit_count>0?`リミット${m.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=i,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await B(),await _(),ce(),b===2&&(document.getElementById("tournament-management-card").style.display="block",D()),Y(),K()}function K(){C&&C.unsubscribe(),C=k.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${f}`},()=>{A&&(console.log("⚡ リアルタイム更新"),_(),b>0&&z())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){A=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");A?(t.style.display="none",d("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",d("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){d("🔄 更新中..."),await _(),b>0&&await z(),d("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((o,i)=>{o.classList.remove("active"),(t==="ranking"&&i===0||t==="input"&&i===1||t==="settings"&&i===2)&&o.classList.add("active")}),document.querySelectorAll(".view").forEach(o=>{o.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),_()):t==="input"?(document.getElementById("input-view").classList.add("active"),b>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",B(),z()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),b===2&&(document.getElementById("rule-settings-card").style.display="block",re()),b>0&&B().then(()=>S()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===m.password)b=2,d("✅ 管理者としてログイン"),P("管理者");else if(t===m.staff_password)b=1,d("✅ 運営スタッフとしてログイン"),P("運営スタッフ");else{d("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",b),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",b===2&&(document.getElementById("tournament-management-card").style.display="block",D()),B(),z()};window.logout=function(){de("ログアウトしますか？",()=>{b=0,C&&(C.unsubscribe(),C=null),d("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function P(t){const e=document.getElementById("login-status"),o=document.getElementById("login-status-text");o.textContent=`${t}としてログイン中`,e.style.display="block"}async function B(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await k.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}h=t||[],console.log("✅ 選手データ読み込み完了:",h.length,"人"),h.length>0&&console.log("📋 選手サンプル:",h[0]);const o=document.getElementById("player-select");o.innerHTML='<option value="">選手を選択してください</option>',h.forEach(i=>{const n=document.createElement("option");n.value=i.zekken,n.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,o.appendChild(n)})}function U(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function X(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const o=e.charCodeAt(0)-96;return String.fromCharCode(o)})}function ee(t){return t.replace(/[\u3041-\u3096]/g,function(e){const o=e.charCodeAt(0)+96;return String.fromCharCode(o)})}function F(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=X(t),o=ee(t),i=U(t);return{original:t,hiragana:e,katakana:o,halfWidth:i}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select"),n=t.value.trim();if(console.log("🔍 検索クエリ:",n),console.log("🔍 選手データ数:",h.length),h.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),h.slice(0,3).forEach(l=>{console.log(`  - ${l.zekken}番: ${l.name} (${l.club||"所属なし"})`)})),e.style.display=n?"block":"none",!n){i.innerHTML='<option value="">選手を選択してください</option>',h.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(r)}),o.textContent="";return}const s=F(n);console.log("🔧 正規化された検索クエリ:",{元:s.original,ひらがな:s.hiragana,カタカナ:s.katakana,半角:s.halfWidth});const c=h.filter(l=>{if(l.zekken.toString()===n||l.zekken.toString()===s.halfWidth)return console.log("✅ ゼッケン一致:",l.zekken),!0;if(l.reading){const r=F(l.reading);if(l.reading.includes(n))return console.log("✅ 読み仮名一致（完全）:",l.reading,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",l.reading,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",l.reading,"検索:",n),!0}if(l.name){const r=F(l.name);if(l.name.includes(n))return console.log("✅ 名前一致（完全）:",l.name,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",l.name,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",l.name,"検索:",n),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 名前一致（半角）:",l.name,"検索:",n),!0;const u=l.name.toLowerCase(),g=n.toLowerCase();if(u.includes(g))return console.log("✅ 名前一致（英語）:",l.name,"検索:",n),!0}if(l.club){const r=F(l.club);if(l.club.includes(n))return console.log("✅ 所属一致（完全）:",l.club,"検索:",n),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",l.club,"検索:",n),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",l.club,"検索:",n),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 所属一致（半角）:",l.club,"検索:",n),!0;const u=l.club.toLowerCase(),g=n.toLowerCase();if(u.includes(g))return console.log("✅ 所属一致（英語）:",l.club,"検索:",n),!0}return!1});console.log("🔍 検索結果:",c.length,"件"),i.innerHTML='<option value="">選手を選択してください</option>',c.length===0?(o.textContent="該当する選手が見つかりません",o.style.color="#ff6b6b"):(c.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(r)}),o.textContent=`${c.length}件の選手が見つかりました`,o.style.color="#51cf66",c.length===1&&(i.value=c[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select");t.value="",e.style.display="none",o.textContent="",i.innerHTML='<option value="">選手を選択してください</option>',h.forEach(n=>{const s=document.createElement("option");s.value=n.zekken,s.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,i.appendChild(s)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),o=document.getElementById("search-input-mode"),i=document.getElementById("tab-zekken"),n=document.getElementById("tab-search");t==="zekken"?(e.style.display="block",o.style.display="none",i.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",i.style.color="white",i.style.border="none",i.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",o.style.display="block",n.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",n.style.color="white",n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 0.6)",i.style.border="2px solid rgba(255, 255, 255, 0.2)",i.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),o=document.getElementById("player-name-display"),i=document.getElementById("player-club-display"),n=document.getElementById("player-error-display"),s=parseInt(t.value);if(!s||isNaN(s)){e.style.display="none",n.style.display="none";return}const c=h.find(l=>l.zekken===s);c?(e.style.display="block",n.style.display="none",o.textContent=`${c.zekken}番: ${c.name}`,i.textContent=c.club?`所属: ${c.club}`:"所属なし",console.log("✅ 選手が見つかりました:",c)):(e.style.display="none",n.style.display="block",console.log("❌ 選手が見つかりません:",s))};window.registerCatch=async function(){if(b===0){d("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const o=parseFloat(document.getElementById("length-input").value),i=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:o,weight:i,mode:t?"ゼッケン":"検索"}),!e){d("選手を選択してください",!0);return}if(!o||o<=0){d("長寸を入力してください",!0);return}const n=h.find(l=>l.zekken==e);if(!n){d("選手が見つかりません",!0);return}const s=n.name,{error:c}=await k.from("catches").insert({tournament_id:f,zekken:e,length:o,weight:i});if(c){console.error("❌ 登録エラー:",c),d("登録に失敗しました",!0);return}console.log("✅ 登録成功"),d(`✅ ${s}: ${o}cm ${i>0?i+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await z(),await _()};async function z(){console.log("📋 履歴読み込み開始");const t={};h.forEach(n=>{t[n.zekken]=n.name});const{data:e,error:o}=await k.from("catches").select("*").eq("tournament_id",f).order("created_at",{ascending:!1}).limit(50);if(o){console.error("❌ 履歴読み込みエラー:",o);return}M=e||[],console.log("✅ 履歴読み込み完了:",M.length,"件");const i=document.getElementById("history-list");if(M.length===0){i.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}i.innerHTML=M.map(n=>{const s=t[n.zekken],c=s?s.name:"未登録",l=new Date(n.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <span style="font-size: 16px;">${c}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${n.length}cm</span>
                        ${n.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${n.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${l}</div>
                </div>
                ${b===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${n.id}, ${n.zekken}, ${n.length}, ${n.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${n.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,o,i){if(b!==2){d("管理者権限が必要です",!0);return}const n=h.find(c=>c.zekken===e),s=n?n.name:`${e}番`;te(t,e,s,o,i)};function te(t,e,o,i,n){const s=`
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
    `;document.body.insertAdjacentHTML("beforeend",s);const c=document.getElementById("edit-catch-dialog"),l=document.getElementById("edit-length-input"),r=document.getElementById("edit-weight-input"),u=document.getElementById("edit-catch-cancel-btn"),g=document.getElementById("edit-catch-save-btn");u.onclick=()=>{c.remove()},g.onclick=async()=>{const p=parseFloat(l.value),a=parseFloat(r.value)||0;if(!p||p<=0){d("長寸を入力してください",!0);return}c.remove();const{error:y}=await k.from("catches").update({length:p,weight:a}).eq("id",t);if(y){console.error("❌ 更新エラー:",y),d("❌ 更新に失敗しました",!0);return}d(`✅ ${o}の釣果を更新しました`),await z(),await _()},l.addEventListener("keypress",p=>{p.key==="Enter"&&g.click()}),r.addEventListener("keypress",p=>{p.key==="Enter"&&g.click()}),c.addEventListener("click",p=>{p.target===c&&c.remove()}),l.focus(),l.select()}window.deleteCatch=async function(t){if(b!==2){d("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:e}=await k.from("catches").delete().eq("id",t);if(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await z(),await _()};async function _(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",m),console.log("📊 リミット匹数:",m.limit_count),console.log("🎯 大会ルール:",m.rule_type);const{data:t,error:e}=await k.from("catches").select("*").eq("tournament_id",f);if(e){console.error("❌ ランキング読み込みエラー:",e);return}const o=t||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const i={};h.forEach(a=>{i[a.zekken]=a});const n={};o.forEach(a=>{n[a.zekken]||(n[a.zekken]={zekken:a.zekken,lengths:[],weights:[],min_len:a.length,max_len:a.length,min_weight:a.weight||0,max_weight:a.weight||0}),n[a.zekken].lengths.push(a.length),n[a.zekken].weights.push(a.weight||0),n[a.zekken].min_len=Math.min(n[a.zekken].min_len,a.length),n[a.zekken].max_len=Math.max(n[a.zekken].max_len,a.length),n[a.zekken].min_weight=Math.min(n[a.zekken].min_weight,a.weight||0),n[a.zekken].max_weight=Math.max(n[a.zekken].max_weight,a.weight||0)});const s=Object.values(n).map(a=>{const y=[...a.lengths].sort((v,x)=>x-v),E=[...a.weights].sort((v,x)=>x-v),I=m.limit_count||999;console.log(`📊 選手${a.zekken}番の計算:`,{全釣果数:a.lengths.length,リミット匹数:I,全長寸:y,リミット長寸:y.slice(0,I)});const w=E.slice(0,I).reduce((v,x)=>v+x,0),L=y.slice(0,I).reduce((v,x)=>v+x,0);return{zekken:a.zekken,count:a.lengths.length,max_len:a.max_len,min_len:a.min_len,max_weight:a.max_weight,min_weight:a.min_weight,one_max_len:a.max_len,one_max_weight:a.max_weight,total_weight:a.weights.reduce((v,x)=>v+x,0),total_count:a.lengths.length,limit_weight:w,limit_total_len:L}}),c=m.rule_type||"max_len",l=m.sort1||null,r=m.sort2||null,u=m.sort3||null;s.sort((a,y)=>a[c]!==y[c]?y[c]-a[c]:l&&a[l]!==y[l]?y[l]-a[l]:r&&a[r]!==y[r]?y[r]-a[r]:u&&a[u]!==y[u]?y[u]-a[u]:0),q=s,console.log("✅ ランキング計算完了:",s.length,"人");const g=document.getElementById("show-biggest-fish")?.checked??!0;g?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ne(s,i)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const p=document.getElementById("show-smallest-fish")?.checked??!0;p?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),oe(s,i)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!g&&!p&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),W(s,i)}function ne(t,e){const o=document.getElementById("biggest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,r)=>r.max_len===l.max_len?r.max_weight-l.max_weight:r.max_len-l.max_len),n=new Set,s=[];for(const l of i)if(!n.has(l.zekken)&&(s.push(l),n.add(l.zekken),s.length===3))break;const c=document.getElementById("biggest-fish-list");c.innerHTML=s.map((l,r)=>{const u=e[l.zekken]||{},g=u.name||"未登録",p=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${g}</div>
                        ${p?`<div style="font-size: 10px; opacity: 0.8;">${p}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${l.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function oe(t,e){const o=document.getElementById("smallest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,r)=>l.min_len===r.min_len?l.min_weight-r.min_weight:l.min_len-r.min_len),n=new Set,s=[];for(const l of i)if(!n.has(l.zekken)&&(s.push(l),n.add(l.zekken),s.length===3))break;const c=document.getElementById("smallest-fish-list");c.innerHTML=s.map((l,r)=>{const u=e[l.zekken]||{},g=u.name||"未登録",p=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${g}</div>
                        ${p?`<div style="font-size: 10px; opacity: 0.8;">${p}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${l.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function W(t,e){const o=m.rule_type||"max_len",i=m.sort1||null,n=m.sort2||null,s=m.limit_count||0,c=Math.min(H,t.length),l=t.slice(0,c),r=document.getElementById("ranking-list");r.innerHTML=l.map((g,p)=>{const a=p<3,y=e[g.zekken]||{},E=y.name||"未登録",I=y.club||"";let w=O[o];(o==="limit_total_len"||o==="limit_weight")&&s>0&&(w+=` (${s}匹)`);const L=R(o,g[o]),v=i?R(i,g[i]):null,x=n?R(n,g[n]):null;return`
            <div class="ranking-item ${a?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${p+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${g.zekken}番: ${E}</div>
                        ${I?`<div style="font-size: 14px; opacity: 0.8;">${I}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${w}</div>
                        <div class="stat-value" style="color: #FFD700;">${L}</div>
                    </div>
                    ${v?`
                    <div class="stat">
                        <div class="stat-label">${O[i]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${v}</div>
                    </div>
                    `:""}
                    ${x?`
                    <div class="stat">
                        <div class="stat-label">${O[n]}</div>
                        <div class="stat-value" style="color: #2196F3;">${x}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const u=document.getElementById("show-more-btn");t.length>H?u.style.display="block":u.style.display="none"}window.showMoreRankings=function(){H+=10;const t={};h.forEach(e=>{t[e.zekken]=e}),W(q,t),d("10件追加表示しました")};function R(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function S(){const{data:t,error:e}=await k.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const o=t||[],i=document.getElementById("player-list");if(o.length===0){i.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}i.innerHTML=o.map(n=>`
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
    `).join("")}window.editPlayer=async function(t){const e=h.find(o=>o.zekken===t);if(!e){d("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),ie(e,async o=>{if(!o)return;console.log("📝 更新データ:",o),console.log("📝 更新条件:",{tournament_id:f,zekken:t});const{data:i,error:n}=await k.from("players").update({name:o.name,club:o.club,reading:o.reading}).eq("tournament_id",f).eq("zekken",t).select();if(n){console.error("❌ 選手編集エラー:",n),console.error("❌ エラー詳細:",JSON.stringify(n,null,2)),d(`❌ 編集に失敗しました: ${n.message||n.code||"不明なエラー"}`,!0);return}if(!i||i.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",i),d("✅ 選手情報を更新しました"),await B(),await S(),console.log("✅ 再読み込み後のALL_PLAYERS:",h.find(s=>s.zekken===t))})};function ie(t,e){const o=`
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
    `;document.body.insertAdjacentHTML("beforeend",o);const i=document.getElementById("edit-player-dialog"),n=document.getElementById("edit-name-input"),s=document.getElementById("edit-reading-input"),c=document.getElementById("edit-club-input"),l=document.getElementById("edit-cancel-btn"),r=document.getElementById("edit-ok-btn");l.onclick=()=>{i.remove(),e(null)},r.onclick=()=>{const u=n.value.trim(),g=s.value.trim(),p=c.value.trim();if(!u){d("名前は必須です",!0);return}i.remove(),e({name:u,reading:g,club:p})},n.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),s.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),c.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),i.addEventListener("click",u=>{u.target===i&&(i.remove(),e(null))}),n.focus(),n.select()}window.addPlayer=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),o=document.getElementById("new-club").value.trim(),i=document.getElementById("new-reading").value.trim();if(!t||!e){d("ゼッケン番号と名前は必須です",!0);return}if(h.some(c=>c.zekken===t)){d(`${t}番は既に登録されています`,!0);return}const{error:s}=await k.from("players").insert({tournament_id:f,zekken:t,name:e,club:o||"",reading:i||""});if(s){console.error("選手追加エラー:",s),d("追加に失敗しました（重複の可能性）",!0);return}d("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await B(),await S()};let $=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const o=new FileReader;o.onload=function(i){const n=i.target.result;le(n)},o.readAsText(e,"UTF-8")};function le(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(r=>r.trim());if(e.length<2){d("❌ CSVファイルが空です",!0);return}const i=e[0].split(",").map(r=>r.trim());console.log("📋 ヘッダー:",i);const s=["ゼッケン番号","名前"].filter(r=>!i.includes(r));if(s.length>0){d(`❌ 必須列が不足: ${s.join(", ")}`,!0);return}const c=[],l=[];for(let r=1;r<e.length;r++){const g=e[r].split(",").map(w=>w.trim());if(g.length!==i.length){l.push(`${r+1}行目: 列数が一致しません`);continue}const p={};i.forEach((w,L)=>{p[w]=g[L]});const a=parseInt(p.ゼッケン番号),y=p.名前;if(!a||isNaN(a)||a<=0){l.push(`${r+1}行目: ゼッケン番号が不正です (${p.ゼッケン番号})`);continue}if(!y||y.trim()===""){l.push(`${r+1}行目: 名前が空です`);continue}if(c.some(w=>w.zekken===a)){l.push(`${r+1}行目: ゼッケン番号 ${a} が重複しています`);continue}const I=h.find(w=>w.zekken===a);if(I){l.push(`${r+1}行目: ゼッケン番号 ${a} は既に登録されています (${I.name})`);continue}c.push({zekken:a,name:y,reading:p.読み仮名||"",club:p.所属||""})}if(console.log("✅ パース完了:",c.length,"件"),console.log("❌ エラー:",l.length,"件"),l.length>0){console.error("エラー詳細:",l),d(`⚠️ ${l.length}件のエラーがあります`,!0);const r=l.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${r}${l.length>5?`

...他${l.length-5}件`:""}`)}if(c.length===0){d("❌ インポート可能なデータがありません",!0);return}$=c,se(c,l)}catch(e){console.error("❌ CSVパースエラー:",e),d("❌ CSVファイルの読み込みに失敗しました",!0)}}function se(t,e){const o=document.getElementById("csv-preview"),i=document.getElementById("csv-preview-content");let n=`
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
    `,i.innerHTML=n,o.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if($.length===0){d("❌ インポートするデータがありません",!0);return}if(b!==2){d("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",$.length,"件");try{const t=$.map(i=>({tournament_id:f,zekken:i.zekken,name:i.name,reading:i.reading,club:i.club})),{data:e,error:o}=await k.from("players").insert(t).select();if(o){console.error("❌ インポートエラー:",o),d(`❌ インポートに失敗しました: ${o.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),d(`✅ ${e.length}件の選手を登録しました！`),$=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await B(),await S()}catch(t){console.error("❌ インポート例外:",t),d("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){$=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",d("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await k.from("players").delete().eq("tournament_id",f).eq("zekken",t);if(e){console.error("選手削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await B(),await S()};const O={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),o=document.getElementById("add-player-btn");if(!t){e.style.display="none",o.disabled=!1;return}const i=parseInt(t);h.some(s=>s.zekken===i)?(e.textContent=`⚠️ ${i}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",o.disabled=!0):(e.textContent=`✅ ${i}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",o.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,o=document.getElementById("sort2").value,i=[t];e&&i.push(e),o&&i.push(o),N("sort1",i,[t]),N("sort2",i,[t,e]),N("sort3",i,[t,e,o])};function N(t,e,o){const i=document.getElementById(t),n=i.value;i.innerHTML='<option value="">選択しない</option>';const s={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[c,l]of Object.entries(s))if(!o.includes(c)||c===n){const r=document.createElement("option");r.value=c,r.textContent=l,c===n&&(r.selected=!0),i.appendChild(r)}}async function re(){if(console.log("⚙️ 大会設定読み込み開始"),!m||!m.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=m.rule_type||"limit_total_len",ae(m.limit_count||0);const t=localStorage.getItem(`${f}_show_biggest_fish`),e=localStorage.getItem(`${f}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=e===null?!0:e==="true",updateSortOptions(),document.getElementById("sort1").value=m.sort1||"",document.getElementById("sort2").value=m.sort2||"",document.getElementById("sort3").value=m.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",m)}function ae(t){const e=document.getElementById("limit-count-picker"),o=document.getElementById("limit-count"),i=e.querySelectorAll(".limit-option");o.value=t;const n=Array.from(i).find(l=>parseInt(l.dataset.value)===t);n&&(n.scrollIntoView({block:"center",behavior:"auto"}),c());let s;e.addEventListener("scroll",function(){clearTimeout(s),s=setTimeout(()=>{c()},100)}),i.forEach(l=>{l.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>c(),300)})});function c(){const l=e.getBoundingClientRect(),r=l.top+l.height/2;let u=null,g=1/0;i.forEach(p=>{const a=p.getBoundingClientRect(),y=a.top+a.height/2,E=Math.abs(r-y);E<g&&(g=E,u=p)}),u&&(i.forEach(p=>p.classList.remove("selected")),u.classList.add("selected"),o.value=u.dataset.value,console.log("📊 リミット匹数変更:",o.value))}}window.updateTournamentSettings=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,o=document.getElementById("sort1").value,i=document.getElementById("sort2").value,n=document.getElementById("sort3").value,s=document.getElementById("show-biggest-fish").checked,c=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${f}_show_biggest_fish`,s),localStorage.setItem(`${f}_show_smallest_fish`,c);const l=[o,i,n].filter(E=>E!==""),r=new Set(l);if(l.length!==r.size){d("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:o,sort2:i,sort3:n,showBiggestFish:s,showSmallestFish:c}),console.log("💾 更新条件:",{id:f}),console.log("💾 更新前のCONFIG.limit_count:",m.limit_count);const{data:u,error:g}=await k.from("tournaments").update({rule_type:t,limit_count:e,sort1:o||null,sort2:i||null,sort3:n||null}).eq("id",f).select();if(console.log("💾 UPDATE結果 - data:",u),console.log("💾 UPDATE結果 - error:",g),g){console.error("❌ 設定保存エラー:",g),console.error("❌ エラー詳細:",JSON.stringify(g,null,2)),console.error("❌ エラーコード:",g.code),console.error("❌ エラーメッセージ:",g.message),alert(`❌ 設定保存エラー: ${g.message}
コード: ${g.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),d(`❌ 設定の保存に失敗しました: ${g.message||g.code||"不明なエラー"}`,!0);return}if(!u||u.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",u);const{data:p,error:a}=await k.from("tournaments").select("*").eq("id",f).single();if(a||!p){console.error("❌ 設定再取得エラー:",a),d("❌ 設定の再取得に失敗しました",!0);return}m=p,console.log("✅ 再取得後のCONFIG:",m),d("✅ 設定を保存しました");const y=m.limit_count>0?`リミット${m.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=y,await _(),console.log("✅ 設定保存完了")};function d(t,e=!1){const o=document.getElementById("toast");o.textContent=t,o.className="toast"+(e?" error":""),o.style.display="block",setTimeout(()=>{o.style.display="none"},3e3)}let T=null;function de(t,e){T=e,document.getElementById("confirm-message").textContent=t;const o=document.getElementById("confirm-dialog");o.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",T&&(T(),T=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",T=null};console.log("✅ システム準備完了");function ce(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+f;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{d("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),d("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const e=!(m.is_ended||!1),o=e?"終了":"再開";if(!confirm(`大会を${o}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:i}=await k.from("tournaments").update({is_ended:e}).eq("id",f);if(i){console.error("❌ 更新エラー:",i),d(`❌ ${o}に失敗しました`,!0);return}m.is_ended=e,D(),d(`✅ 大会を${o}しました`),Y()};function D(){const t=m.is_ended||!1,e=document.getElementById("tournament-status-display"),o=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",o.innerHTML="▶️ 大会を再開",o.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",o.innerHTML="⏸️ 大会を終了",o.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function Y(){const t=m.is_ended||!1,e=document.getElementById("input-form");t&&b!==2&&(e.style.display="none",d("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+f+"」を入力してください:");if(t!==f){t!==null&&d("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await k.from("catches").delete().eq("tournament_id",f);if(e)throw e;const{error:o}=await k.from("players").delete().eq("tournament_id",f);if(o)throw o;const{error:i}=await k.from("tournaments").delete().eq("id",f);if(i)throw i;d("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(b!==2){d("管理者権限が必要です",!0);return}try{const t=q||[],e=h||[];if(t.length===0){d("❌ エクスポートするデータがありません",!0);return}let o=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`;t.forEach((u,g)=>{const p=e.find(a=>a.zekken===u.zekken)||{};o+=`${g+1},${u.zekken},"${p.name||"未登録"}","${p.club||""}",${u.limit_total_len||0},${u.one_max_len||0},${u.one_max_weight||0},${u.total_count||0},${u.total_weight||0}
`});const i=m.name||"tournament",n=new Date().toISOString().split("T")[0],s=`${i}_result_${n}.csv`,c="\uFEFF",l=new Blob([c+o],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a");r.href=URL.createObjectURL(l),r.download=s,r.click(),d("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),d("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const o=document.getElementById(e);o&&o.addEventListener("input",function(i){const n=i.target.value,s=U(n);n!==s&&(i.target.value=s)})})});
