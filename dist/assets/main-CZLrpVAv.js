import{createClient as oe}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();const ie="https://pkjvdtvomqzcnfhkqven.supabase.co",le="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",x=oe(ie,le);let v=0,u={},h=null,b=[],R=[],V=!0,F=null,U=10,O=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const e=new URLSearchParams(window.location.search).get("id");e?await re(e):Z()});function Z(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",G()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){d("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function G(){const{data:t,error:e}=await x.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),o=document.getElementById("tournament-list");if(e){console.error("大会一覧読み込みエラー:",e),o.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){o.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}o.innerHTML=t.map(i=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${i.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${i.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${i.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),e=document.getElementById("new-tournament-name").value.trim(),o=document.getElementById("new-tournament-admin-password").value.trim(),i=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!e||!o){d("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){d("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:e});const{data:n,error:r}=await x.from("tournaments").insert({id:t,name:e,password:o,staff_password:i||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(r){console.error("大会作成エラー:",r),r.code==="23505"?d("この大会IDは既に使用されています",!0):d("大会の作成に失敗しました",!0);return}d("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await G(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function re(t){h=t,console.log("📂 大会ID:",h);const{data:e,error:o}=await x.from("tournaments").select("*").eq("id",h).single();if(o||!e){console.error("大会取得エラー:",o),alert("大会が見つかりません"),Z();return}u=e,console.log("✅ 大会情報取得:",u),console.log("📋 大会ルール:",u.rule_type),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 優先順位1:",u.sort1),console.log("🎯 優先順位2:",u.sort2),console.log("🎯 優先順位3:",u.sort3),document.getElementById("tournament-name").textContent=u.name;const i=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=i,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await C(),await L(),xe(),v===2&&(document.getElementById("tournament-management-card").style.display="block",W()),X(),se()}function se(){F&&F.unsubscribe(),F=x.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${h}`},()=>{V&&(console.log("⚡ リアルタイム更新"),L(),v>0&&S())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){V=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");V?(t.style.display="none",d("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",d("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){d("🔄 更新中..."),await L(),v>0&&await S(),d("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((o,i)=>{o.classList.remove("active"),(t==="ranking"&&i===0||t==="input"&&i===1||t==="settings"&&i===2)&&o.classList.add("active")}),document.querySelectorAll(".view").forEach(o=>{o.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),L()):t==="input"?(document.getElementById("input-view").classList.add("active"),v>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",C(),S()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),v===2&&(document.getElementById("rule-settings-card").style.display="block",ye()),v>0&&C().then(()=>P()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===u.password)v=2,d("✅ 管理者としてログイン"),J("管理者");else if(t===u.staff_password)v=1,d("✅ 運営スタッフとしてログイン"),J("運営スタッフ");else{d("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",v),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",v===2&&(document.getElementById("tournament-management-card").style.display="block",W()),C(),S()};window.logout=function(){be("ログアウトしますか？",()=>{v=0,F&&(F.unsubscribe(),F=null),d("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function J(t){const e=document.getElementById("login-status"),o=document.getElementById("login-status-text");o.textContent=`${t}としてログイン中`,e.style.display="block"}async function C(){console.log("👥 選手データ読み込み開始");const{data:t,error:e}=await x.from("players").select("*").eq("tournament_id",h).order("zekken");if(e){console.error("❌ 選手読み込みエラー:",e);return}b=t||[],console.log("✅ 選手データ読み込み完了:",b.length,"人"),b.length>0&&console.log("📋 選手サンプル:",b[0]);const o=document.getElementById("player-select");o.innerHTML='<option value="">選手を選択してください</option>',b.forEach(i=>{const n=document.createElement("option");n.value=i.zekken,n.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,o.appendChild(n)})}function Q(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(e){return String.fromCharCode(e.charCodeAt(0)-65248)})}function ae(t){return t.replace(/[\u30A1-\u30F6]/g,function(e){const o=e.charCodeAt(0)-96;return String.fromCharCode(o)})}function de(t){return t.replace(/[\u3041-\u3096]/g,function(e){const o=e.charCodeAt(0)+96;return String.fromCharCode(o)})}function H(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const e=ae(t),o=de(t),i=Q(t);return{original:t,hiragana:e,katakana:o,halfWidth:i}}window.searchPlayer=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select"),n=t.value.trim();if(console.log("🔍 検索クエリ:",n),console.log("🔍 選手データ数:",b.length),b.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),b.slice(0,3).forEach(l=>{console.log(`  - ${l.zekken}番: ${l.name} (${l.club||"所属なし"})`)})),e.style.display=n?"block":"none",!n){i.innerHTML='<option value="">選手を選択してください</option>',b.forEach(l=>{const a=document.createElement("option");a.value=l.zekken,a.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(a)}),o.textContent="";return}const r=H(n);console.log("🔧 正規化された検索クエリ:",{元:r.original,ひらがな:r.hiragana,カタカナ:r.katakana,半角:r.halfWidth});const s=b.filter(l=>{if(l.zekken.toString()===n||l.zekken.toString()===r.halfWidth)return console.log("✅ ゼッケン一致:",l.zekken),!0;if(l.reading){const a=H(l.reading);if(l.reading.includes(n))return console.log("✅ 読み仮名一致（完全）:",l.reading,"検索:",n),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",l.reading,"検索:",n),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",l.reading,"検索:",n),!0}if(l.name){const a=H(l.name);if(l.name.includes(n))return console.log("✅ 名前一致（完全）:",l.name,"検索:",n),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",l.name,"検索:",n),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",l.name,"検索:",n),!0;if(a.halfWidth.includes(r.halfWidth)&&r.halfWidth!=="")return console.log("✅ 名前一致（半角）:",l.name,"検索:",n),!0;const g=l.name.toLowerCase(),p=n.toLowerCase();if(g.includes(p))return console.log("✅ 名前一致（英語）:",l.name,"検索:",n),!0}if(l.club){const a=H(l.club);if(l.club.includes(n))return console.log("✅ 所属一致（完全）:",l.club,"検索:",n),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",l.club,"検索:",n),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",l.club,"検索:",n),!0;if(a.halfWidth.includes(r.halfWidth)&&r.halfWidth!=="")return console.log("✅ 所属一致（半角）:",l.club,"検索:",n),!0;const g=l.club.toLowerCase(),p=n.toLowerCase();if(g.includes(p))return console.log("✅ 所属一致（英語）:",l.club,"検索:",n),!0}return!1});console.log("🔍 検索結果:",s.length,"件"),i.innerHTML='<option value="">選手を選択してください</option>',s.length===0?(o.textContent="該当する選手が見つかりません",o.style.color="#ff6b6b"):(s.forEach(l=>{const a=document.createElement("option");a.value=l.zekken,a.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,i.appendChild(a)}),o.textContent=`${s.length}件の選手が見つかりました`,o.style.color="#51cf66",s.length===1&&(i.value=s[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),e=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),i=document.getElementById("player-select");t.value="",e.style.display="none",o.textContent="",i.innerHTML='<option value="">選手を選択してください</option>',b.forEach(n=>{const r=document.createElement("option");r.value=n.zekken,r.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,i.appendChild(r)})};window.switchInputMode=function(t){const e=document.getElementById("zekken-input-mode"),o=document.getElementById("search-input-mode"),i=document.getElementById("tab-zekken"),n=document.getElementById("tab-search");t==="zekken"?(e.style.display="block",o.style.display="none",i.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",i.style.color="white",i.style.border="none",i.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(e.style.display="none",o.style.display="block",n.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",n.style.color="white",n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 0.6)",i.style.border="2px solid rgba(255, 255, 255, 0.2)",i.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),e=document.getElementById("player-info-display"),o=document.getElementById("player-name-display"),i=document.getElementById("player-club-display"),n=document.getElementById("player-error-display"),r=parseInt(t.value);if(!r||isNaN(r)){e.style.display="none",n.style.display="none";return}const s=b.find(l=>l.zekken===r);s?(e.style.display="block",n.style.display="none",o.textContent=`${s.zekken}番: ${s.name}`,i.textContent=s.club?`所属: ${s.club}`:"所属なし",console.log("✅ 選手が見つかりました:",s)):(e.style.display="none",n.style.display="block",console.log("❌ 選手が見つかりません:",r))};window.registerCatch=async function(){if(v===0){d("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let e;t?e=parseInt(document.getElementById("zekken-input").value):e=parseInt(document.getElementById("player-select").value);const o=parseFloat(document.getElementById("length-input").value),i=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:e,length:o,weight:i,mode:t?"ゼッケン":"検索"}),!e){d("選手を選択してください",!0);return}if(!o||o<=0){d("長寸を入力してください",!0);return}const n=b.find(l=>l.zekken==e);if(!n){d("選手が見つかりません",!0);return}const r=n.name,{error:s}=await x.from("catches").insert({tournament_id:h,zekken:e,length:o,weight:i});if(s){console.error("❌ 登録エラー:",s),d("登録に失敗しました",!0);return}console.log("✅ 登録成功"),d(`✅ ${r}: ${o}cm ${i>0?i+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await S(),await L()};async function S(){console.log("📋 履歴読み込み開始"),console.log("👥 ALL_PLAYERS:",b);const t={};b.forEach(n=>{t[n.zekken]=n.name}),console.log("🗺️ playerMap:",t);const{data:e,error:o}=await x.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1}).limit(50);if(o){console.error("❌ 履歴読み込みエラー:",o);return}R=e||[],console.log("✅ 履歴読み込み完了:",R.length,"件");const i=document.getElementById("history-list");if(R.length===0){i.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}i.innerHTML=R.map(n=>{const r=t[n.zekken]||"未登録",s=new Date(n.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <span style="font-size: 16px;">${r}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${n.length}cm</span>
                        ${n.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${n.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">🕐 ${s}</div>
                </div>
                ${v===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${n.id}, ${n.zekken}, ${n.length}, ${n.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${n.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(t,e,o,i){if(v!==2){d("管理者権限が必要です",!0);return}const n=b.find(s=>s.zekken===e),r=n?n.name:`${e}番`;ce(t,e,r,o,i)};function ce(t,e,o,i,n){const r=`
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
    `;document.body.insertAdjacentHTML("beforeend",r);const s=document.getElementById("edit-catch-dialog"),l=document.getElementById("edit-length-input"),a=document.getElementById("edit-weight-input"),g=document.getElementById("edit-catch-cancel-btn"),p=document.getElementById("edit-catch-save-btn");g.onclick=()=>{s.remove()},p.onclick=async()=>{const m=parseFloat(l.value),c=parseFloat(a.value)||0;if(!m||m<=0){d("長寸を入力してください",!0);return}s.remove();const{error:f}=await x.from("catches").update({length:m,weight:c}).eq("id",t);if(f){console.error("❌ 更新エラー:",f),d("❌ 更新に失敗しました",!0);return}d(`✅ ${o}の釣果を更新しました`),await S(),await L()},l.addEventListener("keypress",m=>{m.key==="Enter"&&p.click()}),a.addEventListener("keypress",m=>{m.key==="Enter"&&p.click()}),s.addEventListener("click",m=>{m.target===s&&s.remove()}),l.focus(),l.select()}window.deleteCatch=async function(t){if(v!==2){d("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:e}=await x.from("catches").delete().eq("id",t);if(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await S(),await L()};async function L(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",u),console.log("📊 リミット匹数:",u.limit_count),console.log("🎯 大会ルール:",u.rule_type);const{data:t,error:e}=await x.from("catches").select("*").eq("tournament_id",h);if(e){console.error("❌ ランキング読み込みエラー:",e);return}const o=t||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const i={};b.forEach(c=>{i[c.zekken]=c});const n={};o.forEach(c=>{n[c.zekken]||(n[c.zekken]={zekken:c.zekken,lengths:[],weights:[],min_len:c.length,max_len:c.length,min_weight:c.weight||0,max_weight:c.weight||0}),n[c.zekken].lengths.push(c.length),n[c.zekken].weights.push(c.weight||0),n[c.zekken].min_len=Math.min(n[c.zekken].min_len,c.length),n[c.zekken].max_len=Math.max(n[c.zekken].max_len,c.length),n[c.zekken].min_weight=Math.min(n[c.zekken].min_weight,c.weight||0),n[c.zekken].max_weight=Math.max(n[c.zekken].max_weight,c.weight||0)});const r=Object.values(n).map(c=>{const f=[...c.lengths].sort((E,z)=>z-E),y=[...c.weights].sort((E,z)=>z-E),k=u.limit_count||999;console.log(`📊 選手${c.zekken}番の計算:`,{全釣果数:c.lengths.length,リミット匹数:k,全長寸:f,リミット長寸:f.slice(0,k)});const w=y.slice(0,k).reduce((E,z)=>E+z,0),_=f.slice(0,k).reduce((E,z)=>E+z,0);return{zekken:c.zekken,count:c.lengths.length,max_len:c.max_len,min_len:c.min_len,max_weight:c.max_weight,min_weight:c.min_weight,one_max_len:c.max_len,one_max_weight:c.max_weight,total_weight:c.weights.reduce((E,z)=>E+z,0),total_count:c.lengths.length,limit_weight:w,limit_total_len:_}}),s=u.rule_type||"max_len",l=u.sort1||null,a=u.sort2||null,g=u.sort3||null;r.sort((c,f)=>c[s]!==f[s]?f[s]-c[s]:l&&c[l]!==f[l]?f[l]-c[l]:a&&c[a]!==f[a]?f[a]-c[a]:g&&c[g]!==f[g]?f[g]-c[g]:0),O=r,console.log("✅ ランキング計算完了:",r.length,"人");const p=document.getElementById("show-biggest-fish")?.checked??!0;p?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ue(r,i)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const m=document.getElementById("show-smallest-fish")?.checked??!0;m?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),ge(r,i)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!p&&!m&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),K(r,i)}function ue(t,e){const o=document.getElementById("biggest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,a)=>a.max_len===l.max_len?a.max_weight-l.max_weight:a.max_len-l.max_len),n=new Set,r=[];for(const l of i)if(!n.has(l.zekken)&&(r.push(l),n.add(l.zekken),r.length===3))break;const s=document.getElementById("biggest-fish-list");s.innerHTML=r.map((l,a)=>{const g=e[l.zekken]||{},p=g.name||"未登録",m=g.club||"";return`
            <div class="ranking-item ${a===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${a+1}位</div>
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
        `}).join("")}function ge(t,e){const o=document.getElementById("smallest-fish-list").closest(".card");o.style.display="block";const i=[...t].sort((l,a)=>l.min_len===a.min_len?l.min_weight-a.min_weight:l.min_len-a.min_len),n=new Set,r=[];for(const l of i)if(!n.has(l.zekken)&&(r.push(l),n.add(l.zekken),r.length===3))break;const s=document.getElementById("smallest-fish-list");s.innerHTML=r.map((l,a)=>{const g=e[l.zekken]||{},p=g.name||"未登録",m=g.club||"";return`
            <div class="ranking-item ${a===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${a+1}位</div>
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
        `}).join("")}function K(t,e){const o=u.rule_type||"max_len",i=u.sort1||null,n=u.sort2||null,r=u.limit_count||0,s=Math.min(U,t.length),l=t.slice(0,s),a=document.getElementById("ranking-list");a.innerHTML=l.map((p,m)=>{const c=m<3,f=e[p.zekken]||{},y=f.name||"未登録",k=f.club||"";let w=q[o];(o==="limit_total_len"||o==="limit_weight")&&r>0&&(w+=` (${r}匹)`);const _=N(o,p[o]),E=i?N(i,p[i]):null,z=n?N(n,p[n]):null;return`
            <div class="ranking-item ${c?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${m+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${p.zekken}番: ${y}</div>
                        ${k?`<div style="font-size: 14px; opacity: 0.8;">${k}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${w}</div>
                        <div class="stat-value" style="color: #FFD700;">${_}</div>
                    </div>
                    ${E?`
                    <div class="stat">
                        <div class="stat-label">${q[i]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${E}</div>
                    </div>
                    `:""}
                    ${z?`
                    <div class="stat">
                        <div class="stat-label">${q[n]}</div>
                        <div class="stat-value" style="color: #2196F3;">${z}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const g=document.getElementById("show-more-btn");t.length>U?g.style.display="block":g.style.display="none"}window.showMoreRankings=function(){U+=10;const t={};b.forEach(e=>{t[e.zekken]=e}),K(O,t),d("10件追加表示しました")};function N(t,e){return t.includes("len")?`${e.toFixed(1)}cm`:t.includes("weight")?`${Math.round(e)}g`:t==="total_count"?`${e}枚`:e}async function P(){const{data:t,error:e}=await x.from("players").select("*").eq("tournament_id",h).order("zekken");if(e){console.error("選手リスト読み込みエラー:",e);return}const o=t||[],i=document.getElementById("player-list");if(o.length===0){i.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}i.innerHTML=o.map(n=>`
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
    `).join("")}window.editPlayer=async function(t){const e=b.find(o=>o.zekken===t);if(!e){d("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",e),me(e,async o=>{if(!o)return;console.log("📝 更新データ:",o),console.log("📝 更新条件:",{tournament_id:h,zekken:t});const{data:i,error:n}=await x.from("players").update({name:o.name,club:o.club,reading:o.reading}).eq("tournament_id",h).eq("zekken",t).select();if(n){console.error("❌ 選手編集エラー:",n),console.error("❌ エラー詳細:",JSON.stringify(n,null,2)),d(`❌ 編集に失敗しました: ${n.message||n.code||"不明なエラー"}`,!0);return}if(!i||i.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",i),d("✅ 選手情報を更新しました"),await C(),await P(),console.log("✅ 再読み込み後のALL_PLAYERS:",b.find(r=>r.zekken===t))})};function me(t,e){const o=`
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
    `;document.body.insertAdjacentHTML("beforeend",o);const i=document.getElementById("edit-player-dialog"),n=document.getElementById("edit-name-input"),r=document.getElementById("edit-reading-input"),s=document.getElementById("edit-club-input"),l=document.getElementById("edit-cancel-btn"),a=document.getElementById("edit-ok-btn");l.onclick=()=>{i.remove(),e(null)},a.onclick=()=>{const g=n.value.trim(),p=r.value.trim(),m=s.value.trim();if(!g){d("名前は必須です",!0);return}i.remove(),e({name:g,reading:p,club:m})},n.addEventListener("keypress",g=>{g.key==="Enter"&&a.click()}),r.addEventListener("keypress",g=>{g.key==="Enter"&&a.click()}),s.addEventListener("keypress",g=>{g.key==="Enter"&&a.click()}),i.addEventListener("click",g=>{g.target===i&&(i.remove(),e(null))}),n.focus(),n.select()}window.addPlayer=async function(){if(v!==2){d("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),e=document.getElementById("new-name").value.trim(),o=document.getElementById("new-club").value.trim(),i=document.getElementById("new-reading").value.trim();if(!t||!e){d("ゼッケン番号と名前は必須です",!0);return}if(b.some(s=>s.zekken===t)){d(`${t}番は既に登録されています`,!0);return}const{error:r}=await x.from("players").insert({tournament_id:h,zekken:t,name:e,club:o||"",reading:i||""});if(r){console.error("選手追加エラー:",r),d("追加に失敗しました（重複の可能性）",!0);return}d("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await C(),await P()};let M=[];window.handleCSVFile=function(t){const e=t.target.files[0];if(!e)return;console.log("📂 CSVファイル選択:",e.name);const o=new FileReader;o.onload=function(i){const n=i.target.result;pe(n)},o.readAsText(e,"UTF-8")};function pe(t){try{console.log("📊 CSVパース開始");const e=t.split(/\r?\n/).filter(a=>a.trim());if(e.length<2){d("❌ CSVファイルが空です",!0);return}const i=e[0].split(",").map(a=>a.trim());console.log("📋 ヘッダー:",i);const r=["ゼッケン番号","名前"].filter(a=>!i.includes(a));if(r.length>0){d(`❌ 必須列が不足: ${r.join(", ")}`,!0);return}const s=[],l=[];for(let a=1;a<e.length;a++){const p=e[a].split(",").map(w=>w.trim());if(p.length!==i.length){l.push(`${a+1}行目: 列数が一致しません`);continue}const m={};i.forEach((w,_)=>{m[w]=p[_]});const c=parseInt(m.ゼッケン番号),f=m.名前;if(!c||isNaN(c)||c<=0){l.push(`${a+1}行目: ゼッケン番号が不正です (${m.ゼッケン番号})`);continue}if(!f||f.trim()===""){l.push(`${a+1}行目: 名前が空です`);continue}if(s.some(w=>w.zekken===c)){l.push(`${a+1}行目: ゼッケン番号 ${c} が重複しています`);continue}const k=b.find(w=>w.zekken===c);if(k){l.push(`${a+1}行目: ゼッケン番号 ${c} は既に登録されています (${k.name})`);continue}s.push({zekken:c,name:f,reading:m.読み仮名||"",club:m.所属||""})}if(console.log("✅ パース完了:",s.length,"件"),console.log("❌ エラー:",l.length,"件"),l.length>0){console.error("エラー詳細:",l),d(`⚠️ ${l.length}件のエラーがあります`,!0);const a=l.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${a}${l.length>5?`

...他${l.length-5}件`:""}`)}if(s.length===0){d("❌ インポート可能なデータがありません",!0);return}M=s,fe(s,l)}catch(e){console.error("❌ CSVパースエラー:",e),d("❌ CSVファイルの読み込みに失敗しました",!0)}}function fe(t,e){const o=document.getElementById("csv-preview"),i=document.getElementById("csv-preview-content");let n=`
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
    `;t.forEach(r=>{n+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${r.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.club||"-"}</td>
            </tr>
        `}),n+=`
            </tbody>
        </table>
    `,i.innerHTML=n,o.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(M.length===0){d("❌ インポートするデータがありません",!0);return}if(v!==2){d("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",M.length,"件");try{const t=M.map(i=>({tournament_id:h,zekken:i.zekken,name:i.name,reading:i.reading,club:i.club})),{data:e,error:o}=await x.from("players").insert(t).select();if(o){console.error("❌ インポートエラー:",o),d(`❌ インポートに失敗しました: ${o.message}`,!0);return}console.log("✅ インポート成功:",e.length,"件"),d(`✅ ${e.length}件の選手を登録しました！`),M=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await C(),await P()}catch(t){console.error("❌ インポート例外:",t),d("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){M=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",d("インポートをキャンセルしました")};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:e}=await x.from("players").delete().eq("tournament_id",h).eq("zekken",t);if(e){console.error("選手削除エラー:",e),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await C(),await P()};const q={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const e=document.getElementById("zekken-warning"),o=document.getElementById("add-player-btn");if(!t){e.style.display="none",o.disabled=!1;return}const i=parseInt(t);b.some(r=>r.zekken===i)?(e.textContent=`⚠️ ${i}番は既に登録されています`,e.style.color="#ff6b6b",e.style.fontWeight="bold",e.style.display="block",o.disabled=!0):(e.textContent=`✅ ${i}番は利用可能です`,e.style.color="#4CAF50",e.style.fontWeight="normal",e.style.display="block",o.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,e=document.getElementById("sort1").value,o=document.getElementById("sort2").value,i=[t];e&&i.push(e),o&&i.push(o),j("sort1",i,[t]),j("sort2",i,[t,e]),j("sort3",i,[t,e,o])};function j(t,e,o){const i=document.getElementById(t),n=i.value;i.innerHTML='<option value="">選択しない</option>';const r={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[s,l]of Object.entries(r))if(!o.includes(s)||s===n){const a=document.createElement("option");a.value=s,a.textContent=l,s===n&&(a.selected=!0),i.appendChild(a)}}async function ye(){if(console.log("⚙️ 大会設定読み込み開始"),!u||!u.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=u.rule_type||"limit_total_len",he(u.limit_count||0);const t=localStorage.getItem(`${h}_show_biggest_fish`),e=localStorage.getItem(`${h}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=e===null?!0:e==="true",updateSortOptions(),document.getElementById("sort1").value=u.sort1||"",document.getElementById("sort2").value=u.sort2||"",document.getElementById("sort3").value=u.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",u)}function he(t){const e=document.getElementById("limit-count-picker"),o=document.getElementById("limit-count"),i=e.querySelectorAll(".limit-option");o.value=t;const n=Array.from(i).find(l=>parseInt(l.dataset.value)===t);n&&(n.scrollIntoView({block:"center",behavior:"auto"}),s());let r;e.addEventListener("scroll",function(){clearTimeout(r),r=setTimeout(()=>{s()},100)}),i.forEach(l=>{l.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>s(),300)})});function s(){const l=e.getBoundingClientRect(),a=l.top+l.height/2;let g=null,p=1/0;i.forEach(m=>{const c=m.getBoundingClientRect(),f=c.top+c.height/2,y=Math.abs(a-f);y<p&&(p=y,g=m)}),g&&(i.forEach(m=>m.classList.remove("selected")),g.classList.add("selected"),o.value=g.dataset.value,console.log("📊 リミット匹数変更:",o.value))}}window.updateTournamentSettings=async function(){if(v!==2){d("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,e=parseInt(document.getElementById("limit-count").value)||0,o=document.getElementById("sort1").value,i=document.getElementById("sort2").value,n=document.getElementById("sort3").value,r=document.getElementById("show-biggest-fish").checked,s=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${h}_show_biggest_fish`,r),localStorage.setItem(`${h}_show_smallest_fish`,s);const l=[o,i,n].filter(y=>y!==""),a=new Set(l);if(l.length!==a.size){d("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:e,sort1:o,sort2:i,sort3:n,showBiggestFish:r,showSmallestFish:s}),console.log("💾 更新条件:",{id:h}),console.log("💾 更新前のCONFIG.limit_count:",u.limit_count);const{data:g,error:p}=await x.from("tournaments").update({rule_type:t,limit_count:e,sort1:o||null,sort2:i||null,sort3:n||null}).eq("id",h).select();if(console.log("💾 UPDATE結果 - data:",g),console.log("💾 UPDATE結果 - error:",p),p){console.error("❌ 設定保存エラー:",p),console.error("❌ エラー詳細:",JSON.stringify(p,null,2)),console.error("❌ エラーコード:",p.code),console.error("❌ エラーメッセージ:",p.message),alert(`❌ 設定保存エラー: ${p.message}
コード: ${p.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),d(`❌ 設定の保存に失敗しました: ${p.message||p.code||"不明なエラー"}`,!0);return}if(!g||g.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",g);const{data:m,error:c}=await x.from("tournaments").select("*").eq("id",h).single();if(c||!m){console.error("❌ 設定再取得エラー:",c),d("❌ 設定の再取得に失敗しました",!0);return}u=m,console.log("✅ 再取得後のCONFIG:",u),d("✅ 設定を保存しました");const f=u.limit_count>0?`リミット${u.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=f,await L(),console.log("✅ 設定保存完了")};function d(t,e=!1){const o=document.getElementById("toast");o.textContent=t,o.className="toast"+(e?" error":""),o.style.display="block",setTimeout(()=>{o.style.display="none"},3e3)}let D=null;function be(t,e){D=e,document.getElementById("confirm-message").textContent=t;const o=document.getElementById("confirm-dialog");o.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",D&&(D(),D=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",D=null};console.log("✅ システム準備完了");function xe(){const t=document.getElementById("qrcode");t.innerHTML="";const e=window.location.origin+window.location.pathname+"?id="+h;document.getElementById("tournament-url").textContent=e,new QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const t=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(t).then(()=>{d("✅ URLをコピーしました")}).catch(e=>{console.error("コピーエラー:",e),d("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(v!==2){d("管理者権限が必要です",!0);return}const e=!(u.is_ended||!1),o=e?"終了":"再開";if(!confirm(`大会を${o}しますか？
${e?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:i}=await x.from("tournaments").update({is_ended:e}).eq("id",h);if(i){console.error("❌ 更新エラー:",i),d(`❌ ${o}に失敗しました`,!0);return}u.is_ended=e,W(),d(`✅ 大会を${o}しました`),X()};function W(){const t=u.is_ended||!1,e=document.getElementById("tournament-status-display"),o=document.getElementById("toggle-tournament-btn");t?(e.innerHTML="🔴 終了",e.style.background="rgba(255, 107, 107, 0.2)",e.style.borderColor="#ff6b6b",e.style.color="#ff6b6b",o.innerHTML="▶️ 大会を再開",o.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(e.innerHTML="🟢 進行中",e.style.background="rgba(81, 207, 102, 0.2)",e.style.borderColor="#51cf66",e.style.color="#51cf66",o.innerHTML="⏸️ 大会を終了",o.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function X(){const t=u.is_ended||!1,e=document.getElementById("input-form");t&&v!==2&&(e.style.display="none",d("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(v!==2){d("管理者権限が必要です",!0);return}const t=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+h+"」を入力してください:");if(t!==h){t!==null&&d("❌ 大会IDが一致しません",!0);return}try{const{error:e}=await x.from("catches").delete().eq("tournament_id",h);if(e)throw e;const{error:o}=await x.from("players").delete().eq("tournament_id",h);if(o)throw o;const{error:i}=await x.from("tournaments").delete().eq("id",h);if(i)throw i;d("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(e){console.error("❌ 削除エラー:",e),d("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(v!==2){d("管理者権限が必要です",!0);return}try{const t=O||[],e=b||[];if(t.length===0){d("❌ エクスポートするデータがありません",!0);return}const{data:o,error:i}=await x.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1});i&&console.error("釣果取得エラー:",i);const n=await ee(),r=await te();let s="";if(s+=`【大会情報】
`,s+=`大会名,"${u.name||"釣り大会"}"
`,s+=`作成日,${new Date().toLocaleDateString("ja-JP")}
`,s+=`ルール,"${{limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[u.rule_type]||"リミット合計長寸"}"
`,s+=`リミット匹数,${u.limit_count>0?u.limit_count+"匹":"無制限"}
`,s+=`
`,s+=`【順位表】
`,s+=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`,t.forEach((y,k)=>{const w=e.find(_=>_.zekken===y.zekken)||{};s+=`${k+1},${y.zekken},"${w.name||"未登録"}","${w.club||""}",${y.limit_total_len||0},${y.one_max_len||0},${y.one_max_weight||0},${y.total_count||0},${y.total_weight||0}
`}),s+=`
`,s+=`【特別賞】
`,n&&u.show_biggest_fish){const y=e.find(k=>k.zekken===n.zekken)||{};s+=`大物賞,${n.zekken}番,"${y.name||"未登録"}","${y.club||""}",${n.length}cm,${n.weight||0}g
`}if(r&&u.show_smallest_fish){const y=e.find(k=>k.zekken===r.zekken)||{};s+=`最小寸賞,${r.zekken}番,"${y.name||"未登録"}","${y.club||""}",${r.length}cm,${r.weight||0}g
`}s+=`
`,o&&o.length>0&&(s+=`【全釣果データ】
`,s+=`ゼッケン番号,名前,所属,長寸(cm),重量(g),登録日時
`,o.forEach(y=>{const k=e.find(_=>_.zekken===y.zekken)||{},w=new Date(y.created_at).toLocaleString("ja-JP");s+=`${y.zekken},"${k.name||"未登録"}","${k.club||""}",${y.length},${y.weight||0},"${w}"
`}));const a=u.name||"tournament",g=new Date().toISOString().split("T")[0],p=`${a}_完全版_${g}.csv`,m="\uFEFF",c=new Blob([m+s],{type:"text/csv;charset=utf-8;"}),f=document.createElement("a");f.href=URL.createObjectURL(c),f.download=p,f.click(),d("✅ CSVファイルをダウンロードしました")}catch(t){console.error("❌ エクスポートエラー:",t),d("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(e=>{const o=document.getElementById(e);o&&o.addEventListener("input",function(i){const n=i.target.value,r=Q(n);n!==r&&(i.target.value=r)})})});window.exportPDF=async function(){try{if(d("📄 PDF生成中..."),typeof window.jspdf>"u"||typeof html2canvas>"u"){d("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:t}=window.jspdf,e=O||[],o=b||[];if(e.length===0){d("❌ まだ釣果データがありません",!0);return}const n={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[u.rule_type]||"リミット合計長寸",r=u.limit_count>0?`(リミット${u.limit_count}匹)`:"(無制限)",s=document.createElement("div");s.style.cssText=`
            position: absolute;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
            color: #333;
        `;const l=u.name||"釣り大会",a=new Date().toLocaleDateString("ja-JP");if(s.innerHTML=`
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #667eea;">${l}</h1>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">作成日: ${a}</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">ルール: ${n} ${r}</p>
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
                        ${e.map(($,I)=>{const B=o.find(A=>A.zekken===$.zekken)||{},T=N(u.rule_type,$[u.rule_type]);return`
                                <tr style="background: ${I%2===0?"#f9f9f9":"white"};">
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${I+1}位</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${$.zekken}番</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${B.name||"未登録"}</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${B.club||"-"}</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">${T}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            </div>
        `,u.show_biggest_fish||u.show_smallest_fish){const $=[];if(u.show_biggest_fish){const I=await ee();if(I){const B=o.find(T=>T.zekken===I.zekken)||{};$.push(`
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <strong style="color: #667eea; font-size: 16px;">🐟 大物賞</strong><br>
                            <span style="font-size: 14px; margin-top: 5px; display: inline-block;">
                                ${B.name||"未登録"} (${I.zekken}番) - 長寸: ${I.length}cm ${I.weight?`/ 重量: ${I.weight}g`:""}
                            </span>
                        </div>
                    `)}}if(u.show_smallest_fish){const I=await te();if(I){const B=o.find(T=>T.zekken===I.zekken)||{};$.push(`
                        <div style="background: rgba(255, 183, 77, 0.1); padding: 15px; border-radius: 8px;">
                            <strong style="color: #ff8c00; font-size: 16px;">🎣 最小寸賞</strong><br>
                            <span style="font-size: 14px; margin-top: 5px; display: inline-block;">
                                ${B.name||"未登録"} (${I.zekken}番) - 長寸: ${I.length}cm ${I.weight?`/ 重量: ${I.weight}g`:""}
                            </span>
                        </div>
                    `)}}$.length>0&&(s.innerHTML+=`
                    <div style="margin-top: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">🏆 特別賞</h2>
                        ${$.join("")}
                    </div>
                `)}const{data:g,error:p}=await x.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1});!p&&g&&g.length>0&&(s.innerHTML+=`
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
                                ${g.map(($,I)=>{const B=o.find(A=>A.zekken===$.zekken)||{},T=I%2===0?"#f9f9f9":"white",Y=new Date($.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
                                        <tr style="background: ${T};">
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${I+1}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${$.zekken}番</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${B.name||"未登録"}</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${B.club||"-"}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #51cf66; font-weight: bold;">${$.length}cm</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #ffd93d; font-weight: bold;">${$.weight||0}g</td>
                                            <td style="padding: 8px; text-align: center; font-size: 11px; border-bottom: 1px solid #eee; color: #999;">${Y}</td>
                                        </tr>
                                    `}).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 10px; text-align: right; font-size: 12px; color: #666;">
                        合計: ${g.length}件の釣果
                    </div>
                </div>
            `),document.body.appendChild(s);const m=await html2canvas(s,{scale:2,backgroundColor:"#ffffff",logging:!1});document.body.removeChild(s);const c=m.toDataURL("image/png"),f=210,y=m.height*f/m.width,k=new t({orientation:(y>297,"portrait"),unit:"mm",format:"a4"});let w=0;const _=297;for(;w<y;)w>0&&k.addPage(),k.addImage(c,"PNG",0,-w,f,y),w+=_;const E=u.name||"tournament",z=new Date().toISOString().split("T")[0],ne=`${E}_ranking_${z}.pdf`;k.save(ne),d("✅ PDFファイルをダウンロードしました")}catch(t){console.error("❌ PDF生成エラー:",t),d("❌ PDF生成に失敗しました: "+t.message,!0)}};async function ee(){const{data:t,error:e}=await x.from("catches").select("*").eq("tournament_id",h).order("length",{ascending:!1}).limit(1);return e||!t||t.length===0?null:t[0]}async function te(){const{data:t,error:e}=await x.from("catches").select("*").eq("tournament_id",h).order("length",{ascending:!0}).limit(1);return e||!t||t.length===0?null:t[0]}
