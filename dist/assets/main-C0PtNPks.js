import{createClient as ce}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function i(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(o){if(o.ep)return;o.ep=!0;const r=i(o);fetch(o.href,r)}})();const K="https://pkjvdtvomqzcnfhkqven.supabase.co",ge="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",b=ce(K,ge);let k=0,g={},h=null,v=[],V=[],G=!0,R=null,Q=10,J=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const t=new URLSearchParams(window.location.search).get("id");t?await ue(t):te()});function te(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",ne()}window.enterTournament=function(){const e=document.getElementById("tournament-id-input").value.trim();if(!e){d("大会IDを入力してください",!0);return}window.location.href=`?id=${e}`};async function ne(){const{data:e,error:t}=await b.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),i=document.getElementById("tournament-list");if(t){console.error("大会一覧読み込みエラー:",t),i.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!e||e.length===0){i.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}i.innerHTML=e.map(n=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${n.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${n.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${n.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const e=document.getElementById("new-tournament-id").value.trim(),t=document.getElementById("new-tournament-name").value.trim(),i=document.getElementById("new-tournament-admin-password").value.trim(),n=document.getElementById("new-tournament-staff-password").value.trim();if(!e||!t||!i){d("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(e)){d("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:e,name:t});const{data:o,error:r}=await b.from("tournaments").insert({id:e,name:t,password:i,staff_password:n||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null,hide_ranking:!1}).select();if(r){console.error("❌ 大会作成エラー:",r),console.error("エラー詳細:",{message:r.message,details:r.details,hint:r.hint,code:r.code}),r.code==="23505"?d("❌ この大会IDは既に使用されています",!0):r.message&&r.message.includes("Failed to fetch")?(d("❌ Supabaseへの接続に失敗しました。ネットワークを確認してください。",!0),alert(`Supabase接続エラー

1. Supabaseプロジェクトが一時停止していないか確認
2. ネットワーク接続を確認
3. RLSポリシーが設定されているか確認

URL: ${K}`)):d(`❌ 大会の作成に失敗しました: ${r.message||"不明なエラー"}`,!0);return}d("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await ne(),setTimeout(()=>{window.location.href=`?id=${e}`},1500)};async function ue(e){h=e,console.log("📂 大会ID:",h);const{data:t,error:i}=await b.from("tournaments").select("*").eq("id",h).single();if(i||!t){console.error("大会取得エラー:",i),alert("大会が見つかりません"),te();return}g=t,console.log("✅ 大会情報取得:",g),console.log("📋 大会ルール:",g.rule_type),console.log("📊 リミット匹数:",g.limit_count),console.log("🎯 優先順位1:",g.sort1),console.log("🎯 優先順位2:",g.sort2),console.log("🎯 優先順位3:",g.sort3),document.getElementById("tournament-name").textContent=g.name;const n=g.limit_count>0?`リミット${g.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=n,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await S(),await C(),Ie(),k===2&&(document.getElementById("tournament-management-card").style.display="block",X()),le(),me()}function me(){R&&R.unsubscribe(),R=b.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${h}`},()=>{G&&(console.log("⚡ リアルタイム更新"),C(),k>0&&D())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){G=document.getElementById("realtime-toggle").checked;const e=document.getElementById("manual-refresh-btn");G?(e.style.display="none",d("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(e.style.display="inline-block",d("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){d("🔄 更新中..."),await C(),k>0&&await D(),d("✅ 更新しました")};window.switchTab=function(e){document.querySelectorAll(".tab").forEach((i,n)=>{i.classList.remove("active"),(e==="ranking"&&n===0||e==="input"&&n===1||e==="settings"&&n===2)&&i.classList.add("active")}),document.querySelectorAll(".view").forEach(i=>{i.classList.remove("active")}),e==="ranking"?(document.getElementById("ranking-view").classList.add("active"),C()):e==="input"?(document.getElementById("input-view").classList.add("active"),k>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",S(),D()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):e==="settings"&&(document.getElementById("settings-view").classList.add("active"),k===2&&(document.getElementById("rule-settings-card").style.display="block",ve()),k>0&&S().then(()=>q()))};window.login=function(){const e=document.getElementById("password-input").value;if(e===g.password)k=2,d("✅ 管理者としてログイン"),ee("管理者");else if(e===g.staff_password)k=1,d("✅ 運営スタッフとしてログイン"),ee("運営スタッフ");else{d("パスワードが違います",!0);return}if(console.log("🔐 ログイン成功 AUTH_LEVEL:",k),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",k>=1&&document.querySelectorAll(".admin-only").forEach(t=>{t.style.display="block"}),k===2){const t=document.getElementById("tournament-management-card");t&&(t.style.display="block",X())}S(),D()};window.logout=function(){Ee("ログアウトしますか？",()=>{k=0,R&&(R.unsubscribe(),R=null),d("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function ee(e){const t=document.getElementById("login-status"),i=document.getElementById("login-status-text");i.textContent=`${e}としてログイン中`,t.style.display="block"}async function S(){console.log("👥 選手データ読み込み開始");const{data:e,error:t}=await b.from("players").select("*").eq("tournament_id",h).order("zekken");if(t){console.error("❌ 選手読み込みエラー:",t);return}v=e||[],console.log("✅ 選手データ読み込み完了:",v.length,"人"),v.length>0&&console.log("📋 選手サンプル:",v[0]);const i=document.getElementById("player-select");i.innerHTML='<option value="">選手を選択してください</option>',v.forEach(n=>{const o=document.createElement("option");o.value=n.zekken,o.textContent=`${n.zekken}番: ${n.name}${n.club?` (${n.club})`:""}`,i.appendChild(o)})}function oe(e){return e.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(t){return String.fromCharCode(t.charCodeAt(0)-65248)})}function pe(e){return e.replace(/[\u30A1-\u30F6]/g,function(t){const i=t.charCodeAt(0)-96;return String.fromCharCode(i)})}function ye(e){return e.replace(/[\u3041-\u3096]/g,function(t){const i=t.charCodeAt(0)+96;return String.fromCharCode(i)})}function W(e){if(!e)return{original:"",hiragana:"",katakana:"",halfWidth:""};const t=pe(e),i=ye(e),n=oe(e);return{original:e,hiragana:t,katakana:i,halfWidth:n}}window.searchPlayer=function(){const e=document.getElementById("player-search"),t=document.getElementById("clear-search-btn"),i=document.getElementById("search-result-count"),n=document.getElementById("player-select"),o=e.value.trim();if(console.log("🔍 検索クエリ:",o),console.log("🔍 選手データ数:",v.length),v.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),v.slice(0,3).forEach(l=>{console.log(`  - ${l.zekken}番: ${l.name} (${l.club||"所属なし"})`)})),t.style.display=o?"block":"none",!o){n.innerHTML='<option value="">選手を選択してください</option>',v.forEach(l=>{const a=document.createElement("option");a.value=l.zekken,a.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,n.appendChild(a)}),i.textContent="";return}const r=W(o);console.log("🔧 正規化された検索クエリ:",{元:r.original,ひらがな:r.hiragana,カタカナ:r.katakana,半角:r.halfWidth});const s=v.filter(l=>{if(l.zekken.toString()===o||l.zekken.toString()===r.halfWidth)return console.log("✅ ゼッケン一致:",l.zekken),!0;if(l.reading){const a=W(l.reading);if(l.reading.includes(o))return console.log("✅ 読み仮名一致（完全）:",l.reading,"検索:",o),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",l.reading,"検索:",o),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",l.reading,"検索:",o),!0}if(l.name){const a=W(l.name);if(l.name.includes(o))return console.log("✅ 名前一致（完全）:",l.name,"検索:",o),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",l.name,"検索:",o),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",l.name,"検索:",o),!0;if(a.halfWidth.includes(r.halfWidth)&&r.halfWidth!=="")return console.log("✅ 名前一致（半角）:",l.name,"検索:",o),!0;const m=l.name.toLowerCase(),y=o.toLowerCase();if(m.includes(y))return console.log("✅ 名前一致（英語）:",l.name,"検索:",o),!0}if(l.club){const a=W(l.club);if(l.club.includes(o))return console.log("✅ 所属一致（完全）:",l.club,"検索:",o),!0;if(a.hiragana.includes(r.hiragana)&&r.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",l.club,"検索:",o),!0;if(a.katakana.includes(r.katakana)&&r.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",l.club,"検索:",o),!0;if(a.halfWidth.includes(r.halfWidth)&&r.halfWidth!=="")return console.log("✅ 所属一致（半角）:",l.club,"検索:",o),!0;const m=l.club.toLowerCase(),y=o.toLowerCase();if(m.includes(y))return console.log("✅ 所属一致（英語）:",l.club,"検索:",o),!0}return!1});console.log("🔍 検索結果:",s.length,"件"),n.innerHTML='<option value="">選手を選択してください</option>',s.length===0?(i.textContent="該当する選手が見つかりません",i.style.color="#ff6b6b"):(s.forEach(l=>{const a=document.createElement("option");a.value=l.zekken,a.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,n.appendChild(a)}),i.textContent=`${s.length}件の選手が見つかりました`,i.style.color="#51cf66",s.length===1&&(n.value=s[0].zekken))};window.clearSearch=function(){const e=document.getElementById("player-search"),t=document.getElementById("clear-search-btn"),i=document.getElementById("search-result-count"),n=document.getElementById("player-select");e.value="",t.style.display="none",i.textContent="",n.innerHTML='<option value="">選手を選択してください</option>',v.forEach(o=>{const r=document.createElement("option");r.value=o.zekken,r.textContent=`${o.zekken}番: ${o.name}${o.club?` (${o.club})`:""}`,n.appendChild(r)})};window.switchInputMode=function(e){const t=document.getElementById("zekken-input-mode"),i=document.getElementById("search-input-mode"),n=document.getElementById("tab-zekken"),o=document.getElementById("tab-search"),r=getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim(),s=getComputedStyle(document.documentElement).getPropertyValue("--secondary-color").trim(),l=getComputedStyle(document.documentElement).getPropertyValue("--heading-color").trim();e==="zekken"?(t.style.display="block",i.style.display="none",n.style.background=`linear-gradient(135deg, ${r} 0%, ${s} 100%)`,n.style.color=l,n.style.border="none",n.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",o.style.background="rgba(255, 255, 255, 0.1)",o.style.color="rgba(255, 255, 255, 0.6)",o.style.border="2px solid rgba(255, 255, 255, 0.2)",o.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(t.style.display="none",i.style.display="block",o.style.background=`linear-gradient(135deg, ${r} 0%, ${s} 100%)`,o.style.color=l,o.style.border="none",o.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",n.style.background="rgba(255, 255, 255, 0.1)",n.style.color="rgba(255, 255, 255, 0.6)",n.style.border="2px solid rgba(255, 255, 255, 0.2)",n.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const e=document.getElementById("zekken-input"),t=document.getElementById("player-info-display"),i=document.getElementById("player-name-display"),n=document.getElementById("player-club-display"),o=document.getElementById("player-error-display"),r=parseInt(e.value);if(!r||isNaN(r)){t.style.display="none",o.style.display="none";return}const s=v.find(l=>l.zekken===r);s?(t.style.display="block",o.style.display="none",i.textContent=`${s.zekken}番: ${s.name}`,n.textContent=s.club?`所属: ${s.club}`:"所属なし",console.log("✅ 選手が見つかりました:",s)):(t.style.display="none",o.style.display="block",console.log("❌ 選手が見つかりません:",r))};window.registerCatch=async function(){if(k===0){d("ログインが必要です",!0);return}const e=document.getElementById("zekken-input-mode").style.display!=="none";let t;e?t=parseInt(document.getElementById("zekken-input").value):t=parseInt(document.getElementById("player-select").value);const i=parseFloat(document.getElementById("length-input").value),n=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:t,length:i,weight:n,mode:e?"ゼッケン":"検索"}),!t){d("選手を選択してください",!0);return}if(!i||i<=0){d("長寸を入力してください",!0);return}const o=v.find(l=>l.zekken==t);if(!o){d("選手が見つかりません",!0);return}const r=o.name,{error:s}=await b.from("catches").insert({tournament_id:h,zekken:t,length:i,weight:n});if(s){console.error("❌ 登録エラー:",s),d("登録に失敗しました",!0);return}console.log("✅ 登録成功"),d(`✅ ${r}: ${i}cm ${n>0?n+"g":""} を登録しました！`),e?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await D(),await C()};async function D(){console.log("📋 履歴読み込み開始"),console.log("👥 ALL_PLAYERS:",v);const e={};v.forEach(o=>{e[o.zekken]=o.name}),console.log("🗺️ playerMap:",e);const{data:t,error:i}=await b.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1}).limit(50);if(i){console.error("❌ 履歴読み込みエラー:",i);return}V=t||[],console.log("✅ 履歴読み込み完了:",V.length,"件");const n=document.getElementById("history-list");if(V.length===0){n.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}n.innerHTML=V.map(o=>{const r=e[o.zekken]||"未登録",s=new Date(o.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
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
                        <span style="font-size: 16px; color: var(--heading-color);">${r}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #51cf66; font-weight: bold; font-size: 16px;">📏 ${o.length}cm</span>
                        ${o.weight>0?`<span style="color: #ffd93d; font-weight: bold; font-size: 16px;">⚖️ ${o.weight}g</span>`:""}
                    </div>
                    <div style="font-size: 12px; color: var(--heading-color); opacity: 0.7; margin-top: 5px;">🕐 ${s}</div>
                </div>
                ${k===2?`
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="editCatch(${o.id}, ${o.zekken}, ${o.length}, ${o.weight})" style="padding: 8px 15px; font-size: 14px;">✏️ 編集</button>
                    <button class="btn btn-danger" onclick="deleteCatch(${o.id})" style="padding: 8px 15px; font-size: 14px;">🗑️ 削除</button>
                </div>
                `:""}
            </div>
        `}).join("")}window.editCatch=async function(e,t,i,n){if(k!==2){d("管理者権限が必要です",!0);return}const o=v.find(s=>s.zekken===t),r=o?o.name:`${t}番`;fe(e,t,r,i,n)};function fe(e,t,i,n,o){const r=`
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
                    <div style="font-size: 20px; font-weight: bold; color: white;">${t}番: ${i}</div>
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
    `;document.body.insertAdjacentHTML("beforeend",r);const s=document.getElementById("edit-catch-dialog"),l=document.getElementById("edit-length-input"),a=document.getElementById("edit-weight-input"),m=document.getElementById("edit-catch-cancel-btn"),y=document.getElementById("edit-catch-save-btn");m.onclick=()=>{s.remove()},y.onclick=async()=>{const p=parseFloat(l.value),f=parseFloat(a.value)||0;if(!p||p<=0){d("長寸を入力してください",!0);return}s.remove();const{error:c}=await b.from("catches").update({length:p,weight:f}).eq("id",e);if(c){console.error("❌ 更新エラー:",c),d("❌ 更新に失敗しました",!0);return}d(`✅ ${i}の釣果を更新しました`),await D(),await C()},l.addEventListener("keypress",p=>{p.key==="Enter"&&y.click()}),a.addEventListener("keypress",p=>{p.key==="Enter"&&y.click()}),s.addEventListener("click",p=>{p.target===s&&s.remove()}),l.focus(),l.select()}window.deleteCatch=async function(e){if(k!==2){d("管理者権限が必要です",!0);return}if(!confirm(`この記録を削除しますか？
削除すると順位表も更新されます。`))return;const{error:t}=await b.from("catches").delete().eq("id",e);if(t){console.error("❌ 削除エラー:",t),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await D(),await C()};async function C(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",g),console.log("📊 リミット匹数:",g.limit_count),console.log("🎯 大会ルール:",g.rule_type);const e=g.hide_ranking===!0;if(console.log("🔒 順位非表示設定:",e,"(CONFIG.hide_ranking:",g.hide_ranking,")"),e&&k<2){console.log("🚫 順位は非表示に設定されています（管理者以外）"),document.getElementById("ranking-list").style.display="none",document.getElementById("ranking-hidden-message").style.display="block",document.getElementById("show-more-btn").style.display="none",document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">順位発表までお待ちください</div>';return}document.getElementById("ranking-list").style.display="block",document.getElementById("ranking-hidden-message").style.display="none";const{data:t,error:i}=await b.from("catches").select("*").eq("tournament_id",h);if(i){console.error("❌ ランキング読み込みエラー:",i);return}const n=t||[];if(console.log("📊 釣果データ:",n.length,"件"),n.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const o={};v.forEach(c=>{o[c.zekken]=c});const r={};n.forEach(c=>{r[c.zekken]||(r[c.zekken]={zekken:c.zekken,lengths:[],weights:[],min_len:c.length,max_len:c.length,min_weight:c.weight||0,max_weight:c.weight||0}),r[c.zekken].lengths.push(c.length),r[c.zekken].weights.push(c.weight||0),r[c.zekken].min_len=Math.min(r[c.zekken].min_len,c.length),r[c.zekken].max_len=Math.max(r[c.zekken].max_len,c.length),r[c.zekken].min_weight=Math.min(r[c.zekken].min_weight,c.weight||0),r[c.zekken].max_weight=Math.max(r[c.zekken].max_weight,c.weight||0)});const s=Object.values(r).map(c=>{const u=[...c.lengths].sort(($,_)=>_-$),x=[...c.weights].sort(($,_)=>_-$),w=g.limit_count||999;console.log(`📊 選手${c.zekken}番の計算:`,{全釣果数:c.lengths.length,リミット匹数:w,全長寸:u,リミット長寸:u.slice(0,w)});const z=x.slice(0,w).reduce(($,_)=>$+_,0),L=u.slice(0,w).reduce(($,_)=>$+_,0);return{zekken:c.zekken,count:c.lengths.length,max_len:c.max_len,min_len:c.min_len,max_weight:c.max_weight,min_weight:c.min_weight,one_max_len:c.max_len,one_max_weight:c.max_weight,total_weight:c.weights.reduce(($,_)=>$+_,0),total_count:c.lengths.length,limit_weight:z,limit_total_len:L}}),l=g.rule_type||"max_len",a=g.sort1||null,m=g.sort2||null,y=g.sort3||null;s.sort((c,u)=>c[l]!==u[l]?u[l]-c[l]:a&&c[a]!==u[a]?u[a]-c[a]:m&&c[m]!==u[m]?u[m]-c[m]:y&&c[y]!==u[y]?u[y]-c[y]:0),J=s,console.log("✅ ランキング計算完了:",s.length,"人");const p=document.getElementById("show-biggest-fish")?.checked??!0;p?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),he(s,o)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const f=document.getElementById("show-smallest-fish")?.checked??!0;f?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),be(s,o)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!p&&!f&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),re(s,o)}function he(e,t){const i=document.getElementById("biggest-fish-list").closest(".card");i.style.display="block";const n=[...e].sort((l,a)=>a.max_len===l.max_len?a.max_weight-l.max_weight:a.max_len-l.max_len),o=new Set,r=[];for(const l of n)if(!o.has(l.zekken)&&(r.push(l),o.add(l.zekken),r.length===3))break;const s=document.getElementById("biggest-fish-list");s.innerHTML=r.map((l,a)=>{const m=t[l.zekken]||{},y=m.name||"未登録",p=m.club||"";let f,c,u,x;return a===0?(f="linear-gradient(135deg, #FFD700, #FFA500)",c="#FFD700",u="#000",x="🥇"):a===1?(f="linear-gradient(135deg, #C0C0C0, #A8A8A8)",c="#C0C0C0",u="#000",x="🥈"):(f="linear-gradient(135deg, #CD7F32, #B87333)",c="#CD7F32",u="#FFF",x="🥉"),`
            <div class="ranking-item" style="
                padding: 12px;
                margin-bottom: 10px;
                background: ${f};
                border: 3px solid ${c};
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <div class="ranking-header">
                    <div style="font-size: 20px; font-weight: bold; color: ${u};">
                        ${x} ${a+1}位
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${u};">${l.zekken}番: ${y}</div>
                        ${p?`<div style="font-size: 12px; opacity: 0.8; color: ${u};">${p}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${u}; opacity: 0.9;">最大長寸</div>
                        <div class="stat-value" style="color: ${u}; font-size: 20px; font-weight: bold;">${l.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function be(e,t){const i=document.getElementById("smallest-fish-list").closest(".card");i.style.display="block";const n=[...e].sort((l,a)=>l.min_len===a.min_len?l.min_weight-a.min_weight:l.min_len-a.min_len),o=new Set,r=[];for(const l of n)if(!o.has(l.zekken)&&(r.push(l),o.add(l.zekken),r.length===3))break;const s=document.getElementById("smallest-fish-list");s.innerHTML=r.map((l,a)=>{const m=t[l.zekken]||{},y=m.name||"未登録",p=m.club||"";let f,c,u,x;return a===0?(f="linear-gradient(135deg, #FFD700, #FFA500)",c="#FFD700",u="#000",x="🥇"):a===1?(f="linear-gradient(135deg, #C0C0C0, #A8A8A8)",c="#C0C0C0",u="#000",x="🥈"):(f="linear-gradient(135deg, #CD7F32, #B87333)",c="#CD7F32",u="#FFF",x="🥉"),`
            <div class="ranking-item" style="
                padding: 12px;
                margin-bottom: 10px;
                background: ${f};
                border: 3px solid ${c};
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <div class="ranking-header">
                    <div style="font-size: 20px; font-weight: bold; color: ${u};">
                        ${x} ${a+1}位
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${u};">${l.zekken}番: ${y}</div>
                        ${p?`<div style="font-size: 12px; opacity: 0.8; color: ${u};">${p}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 12px; color: ${u}; opacity: 0.9;">最小長寸</div>
                        <div class="stat-value" style="color: ${u}; font-size: 20px; font-weight: bold;">${l.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function ie(){const t=getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim().replace("#",""),i=parseInt(t.substr(0,2),16),n=parseInt(t.substr(2,2),16),o=parseInt(t.substr(4,2),16);return(i*299+n*587+o*114)/1e3>180}function re(e,t){const i=g.rule_type||"max_len",n=g.sort1||null,o=g.sort2||null,r=g.limit_count||0,s=ie(),l=s?"#1a1a1a":"white",a=s?"0.7":"0.9",m=Math.min(Q,e.length),y=e.slice(0,m),p=document.getElementById("ranking-list");p.innerHTML=y.map((c,u)=>{const x=u<3,w=t[c.zekken]||{},z=w.name||"未登録",L=w.club||"";let $="",_="transparent",P="2px",M="0 4px 8px rgba(0,0,0,0.2)";u===0?($="🏆",_="#FFD700",P="4px",M="0 6px 16px rgba(255, 215, 0, 0.4)"):u===1?($="🥈",_="#C0C0C0",P="4px",M="0 6px 16px rgba(192, 192, 192, 0.4)"):u===2&&($="🥉",_="#CD7F32",P="4px",M="0 6px 16px rgba(205, 127, 50, 0.4)");let N=Y[i];(i==="limit_total_len"||i==="limit_weight")&&r>0&&(N+=` (${r}匹)`);const I=U(i,c[i]),E=n?U(n,c[n]):null,B=o?U(o,c[o]):null;return`
            <div class="ranking-item ${x?"top3":""}" onclick="showPlayerDetail(${c.zekken})" style="cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 12px; padding: 15px; margin-bottom: 12px; box-shadow: ${M}; border: ${P} solid ${_};">
                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        ${$?`<span style="font-size: 36px; line-height: 1;">${$}</span>`:""}
                        <span style="font-size: 32px; font-weight: bold; color: ${l}; white-space: nowrap;">${u+1}位</span>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 20px; font-weight: bold; color: ${l}; margin-bottom: 4px;">${c.zekken}番: ${z}</div>
                        ${L?`<div style="font-size: 14px; opacity: ${a}; color: ${l};">${L}</div>`:""}
                    </div>
                    <div style="font-size: 12px; opacity: ${a}; color: ${l}; white-space: nowrap; flex-shrink: 0;">
                        👆 タップで<br>詳細
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="color: ${l};">${N}</div>
                        <div class="stat-value" style="color: ${s?"#D4AF37":"#FFD700"};">${I}</div>
                    </div>
                    ${E?`
                    <div class="stat">
                        <div class="stat-label" style="color: ${l};">${Y[n]}</div>
                        <div class="stat-value" style="color: ${s?"#2E7D32":"#4CAF50"};">${E}</div>
                    </div>
                    `:""}
                    ${B?`
                    <div class="stat">
                        <div class="stat-label" style="color: ${l};">${Y[o]}</div>
                        <div class="stat-value" style="color: ${s?"#1565C0":"#2196F3"};">${B}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const f=document.getElementById("show-more-btn");e.length>Q?f.style.display="block":f.style.display="none"}window.showMoreRankings=function(){Q+=10;const e={};v.forEach(t=>{e[t.zekken]=t}),re(J,e),d("10件追加表示しました")};function U(e,t){return e.includes("len")?`${t.toFixed(1)}cm`:e.includes("weight")?`${Math.round(t)}g`:e==="total_count"?`${t}枚`:t}async function q(){const{data:e,error:t}=await b.from("players").select("*").eq("tournament_id",h).order("zekken");if(t){console.error("選手リスト読み込みエラー:",t);return}const i=e||[],n=document.getElementById("player-list");if(i.length===0){n.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}n.innerHTML=i.map(o=>`
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
    `).join("")}window.editPlayer=async function(e){const t=v.find(i=>i.zekken===e);if(!t){d("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",t),xe(t,async i=>{if(!i)return;console.log("📝 更新データ:",i),console.log("📝 更新条件:",{tournament_id:h,zekken:e});const{data:n,error:o}=await b.from("players").update({name:i.name,club:i.club,reading:i.reading}).eq("tournament_id",h).eq("zekken",e).select();if(o){console.error("❌ 選手編集エラー:",o),console.error("❌ エラー詳細:",JSON.stringify(o,null,2)),d(`❌ 編集に失敗しました: ${o.message||o.code||"不明なエラー"}`,!0);return}if(!n||n.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",n),d("✅ 選手情報を更新しました"),await S(),await q(),console.log("✅ 再読み込み後のALL_PLAYERS:",v.find(r=>r.zekken===e))})};function xe(e,t){const i=`
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
                    📝 ${e.zekken}番 選手編集
                </h2>
                
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">名前 <span style="color: #ff6b6b;">*</span></label>
                        <input type="text" id="edit-name-input" value="${e.name}" style="
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
                        <input type="text" id="edit-reading-input" value="${e.reading||""}" placeholder="例: やまだたろう" style="
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
                        <input type="text" id="edit-club-input" value="${e.club||""}" placeholder="例: Aチーム" style="
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
    `;document.body.insertAdjacentHTML("beforeend",i);const n=document.getElementById("edit-player-dialog"),o=document.getElementById("edit-name-input"),r=document.getElementById("edit-reading-input"),s=document.getElementById("edit-club-input"),l=document.getElementById("edit-cancel-btn"),a=document.getElementById("edit-ok-btn");l.onclick=()=>{n.remove(),t(null)},a.onclick=()=>{const m=o.value.trim(),y=r.value.trim(),p=s.value.trim();if(!m){d("名前は必須です",!0);return}n.remove(),t({name:m,reading:y,club:p})},o.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),r.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),s.addEventListener("keypress",m=>{m.key==="Enter"&&a.click()}),n.addEventListener("click",m=>{m.target===n&&(n.remove(),t(null))}),o.focus(),o.select()}window.addPlayer=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const e=parseInt(document.getElementById("new-zekken").value),t=document.getElementById("new-name").value.trim(),i=document.getElementById("new-club").value.trim(),n=document.getElementById("new-reading").value.trim();if(!e||!t){d("ゼッケン番号と名前は必須です",!0);return}if(v.some(s=>s.zekken===e)){d(`${e}番は既に登録されています`,!0);return}const{error:r}=await b.from("players").insert({tournament_id:h,zekken:e,name:t,club:i||"",reading:n||""});if(r){console.error("選手追加エラー:",r),d("追加に失敗しました（重複の可能性）",!0);return}d("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await S(),await q()};let A=[];window.handleCSVFile=function(e){const t=e.target.files[0];if(!t)return;console.log("📂 CSVファイル選択:",t.name);const i=new FileReader;i.onload=function(n){const o=n.target.result;we(o)},i.readAsText(t,"UTF-8")};function we(e){try{console.log("📊 CSVパース開始");const t=e.split(/\r?\n/).filter(a=>a.trim());if(t.length<2){d("❌ CSVファイルが空です",!0);return}const n=t[0].split(",").map(a=>a.trim());console.log("📋 ヘッダー:",n);const r=["ゼッケン番号","名前"].filter(a=>!n.includes(a));if(r.length>0){d(`❌ 必須列が不足: ${r.join(", ")}`,!0);return}const s=[],l=[];for(let a=1;a<t.length;a++){const y=t[a].split(",").map(w=>w.trim());if(y.length!==n.length){l.push(`${a+1}行目: 列数が一致しません`);continue}const p={};n.forEach((w,z)=>{p[w]=y[z]});const f=parseInt(p.ゼッケン番号),c=p.名前;if(!f||isNaN(f)||f<=0){l.push(`${a+1}行目: ゼッケン番号が不正です (${p.ゼッケン番号})`);continue}if(!c||c.trim()===""){l.push(`${a+1}行目: 名前が空です`);continue}if(s.some(w=>w.zekken===f)){l.push(`${a+1}行目: ゼッケン番号 ${f} が重複しています`);continue}const x=v.find(w=>w.zekken===f);if(x){l.push(`${a+1}行目: ゼッケン番号 ${f} は既に登録されています (${x.name})`);continue}s.push({zekken:f,name:c,reading:p.読み仮名||"",club:p.所属||""})}if(console.log("✅ パース完了:",s.length,"件"),console.log("❌ エラー:",l.length,"件"),l.length>0){console.error("エラー詳細:",l),d(`⚠️ ${l.length}件のエラーがあります`,!0);const a=l.slice(0,5).join(`
`);alert(`CSVインポートエラー:

${a}${l.length>5?`

...他${l.length-5}件`:""}`)}if(s.length===0){d("❌ インポート可能なデータがありません",!0);return}A=s,ke(s,l)}catch(t){console.error("❌ CSVパースエラー:",t),d("❌ CSVファイルの読み込みに失敗しました",!0)}}function ke(e,t){const i=document.getElementById("csv-preview"),n=document.getElementById("csv-preview-content");let o=`
        <div style="margin-bottom: 15px;">
            <strong style="color: #51cf66;">✅ インポート可能: ${e.length}件</strong>
            ${t.length>0?`<br><strong style="color: #ff6b6b;">❌ エラー: ${t.length}件</strong>`:""}
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
    `;e.forEach(r=>{o+=`
            <tr>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">${r.zekken}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.name}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.reading||"-"}</td>
                <td style="padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">${r.club||"-"}</td>
            </tr>
        `}),o+=`
            </tbody>
        </table>
    `,n.innerHTML=o,i.style.display="block",console.log("👁️ プレビュー表示")}window.importCSV=async function(){if(A.length===0){d("❌ インポートするデータがありません",!0);return}if(k!==2){d("管理者権限が必要です",!0);return}console.log("🚀 CSVインポート開始:",A.length,"件");try{const e=A.map(n=>({tournament_id:h,zekken:n.zekken,name:n.name,reading:n.reading,club:n.club})),{data:t,error:i}=await b.from("players").insert(e).select();if(i){console.error("❌ インポートエラー:",i),d(`❌ インポートに失敗しました: ${i.message}`,!0);return}console.log("✅ インポート成功:",t.length,"件"),d(`✅ ${t.length}件の選手を登録しました！`),A=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",await S(),await q()}catch(e){console.error("❌ インポート例外:",e),d("❌ インポートに失敗しました",!0)}};window.cancelCSVImport=function(){A=[],document.getElementById("csv-preview").style.display="none",document.getElementById("csv-file-input").value="",d("インポートをキャンセルしました")};window.deletePlayer=async function(e){if(!confirm(`${e}番を削除しますか？`))return;const{error:t}=await b.from("players").delete().eq("tournament_id",h).eq("zekken",e);if(t){console.error("選手削除エラー:",t),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await S(),await q()};const Y={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(e){const t=document.getElementById("zekken-warning"),i=document.getElementById("add-player-btn");if(!e){t.style.display="none",i.disabled=!1;return}const n=parseInt(e);v.some(r=>r.zekken===n)?(t.textContent=`⚠️ ${n}番は既に登録されています`,t.style.color="#ff6b6b",t.style.fontWeight="bold",t.style.display="block",i.disabled=!0):(t.textContent=`✅ ${n}番は利用可能です`,t.style.color="#4CAF50",t.style.fontWeight="normal",t.style.display="block",i.disabled=!1)};window.updateSortOptions=function(){const e=document.getElementById("rule-type").value,t=document.getElementById("sort1").value,i=document.getElementById("sort2").value,n=[e];t&&n.push(t),i&&n.push(i),Z("sort1",n,[e]),Z("sort2",n,[e,t]),Z("sort3",n,[e,t,i])};function Z(e,t,i){const n=document.getElementById(e),o=n.value;n.innerHTML='<option value="">選択しない</option>';const r={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[s,l]of Object.entries(r))if(!i.includes(s)||s===o){const a=document.createElement("option");a.value=s,a.textContent=l,s===o&&(a.selected=!0),n.appendChild(a)}}async function ve(){if(console.log("⚙️ 大会設定読み込み開始"),!g||!g.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=g.rule_type||"limit_total_len",$e(g.limit_count||0);const e=localStorage.getItem(`${h}_show_biggest_fish`),t=localStorage.getItem(`${h}_show_smallest_fish`);g.show_biggest_fish=e===null?!0:e==="true",g.show_smallest_fish=t===null?!0:t==="true",document.getElementById("show-biggest-fish").checked=g.show_biggest_fish,document.getElementById("show-smallest-fish").checked=g.show_smallest_fish,console.log("🏆 特別賞設定:",{show_biggest_fish:g.show_biggest_fish,show_smallest_fish:g.show_smallest_fish}),g.hide_ranking=g.hide_ranking===!0;const i=document.getElementById("hide-ranking");if(i&&(i.checked=g.hide_ranking),k===2){const n=document.getElementById("ranking-hidden-notice");n&&(n.style.display=g.hide_ranking?"block":"none")}console.log("🔒 順位非表示設定:",g.hide_ranking),updateSortOptions(),document.getElementById("sort1").value=g.sort1||"",document.getElementById("sort2").value=g.sort2||"",document.getElementById("sort3").value=g.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",g)}function $e(e){const t=document.getElementById("limit-count-picker"),i=document.getElementById("limit-count"),n=t.querySelectorAll(".limit-option");i.value=e;const o=Array.from(n).find(l=>parseInt(l.dataset.value)===e);o&&(o.scrollIntoView({block:"center",behavior:"auto"}),s());let r;t.addEventListener("scroll",function(){clearTimeout(r),r=setTimeout(()=>{s()},100)}),n.forEach(l=>{l.addEventListener("click",function(){this.scrollIntoView({block:"center",behavior:"smooth"}),setTimeout(()=>s(),300)})});function s(){const l=t.getBoundingClientRect(),a=l.top+l.height/2;let m=null,y=1/0;n.forEach(p=>{const f=p.getBoundingClientRect(),c=f.top+f.height/2,u=Math.abs(a-c);u<y&&(y=u,m=p)}),m&&(n.forEach(p=>p.classList.remove("selected")),m.classList.add("selected"),i.value=m.dataset.value,console.log("📊 リミット匹数変更:",i.value))}}window.updateTournamentSettings=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const e=document.getElementById("rule-type").value,t=parseInt(document.getElementById("limit-count").value)||0,i=document.getElementById("sort1").value,n=document.getElementById("sort2").value,o=document.getElementById("sort3").value,r=document.getElementById("show-biggest-fish").checked,s=document.getElementById("show-smallest-fish").checked,l=document.getElementById("hide-ranking").checked;localStorage.setItem(`${h}_show_biggest_fish`,r),localStorage.setItem(`${h}_show_smallest_fish`,s),console.log("💾 順位非表示設定を保存:",l);const a=[i,n,o].filter(x=>x!==""),m=new Set(a);if(a.length!==m.size){d("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:e,limitCount:t,sort1:i,sort2:n,sort3:o,showBiggestFish:r,showSmallestFish:s,hideRanking:l}),console.log("💾 更新条件:",{id:h}),console.log("💾 更新前のCONFIG.limit_count:",g.limit_count);const{data:y,error:p}=await b.from("tournaments").update({rule_type:e,limit_count:t,sort1:i||null,sort2:n||null,sort3:o||null,hide_ranking:l}).eq("id",h).select();if(console.log("💾 UPDATE結果 - data:",y),console.log("💾 UPDATE結果 - error:",p),p){console.error("❌ 設定保存エラー:",p),console.error("❌ エラー詳細:",JSON.stringify(p,null,2)),console.error("❌ エラーコード:",p.code),console.error("❌ エラーメッセージ:",p.message),alert(`❌ 設定保存エラー: ${p.message}
コード: ${p.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),d(`❌ 設定の保存に失敗しました: ${p.message||p.code||"不明なエラー"}`,!0);return}if(!y||y.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",y);const{data:f,error:c}=await b.from("tournaments").select("*").eq("id",h).single();if(c||!f){console.error("❌ 設定再取得エラー:",c),d("❌ 設定の再取得に失敗しました",!0);return}g=f,g.show_biggest_fish=r,g.show_smallest_fish=s,g.hide_ranking=l,console.log("✅ 再取得後のCONFIG:",g),d("✅ 設定を保存しました");const u=g.limit_count>0?`リミット${g.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=u,await C(),console.log("✅ 設定保存完了")};function d(e,t=!1){const i=document.getElementById("toast");i.textContent=e,i.className="toast"+(t?" error":""),i.style.display="block",setTimeout(()=>{i.style.display="none"},3e3)}let O=null;function Ee(e,t){O=t,document.getElementById("confirm-message").textContent=e;const i=document.getElementById("confirm-dialog");i.style.display="flex"}window.confirmAction=function(){const e=document.getElementById("confirm-dialog");e.style.display="none",O&&(O(),O=null)};window.cancelConfirm=function(){const e=document.getElementById("confirm-dialog");e.style.display="none",O=null};console.log("✅ システム準備完了");function Ie(){const e=document.getElementById("qrcode");e.innerHTML="";const t=window.location.origin+window.location.pathname+"?id="+h;document.getElementById("tournament-url").textContent=t,new QRCode(e,{text:t,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H}),console.log("✅ QRコード生成完了")}window.copyTournamentURL=function(){const e=document.getElementById("tournament-url").textContent;navigator.clipboard.writeText(e).then(()=>{d("✅ URLをコピーしました")}).catch(t=>{console.error("コピーエラー:",t),d("❌ コピーに失敗しました",!0)})};window.toggleTournamentStatus=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const t=!(g.is_ended||!1),i=t?"終了":"再開";if(!confirm(`大会を${i}しますか？
${t?"終了すると釣果の入力ができなくなります。":"再開すると釣果の入力が可能になります。"}`))return;const{error:n}=await b.from("tournaments").update({is_ended:t}).eq("id",h);if(n){console.error("❌ 更新エラー:",n),d(`❌ ${i}に失敗しました`,!0);return}g.is_ended=t,X(),d(`✅ 大会を${i}しました`),le()};function X(){const e=g.is_ended||!1,t=document.getElementById("tournament-status-display"),i=document.getElementById("toggle-tournament-btn");e?(t.innerHTML="🔴 終了",t.style.background="rgba(255, 107, 107, 0.2)",t.style.borderColor="#ff6b6b",t.style.color="#ff6b6b",i.innerHTML="▶️ 大会を再開",i.style.background="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"):(t.innerHTML="🟢 進行中",t.style.background="rgba(81, 207, 102, 0.2)",t.style.borderColor="#51cf66",t.style.color="#51cf66",i.innerHTML="⏸️ 大会を終了",i.style.background="linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)")}function le(){const e=g.is_ended||!1,t=document.getElementById("input-form");e&&k!==2&&(t.style.display="none",d("⚠️ 大会は終了しました",!0))}window.deleteTournament=async function(){if(k!==2){d("管理者権限が必要です",!0);return}const e=prompt(`大会を完全に削除します。
この操作は取り消せません。

削除する場合は、大会ID「`+h+"」を入力してください:");if(e!==h){e!==null&&d("❌ 大会IDが一致しません",!0);return}try{const{error:t}=await b.from("catches").delete().eq("tournament_id",h);if(t)throw t;const{error:i}=await b.from("players").delete().eq("tournament_id",h);if(i)throw i;const{error:n}=await b.from("tournaments").delete().eq("id",h);if(n)throw n;d("✅ 大会を削除しました"),setTimeout(()=>{window.location.href="/"},1500)}catch(t){console.error("❌ 削除エラー:",t),d("❌ 削除に失敗しました",!0)}};window.exportResults=async function(){if(k!==2){d("管理者権限が必要です",!0);return}try{const e=J||[],t=v||[];if(e.length===0){d("❌ エクスポートするデータがありません",!0);return}const{data:i,error:n}=await b.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1});n&&console.error("釣果取得エラー:",n);const o=await se(3),r=await ae(3);let s="";s+=`【大会情報】
`,s+=`大会名,"${g.name||"釣り大会"}"
`,s+=`作成日,${new Date().toLocaleDateString("ja-JP")}
`,s+=`ルール,"${{limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[g.rule_type]||"リミット合計長寸"}"
`,s+=`リミット匹数,${g.limit_count>0?g.limit_count+"匹":"無制限"}
`,s+=`
`,s+=`【順位表】
`,s+=`順位,ゼッケン番号,名前,所属,リミット合計長寸,1匹最大長寸,1匹最大重量,総枚数,総重量
`,e.forEach((u,x)=>{const w=t.find(z=>z.zekken===u.zekken)||{};s+=`${x+1},${u.zekken},"${w.name||"未登録"}","${w.club||""}",${u.limit_total_len||0},${u.one_max_len||0},${u.one_max_weight||0},${u.total_count||0},${u.total_weight||0}
`}),s+=`
`,s+=`【特別賞】
`,console.log("🏆 特別賞チェック - biggestCatches:",o),console.log("🏆 特別賞チェック - smallestCatches:",r),o.length>0?(s+=`大物賞（長寸上位）
`,s+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,o.forEach((u,x)=>{const w=t.find(z=>z.zekken===u.zekken)||{};s+=`${x+1}位,${u.zekken}番,"${w.name||"未登録"}","${w.club||""}",${u.length},${u.weight||0}
`}),s+=`
`,console.log(`✅ 大物賞を${o.length}件追加しました`)):console.log("⚠️ 大物賞データなし"),r.length>0?(s+=`最小寸賞（長寸下位）
`,s+=`順位,ゼッケン番号,名前,所属,長寸(cm),重量(g)
`,r.forEach((u,x)=>{const w=t.find(z=>z.zekken===u.zekken)||{};s+=`${x+1}位,${u.zekken}番,"${w.name||"未登録"}","${w.club||""}",${u.length},${u.weight||0}
`}),s+=`
`,console.log(`✅ 最小寸賞を${r.length}件追加しました`)):console.log("⚠️ 最小寸賞データなし"),s+=`
`,i&&i.length>0&&(s+=`【全釣果データ】
`,s+=`ゼッケン番号,名前,所属,長寸(cm),重量(g),登録日時
`,i.forEach(u=>{const x=t.find(z=>z.zekken===u.zekken)||{},w=new Date(u.created_at).toLocaleString("ja-JP");s+=`${u.zekken},"${x.name||"未登録"}","${x.club||""}",${u.length},${u.weight||0},"${w}"
`}));const a=g.name||"tournament",m=new Date().toISOString().split("T")[0],y=`${a}_完全版_${m}.csv`,p="\uFEFF",f=new Blob([p+s],{type:"text/csv;charset=utf-8;"}),c=document.createElement("a");c.href=URL.createObjectURL(f),c.download=y,c.click(),d("✅ CSVファイルをダウンロードしました")}catch(e){console.error("❌ エクスポートエラー:",e),d("❌ エクスポートに失敗しました",!0)}};document.addEventListener("DOMContentLoaded",function(){["zekken-number-input","length-input","weight-input"].forEach(t=>{const i=document.getElementById(t);i&&i.addEventListener("input",function(n){const o=n.target.value,r=oe(o);o!==r&&(n.target.value=r)})})});window.exportPDF=async function(){try{if(d("📄 PDF生成中..."),typeof window.jspdf>"u"||typeof html2canvas>"u"){d("❌ PDFライブラリが読み込まれていません",!0);return}const{jsPDF:e}=window.jspdf,t=J||[],i=v||[];if(t.length===0){d("❌ まだ釣果データがありません",!0);return}const o={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"総枚数",total_weight:"総重量"}[g.rule_type]||"リミット合計長寸",r=g.limit_count>0?`(リミット${g.limit_count}匹)`:"(無制限)",s=document.createElement("div");s.style.cssText=`
            position: absolute;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
            color: #333;
        `;const l=g.name||"釣り大会",a=new Date().toLocaleDateString("ja-JP");s.innerHTML=`
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #667eea;">${l}</h1>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">作成日: ${a}</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">ルール: ${o} ${r}</p>
            </div>
            
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">順位</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">ゼッケン</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">名前</th>
                            <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.2);">所属</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold;">${o}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${t.map((I,E)=>{const B=i.find(F=>F.zekken===I.zekken)||{},T=U(g.rule_type,I[g.rule_type]);return`
                                <tr style="background: ${E%2===0?"#f9f9f9":"white"};">
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${E+1}位</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${I.zekken}番</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${B.name||"未登録"}</td>
                                    <td style="padding: 10px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${B.club||"-"}</td>
                                    <td style="padding: 10px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">${T}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            </div>
        `;const m=[],y=await se(3);if(console.log("🏆 PDF大物賞データ:",y),y.length>0){let I=`
                <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #667eea; font-size: 16px;">🐟 大物賞（長寸上位）</strong><br>
            `;y.forEach((E,B)=>{const T=i.find(F=>F.zekken===E.zekken)||{};I+=`
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${B===0?"🥇":B===1?"🥈":"🥉"} ${B+1}位: ${T.name||"未登録"} (${E.zekken}番) - 長寸: ${E.length}cm ${E.weight?`/ 重量: ${E.weight}g`:""}
                    </div>
                `}),I+="</div>",m.push(I),console.log(`✅ PDF大物賞を${y.length}件追加しました`)}const p=await ae(3);if(console.log("🏆 PDF最小寸賞データ:",p),p.length>0){let I=`
                <div style="background: rgba(255, 183, 77, 0.1); padding: 15px; border-radius: 8px;">
                    <strong style="color: #ff8c00; font-size: 16px;">🎣 最小寸賞（長寸下位）</strong><br>
            `;p.forEach((E,B)=>{const T=i.find(F=>F.zekken===E.zekken)||{};I+=`
                    <div style="font-size: 14px; margin-top: 8px; padding: 8px; background: white; border-radius: 5px;">
                        ${B===0?"🥇":B===1?"🥈":"🥉"} ${B+1}位: ${T.name||"未登録"} (${E.zekken}番) - 長寸: ${E.length}cm ${E.weight?`/ 重量: ${E.weight}g`:""}
                    </div>
                `}),I+="</div>",m.push(I),console.log(`✅ PDF最小寸賞を${p.length}件追加しました`)}m.length>0?s.innerHTML+=`
                <div style="margin-top: 30px;">
                    <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">🏆 特別賞</h2>
                    ${m.join("")}
                </div>
            `:console.log("⚠️ PDF特別賞データがありません");const{data:f,error:c}=await b.from("catches").select("*").eq("tournament_id",h).order("created_at",{ascending:!1});!c&&f&&f.length>0&&(s.innerHTML+=`
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
                                ${f.map((I,E)=>{const B=i.find(F=>F.zekken===I.zekken)||{},T=E%2===0?"#f9f9f9":"white",j=new Date(I.created_at).toLocaleString("ja-JP",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return`
                                        <tr style="background: ${T};">
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${E+1}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${I.zekken}番</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-weight: bold;">${B.name||"未登録"}</td>
                                            <td style="padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee;">${B.club||"-"}</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #51cf66; font-weight: bold;">${I.length}cm</td>
                                            <td style="padding: 8px; text-align: center; font-size: 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; color: #ffd93d; font-weight: bold;">${I.weight||0}g</td>
                                            <td style="padding: 8px; text-align: center; font-size: 11px; border-bottom: 1px solid #eee; color: #999;">${j}</td>
                                        </tr>
                                    `}).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 10px; text-align: right; font-size: 12px; color: #666;">
                        合計: ${f.length}件の釣果
                    </div>
                </div>
            `),document.body.appendChild(s);const u=await html2canvas(s,{scale:2,backgroundColor:"#ffffff",logging:!1});document.body.removeChild(s);const x=u.toDataURL("image/png"),w=210,z=u.height*w/u.width,L=new e({orientation:(z>297,"portrait"),unit:"mm",format:"a4"});let $=0;const _=297;for(;$<z;)$>0&&L.addPage(),L.addImage(x,"PNG",0,-$,w,z),$+=_;const P=g.name||"tournament",M=new Date().toISOString().split("T")[0],N=`${P}_ranking_${M}.pdf`;L.save(N),d("✅ PDFファイルをダウンロードしました")}catch(e){console.error("❌ PDF生成エラー:",e),d("❌ PDF生成に失敗しました: "+e.message,!0)}};async function se(e=3){const{data:t,error:i}=await b.from("catches").select("*").eq("tournament_id",h).order("length",{ascending:!1}).order("weight",{ascending:!1});if(i||!t||t.length===0)return[];const n=[],o=new Set;for(const r of t)if(!o.has(r.zekken)&&(n.push(r),o.add(r.zekken),n.length>=e))break;return n}async function ae(e=3){const{data:t,error:i}=await b.from("catches").select("*").eq("tournament_id",h).order("length",{ascending:!0}).order("weight",{ascending:!0});if(i||!t||t.length===0)return[];const n=[],o=new Set;for(const r of t)if(!o.has(r.zekken)&&(n.push(r),o.add(r.zekken),n.length>=e))break;return n}window.showMyTournaments=function(){document.getElementById("top-page").style.display="none",document.getElementById("tournament-list-page").style.display="block",ze()};window.backToTop=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block"};async function ze(){const e=JSON.parse(localStorage.getItem("myTournaments")||"[]"),t=document.getElementById("my-tournaments-list");if(e.length===0){t.innerHTML=`
            <div style="text-align: center; padding: 40px; color: #ccc;">
                <p style="font-size: 18px; margin-bottom: 10px;">📭 まだ大会がありません</p>
                <p style="font-size: 14px;">「➕ 新規作成」から大会を作成してください</p>
            </div>
        `;return}const i=[];for(const n of e){const{data:o,error:r}=await b.from("tournaments").select("*").eq("id",n).single();if(!r&&o){const{data:s,error:l}=await b.from("players").select("zekken",{count:"exact"}).eq("tournament_id",n),{data:a,error:m}=await b.from("catches").select("id",{count:"exact"}).eq("tournament_id",n);i.push({...o,playerCount:s?s.length:0,catchCount:a?a.length:0})}}i.sort((n,o)=>new Date(o.created_at)-new Date(n.created_at)),t.innerHTML=i.map(n=>{const r=n.is_ended||!1?'<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🔴 終了</span>':'<span style="background: rgba(81,207,102,0.2); color: #51cf66; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🟢 進行中</span>',s=new Date(n.created_at).toLocaleDateString("ja-JP");return`
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onclick="enterTournamentById('${n.id}')" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <h3 style="font-size: 18px; margin-bottom: 5px;">${n.name}</h3>
                        <p style="font-size: 13px; color: #ccc;">ID: ${n.id}</p>
                    </div>
                    ${r}
                </div>
                <div style="display: flex; gap: 20px; font-size: 14px; color: #ccc;">
                    <span>📅 ${s}</span>
                    <span>👥 ${n.playerCount}名</span>
                    <span>🐟 ${n.catchCount}匹</span>
                </div>
            </div>
        `}).join("")}window.enterTournamentById=function(e){document.getElementById("tournament-id-input").value=e,enterTournament()};window.createNewTournament=function(){document.getElementById("tournament-list-page").style.display="none",document.getElementById("top-page").style.display="block",document.getElementById("new-tournament-id").focus()};function _e(e){const t=JSON.parse(localStorage.getItem("myTournaments")||"[]");t.includes(e)||(t.push(e),localStorage.setItem("myTournaments",JSON.stringify(t)))}window.applyThemePreset=function(e){const t=e.dataset.primary,i=e.dataset.secondary;document.getElementById("primary-color").value=t,document.getElementById("primary-color-text").value=t,document.getElementById("secondary-color").value=i,document.getElementById("secondary-color-text").value=i,document.documentElement.style.setProperty("--primary-color",t),document.documentElement.style.setProperty("--secondary-color",i);const n=t.replace("#",""),o=parseInt(n.substr(0,2),16),r=parseInt(n.substr(2,2),16),s=parseInt(n.substr(4,2),16),a=(o*299+r*587+s*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",a),document.querySelectorAll(".theme-preset").forEach(m=>{m.style.border="2px solid transparent",m.style.transform="scale(1)"}),e.style.border="2px solid white",e.style.transform="scale(1.05)"};function Be(){const e=JSON.parse(localStorage.getItem("customTheme")||"{}");if(e.primaryColor){document.documentElement.style.setProperty("--primary-color",e.primaryColor);const t=document.getElementById("primary-color"),i=document.getElementById("primary-color-text");t&&(t.value=e.primaryColor),i&&(i.value=e.primaryColor);const n=e.primaryColor.replace("#",""),o=parseInt(n.substr(0,2),16),r=parseInt(n.substr(2,2),16),s=parseInt(n.substr(4,2),16),a=(o*299+r*587+s*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",a)}if(e.secondaryColor){document.documentElement.style.setProperty("--secondary-color",e.secondaryColor);const t=document.getElementById("secondary-color"),i=document.getElementById("secondary-color-text");t&&(t.value=e.secondaryColor),i&&(i.value=e.secondaryColor)}Ce()}window.saveTheme=function(){const e=document.getElementById("primary-color").value,t=document.getElementById("secondary-color").value,i={primaryColor:e,secondaryColor:t};localStorage.setItem("customTheme",JSON.stringify(i)),document.documentElement.style.setProperty("--primary-color",e),document.documentElement.style.setProperty("--secondary-color",t);const n=e.replace("#",""),o=parseInt(n.substr(0,2),16),r=parseInt(n.substr(2,2),16),s=parseInt(n.substr(4,2),16),a=(o*299+r*587+s*114)/1e3>180?"#1a1a1a":"#ffffff";document.documentElement.style.setProperty("--heading-color",a),d("✅ テーマを保存しました")};window.resetTheme=function(){confirm("テーマをデフォルトに戻しますか？")&&(localStorage.removeItem("customTheme"),document.documentElement.style.setProperty("--primary-color","#667eea"),document.documentElement.style.setProperty("--secondary-color","#764ba2"),document.getElementById("primary-color").value="#667eea",document.getElementById("primary-color-text").value="#667eea",document.getElementById("secondary-color").value="#764ba2",document.getElementById("secondary-color-text").value="#764ba2",document.querySelectorAll(".theme-preset").forEach(e=>{e.style.border="2px solid transparent",e.style.transform="scale(1)"}),d("✅ テーマをリセットしました"))};let H=null;window.handleLogoUpload=function(e){const t=e.target.files[0];if(!t)return;if(!t.type.startsWith("image/")){d("❌ 画像ファイルを選択してください",!0);return}const i=new FileReader;i.onload=function(n){const o=new Image;o.onload=function(){let l=o.width,a=o.height;l>200&&(a=200/l*a,l=200),a>80&&(l=80/a*l,a=80);const m=document.createElement("canvas");m.width=l,m.height=a,m.getContext("2d").drawImage(o,0,0,l,a),H=m.toDataURL("image/png",.9),document.getElementById("logo-preview").style.display="block",document.getElementById("logo-preview-img").src=H,d("✅ ロゴをプレビューしました（「💾 ロゴを保存」をクリックして保存してください）")},o.src=n.target.result},i.readAsDataURL(t)};window.saveLogo=function(){if(!H&&!localStorage.getItem("customLogo")){d("⚠️ ロゴがアップロードされていません",!0);return}const e=H||localStorage.getItem("customLogo");localStorage.setItem("customLogo",e),H=null,document.querySelectorAll(".logo").forEach(i=>{i.src=e,i.classList.add("visible")}),d("✅ ロゴを保存しました")};window.removeLogo=function(){if(!confirm("ロゴを削除しますか？"))return;localStorage.removeItem("customLogo"),H=null,document.querySelectorAll(".logo").forEach(t=>{t.src="",t.classList.remove("visible")}),document.getElementById("logo-preview").style.display="none",document.getElementById("logo-upload").value="",d("✅ ロゴを削除しました")};function Ce(){const e=localStorage.getItem("customLogo");if(e){document.querySelectorAll(".logo").forEach(o=>{o.src=e,o.classList.add("visible")});const i=document.getElementById("logo-preview"),n=document.getElementById("logo-preview-img");i&&n&&(i.style.display="block",n.src=e)}}document.addEventListener("DOMContentLoaded",function(){const e=document.getElementById("primary-color"),t=document.getElementById("primary-color-text"),i=document.getElementById("secondary-color"),n=document.getElementById("secondary-color-text");e&&t&&(e.addEventListener("input",function(){t.value=this.value}),t.addEventListener("input",function(){e.value=this.value})),i&&n&&(i.addEventListener("input",function(){n.value=this.value}),n.addEventListener("input",function(){i.value=this.value})),Be()});const Le=window.createTournament;window.createTournament=async function(){const e=await Le();if(e!==!1){const t=document.getElementById("new-tournament-id").value.trim();_e(t)}return e};window.toggleRankingVisibility=async function(){if(k!==2){d("管理者権限が必要です",!0),document.getElementById("hide-ranking").checked=!1;return}const e=document.getElementById("hide-ranking").checked;console.log("🔒 順位非表示設定を更新:",e);const{data:t,error:i}=await b.from("tournaments").update({hide_ranking:e}).eq("id",h).select();if(i){console.error("❌ 順位非表示設定の保存エラー:",i),d("❌ 設定の保存に失敗しました",!0);return}g.hide_ranking=e,console.log("✅ CONFIG更新:",g);const n=document.getElementById("ranking-hidden-notice");n&&(n.style.display=e?"block":"none"),e?(d("🔒 順位表を非表示にしました（参加者から見えません）"),console.log("🔒 順位非表示に設定")):(d("🔓 順位表を表示に戻しました"),console.log("🔓 順位表示に設定")),await C()};console.log("✅ 順位表示制御機能を読み込みました");window.testSupabaseConnection=async function(){console.log("🔌 Supabase接続テスト開始..."),console.log("URL:",K);try{const{data:e,error:t}=await b.from("tournaments").select("count").limit(1);return t?(console.error("❌ 接続エラー:",t),alert(`Supabase接続失敗

エラー: ${t.message}
コード: ${t.code}

Supabaseダッシュボードで以下を確認:
1. プロジェクトが一時停止していないか
2. RLSポリシーが設定されているか
3. API Keyが正しいか`),!1):(console.log("✅ Supabase接続成功"),alert(`✅ Supabase接続成功！

データベースに正常に接続できました。`),!0)}catch(e){return console.error("❌ ネットワークエラー:",e),alert(`ネットワークエラー

${e.message}

以下を確認してください:
1. インターネット接続
2. Supabaseプロジェクトの状態
3. ファイアウォール設定`),!1}};console.log("✅ Supabase接続テスト機能を読み込みました");console.log("💡 ヒント: testSupabaseConnection() を実行して接続をテストできます");window.showPlayerDetail=async function(e){console.log("📊 選手詳細表示:",e);const t=v.find(r=>r.zekken===e);if(!t){d("❌ 選手が見つかりません",!0);return}const{data:i,error:n}=await b.from("catches").select("*").eq("tournament_id",h).eq("zekken",e).order("created_at",{ascending:!1});if(n){console.error("❌ 釣果取得エラー:",n),d("❌ 釣果データの取得に失敗しました",!0);return}const o=Se(i);Te(t,i,o)};function Se(e){if(!e||e.length===0)return{totalCount:0,totalWeight:0,totalLength:0,maxLength:0,maxWeight:0,secondMaxLength:0,cumulativeCount:0};const t=e.map(l=>l.length),i=e.map(l=>l.weight||0),n=[...t].sort((l,a)=>a-l),o=[...i].sort((l,a)=>a-l),r=t.reduce((l,a)=>l+a,0),s=i.reduce((l,a)=>l+a,0);return{totalCount:e.length,totalWeight:Math.round(s),totalLength:r.toFixed(1),maxLength:n[0]?n[0].toFixed(1):"0.0",maxWeight:Math.round(o[0]||0),secondMaxLength:n[1]?n[1].toFixed(1):"0.0",cumulativeCount:e.length}}function Te(e,t,i){const n=ie(),o=n?"#1a1a1a":"white",r=n?"rgba(0, 0, 0, 0.1)":"rgba(255, 255, 255, 0.2)",s=n?"rgba(0, 0, 0, 0.2)":"rgba(255, 255, 255, 0.3)",l=n?"#333":"white",a=`
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
                            ${e.zekken}番: ${e.name}
                        </h2>
                        ${e.club?`<div style="margin-top: 5px; font-size: 16px; opacity: 0.9; color: ${o};">${e.club}</div>`:""}
                        ${e.reading?`<div style="margin-top: 3px; font-size: 14px; opacity: 0.7; color: ${o};">(${e.reading})</div>`:""}
                    </div>
                    <button onclick="closePlayerDetail()" style="
                        background: ${r};
                        border: 2px solid ${l};
                        color: ${o};
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 24px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='${s}'" onmouseout="this.style.background='${r}'">
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
                        <div style="font-size: 28px; font-weight: bold; color: ${o};">${i.cumulativeCount}枚</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">総重量</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${o};">${i.totalWeight}g</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">最大長寸</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${n?"#D4AF37":"#FFD700"};">${i.maxLength}cm</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">最大重量</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${n?"#D4AF37":"#FFD700"};">${i.maxWeight}g</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">2番目長寸</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">${i.secondMaxLength}cm</div>
                    </div>
                    <div style="background: ${n?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.15)"}; padding: 15px; border-radius: 12px; border: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};">
                        <div style="font-size: 14px; opacity: 0.8; color: ${o};">累計獲得枚数</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">${i.cumulativeCount}枚</div>
                    </div>
                </div>
                
                <!-- 全釣果リスト -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: ${o}; margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid ${n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"}; padding-bottom: 10px;">
                        📋 全釣果記録 (${t.length}件)
                    </h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${t.length===0?`<div style="text-align: center; padding: 20px; color: ${o}; opacity: 0.7;">まだ釣果がありません</div>`:t.map((m,y)=>{const p=t.length-y;return`
                                <div style="
                                    background: ${n?"rgba(0, 0, 0, 0.05)":"rgba(255, 255, 255, 0.1)"};
                                    padding: 15px;
                                    border-radius: 10px;
                                    margin-bottom: 10px;
                                    border-left: 4px solid ${y===0?n?"#D4AF37":"#FFD700":n?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"};
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-size: 18px; font-weight: bold; color: ${o};">
                                                ${p}匹目
                                                ${y===0?`<span style="color: ${n?"#D4AF37":"#FFD700"};">🏆 最新</span>`:""}
                                            </div>
                                            <div style="font-size: 14px; opacity: 0.7; color: ${o}; margin-top: 3px;">
                                                ${new Date(m.created_at).toLocaleString("ja-JP",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 24px; font-weight: bold; color: ${n?"#2E7D32":"#4CAF50"};">
                                                ${m.length.toFixed(1)}cm
                                            </div>
                                            ${m.weight>0?`
                                                <div style="font-size: 16px; color: ${o}; opacity: 0.9;">
                                                    ${Math.round(m.weight)}g
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
                    background: ${r};
                    border: 2px solid ${l};
                    border-radius: 12px;
                    color: ${o};
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='${s}'" onmouseout="this.style.background='${r}'">
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
    `;document.body.insertAdjacentHTML("beforeend",a)}window.closePlayerDetail=function(e){if(e&&e.target.id!=="player-detail-modal")return;const t=document.getElementById("player-detail-modal");t&&(t.style.animation="fadeOut 0.3s ease",setTimeout(()=>t.remove(),300))};const de=document.createElement("style");de.textContent=`
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;document.head.appendChild(de);console.log("✅ 選手詳細表示機能を読み込みました");
