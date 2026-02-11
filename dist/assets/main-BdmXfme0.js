import{createClient as W}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function i(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(e){if(e.ep)return;e.ep=!0;const s=i(e);fetch(e.href,s)}})();const U="https://pkjvdtvomqzcnfhkqven.supabase.co",Y="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",b=W(U,Y);let k=0,p={},h=null,f=[],M=[],P=!0,C=null,R=10,q=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const n=new URLSearchParams(window.location.search).get("id");n?await Z(n):D()});function D(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",j()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){c("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function j(){const{data:t,error:n}=await b.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),i=document.getElementById("tournament-list");if(n){console.error("大会一覧読み込みエラー:",n),i.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){i.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}i.innerHTML=t.map(o=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${o.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${o.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${o.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),n=document.getElementById("new-tournament-name").value.trim(),i=document.getElementById("new-tournament-admin-password").value.trim(),o=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!n||!i){c("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){c("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:n});const{data:e,error:s}=await b.from("tournaments").insert({id:t,name:n,password:i,staff_password:o||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(s){console.error("大会作成エラー:",s),s.code==="23505"?c("この大会IDは既に使用されています",!0):c("大会の作成に失敗しました",!0);return}c("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await j(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function Z(t){h=t,console.log("📂 大会ID:",h);const{data:n,error:i}=await b.from("tournaments").select("*").eq("id",h).single();if(i||!n){console.error("大会取得エラー:",i),alert("大会が見つかりません"),D();return}p=n,console.log("✅ 大会情報取得:",p),console.log("📋 大会ルール:",p.rule_type),console.log("📊 リミット匹数:",p.limit_count),console.log("🎯 優先順位1:",p.sort1),console.log("🎯 優先順位2:",p.sort2),console.log("🎯 優先順位3:",p.sort3),document.getElementById("tournament-name").textContent=p.name;const o=p.limit_count>0?`リミット${p.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=o,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await B(),await z(),J()}function J(){C&&C.unsubscribe(),C=b.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${h}`},()=>{P&&(console.log("⚡ リアルタイム更新"),z(),k>0&&_())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){P=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");P?(t.style.display="none",c("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",c("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){c("🔄 更新中..."),await z(),k>0&&await _(),c("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((i,o)=>{i.classList.remove("active"),(t==="ranking"&&o===0||t==="input"&&o===1||t==="settings"&&o===2)&&i.classList.add("active")}),document.querySelectorAll(".view").forEach(i=>{i.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),z()):t==="input"?(document.getElementById("input-view").classList.add("active"),k>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",B(),_()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),k===2&&(document.getElementById("rule-settings-card").style.display="block",le()),k>0&&B().then(()=>T()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===p.password)k=2,c("✅ 管理者としてログイン"),H("管理者");else if(t===p.staff_password)k=1,c("✅ 運営スタッフとしてログイン"),H("運営スタッフ");else{c("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",k),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",B(),_()};window.logout=function(){re("ログアウトしますか？",()=>{k=0,C&&(C.unsubscribe(),C=null),c("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function H(t){const n=document.getElementById("login-status"),i=document.getElementById("login-status-text");i.textContent=`${t}としてログイン中`,n.style.display="block"}async function B(){console.log("👥 選手データ読み込み開始");const{data:t,error:n}=await b.from("players").select("*").eq("tournament_id",h).order("zekken");if(n){console.error("❌ 選手読み込みエラー:",n);return}f=t||[],console.log("✅ 選手データ読み込み完了:",f.length,"人"),f.length>0&&console.log("📋 選手サンプル:",f[0]);const i=document.getElementById("player-select");i.innerHTML='<option value="">選手を選択してください</option>',f.forEach(o=>{const e=document.createElement("option");e.value=o.zekken,e.textContent=`${o.zekken}番: ${o.name}${o.club?` (${o.club})`:""}`,i.appendChild(e)})}function G(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(n){return String.fromCharCode(n.charCodeAt(0)-65248)})}function K(t){return t.replace(/[\u30A1-\u30F6]/g,function(n){const i=n.charCodeAt(0)-96;return String.fromCharCode(i)})}function X(t){return t.replace(/[\u3041-\u3096]/g,function(n){const i=n.charCodeAt(0)+96;return String.fromCharCode(i)})}function F(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const n=K(t),i=X(t),o=G(t);return{original:t,hiragana:n,katakana:i,halfWidth:o}}window.searchPlayer=function(){const t=document.getElementById("player-search"),n=document.getElementById("clear-search-btn"),i=document.getElementById("search-result-count"),o=document.getElementById("player-select"),e=t.value.trim();if(console.log("🔍 検索クエリ:",e),console.log("🔍 選手データ数:",f.length),f.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),f.slice(0,3).forEach(l=>{console.log(`  - ${l.zekken}番: ${l.name} (${l.club||"所属なし"})`)})),n.style.display=e?"block":"none",!e){o.innerHTML='<option value="">選手を選択してください</option>',f.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,o.appendChild(r)}),i.textContent="";return}const s=F(e);console.log("🔧 正規化された検索クエリ:",{元:s.original,ひらがな:s.hiragana,カタカナ:s.katakana,半角:s.halfWidth});const d=f.filter(l=>{if(l.zekken.toString()===e||l.zekken.toString()===s.halfWidth)return console.log("✅ ゼッケン一致:",l.zekken),!0;if(l.reading){const r=F(l.reading);if(l.reading.includes(e))return console.log("✅ 読み仮名一致（完全）:",l.reading,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",l.reading,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",l.reading,"検索:",e),!0}if(l.name){const r=F(l.name);if(l.name.includes(e))return console.log("✅ 名前一致（完全）:",l.name,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",l.name,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",l.name,"検索:",e),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 名前一致（半角）:",l.name,"検索:",e),!0;const u=l.name.toLowerCase(),g=e.toLowerCase();if(u.includes(g))return console.log("✅ 名前一致（英語）:",l.name,"検索:",e),!0}if(l.club){const r=F(l.club);if(l.club.includes(e))return console.log("✅ 所属一致（完全）:",l.club,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",l.club,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",l.club,"検索:",e),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 所属一致（半角）:",l.club,"検索:",e),!0;const u=l.club.toLowerCase(),g=e.toLowerCase();if(u.includes(g))return console.log("✅ 所属一致（英語）:",l.club,"検索:",e),!0}return!1});console.log("🔍 検索結果:",d.length,"件"),o.innerHTML='<option value="">選手を選択してください</option>',d.length===0?(i.textContent="該当する選手が見つかりません",i.style.color="#ff6b6b"):(d.forEach(l=>{const r=document.createElement("option");r.value=l.zekken,r.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,o.appendChild(r)}),i.textContent=`${d.length}件の選手が見つかりました`,i.style.color="#51cf66",d.length===1&&(o.value=d[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),n=document.getElementById("clear-search-btn"),i=document.getElementById("search-result-count"),o=document.getElementById("player-select");t.value="",n.style.display="none",i.textContent="",o.innerHTML='<option value="">選手を選択してください</option>',f.forEach(e=>{const s=document.createElement("option");s.value=e.zekken,s.textContent=`${e.zekken}番: ${e.name}${e.club?` (${e.club})`:""}`,o.appendChild(s)})};window.switchInputMode=function(t){const n=document.getElementById("zekken-input-mode"),i=document.getElementById("search-input-mode"),o=document.getElementById("tab-zekken"),e=document.getElementById("tab-search");t==="zekken"?(n.style.display="block",i.style.display="none",o.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",o.style.color="white",o.style.border="none",o.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",e.style.background="rgba(255, 255, 255, 0.1)",e.style.color="rgba(255, 255, 255, 0.6)",e.style.border="2px solid rgba(255, 255, 255, 0.2)",e.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(n.style.display="none",i.style.display="block",e.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",e.style.color="white",e.style.border="none",e.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",o.style.background="rgba(255, 255, 255, 0.1)",o.style.color="rgba(255, 255, 255, 0.6)",o.style.border="2px solid rgba(255, 255, 255, 0.2)",o.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),n=document.getElementById("player-info-display"),i=document.getElementById("player-name-display"),o=document.getElementById("player-club-display"),e=document.getElementById("player-error-display"),s=parseInt(t.value);if(!s||isNaN(s)){n.style.display="none",e.style.display="none";return}const d=f.find(l=>l.zekken===s);d?(n.style.display="block",e.style.display="none",i.textContent=`${d.zekken}番: ${d.name}`,o.textContent=d.club?`所属: ${d.club}`:"所属なし",console.log("✅ 選手が見つかりました:",d)):(n.style.display="none",e.style.display="block",console.log("❌ 選手が見つかりません:",s))};window.registerCatch=async function(){if(k===0){c("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let n;t?n=parseInt(document.getElementById("zekken-input").value):n=parseInt(document.getElementById("player-select").value);const i=parseFloat(document.getElementById("length-input").value),o=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:n,length:i,weight:o,mode:t?"ゼッケン":"検索"}),!n){c("選手を選択してください",!0);return}if(!i||i<=0){c("長寸を入力してください",!0);return}const e=f.find(l=>l.zekken==n);if(!e){c("選手が見つかりません",!0);return}const s=e.name,{error:d}=await b.from("catches").insert({tournament_id:h,zekken:n,length:i,weight:o});if(d){console.error("❌ 登録エラー:",d),c("登録に失敗しました",!0);return}console.log("✅ 登録成功"),c(`✅ ${s}: ${i}cm ${o>0?o+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await _(),await z()};async function _(){console.log("📋 履歴読み込み開始");const t={};f.forEach(e=>{t[e.zekken]=e.name});const{data:n,error:i}=await b.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1}).limit(50);if(i){console.error("❌ 履歴読み込みエラー:",i);return}M=n||[],console.log("✅ 履歴読み込み完了:",M.length,"件");const o=document.getElementById("history-list");if(M.length===0){o.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}o.innerHTML=M.map(e=>{const s=t[e.zekken],d=s?s.name:"未登録",l=new Date(e.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <strong style="font-size: 18px;">${e.zekken}番</strong>
                        <span style="font-size: 16px;">${d}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${e.length}cm</span>
                        ${e.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${e.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${l}</div>
                </div>
                ${k===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${e.id}, ${e.zekken}, ${e.length}, ${e.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${e.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,n,i,o){if(k!==2){c("管理者権限が必要です",!0);return}const e=f.find(d=>d.zekken===n),s=e?e.name:`${n}番`;Q(t,n,s,i,o)};function Q(t,n,i,o,e){const s=`
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
                    <div style="font-size: 20px; font-weight: bold; color: white;">${n}番: ${i}</div>
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
                        <input type="number" id="edit-weight-input" value="${e||""}" placeholder="任意" style="
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
    `;document.body.insertAdjacentHTML("beforeend",s);const d=document.getElementById("edit-catch-dialog"),l=document.getElementById("edit-length-input"),r=document.getElementById("edit-weight-input"),u=document.getElementById("edit-catch-cancel-btn"),g=document.getElementById("edit-catch-save-btn");u.onclick=()=>{d.remove()},g.onclick=async()=>{const m=parseFloat(l.value),a=parseFloat(r.value)||0;if(!m||m<=0){c("長寸を入力してください",!0);return}d.remove();const{error:y}=await b.from("catches").update({length:m,weight:a}).eq("id",t);if(y){console.error("❌ 更新エラー:",y),c("❌ 更新に失敗しました",!0);return}c(`✅ ${i}の釣果を更新しました`),await _(),await z()},l.addEventListener("keypress",m=>{m.key==="Enter"&&g.click()}),r.addEventListener("keypress",m=>{m.key==="Enter"&&g.click()}),d.addEventListener("click",m=>{m.target===d&&d.remove()}),l.focus(),l.select()}window.deleteCatch=async function(t){if(k!==2){c("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:n}=await b.from("catches").delete().eq("id",t);if(n){console.error("❌ 削除エラー:",n),c("❌ 削除に失敗しました",!0);return}c("✅ 削除しました"),await _(),await z()};async function z(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",p),console.log("📊 リミット匹数:",p.limit_count),console.log("🎯 大会ルール:",p.rule_type);const{data:t,error:n}=await b.from("catches").select("*").eq("tournament_id",h);if(n){console.error("❌ ランキング読み込みエラー:",n);return}const i=t||[];if(console.log("📊 釣果データ:",i.length,"件"),i.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const o={};f.forEach(a=>{o[a.zekken]=a});const e={};i.forEach(a=>{e[a.zekken]||(e[a.zekken]={zekken:a.zekken,lengths:[],weights:[],min_len:a.length,max_len:a.length,min_weight:a.weight||0,max_weight:a.weight||0}),e[a.zekken].lengths.push(a.length),e[a.zekken].weights.push(a.weight||0),e[a.zekken].min_len=Math.min(e[a.zekken].min_len,a.length),e[a.zekken].max_len=Math.max(e[a.zekken].max_len,a.length),e[a.zekken].min_weight=Math.min(e[a.zekken].min_weight,a.weight||0),e[a.zekken].max_weight=Math.max(e[a.zekken].max_weight,a.weight||0)});const s=Object.values(e).map(a=>{const y=[...a.lengths].sort((v,x)=>x-v),E=[...a.weights].sort((v,x)=>x-v),I=p.limit_count||999;console.log(`📊 選手${a.zekken}番の計算:`,{全釣果数:a.lengths.length,リミット匹数:I,全長寸:y,リミット長寸:y.slice(0,I)});const w=E.slice(0,I).reduce((v,x)=>v+x,0),L=y.slice(0,I).reduce((v,x)=>v+x,0);return{zekken:a.zekken,count:a.lengths.length,max_len:a.max_len,min_len:a.min_len,max_weight:a.max_weight,min_weight:a.min_weight,one_max_len:a.max_len,one_max_weight:a.max_weight,total_weight:a.weights.reduce((v,x)=>v+x,0),total_count:a.lengths.length,limit_weight:w,limit_total_len:L}}),d=p.rule_type||"max_len",l=p.sort1||null,r=p.sort2||null,u=p.sort3||null;s.sort((a,y)=>a[d]!==y[d]?y[d]-a[d]:l&&a[l]!==y[l]?y[l]-a[l]:r&&a[r]!==y[r]?y[r]-a[r]:u&&a[u]!==y[u]?y[u]-a[u]:0),q=s,console.log("✅ ランキング計算完了:",s.length,"人");const g=document.getElementById("show-biggest-fish")?.checked??!0;g?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ee(s,o)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const m=document.getElementById("show-smallest-fish")?.checked??!0;m?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),te(s,o)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!g&&!m&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),V(s,o)}function ee(t,n){const i=document.getElementById("biggest-fish-list").closest(".card");i.style.display="block";const o=[...t].sort((l,r)=>r.max_len===l.max_len?r.max_weight-l.max_weight:r.max_len-l.max_len),e=new Set,s=[];for(const l of o)if(!e.has(l.zekken)&&(s.push(l),e.add(l.zekken),s.length===3))break;const d=document.getElementById("biggest-fish-list");d.innerHTML=s.map((l,r)=>{const u=n[l.zekken]||{},g=u.name||"未登録",m=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${g}</div>
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
        `}).join("")}function te(t,n){const i=document.getElementById("smallest-fish-list").closest(".card");i.style.display="block";const o=[...t].sort((l,r)=>l.min_len===r.min_len?l.min_weight-r.min_weight:l.min_len-r.min_len),e=new Set,s=[];for(const l of o)if(!e.has(l.zekken)&&(s.push(l),e.add(l.zekken),s.length===3))break;const d=document.getElementById("smallest-fish-list");d.innerHTML=s.map((l,r)=>{const u=n[l.zekken]||{},g=u.name||"未登録",m=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${l.zekken}番: ${g}</div>
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
        `}).join("")}function V(t,n){const i=p.rule_type||"max_len",o=p.sort1||null,e=p.sort2||null,s=p.limit_count||0,d=Math.min(R,t.length),l=t.slice(0,d),r=document.getElementById("ranking-list");r.innerHTML=l.map((g,m)=>{const a=m<3,y=n[g.zekken]||{},E=y.name||"未登録",I=y.club||"";let w=N[i];(i==="limit_total_len"||i==="limit_weight")&&s>0&&(w+=` (${s}匹)`);const L=A(i,g[i]),v=o?A(o,g[o]):null,x=e?A(e,g[e]):null;return`
            <div class="ranking-item ${a?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${m+1}位</div>
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
                        <div class="stat-label">${N[o]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${v}</div>
                    </div>
                    `:""}
                    ${x?`
                    <div class="stat">
                        <div class="stat-label">${N[e]}</div>
                        <div class="stat-value" style="color: #2196F3;">${x}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const u=document.getElementById("show-more-btn");t.length>R?u.style.display="block":u.style.display="none"}window.showMoreRankings=function(){R+=10;const t={};f.forEach(n=>{t[n.zekken]=n}),V(q,t),c("10件追加表示しました")};function A(t,n){return t.includes("len")?`${n.toFixed(1)}cm`:t.includes("weight")?`${Math.round(n)}g`:t==="total_count"?`${n}枚`:n}async function T(){const{data:t,error:n}=await b.from("players").select("*").eq("tournament_id",h).order("zekken");if(n){console.error("選手リスト読み込みエラー:",n);return}const i=t||[],o=document.getElementById("player-list");if(i.length===0){o.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}o.innerHTML=i.map(e=>`
        <div class="player-item">
            <div>
                <strong>${e.zekken}番:</strong>
                <span style="margin-left: 10px;">${e.name}</span>
                ${e.club?`<span style="color: #aaa; margin-left: 10px;">(${e.club})</span>`:""}
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; margin-right: 5px;" onclick="editPlayer(${e.zekken})">編集</button>
                <button class="btn btn-danger" onclick="deletePlayer(${e.zekken})">削除</button>
            </div>
        </div>
    `).join("")}window.editPlayer=async function(t){const n=f.find(i=>i.zekken===t);if(!n){c("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",n),ne(n,async i=>{if(!i)return;console.log("📝 更新データ:",i),console.log("📝 更新条件:",{tournament_id:h,zekken:t});const{data:o,error:e}=await b.from("players").update({name:i.name,club:i.club,reading:i.reading}).eq("tournament_id",h).eq("zekken",t).select();if(e){console.error("❌ 選手編集エラー:",e),console.error("❌ エラー詳細:",JSON.stringify(e,null,2)),c(`❌ 編集に失敗しました: ${e.message||e.code||"不明なエラー"}`,!0);return}if(!o||o.length===0){console.error("❌ 更新対象が見つかりませんでした"),c("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",o),c("✅ 選手情報を更新しました"),await B(),await T(),console.log("✅ 再読み込み後のALL_PLAYERS:",f.find(s=>s.zekken===t))})};function ne(t,n){const i=`
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
    `;document.body.insertAdjacentHTML("beforeend",i);const o=document.getElementById("edit-player-dialog"),e=document.getElementById("edit-name-input"),s=document.getElementById("edit-reading-input"),d=document.getElementById("edit-club-input"),l=document.getElementById("edit-cancel-btn"),r=document.getElementById("edit-ok-btn");l.onclick=()=>{o.remove(),n(null)},r.onclick=()=>{const u=e.value.trim(),g=s.value.trim(),m=d.value.trim();if(!u){c("名前は必須です",!0);return}o.remove(),n({name:u,reading:g,club:m})},e.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),s.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),d.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),o.addEventListener("click",u=>{u.target===o&&(o.remove(),n(null))}),e.focus(),e.select()}window.addPlayer=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),n=document.getElementById("new-name").value.trim(),i=document.getElementById("new-club").value.trim(),o=document.getElementById("new-reading").value.trim();if(!t||!n){c("ゼッケン番号と名前は必須です",!0);return}if(f.some(d=>d.zekken===t)){c(`${t}番は既に登録されています`,!0);return}const{error:s}=await b.from("players").insert({tournament_id:h,zekken:t,name:n,club:i||"",reading:o||""});if(s){console.error("選手追加エラー:",s),c("追加に失敗しました（重複の可能性）",!0);return}c("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await B(),await T()};let $=[];window.handleCSVFile=function(t){const n=t.target.files[0];if(!n)return;console.log("📂 CSVファイル選択:",n.name);const i=new FileReader;i.onload=function(o){const e=o.target.result;oe(e)},i.readAsText(n,"UTF-8")};function oe(t){try{console.log("📊 CSVパース開始");const n=t.split(/\r?\n/).filter(r=>r.trim());if(n.length<2){c("❌ CSVファイルが空です",!0);return}const o=n[0].split(",").map(r=>r.trim());console.log("📋 ヘッダー:",o);const s=["ゼッケン番号","名前"].filter(r=>!o.includes(r));if(s.length>0){c(`❌ 必須列が不足: ${s.join(", ")}`,!0);return}const d=[],l=[];for(let r=1;r<n.length;r++){const g=n[r].split(",").map(w=>w.trim());if(g.length!==o.length){l.push(`${r+1}行目: 列数が一致しません`);continue}const m={};o.forEach((w,L)=>{m[w]=g[L]});const a=parseInt(m.ゼッケン番号),y=m.名前;if(!a||isNaN(a)||a<=0){l.push(`${r+1}行目: ゼッケン番号が不正です (${m.ゼッケン番号})`);continue}if(!y||y.trim()===""){l.push(`${r+1}行目: 名前が空です`);continue}if(d.some(w=>w.zekken===a)){l.push(`${r+1}行目: ゼッケン番号 ${a} が重複しています`);continue}const I=f.find(w=>w.zekken===a);if(I){l.push(`${r+1}行目: ゼッケン番号 ${a} は既に登録されています (${I.name})`);continue}d.push({zekken:a,name:y,reading:m.読み仮名||"",club:m.所属||""})}if(console.log("✅ パース完了:",d.length,"件"),console.log("❌ エラー:",l.length,"件"),l.length>0){console.error("エラー詳細:",l),c(`⚠️ ${l.length}件のエラーがあります`,!0);const r=l.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${r}${l.length>5?`

...他${l.length-5}件`:""}`)}if(d.length===0){c("❌ インポート可能なデータがありません",!0);return}$=d,ie(d,l)}catch(n){console.error("❌ CSVパースエラー:",n),c("❌ CSVファイルの読み込みに失敗しました",!0)}}function ie(t,n){const i=document.getElementById("csv-preview"),o=document.getElementById("csv-preview-content");let e=`
        <div style="margin-bottom: 15px;">
            <strong style="color: #51cf66;">✅ インポート可能: ${t.length}件</strong>
            ${n.length>0?`<br><strong style="color: #ff6b6b;">❌ エラー: ${n.length}件</strong>`:""}
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
    `;t.forEach(s=>{e+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${s.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${s.club||"-"}</td>
            </tr>
        `}),e+=`
            </tbody>
        </table>
    `,o.innerHTML=e,i.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if($.length===0){c("❌ インポートするデータがありません",!0);return}if(k!==2){c("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",$.length,"件");try{const t=$.map(o=>({tournament_id:h,zekken:o.zekken,name:o.name,reading:o.reading,club:o.club})),{data:n,error:i}=await b.from("players").insert(t).select();if(i){console.error("❌ インポートエラー:",i),c(`❌ インポートに失敗しました: ${i.message}`,!0);return}console.log("✅ インポート成功:",n.length,"件"),c(`✅ ${n.length}件の選手を登録しました！`),$=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await B(),await T()}catch(t){console.error("❌ インポート例外:",t),c("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){$=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",c("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:n}=await b.from("players").delete().eq("tournament_id",h).eq("zekken",t);if(n){console.error("選手削除エラー:",n),c("❌ 削除に失敗しました",!0);return}c("✅ 削除しました"),await B(),await T()};const N={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const n=document.getElementById("zekken-warning"),i=document.getElementById("add-player-btn");if(!t){n.style.display="none",i.disabled=!1;return}const o=parseInt(t);f.some(s=>s.zekken===o)?(n.textContent=`⚠️ ${o}番は既に登録されています`,n.style.color="#ff6b6b",n.style.fontWeight="bold",n.style.display="block",i.disabled=!0):(n.textContent=`✅ ${o}番は利用可能です`,n.style.color="#4CAF50",n.style.fontWeight="normal",n.style.display="block",i.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,n=document.getElementById("sort1").value,i=document.getElementById("sort2").value,o=[t];n&&o.push(n),i&&o.push(i),O("sort1",o,[t]),O("sort2",o,[t,n]),O("sort3",o,[t,n,i])};function O(t,n,i){const o=document.getElementById(t),e=o.value;o.innerHTML='<option value="">選択しない</option>';const s={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[d,l]of Object.entries(s))if(!i.includes(d)||d===e){const r=document.createElement("option");r.value=d,r.textContent=l,d===e&&(r.selected=!0),o.appendChild(r)}}async function le(){if(console.log("⚙️ 大会設定読み込み開始"),!p||!p.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=p.rule_type||"limit_total_len",se(p.limit_count||0);const t=localStorage.getItem(`${h}_show_biggest_fish`),n=localStorage.getItem(`${h}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=n===null?!0:n==="true",updateSortOptions(),document.getElementById("sort1").value=p.sort1||"",document.getElementById("sort2").value=p.sort2||"",document.getElementById("sort3").value=p.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",p)}function se(t){const n=document.getElementById("limit-count-picker"),i=document.getElementById("limit-count"),o=n.querySelectorAll(".limit-option");i.value=t;const e=Array.from(o).find(l=>parseInt(l.dataset.value)===t);e&&(e.scrollIntoView({block:"center",behavior:"auto"}),d());let s;n.addEventListener("scroll",function(){clearTimeout(s),s=setTimeout(()=>{d()},100)}),o.forEach(l=>{l.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>d(),300)})});function d(){const l=n.getBoundingClientRect(),r=l.top+l.height/2;let u=null,g=1/0;o.forEach(m=>{const a=m.getBoundingClientRect(),y=a.top+a.height/2,E=Math.abs(r-y);E<g&&(g=E,u=m)}),u&&(o.forEach(m=>m.classList.remove("selected")),u.classList.add("selected"),i.value=u.dataset.value,console.log("📊 リミット匹数変更:",i.value))}}window.updateTournamentSettings=async function(){if(k!==2){c("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,n=parseInt(document.getElementById("limit-count").value)||0,i=document.getElementById("sort1").value,o=document.getElementById("sort2").value,e=document.getElementById("sort3").value,s=document.getElementById("show-biggest-fish").checked,d=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${h}_show_biggest_fish`,s),localStorage.setItem(`${h}_show_smallest_fish`,d);const l=[i,o,e].filter(E=>E!==""),r=new Set(l);if(l.length!==r.size){c("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:n,sort1:i,sort2:o,sort3:e,showBiggestFish:s,showSmallestFish:d}),console.log("💾 更新条件:",{id:h}),console.log("💾 更新前のCONFIG.limit_count:",p.limit_count);const{data:u,error:g}=await b.from("tournaments").update({rule_type:t,limit_count:n,sort1:i||null,sort2:o||null,sort3:e||null}).eq("id",h).select();if(console.log("💾 UPDATE結果 - data:",u),console.log("💾 UPDATE結果 - error:",g),g){console.error("❌ 設定保存エラー:",g),console.error("❌ エラー詳細:",JSON.stringify(g,null,2)),console.error("❌ エラーコード:",g.code),console.error("❌ エラーメッセージ:",g.message),alert(`❌ 設定保存エラー: ${g.message}
コード: ${g.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),c(`❌ 設定の保存に失敗しました: ${g.message||g.code||"不明なエラー"}`,!0);return}if(!u||u.length===0){console.error("❌ 更新対象が見つかりませんでした"),c("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",u);const{data:m,error:a}=await b.from("tournaments").select("*").eq("id",h).single();if(a||!m){console.error("❌ 設定再取得エラー:",a),c("❌ 設定の再取得に失敗しました",!0);return}p=m,console.log("✅ 再取得後のCONFIG:",p),c("✅ 設定を保存しました");const y=p.limit_count>0?`リミット${p.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=y,await z(),console.log("✅ 設定保存完了")};function c(t,n=!1){const i=document.getElementById("toast");i.textContent=t,i.className="toast"+(n?" error":""),i.style.display="block",setTimeout(()=>{i.style.display="none"},3e3)}let S=null;function re(t,n){S=n,document.getElementById("confirm-message").textContent=t;const i=document.getElementById("confirm-dialog");i.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",S&&(S(),S=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",S=null};console.log("✅ システム準備完了");
