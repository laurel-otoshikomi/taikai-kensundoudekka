import{createClient as W}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function o(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(e){if(e.ep)return;e.ep=!0;const s=o(e);fetch(e.href,s)}})();const U="https://pkjvdtvomqzcnfhkqven.supabase.co",Y="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranZkdHZvbXF6Y25maGtxdmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU2MjYsImV4cCI6MjA4NjMyMTYyNn0.Wn-igVmMwRbmR9ph5uNC4_HdOdclEccqNQWimRP-C38",k=W(U,Y);let b=0,m={},y=null,p=[],T=[],A=!0,B=null,P=10,H=[];console.log("🎣 システム起動");document.addEventListener("DOMContentLoaded",async function(){const n=new URLSearchParams(window.location.search).get("id");n?await Z(n):q()});function q(){document.getElementById("top-page").style.display="flex",document.getElementById("tournament-page").style.display="none",D()}window.enterTournament=function(){const t=document.getElementById("tournament-id-input").value.trim();if(!t){d("大会IDを入力してください",!0);return}window.location.href=`?id=${t}`};async function D(){const{data:t,error:n}=await k.from("tournaments").select("id, name, created_at").order("created_at",{ascending:!1}).limit(10),o=document.getElementById("tournament-list");if(n){console.error("大会一覧読み込みエラー:",n),o.innerHTML='<div style="color: #e74c3c;">読み込みに失敗しました</div>';return}if(!t||t.length===0){o.innerHTML='<div style="opacity: 0.6;">まだ大会がありません</div>';return}o.innerHTML=t.map(l=>`
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold; font-size: 16px;">${l.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">ID: ${l.id}</div>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='?id=${l.id}'" style="padding: 8px 15px; font-size: 14px;">参加</button>
        </div>
    `).join("")}window.createTournament=async function(){const t=document.getElementById("new-tournament-id").value.trim(),n=document.getElementById("new-tournament-name").value.trim(),o=document.getElementById("new-tournament-admin-password").value.trim(),l=document.getElementById("new-tournament-staff-password").value.trim();if(!t||!n||!o){d("大会ID、大会名、管理者パスワードは必須です",!0);return}if(!/^[a-zA-Z0-9]+$/.test(t)){d("大会IDは半角英数字のみで入力してください",!0);return}console.log("🆕 大会作成:",{id:t,name:n});const{data:e,error:s}=await k.from("tournaments").insert({id:t,name:n,password:o,staff_password:l||null,rule_type:"limit_total_len",limit_count:0,sort1:"one_max_len",sort2:"one_max_weight",sort3:null}).select();if(s){console.error("大会作成エラー:",s),s.code==="23505"?d("この大会IDは既に使用されています",!0):d("大会の作成に失敗しました",!0);return}d("✅ 大会を作成しました！"),document.getElementById("new-tournament-id").value="",document.getElementById("new-tournament-name").value="",document.getElementById("new-tournament-admin-password").value="",document.getElementById("new-tournament-staff-password").value="",await D(),setTimeout(()=>{window.location.href=`?id=${t}`},1500)};async function Z(t){y=t,console.log("📂 大会ID:",y);const{data:n,error:o}=await k.from("tournaments").select("*").eq("id",y).single();if(o||!n){console.error("大会取得エラー:",o),alert("大会が見つかりません"),q();return}m=n,console.log("✅ 大会情報取得:",m),console.log("📋 大会ルール:",m.rule_type),console.log("📊 リミット匹数:",m.limit_count),console.log("🎯 優先順位1:",m.sort1),console.log("🎯 優先順位2:",m.sort2),console.log("🎯 優先順位3:",m.sort3),document.getElementById("tournament-name").textContent=m.name;const l=m.limit_count>0?`リミット${m.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=l,document.getElementById("top-page").style.display="none",document.getElementById("tournament-page").style.display="block",await I(),await E(),V()}function V(){B&&B.unsubscribe(),B=k.channel("tournament-updates").on("postgres_changes",{event:"*",schema:"public",table:"catches",filter:`tournament_id=eq.${y}`},()=>{A&&(console.log("⚡ リアルタイム更新"),E(),b>0&&z())}).subscribe(),console.log("📡 リアルタイム購読開始")}window.toggleRealtimeUpdate=function(){A=document.getElementById("realtime-toggle").checked;const t=document.getElementById("manual-refresh-btn");A?(t.style.display="none",d("✅ リアルタイム更新: ON"),console.log("📡 リアルタイム更新: ON")):(t.style.display="inline-block",d("⏸️ リアルタイム更新: OFF（手動更新モード）"),console.log("⏸️ リアルタイム更新: OFF"))};window.manualRefreshRanking=async function(){d("🔄 更新中..."),await E(),b>0&&await z(),d("✅ 更新しました")};window.switchTab=function(t){document.querySelectorAll(".tab").forEach((o,l)=>{o.classList.remove("active"),(t==="ranking"&&l===0||t==="input"&&l===1||t==="settings"&&l===2)&&o.classList.add("active")}),document.querySelectorAll(".view").forEach(o=>{o.classList.remove("active")}),t==="ranking"?(document.getElementById("ranking-view").classList.add("active"),E()):t==="input"?(document.getElementById("input-view").classList.add("active"),b>0?(document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",I(),z()):(document.getElementById("login-box").style.display="block",document.getElementById("input-form").style.display="none")):t==="settings"&&(document.getElementById("settings-view").classList.add("active"),b===2&&(document.getElementById("rule-settings-card").style.display="block",te()),b>0&&I().then(()=>M()))};window.login=function(){const t=document.getElementById("password-input").value;if(t===m.password)b=2,d("✅ 管理者としてログイン"),R("管理者");else if(t===m.staff_password)b=1,d("✅ 運営スタッフとしてログイン"),R("運営スタッフ");else{d("パスワードが違います",!0);return}console.log("🔐 ログイン成功 AUTH_LEVEL:",b),document.getElementById("login-box").style.display="none",document.getElementById("input-form").style.display="block",I(),z()};window.logout=function(){ne("ログアウトしますか？",()=>{b=0,B&&(B.unsubscribe(),B=null),d("ログアウトしました"),console.log("🔓 ログアウト"),window.location.href="/"})};function R(t){const n=document.getElementById("login-status"),o=document.getElementById("login-status-text");o.textContent=`${t}としてログイン中`,n.style.display="block"}async function I(){console.log("👥 選手データ読み込み開始");const{data:t,error:n}=await k.from("players").select("*").eq("tournament_id",y).order("zekken");if(n){console.error("❌ 選手読み込みエラー:",n);return}p=t||[],console.log("✅ 選手データ読み込み完了:",p.length,"人"),p.length>0&&console.log("📋 選手サンプル:",p[0]);const o=document.getElementById("player-select");o.innerHTML='<option value="">選手を選択してください</option>',p.forEach(l=>{const e=document.createElement("option");e.value=l.zekken,e.textContent=`${l.zekken}番: ${l.name}${l.club?` (${l.club})`:""}`,o.appendChild(e)})}function J(t){return t.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(n){return String.fromCharCode(n.charCodeAt(0)-65248)})}function G(t){return t.replace(/[\u30A1-\u30F6]/g,function(n){const o=n.charCodeAt(0)-96;return String.fromCharCode(o)})}function K(t){return t.replace(/[\u3041-\u3096]/g,function(n){const o=n.charCodeAt(0)+96;return String.fromCharCode(o)})}function S(t){if(!t)return{original:"",hiragana:"",katakana:"",halfWidth:""};const n=G(t),o=K(t),l=J(t);return{original:t,hiragana:n,katakana:o,halfWidth:l}}window.searchPlayer=function(){const t=document.getElementById("player-search"),n=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),l=document.getElementById("player-select"),e=t.value.trim();if(console.log("🔍 検索クエリ:",e),console.log("🔍 選手データ数:",p.length),p.length>0&&(console.log("📋 選手データサンプル（最初の3人）:"),p.slice(0,3).forEach(i=>{console.log(`  - ${i.zekken}番: ${i.name} (${i.club||"所属なし"})`)})),n.style.display=e?"block":"none",!e){l.innerHTML='<option value="">選手を選択してください</option>',p.forEach(i=>{const r=document.createElement("option");r.value=i.zekken,r.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,l.appendChild(r)}),o.textContent="";return}const s=S(e);console.log("🔧 正規化された検索クエリ:",{元:s.original,ひらがな:s.hiragana,カタカナ:s.katakana,半角:s.halfWidth});const c=p.filter(i=>{if(i.zekken.toString()===e||i.zekken.toString()===s.halfWidth)return console.log("✅ ゼッケン一致:",i.zekken),!0;if(i.reading){const r=S(i.reading);if(i.reading.includes(e))return console.log("✅ 読み仮名一致（完全）:",i.reading,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 読み仮名一致（ひらがな）:",i.reading,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 読み仮名一致（カタカナ）:",i.reading,"検索:",e),!0}if(i.name){const r=S(i.name);if(i.name.includes(e))return console.log("✅ 名前一致（完全）:",i.name,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 名前一致（ひらがな）:",i.name,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 名前一致（カタカナ）:",i.name,"検索:",e),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 名前一致（半角）:",i.name,"検索:",e),!0;const u=i.name.toLowerCase(),g=e.toLowerCase();if(u.includes(g))return console.log("✅ 名前一致（英語）:",i.name,"検索:",e),!0}if(i.club){const r=S(i.club);if(i.club.includes(e))return console.log("✅ 所属一致（完全）:",i.club,"検索:",e),!0;if(r.hiragana.includes(s.hiragana)&&s.hiragana!=="")return console.log("✅ 所属一致（ひらがな）:",i.club,"検索:",e),!0;if(r.katakana.includes(s.katakana)&&s.katakana!=="")return console.log("✅ 所属一致（カタカナ）:",i.club,"検索:",e),!0;if(r.halfWidth.includes(s.halfWidth)&&s.halfWidth!=="")return console.log("✅ 所属一致（半角）:",i.club,"検索:",e),!0;const u=i.club.toLowerCase(),g=e.toLowerCase();if(u.includes(g))return console.log("✅ 所属一致（英語）:",i.club,"検索:",e),!0}return!1});console.log("🔍 検索結果:",c.length,"件"),l.innerHTML='<option value="">選手を選択してください</option>',c.length===0?(o.textContent="該当する選手が見つかりません",o.style.color="#ff6b6b"):(c.forEach(i=>{const r=document.createElement("option");r.value=i.zekken,r.textContent=`${i.zekken}番: ${i.name}${i.club?` (${i.club})`:""}`,l.appendChild(r)}),o.textContent=`${c.length}件の選手が見つかりました`,o.style.color="#51cf66",c.length===1&&(l.value=c[0].zekken))};window.clearSearch=function(){const t=document.getElementById("player-search"),n=document.getElementById("clear-search-btn"),o=document.getElementById("search-result-count"),l=document.getElementById("player-select");t.value="",n.style.display="none",o.textContent="",l.innerHTML='<option value="">選手を選択してください</option>',p.forEach(e=>{const s=document.createElement("option");s.value=e.zekken,s.textContent=`${e.zekken}番: ${e.name}${e.club?` (${e.club})`:""}`,l.appendChild(s)})};window.switchInputMode=function(t){const n=document.getElementById("zekken-input-mode"),o=document.getElementById("search-input-mode"),l=document.getElementById("tab-zekken"),e=document.getElementById("tab-search");t==="zekken"?(n.style.display="block",o.style.display="none",l.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",l.style.color="white",l.style.border="none",l.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",e.style.background="rgba(255, 255, 255, 0.1)",e.style.color="rgba(255, 255, 255, 0.6)",e.style.border="2px solid rgba(255, 255, 255, 0.2)",e.style.boxShadow="none",setTimeout(()=>{document.getElementById("zekken-input").focus()},100)):(n.style.display="none",o.style.display="block",e.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",e.style.color="white",e.style.border="none",e.style.boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)",l.style.background="rgba(255, 255, 255, 0.1)",l.style.color="rgba(255, 255, 255, 0.6)",l.style.border="2px solid rgba(255, 255, 255, 0.2)",l.style.boxShadow="none",setTimeout(()=>{document.getElementById("player-search").focus()},100))};window.onZekkenInput=function(){const t=document.getElementById("zekken-input"),n=document.getElementById("player-info-display"),o=document.getElementById("player-name-display"),l=document.getElementById("player-club-display"),e=document.getElementById("player-error-display"),s=parseInt(t.value);if(!s||isNaN(s)){n.style.display="none",e.style.display="none";return}const c=p.find(i=>i.zekken===s);c?(n.style.display="block",e.style.display="none",o.textContent=`${c.zekken}番: ${c.name}`,l.textContent=c.club?`所属: ${c.club}`:"所属なし",console.log("✅ 選手が見つかりました:",c)):(n.style.display="none",e.style.display="block",console.log("❌ 選手が見つかりません:",s))};window.registerCatch=async function(){if(b===0){d("ログインが必要です",!0);return}const t=document.getElementById("zekken-input-mode").style.display!=="none";let n;t?n=parseInt(document.getElementById("zekken-input").value):n=parseInt(document.getElementById("player-select").value);const o=parseFloat(document.getElementById("length-input").value),l=parseFloat(document.getElementById("weight-input").value)||0;if(console.log("📝 登録データ:",{zekken:n,length:o,weight:l,mode:t?"ゼッケン":"検索"}),!n){d("選手を選択してください",!0);return}if(!o||o<=0){d("長寸を入力してください",!0);return}const e=p.find(i=>i.zekken==n);if(!e){d("選手が見つかりません",!0);return}const s=e.name,{error:c}=await k.from("catches").insert({tournament_id:y,zekken:n,length:o,weight:l});if(c){console.error("❌ 登録エラー:",c),d("登録に失敗しました",!0);return}console.log("✅ 登録成功"),d(`✅ ${s}: ${o}cm ${l>0?l+"g":""} を登録しました！`),t?(document.getElementById("zekken-input").value="",document.getElementById("player-info-display").style.display="none",document.getElementById("player-error-display").style.display="none",document.getElementById("zekken-input").focus()):document.getElementById("player-select").value="",document.getElementById("length-input").value="",document.getElementById("weight-input").value="",await z(),await E()};async function z(){console.log("📋 履歴読み込み開始");const t={};p.forEach(e=>{t[e.zekken]=e.name});const{data:n,error:o}=await k.from("catches").select("*").eq("tournament_id",y).order("created_at",{ascending:!1}).limit(50);if(o){console.error("❌ 履歴読み込みエラー:",o);return}T=n||[],console.log("✅ 履歴読み込み完了:",T.length,"件");const l=document.getElementById("history-list");if(T.length===0){l.innerHTML='<div class="empty-state">まだ履歴がありません</div>';return}l.innerHTML=T.map(e=>{const s=t[e.zekken]||"未登録",c=new Date(e.created_at).toLocaleString("ja-JP");return`
            <div class="history-item">
                <div>
                    <strong>${e.zekken}番: ${s}</strong>
                    <span style="margin-left: 15px; color: #4CAF50;">${e.length}cm</span>
                    ${e.weight>0?`<span style="margin-left: 10px; color: #ccc;">${e.weight}g</span>`:""}
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">${c}</div>
                </div>
                ${b===2?`<button class="btn btn-danger" onclick="deleteCatch(${e.id})">削除</button>`:""}
            </div>
        `}).join("")}window.deleteCatch=async function(t){if(!confirm("この記録を削除しますか？"))return;const{error:n}=await k.from("catches").delete().eq("id",t);if(n){console.error("❌ 削除エラー:",n),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await z(),await E()};async function E(){console.log("🏆 ランキング計算開始"),console.log("📋 現在のCONFIG:",m),console.log("📊 リミット匹数:",m.limit_count),console.log("🎯 大会ルール:",m.rule_type);const{data:t,error:n}=await k.from("catches").select("*").eq("tournament_id",y);if(n){console.error("❌ ランキング読み込みエラー:",n);return}const o=t||[];if(console.log("📊 釣果データ:",o.length,"件"),o.length===0){document.getElementById("ranking-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("biggest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>',document.getElementById("smallest-fish-list").innerHTML='<div class="empty-state">まだ釣果がありません</div>';return}const l={};p.forEach(a=>{l[a.zekken]=a});const e={};o.forEach(a=>{e[a.zekken]||(e[a.zekken]={zekken:a.zekken,lengths:[],weights:[],min_len:a.length,max_len:a.length,min_weight:a.weight||0,max_weight:a.weight||0}),e[a.zekken].lengths.push(a.length),e[a.zekken].weights.push(a.weight||0),e[a.zekken].min_len=Math.min(e[a.zekken].min_len,a.length),e[a.zekken].max_len=Math.max(e[a.zekken].max_len,a.length),e[a.zekken].min_weight=Math.min(e[a.zekken].min_weight,a.weight||0),e[a.zekken].max_weight=Math.max(e[a.zekken].max_weight,a.weight||0)});const s=Object.values(e).map(a=>{const f=[...a.lengths].sort((w,v)=>v-w),x=[...a.weights].sort((w,v)=>v-w),_=m.limit_count||999;console.log(`📊 選手${a.zekken}番の計算:`,{全釣果数:a.lengths.length,リミット匹数:_,全長寸:f,リミット長寸:f.slice(0,_)});const C=x.slice(0,_).reduce((w,v)=>w+v,0),L=f.slice(0,_).reduce((w,v)=>w+v,0);return{zekken:a.zekken,count:a.lengths.length,max_len:a.max_len,min_len:a.min_len,max_weight:a.max_weight,min_weight:a.min_weight,one_max_len:a.max_len,one_max_weight:a.max_weight,total_weight:a.weights.reduce((w,v)=>w+v,0),total_count:a.lengths.length,limit_weight:C,limit_total_len:L}}),c=m.rule_type||"max_len",i=m.sort1||null,r=m.sort2||null,u=m.sort3||null;s.sort((a,f)=>a[c]!==f[c]?f[c]-a[c]:i&&a[i]!==f[i]?f[i]-a[i]:r&&a[r]!==f[r]?f[r]-a[r]:u&&a[u]!==f[u]?f[u]-a[u]:0),H=s,console.log("✅ ランキング計算完了:",s.length,"人");const g=document.getElementById("show-biggest-fish")?.checked??!0;g?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),X(s,l)):document.getElementById("biggest-fish-list").closest(".card").style.display="none";const h=document.getElementById("show-smallest-fish")?.checked??!0;h?(document.querySelector(".prize-grid")?.style.setProperty("display","grid"),Q(s,l)):document.getElementById("smallest-fish-list").closest(".card").style.display="none",!g&&!h&&document.querySelector(".prize-grid")?.style.setProperty("display","none"),j(s,l)}function X(t,n){const o=document.getElementById("biggest-fish-list").closest(".card");o.style.display="block";const l=[...t].sort((i,r)=>r.max_len===i.max_len?r.max_weight-i.max_weight:r.max_len-i.max_len),e=new Set,s=[];for(const i of l)if(!e.has(i.zekken)&&(s.push(i),e.add(i.zekken),s.length===3))break;const c=document.getElementById("biggest-fish-list");c.innerHTML=s.map((i,r)=>{const u=n[i.zekken]||{},g=u.name||"未登録",h=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${i.zekken}番: ${g}</div>
                        ${h?`<div style="font-size: 10px; opacity: 0.8;">${h}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最大長寸</div>
                        <div class="stat-value" style="color: #FFD700; font-size: 16px;">${i.max_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function Q(t,n){const o=document.getElementById("smallest-fish-list").closest(".card");o.style.display="block";const l=[...t].sort((i,r)=>i.min_len===r.min_len?i.min_weight-r.min_weight:i.min_len-r.min_len),e=new Set,s=[];for(const i of l)if(!e.has(i.zekken)&&(s.push(i),e.add(i.zekken),s.length===3))break;const c=document.getElementById("smallest-fish-list");c.innerHTML=s.map((i,r)=>{const u=n[i.zekken]||{},g=u.name||"未登録",h=u.club||"";return`
            <div class="ranking-item ${r===0?"top3":""}" style="padding: 8px; margin-bottom: 8px;">
                <div class="ranking-header">
                    <div style="font-size: 16px; font-weight: bold;">${r+1}位</div>
                    <div>
                        <div style="font-size: 14px; font-weight: bold;">${i.zekken}番: ${g}</div>
                        ${h?`<div style="font-size: 10px; opacity: 0.8;">${h}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label" style="font-size: 10px;">最小長寸</div>
                        <div class="stat-value" style="color: #4CAF50; font-size: 16px;">${i.min_len.toFixed(1)}cm</div>
                    </div>
                </div>
            </div>
        `}).join("")}function j(t,n){const o=m.rule_type||"max_len",l=m.sort1||null,e=m.sort2||null,s=Math.min(P,t.length),c=t.slice(0,s),i=document.getElementById("ranking-list");i.innerHTML=c.map((u,g)=>{const h=g<3,a=n[u.zekken]||{},f=a.name||"未登録",x=a.club||"",_=F(o,u[o]),C=l?F(l,u[l]):null,L=e?F(e,u[e]):null;return`
            <div class="ranking-item ${h?"top3":""}">
                <div class="ranking-header">
                    <div style="font-size: 28px; font-weight: bold;">${g+1}位</div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${u.zekken}番: ${f}</div>
                        ${x?`<div style="font-size: 14px; opacity: 0.8;">${x}</div>`:""}
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="stat">
                        <div class="stat-label">${N[o]}</div>
                        <div class="stat-value" style="color: #FFD700;">${_}</div>
                    </div>
                    ${C?`
                    <div class="stat">
                        <div class="stat-label">${N[l]}</div>
                        <div class="stat-value" style="color: #4CAF50;">${C}</div>
                    </div>
                    `:""}
                    ${L?`
                    <div class="stat">
                        <div class="stat-label">${N[e]}</div>
                        <div class="stat-value" style="color: #2196F3;">${L}</div>
                    </div>
                    `:""}
                </div>
            </div>
        `}).join("");const r=document.getElementById("show-more-btn");t.length>P?r.style.display="block":r.style.display="none"}window.showMoreRankings=function(){P+=10;const t={};p.forEach(n=>{t[n.zekken]=n}),j(H,t),d("10件追加表示しました")};function F(t,n){return t.includes("len")?`${n.toFixed(1)}cm`:t.includes("weight")?`${Math.round(n)}g`:t==="total_count"?`${n}枚`:n}async function M(){const{data:t,error:n}=await k.from("players").select("*").eq("tournament_id",y).order("zekken");if(n){console.error("選手リスト読み込みエラー:",n);return}const o=t||[],l=document.getElementById("player-list");if(o.length===0){l.innerHTML='<div class="empty-state">選手が登録されていません</div>';return}l.innerHTML=o.map(e=>`
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
    `).join("")}window.editPlayer=async function(t){const n=p.find(o=>o.zekken===t);if(!n){d("選手が見つかりません",!0);return}console.log("📝 編集前の選手情報:",n),ee(n,async o=>{if(!o)return;console.log("📝 更新データ:",o),console.log("📝 更新条件:",{tournament_id:y,zekken:t});const{data:l,error:e}=await k.from("players").update({name:o.name,club:o.club,reading:o.reading}).eq("tournament_id",y).eq("zekken",t).select();if(e){console.error("❌ 選手編集エラー:",e),console.error("❌ エラー詳細:",JSON.stringify(e,null,2)),d(`❌ 編集に失敗しました: ${e.message||e.code||"不明なエラー"}`,!0);return}if(!l||l.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",l),d("✅ 選手情報を更新しました"),await I(),await M(),console.log("✅ 再読み込み後のALL_PLAYERS:",p.find(s=>s.zekken===t))})};function ee(t,n){const o=`
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
    `;document.body.insertAdjacentHTML("beforeend",o);const l=document.getElementById("edit-player-dialog"),e=document.getElementById("edit-name-input"),s=document.getElementById("edit-reading-input"),c=document.getElementById("edit-club-input"),i=document.getElementById("edit-cancel-btn"),r=document.getElementById("edit-ok-btn");i.onclick=()=>{l.remove(),n(null)},r.onclick=()=>{const u=e.value.trim(),g=s.value.trim(),h=c.value.trim();if(!u){d("名前は必須です",!0);return}l.remove(),n({name:u,reading:g,club:h})},e.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),s.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),c.addEventListener("keypress",u=>{u.key==="Enter"&&r.click()}),l.addEventListener("click",u=>{u.target===l&&(l.remove(),n(null))}),e.focus(),e.select()}window.addPlayer=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const t=parseInt(document.getElementById("new-zekken").value),n=document.getElementById("new-name").value.trim(),o=document.getElementById("new-club").value.trim(),l=document.getElementById("new-reading").value.trim();if(!t||!n){d("ゼッケン番号と名前は必須です",!0);return}if(p.some(c=>c.zekken===t)){d(`${t}番は既に登録されています`,!0);return}const{error:s}=await k.from("players").insert({tournament_id:y,zekken:t,name:n,club:o||"",reading:l||""});if(s){console.error("選手追加エラー:",s),d("追加に失敗しました（重複の可能性）",!0);return}d("✅ 選手を追加しました"),document.getElementById("new-zekken").value="",document.getElementById("new-name").value="",document.getElementById("new-club").value="",document.getElementById("new-reading").value="",document.getElementById("zekken-warning").style.display="none",document.getElementById("add-player-btn").disabled=!1,await I(),await M()};window.deletePlayer=async function(t){if(!confirm(`${t}番を削除しますか？`))return;const{error:n}=await k.from("players").delete().eq("tournament_id",y).eq("zekken",t);if(n){console.error("選手削除エラー:",n),d("❌ 削除に失敗しました",!0);return}d("✅ 削除しました"),await I(),await M()};const N={limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量",one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量"};window.checkZekkenDuplicate=function(t){const n=document.getElementById("zekken-warning"),o=document.getElementById("add-player-btn");if(!t){n.style.display="none",o.disabled=!1;return}const l=parseInt(t);p.some(s=>s.zekken===l)?(n.textContent=`⚠️ ${l}番は既に登録されています`,n.style.color="#ff6b6b",n.style.fontWeight="bold",n.style.display="block",o.disabled=!0):(n.textContent=`✅ ${l}番は利用可能です`,n.style.color="#4CAF50",n.style.fontWeight="normal",n.style.display="block",o.disabled=!1)};window.updateSortOptions=function(){const t=document.getElementById("rule-type").value,n=document.getElementById("sort1").value,o=document.getElementById("sort2").value,l=[t];n&&l.push(n),o&&l.push(o),O("sort1",l,[t]),O("sort2",l,[t,n]),O("sort3",l,[t,n,o])};function O(t,n,o){const l=document.getElementById(t),e=l.value;l.innerHTML='<option value="">選択しない</option>';const s={one_max_len:"1匹最大長寸",one_max_weight:"1匹最大重量",limit_total_len:"リミット合計長寸",limit_weight:"リミット合計重量",total_count:"枚数",total_weight:"総重量"};for(const[c,i]of Object.entries(s))if(!o.includes(c)||c===e){const r=document.createElement("option");r.value=c,r.textContent=i,c===e&&(r.selected=!0),l.appendChild(r)}}async function te(){if(console.log("⚙️ 大会設定読み込み開始"),!m||!m.id){console.error("❌ CONFIG が存在しません");return}document.getElementById("rule-type").value=m.rule_type||"limit_total_len",document.getElementById("limit-count").value=m.limit_count||0;const t=localStorage.getItem(`${y}_show_biggest_fish`),n=localStorage.getItem(`${y}_show_smallest_fish`);document.getElementById("show-biggest-fish").checked=t===null?!0:t==="true",document.getElementById("show-smallest-fish").checked=n===null?!0:n==="true",updateSortOptions(),document.getElementById("sort1").value=m.sort1||"",document.getElementById("sort2").value=m.sort2||"",document.getElementById("sort3").value=m.sort3||"",updateSortOptions(),console.log("✅ 大会設定読み込み完了:",m)}window.updateTournamentSettings=async function(){if(b!==2){d("管理者権限が必要です",!0);return}const t=document.getElementById("rule-type").value,n=parseInt(document.getElementById("limit-count").value)||0,o=document.getElementById("sort1").value,l=document.getElementById("sort2").value,e=document.getElementById("sort3").value,s=document.getElementById("show-biggest-fish").checked,c=document.getElementById("show-smallest-fish").checked;localStorage.setItem(`${y}_show_biggest_fish`,s),localStorage.setItem(`${y}_show_smallest_fish`,c);const i=[o,l,e].filter(x=>x!==""),r=new Set(i);if(i.length!==r.size){d("判定順位で同じ項目が選択されています",!0);return}console.log("💾 設定保存:",{ruleType:t,limitCount:n,sort1:o,sort2:l,sort3:e,showBiggestFish:s,showSmallestFish:c}),console.log("💾 更新条件:",{id:y}),console.log("💾 更新前のCONFIG.limit_count:",m.limit_count);const{data:u,error:g}=await k.from("tournaments").update({rule_type:t,limit_count:n,sort1:o||null,sort2:l||null,sort3:e||null}).eq("id",y).select();if(console.log("💾 UPDATE結果 - data:",u),console.log("💾 UPDATE結果 - error:",g),g){console.error("❌ 設定保存エラー:",g),console.error("❌ エラー詳細:",JSON.stringify(g,null,2)),console.error("❌ エラーコード:",g.code),console.error("❌ エラーメッセージ:",g.message),alert(`❌ 設定保存エラー: ${g.message}
コード: ${g.code}

⚠️ Supabase RLS UPDATE権限が設定されていない可能性があります。
CRITICAL_FIX.sqlを実行してください。`),d(`❌ 設定の保存に失敗しました: ${g.message||g.code||"不明なエラー"}`,!0);return}if(!u||u.length===0){console.error("❌ 更新対象が見つかりませんでした"),d("❌ 更新対象が見つかりませんでした",!0);return}console.log("✅ 更新後のデータ:",u);const{data:h,error:a}=await k.from("tournaments").select("*").eq("id",y).single();if(a||!h){console.error("❌ 設定再取得エラー:",a),d("❌ 設定の再取得に失敗しました",!0);return}m=h,console.log("✅ 再取得後のCONFIG:",m),d("✅ 設定を保存しました");const f=m.limit_count>0?`リミット${m.limit_count}匹`:"総力戦";document.getElementById("tournament-info").textContent=f,await E(),console.log("✅ 設定保存完了")};function d(t,n=!1){const o=document.getElementById("toast");o.textContent=t,o.className="toast"+(n?" error":""),o.style.display="block",setTimeout(()=>{o.style.display="none"},3e3)}let $=null;function ne(t,n){$=n,document.getElementById("confirm-message").textContent=t;const o=document.getElementById("confirm-dialog");o.style.display="flex"}window.confirmAction=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",$&&($(),$=null)};window.cancelConfirm=function(){const t=document.getElementById("confirm-dialog");t.style.display="none",$=null};console.log("✅ システム準備完了");
