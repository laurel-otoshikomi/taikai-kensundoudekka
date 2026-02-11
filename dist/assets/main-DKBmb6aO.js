import{createClient as K}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function o(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(n){if(n.ep)return;n.ep=!0;const l=o(n);fetch(n.href,l)}})();const X="https://pkjvdtvomqzcnfhkqven.supabase.co",ee="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",k=K(X,ee);let w=0,u={},f=null,b=[],D=[],A=!0,S=null,q=10,O=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await te(e):W()});function W(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",U()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){a("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function U(){const{data:t,error:e}=await k.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),o=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),o.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){o.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}o.innerHTML=t.map(i=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${i.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${i.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${i.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),o=document.getElementById("new-tournament-admin-password").value.trim(),i=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!o){a("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){a("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:n,error:l}=await k.from("tournaments").insert({id:t,name:e,password:o,staff_password:i||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(l){console.error("大会作成エラー:",l),l.code==="23505"?a("この大会IDは既に使用されています",!0):a("大会の作成に失敗しました",!0);return}a("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await U(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function te(t){f=t,console.log("📂 大会ID:",f);const{data:e,error:o}=await k.from("tournaments").select("*").eq("id",f).single();if(o||!e){console.error("大会取得エラー:",o),alert("大会が見つかりません"),W();return}u=e,console.log("✅ 大会情報取得:",u),console.log("📋 大会ルール:",u.rule_type),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 優先順位1:",u.sort1),console.log("🎯 優先順位2:",u.sort2),console.log("🎯 優先順位3:",u.sort3),document.getElementById("tournament-name").textContent=u.name;const i=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=i,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await _(),await z(),pe(),w===2&&(document.getElementById("tournament-management-card").style.display="block",j()),J(),ne()}function ne(){S&&S.unsubscribe(),S=k.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${f}`},()=>{A&&(console.log("⚡ リアルタイム更新"),z(),w>0&&$())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){A=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");A?(t.style.display="none",a("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",a("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){a("🔄 更新中..."),await z(),w>0&&await $(),a("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((o,i)=>{o.classList.remove("active"),(t==="ranking"&&i===0||t==="input"&&i===1||t==="settings"&&i===2)&&o.classList.add("active")}),document.querySelectorAll(".view").forEach(o=>{o.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),z()):t==="input"?(document.getElementById("input-view").classList.add("active"),w>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",_(),$()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),w===2&&(document.getElementById("rule-settings-card").style.display="block",ue()),w>0&&_().then(()=>M()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===u.password)w=2,a("✅ 管理者としてログイン"),V("管理者");else if(t===u.staff_password)w=1,a("✅ 運営スタッフとしてログイン"),V("運営スタッフ");else{a("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",w),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",w===2&&(document.getElementById("tournament-management-card").style.display="block",j()),_(),$()};window.logout=function(){ge("ログアウトしますか？",()=>{w=0,S&&(S.unsubscribe(),S=null),a("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function V(t){const e=document.getElementById("login-status"),o=document.getElementById("login-status-text");o.textContent=`${t}としてログイン中`,e.style.display="block"}async function _(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await k.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}b=t||[],console.log("✅ 選手データ読み込み完了:",b.length,"人"),b.length>0&&console.log("📋 選手サンプル:",b[0]);const o=document.getElementById("player-select");o.innerHTML='<option value="">選手を選択してください</option>',b.forEach(i=>{const n=document.createElement("option");n.value=i.zekken,n.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,o.appendChild(n)})}function Y(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function oe(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const o=e.charCodeAt(0)-96;return String.fromCharCode(o)})}function ie(t){return t.replace(/[\u3041-\u3096]/g,function(e){const o=e.charCodeAt(0)+96;return String.fromCharCode(o)})}function P(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=oe(t),o=ie(t),i=Y(t);return{original:t,hiragana:e,katakana:o,halfWidth:i}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select"),n=t.value.trim();if(console.log("🔍 検索クエリ:",n),console.log("🔍 選手データ数:",b.length),b.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),b.slice(0,3).forEach(s=>{console.log(`  - ${s.zekken}番: ${s.name} (${s.club||"所属なし"})`)})),e.style.display=n?"block":"none",!n){i.innerHTML='<option value="">選手を選択してください</option>',b.forEach(s=>{const r=document.createElement("option");r.value=s.zekken,r.textContent=`${s.zekken}番: ${s.name}${s.club?` (${s.club})`:""}`,i.appendChild(r)}),o.textContent="";return}const l=P(n);console.log("🔧 正規化された検索クエリ:",{元:l.original,ひらがな:l.hiragana,カタカナ:l.katakana,半角:l.halfWidth});const d=b.filter(s=>{if(s.zekken.toString()===n||s.zekken.toString()===l.halfWidth)return console.log("✅ ゼッケン一致:",s.zekken),!0;if(s.reading){const r=P(s.reading);if(s.reading.includes(n))return console.log("✅ 読み仮名一致（完全）:",s.reading,"検索:",n),!0;if(r.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",s.reading,"検索:",n),!0;if(r.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",s.reading,"検索:",n),!0}if(s.name){const r=P(s.name);if(s.name.includes(n))return console.log("✅ 名前一致（完全）:",s.name,"検索:",n),!0;if(r.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",s.name,"検索:",n),!0;if(r.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",s.name,"検索:",n),!0;if(r.halfWidth.includes(l.halfWidth)&&l.halfWidth!=="")return console.log("✅ 名前一致（半角）:",s.name,"検索:",n),!0;const m=s.name.toLowerCase(),p=n.toLowerCase();if(m.includes(p))return console.log("✅ 名前一致（英語）:",s.name,"検索:",n),!0}if(s.club){const r=P(s.club);if(s.club.includes(n))return console.log("✅ 所属一致（完全）:",s.club,"検索:",n),!0;if(r.hiragana.includes(l.hiragana)&&l.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",s.club,"検索:",n),!0;if(r.katakana.includes(l.katakana)&&l.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",s.club,"検索:",n),!0;if(r.halfWidth.includes(l.halfWidth)&&l.halfWidth!=="")return console.log("✅ 所属一致（半角）:",s.club,"検索:",n),!0;const m=s.club.toLowerCase(),p=n.toLowerCase();if(m.includes(p))return console.log("✅ 所属一致（英語）:",s.club,"検索:",n),!0}return!1});console.log("🔍 検索結果:",d.length,"件"),i.innerHTML='<option value="">選手を選択してください</option>',d.length===0?(o.textContent="該当する選手が見つかりません",o.style.color="#ff6b6b"):(d.forEach(s=>{const r=document.createElement("option");r.value=s.zekken,r.textContent=`${s.zekken}番: ${s.name}${s.club?` (${s.club})`:""}`,i.appendChild(r)}),o.textContent=`${d.length}件の選手が見つかりました`,o.style.color="#51cf66",d.length===1&&(i.value=d[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select");t.value="",e.style.display="none",o.textContent="",i.innerHTML='<option value="">選手を選択してください</option>',b.forEach(n=>{const l=document.createElement("option");l.value=n.zekken,l.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,i.appendChild(l)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),o=document.getElementById("search-input-mode"),i=document.getElementById("tab-zekken"),n=document.getElementById("tab-search");t==="zekken"?(e.style.display="block",o.style.display="none",i.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",i.style.color="white",i.style.border="none",i.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",o.style.display="block",n.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",n.style.color="white",n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 0.6)",i.style.border="2px solid rgba(255, 255, 255, 0.2)",i.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),o=document.getElementById("player-name-display"),i=document.getElementById("player-club-display"),n=document.getElementById("player-error-display"),l=parseInt(t.value);if(!l||isNaN(l)){e.style.display="none",n.style.display="none";return}const d=b.find(s=>s.zekken===l);d?(e.style.display="block",n.style.display="none",o.textContent=`${d.zekken}番: ${d.name}`,i.textContent=d.club?`所属: ${d.club}`:"所属なし",console.log("✅ 選手が見つかりました:",d)):(e.style.display="none",n.style.display="block",console.log("❌ 選手が見つかりません:",l))};window.registerCatch=async function(){if(w===0){a("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const o=parseFloat(document.getElementById("length-input").value),i=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:o,weight:i,mode:t?"ゼッケン":"検索"}),!e){a("選手を選択してください",!0);return}if(!o||o<=0){a("長寸を入力してください",!0);return}const n=b.find(s=>s.zekken==e);if(!n){a("選手が見つかりません",!0);return}const l=n.name,{error:d}=await k.from("catches").insert({tournament_id:f,zekken:e,length:o,weight:i});if(d){console.error("❌ 登録エラー:",d),a("登録に失敗しました",!0);return}console.log("✅ 登録成功"),a(`✅ ${l}: ${o}cm ${i>0?i+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await $(),await z()};async function $(){console.log("📋 履歴読み込み開始");const t={};b.forEach(n=>{t[n.zekken]=n.name});const{data:e,error:o}=await k.from("catches").select("*").eq("tournament_id",f).order("created_at",{ascending:!1}).limit(50);if(o){console.error("❌ 履歴読み込みエラー:",o);return}D=e||[],console.log("✅ 履歴読み込み完了:",D.length,"件");const i=document.getElementById("history-list");if(D.length===0){i.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}i.innerHTML=D.map(n=>{const l=t[n.zekken],d=l?l.name:"未登録",s=new Date(n.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <span style="font-size: 16px;">${d}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${n.length}cm</span>
                        ${n.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${n.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${s}</div>
                </div>
                ${w===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${n.id}, ${n.zekken}, ${n.length}, ${n.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${n.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,o,i){if(w!==2){a("管理者権限が必要です",!0);return}const n=b.find(d=>d.zekken===e),l=n?n.name:`${e}番`;le(t,e,l,o,i)};function le(t,e,o,i,n){const l=`
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
    `;document.body.insertAdjacentHTML("beforeend",l);const d=document.getElementById("edit-catch-dialog"),s=document.getElementById("edit-length-input"),r=document.getElementById("edit-weight-input"),m=document.getElementById("edit-catch-cancel-btn"),p=document.getElementById("edit-catch-save-btn");m.onclick=()=>{d.remove()},p.onclick=async()=>{const g=parseFloat(s.value),c=parseFloat(r.value)||0;if(!g||g<=0){a("長寸を入力してください",!0);return}d.remove();const{error:y}=await k.from("catches").update({length:g,weight:c}).eq("id",t);if(y){console.error("❌ 更新エラー:",y),a("❌ 更新に失敗しました",!0);return}a(`✅ ${o}の釣果を更新しました`),await $(),await z()},s.addEventListener("keypress",g=>{g.key==="Enter"&&p.click()}),r.addEventListener("keypress",g=>{g.key==="Enter"&&p.click()}),d.addEventListener("click",g=>{g.target===d&&d.remove()}),s.focus(),s.select()}window.deleteCatch=async function(t){if(w!==2){a("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:e}=await k.from("catches").delete().eq("id",t);if(e){console.error("❌ 削除エラー:",e),a("❌ 削除に失敗しました",!0);return}a("✅ 削除しました"),await $(),await z()};async function z(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",u),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 大会ルール:",u.rule_type);const{data:t,error:e}=await k.from("catches").select("*").eq("tournament_id",f);if(e){console.error("❌ ランキング読み込みエラー:",e);return}const o=t||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const i={};b.forEach(c=>{i[c.zekken]=c});const n={};o.forEach(c=>{n[c.zekken]||(n[c.zekken]={zekken:c.zekken,lengths:[],weights:[],min_len:c.length,max_len:c.length,min_weight:c.weight||0,max_weight:c.weight||0}),n[c.zekken].lengths.push(c.length),n[c.zekken].weights.push(c.weight||0),n[c.zekken].min_len=Math.min(n[c.zekken].min_len,c.length),n[c.zekken].max_len=Math.max(n[c.zekken].max_len,c.length),n[c.zekken].min_weight=Math.min(n[c.zekken].min_weight,c.weight||0),n[c.zekken].max_weight=Math.max(n[c.zekken].max_weight,c.weight||0)});const l=Object.values(n).map(c=>{const y=[...c.lengths].sort((x,h)=>h-x),I=[...c.weights].sort((x,h)=>h-x),E=u.limit_count||999;console.log(`📊 選手${c.zekken}番の計算:`,{全釣果数:c.lengths.length,リミット匹数:E,全長寸:y,リミット長寸:y.slice(0,E)});const v=I.slice(0,E).reduce((x,h)=>x+h,0),B=y.slice(0,E).reduce((x,h)=>x+h,0);return{zekken:c.zekken,count:c.lengths.length,max_len:c.max_len,min_len:c.min_len,max_weight:c.max_weight,min_weight:c.min_weight,one_max_len:c.max_len,one_max_weight:c.max_weight,total_weight:c.weights.reduce((x,h)=>x+h,0),total_count:c.lengths.length,limit_weight:v,limit_total_len:B}}),d=u.rule_type||"max_len",s=u.sort1||null,r=u.sort2||null,m=u.sort3||null;l.sort((c,y)=>c[d]!==y[d]?y[d]-c[d]:s&&c[s]!==y[s]?y[s]-c[s]:r&&c[r]!==y[r]?y[r]-c[r]:m&&c[m]!==y[m]?y[m]-c[m]:0),O=l,console.log("✅ ランキング計算完了:",l.length,"人");const p=document.getElementById("show-biggest-fish")?.checked??!0;p?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),se(l,i)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const g=document.getElementById("show-smallest-fish")?.checked??!0;g?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),re(l,i)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!p&&!g&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),Z(l,i)}function se(t,e){const o=document.getElementById("biggest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((s,r)=>r.max_len===s.max_len?r.max_weight-s.max_weight:r.max_len-s.max_len),n=new Set,l=[];for(const s of i)if(!n.has(s.zekken)&&(l.push(s),n.add(s.zekken),l.length===3))break;const d=document.getElementById("biggest-fish-list");d.innerHTML=l.map((s,r)=>{const m=e[s.zekken]||{},p=m.name||"未登録",g=m.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${s.zekken}番: ${p}</div>
                        ${g?`<div style="font-size: 10px; opacity: 0.8;">${g}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${s.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function re(t,e){const o=document.getElementById("smallest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((s,r)=>s.min_len===r.min_len?s.min_weight-r.min_weight:s.min_len-r.min_len),n=new Set,l=[];for(const s of i)if(!n.has(s.zekken)&&(l.push(s),n.add(s.zekken),l.length===3))break;const d=document.getElementById("smallest-fish-list");d.innerHTML=l.map((s,r)=>{const m=e[s.zekken]||{},p=m.name||"未登録",g=m.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${s.zekken}番: ${p}</div>
                        ${g?`<div style="font-size: 10px; opacity: 0.8;">${g}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${s.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function Z(t,e){const o=u.rule_type||"max_len",i=u.sort1||null,n=u.sort2||null,l=u.limit_count||0,d=Math.min(q,t.length),s=t.slice(0,d),r=document.getElementById("ranking-list");r.innerHTML=s.map((p,g)=>{const c=g<3,y=e[p.zekken]||{},I=y.name||"未登録",E=y.club||"";let v=H[o];(o==="limit_total_len"||o==="limit_weight")&&l>0&&(v+=` (${l}匹)`);const B=R(o,p[o]),x=i?R(i,p[i]):null,h=n?R(n,p[n]):null;return`
            <div class="ranking-item ${c?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${g+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${p.zekken}番: ${I}</div>
                        ${E?`<div style="font-size: 14px; opacity: 0.8;">${E}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${v}</div>
                        <div class="stat-value" style="color: #FFD700;">${B}</div>
                    </div>
                    ${x?`
                    <div class="stat">
                        <div class="stat-label">${H[i]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${x}</div>
                    </div>
                    `:""}
                    ${h?`
                    <div class="stat">
                        <div class="stat-label">${H[n]}</div>
                        <div class="stat-value" style="color: #2196F3;">${h}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const m=document.getElementById("show-more-btn");t.length>q?m.style.display="block":m.style.display="none"}window.showMoreRankings=function(){q+=10;const t={};b.forEach(e=>{t[e.zekken]=e}),Z(O,t),a("10件追加表示しました")};function R(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function M(){const{data:t,error:e}=await k.from("players").select("*").eq("tournament_id",f).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const o=t||[],i=document.getElementById("player-list");if(o.length===0){i.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}i.innerHTML=o.map(n=>`
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
    `).join("")}window.editPlayer=async function(t){const e=b.find(o=>o.zekken===t);if(!e){a("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),ae(e,async o=>{if(!o)return;console.log("📝 更新データ:",o),console.log("📝 更新条件:",{tournament_id:f,zekken:t});const{data:i,error:n}=await k.from("players").update({name:o.name,club:o.club,reading:o.reading}).eq("tournament_id",f).eq("zekken",t).select();if(n){console.error("❌ 選手編集エラー:",n),console.error("❌ エラー詳細:",JSON.stringify(n,null,2)),a(`❌ 編集に失敗しました: ${n.message||n.code||"不明なエラー"}`,!0);return}if(!i||i.length===0){console.error("❌ 更新対象が見つかりませんでした"),a("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",i),a("✅ 選手情報を更新しました"),await _(),await M(),console.log("✅ 再読み込み後のALL_PLAYERS:",b.find(l=>l.zekken===t))})};function ae(t,e){const o=`
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
    `;document.body.insertAdjacentHTML("beforeend",o);const i=document.getElementById("edit-player-dialog"),n=document.getElementById("edit-name-input"),l=document.getElementById("edit-reading-input"),d=document.getElementById("edit-club-input"),s=document.getElementById("edit-cancel-btn"),r=document.getElementById("edit-ok-btn");s.onclick=()=>{i.remove(),e(null)},r.onclick=()=>{const m=n.value.trim(),p=l.value.trim(),g=d.value.trim();if(!m){a("名前は必須です",!0);return}i.remove(),e({name:m,reading:p,club:g})},n.addEventListener("keypress",m=>{m.key==="Enter"&&r.click()}),l.addEventListener("keypress",m=>{m.key==="Enter"&&r.click()}),d.addEventListener("keypress",m=>{m.key==="Enter"&&r.click()}),i.addEventListener("click",m=>{m.target===i&&(i.remove(),e(null))}),n.focus(),n.select()}window.addPlayer=async function(){if(w!==2){a("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),o=document.getElementById("new-club").value.trim(),i=document.getElementById("new-reading").value.trim();if(!t||!e){a("ゼッケン番号と名前は必須です",!0);return}if(b.some(d=>d.zekken===t)){a(`${t}番は既に登録されています`,!0);return}const{error:l}=await k.from("players").insert({tournament_id:f,zekken:t,name:e,club:o||"",reading:i||""});if(l){console.error("選手追加エラー:",l),a("追加に失敗しました（重複の可能性）",!0);return}a("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await _(),await M()};let L=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const o=new FileReader;o.onload=function(i){const n=i.target.result;ce(n)},o.readAsText(e,"UTF-8")};function ce(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(r=>r.trim());if(e.length<2){a("❌ CSVファイルが空です",!0);return}const i=e[0].split(",").map(r=>r.trim());console.log("📋 ヘッダー:",i);const l=["ゼッケン番号","名前"].filter(r=>!i.includes(r));if(l.length>0){a(`❌ 必須列が不足: ${l.join(", ")}`,!0);return}const d=[],s=[];for(let r=1;r<e.length;r++){const p=e[r].split(",").map(v=>v.trim());if(p.length!==i.length){s.push(`${r+1}行目: 列数が一致しません`);continue}const g={};i.forEach((v,B)=>{g[v]=p[B]});const c=parseInt(g.ゼッケン番号),y=g.名前;if(!c||isNaN(c)||c<=0){s.push(`${r+1}行目: ゼッケン番号が不正です (${g.ゼッケン番号})`);continue}if(!y||y.trim()===""){s.push(`${r+1}行目: 名前が空です`);continue}if(d.some(v=>v.zekken===c)){s.push(`${r+1}行目: ゼッケン番号 ${c} が重複しています`);continue}const E=b.find(v=>v.zekken===c);if(E){s.push(`${r+1}行目: ゼッケン番号 ${c} は既に登録されています (${E.name})`);continue}d.push({zekken:c,name:y,reading:g.読み仮名||"",club:g.所属||""})}if(console.log("✅ パース完了:",d.length,"件"),console.log("❌ エラー:",s.length,"件"),s.length>0){console.error("エラー詳細:",s),a(`⚠️ ${s.length}件のエラーがあります`,!0);const r=s.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${r}${s.length>5?`

...他${s.length-5}件`:""}`)}if(d.length===0){a("❌ インポート可能なデータがありません",!0);return}L=d,de(d,s)}catch(e){console.error("❌ CSVパースエラー:",e),a("❌ CSVファイルの読み込みに失敗しました",!0)}}function de(t,e){const o=document.getElementById("csv-preview"),i=document.getElementById("csv-preview-content");let n=`
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
    `;t.forEach(l=>{n+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${l.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${l.club||"-"}</td>
            </tr>
        `}),n+=`
            </tbody>
        </table>
    `,i.innerHTML=n,o.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(L.length===0){a("❌ インポートするデータがありません",!0);return}if(w!==2){a("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",L.length,"件");try{const t=L.map(i=>({tournament_id:f,zekken:i.zekken,name:i.name,reading:i.reading,club:i.club})),{data:e,error:o}=await k.from("players").insert(t).select();if(o){console.error("❌ インポートエラー:",o),a(`❌ インポートに失敗しました: ${o.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),a(`✅ ${e.length}件の選手を登録しました！`),L=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await _(),await M()}catch(t){console.error("❌ インポート例外:",t),a("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){L=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",a("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await k.from("players").delete().eq("tournament_id",f).eq("zekken",t);if(e){console.error("選手削除エラー:",e),a("❌ 削除に失敗しました",!0);return}a("✅ 削除しました"),await _(),await M()};const H={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),o=document.getElementById("add-player-btn");if(!t){e.style.display="none",o.disabled=!1;return}const i=parseInt(t);b.some(l=>l.zekken===i)?(e.textContent=`⚠️ ${i}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",o.disabled=!0):(e.textContent=`✅ ${i}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",o.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,o=document.getElementById("sort2").value,i=[t];e&&i.push(e),o&&i.push(o),N("sort1",i,[t]),N("sort2",i,[t,e]),N("sort3",i,[t,e,o])};function N(t,e,o){const i=document.getElementById(t),n=i.value;i.innerHTML='<option value="">選択しない</option>';const l={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[d,s]of Object.entries(l))if(!o.includes(d)||d===n){const r=document.createElement("option");r.value=d,r.textContent=s,d===n&&(r.selected=!0),i.appendChild(r)}}async function ue(){if(console.log("⚙️ 大会設定読み込み開始"),!u||!u.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=u.rule_type||"limit_total_len",me(u.limit_count||0);const t=localStorage.getItem(`${f}_show_biggest_fish`),e=localStorage.getItem(`${f}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=e===null?!0:e==="true",updateSortOptions(),document.getElementById("sort1").value=u.sort1||"",document.getElementById("sort2").value=u.sort2||"",document.getElementById("sort3").value=u.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",u)}function me(t){const e=document.getElementById("limit-count-picker"),o=document.getElementById("limit-count"),i=e.querySelectorAll(".limit-option");o.value=t;const n=Array.from(i).find(s=>parseInt(s.dataset.value)===t);n&&(n.scrollIntoView({block:"center",behavior:"auto"}),d());let l;e.addEventListener("scroll",function(){clearTimeout(l),l=setTimeout(()=>{d()},100)}),i.forEach(s=>{s.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>d(),300)})});function d(){const s=e.getBoundingClientRect(),r=s.top+s.height/2;let m=null,p=1/0;i.forEach(g=>{const c=g.getBoundingClientRect(),y=c.top+c.height/2,I=Math.abs(r-y);I<p&&(p=I,m=g)}),m&&(i.forEach(g=>g.classList.remove("selected")),m.classList.add("selected"),o.value=m.dataset.value,console.log("📊 リミット匹数変更:",o.value))}}window.updateTournamentSettings=async function(){if(w!==2){a("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,o=document.getElementById("sort1").value,i=document.getElementById("sort2").value,n=document.getElementById("sort3").value,l=document.getElementById("show-biggest-fish").checked,d=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${f}_show_biggest_fish`,l),localStorage.setItem(`${f}_show_smallest_fish`,d);const s=[o,i,n].filter(I=>I!==""),r=new Set(s);if(s.length!==r.size){a("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:o,sort2:i,sort3:n,showBiggestFish:l,showSmallestFish:d}),console.log("💾 更新条件:",{id:f}),console.log("💾 更新前のCONFIG.limit_count:",u.limit_count);const{data:m,error:p}=await k.from("tournaments").update({rule_type:t,limit_count:e,sort1:o||null,sort2:i||null,sort3:n||null}).eq("id",f).select();if(console.log("💾 UPDATE結果 - data:",m),console.log("💾 UPDATE結果 - error:",p),p){console.error("❌ 設定保存エラー:",p),console.error("❌ エラー詳細:",JSON.stringify(p,null,2)),console.error("❌ エラーコード:",p.code),console.error("❌ エラーメッセージ:",p.message),alert(`❌ 設定保存エラー: ${p.message}
コード: ${p.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),a(`❌ 設定の保存に失敗しました: ${p.message||p.code||"不明なエラー"}`,!0);return}if(!m||m.length===0){console.error("❌ 更新対象が見つかりませんでした"),a("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",m);const{data:g,error:c}=await k.from("tournaments").select("*").eq("id",f).single();if(c||!g){console.error("❌ 設定再取得エラー:",c),a("❌ 設定の再取得に失敗しました",!0);return}u=g,console.log("✅ 再取得後のCONFIG:",u),a("✅ 設定を保存しました");const y=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=y,await z(),console.log("✅ 設定保存完了")};function a(t,e=!1){const o=document.getElementById("toast");o.textContent=t,o.className="toast"+(e?" error":""),o.style.display="block",setTimeout(()=>{o.style.display="none"},3e3)}let F=null;function ge(t,e){F=e,document.getElementById("confirm-message").textContent=t;const o=document.getElementById("confirm-dialog");o.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",F&&(F(),F=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",F=null};console.log("✅ システム準備完了");function pe(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+f;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{a("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),a("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(w!==2){a("管理者権限が必要です",!0);return}const e=!(u.is_ended||!1),o=e?"終了":"再開";if(!confirm(`大会を${o}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:i}=await k.from("tournaments").update({is_ended:e}).eq("id",f);if(i){console.error("❌ 更新エラー:",i),a(`❌ ${o}に失敗しました`,!0);return}u.is_ended=e,j(),a(`✅ 大会を${o}しました`),J()};function j(){const t=u.is_ended||!1,e=document.getElementById("tournament-status-display"),o=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",o.innerHTML="▶️ 大会を再開",o.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",o.innerHTML="⏸️ 大会を終了",o.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function J(){const t=u.is_ended||!1,e=document.getElementById("input-form");t&&w!==2&&(e.style.display="none",a("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(w!==2){a("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+f+"」を入力してください:");if(t!==f){t!==null&&a("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await k.from("catches").delete().eq("tournament_id",f);if(e)throw e;const{error:o}=await k.from("players").delete().eq("tournament_id",f);if(o)throw o;const{error:i}=await k.from("tournaments").delete().eq("id",f);if(i)throw i;a("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),a("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(w!==2){a("管理者権限が必要です",!0);return}try{const t=O||[],e=b||[];if(t.length===0){a("❌ エクスポートするデータがありません",!0);return}let o=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`;t.forEach((m,p)=>{const g=e.find(c=>c.zekken===m.zekken)||{};o+=`${p+1},${m.zekken},"${g.name||"未登録"}","${g.club||""}",${m.limit_total_len||0},${m.one_max_len||0},${m.one_max_weight||0},${m.total_count||0},${m.total_weight||0}
`});const i=u.name||"tournament",n=new Date().toISOString().split("T")[0],l=`${i}_result_${n}.csv`,d="\uFEFF",s=new Blob([d+o],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a");r.href=URL.createObjectURL(s),r.download=l,r.click(),a("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),a("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const o=document.getElementById(e);o&&o.addEventListener("input",function(i){const n=i.target.value,l=Y(n);n!==l&&(i.target.value=l)})})});window.exportPDF=async function(){try{if(a("📄 PDF生成中..."),typeof window.jspdf>"u"){a("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:t}=window.jspdf,e=new t({orientation:"portrait",unit:"mm",format:"a4"}),o=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight(),n=15;let l=n;e.setFontSize(20);const d=u.name||"釣り大会",s=e.getTextWidth(d);e.text(d,(o-s)/2,l),l+=10,e.setFontSize(10);const m=`作成日: ${new Date().toLocaleDateString("ja-JP")}`,p=e.getTextWidth(m);e.text(m,o-n-p,l),l+=10,e.setFontSize(11);const g={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"},c=`ルール: ${g[u.rule_type]||"リミット合計長寸"}`;u.limit_count>0?e.text(c+` (リミット${u.limit_count}匹)`,n,l):e.text(c+" (無制限)",n,l),l+=8,e.setLineWidth(.5),e.line(n,l,o-n,l),l+=8;const y=O||[],I=b||[];if(y.length===0)e.setFontSize(12),e.text("まだ釣果データがありません",n,l);else{const x=y.map((h,T)=>{const C=I.find(Q=>Q.zekken===h.zekken)||{},G=R(u.rule_type,h[u.rule_type]);return[`${T+1}位`,`${h.zekken}番`,C.name||"未登録",C.club||"-",G]});if(e.autoTable({startY:l,head:[["順位","ゼッケン","名前","所属",u.limit_count>0?`${g[u.rule_type]}(${u.limit_count}匹)`:g[u.rule_type]]],body:x,styles:{font:"helvetica",fontSize:10,cellPadding:3},headStyles:{fillColor:[102,126,234],textColor:255,fontStyle:"bold"},alternateRowStyles:{fillColor:[245,245,245]},margin:{left:n,right:n}}),l=e.lastAutoTable.finalY+10,u.show_biggest_fish||u.show_smallest_fish){if(l>i-40&&(e.addPage(),l=n),e.setFontSize(14),e.text("特別賞",n,l),l+=8,u.show_biggest_fish){const h=await fe();if(h){const T=I.find(C=>C.zekken===h.zekken)||{};e.setFontSize(11),e.text(`🐟 大物賞: ${T.name||"未登録"} (${h.zekken}番) - ${h.length}cm`,n+5,l),l+=6}}if(u.show_smallest_fish){const h=await ye();if(h){const T=I.find(C=>C.zekken===h.zekken)||{};e.setFontSize(11),e.text(`🎣 最小寸賞: ${T.name||"未登録"} (${h.zekken}番) - ${h.length}cm`,n+5,l),l+=6}}}}const E=u.name||"tournament",v=new Date().toISOString().split("T")[0],B=`${E}_ranking_${v}.pdf`;e.save(B),a("✅ PDFファイルをダウンロードしました")}catch(t){console.error("❌ PDF生成エラー:",t),a("❌ PDF生成に失敗しました: "+t.message,!0)}};async function fe(){const{data:t,error:e}=await k.from("catches").select("*").eq("tournament_id",f).order("length",{ascending:!1}).limit(1);return e||!t||t.length===0?null:t[0]}async function ye(){const{data:t,error:e}=await k.from("catches").select("*").eq("tournament_id",f).order("length",{ascending:!0}).limit(1);return e||!t||t.length===0?null:t[0]}
