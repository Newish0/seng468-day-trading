(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function r(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(o){if(o.ep)return;o.ep=!0;const l=r(o);fetch(o.href,l)}})();const ce=!1;var Xt=Array.isArray,Ye=Array.prototype.indexOf,Zt=Array.from,je=Object.defineProperty,Vt=Object.getOwnPropertyDescriptor,Ke=Object.getOwnPropertyDescriptors,Qe=Object.getPrototypeOf;function Xe(t){return t()}function Ut(t){for(var e=0;e<t.length;e++)t[e]()}const L=2,be=4,dt=8,zt=16,q=32,et=64,wt=128,Z=256,xt=512,O=1024,G=2048,rt=4096,$=8192,nt=16384,Ze=32768,Jt=65536,ze=1<<17,Je=1<<19,ye=1<<20,Et=Symbol("$state"),tr=Symbol("legacy props");function we(t){return t===this.v}function er(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function xe(t){return!er(t,this.v)}function rr(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function nr(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function lr(t){throw new Error("https://svelte.dev/e/effect_orphan")}function or(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ar(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function ir(){throw new Error("https://svelte.dev/e/state_unsafe_local_read")}function ur(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let lt=!1,sr=!1;function fr(){lt=!0}const cr=1,vr=2,dr=16,_r=1,hr=2,pr=1,mr=2,gr=Symbol();function kt(t,e){var r={f:0,v:t,reactions:null,equals:we,rv:0,wv:0};return r}function Ee(t,e=!1){var n;const r=kt(t);return e||(r.equals=xe),lt&&x!==null&&x.l!==null&&((n=x.l).s??(n.s=[])).push(r),r}function V(t,e=!1){return br(Ee(t,e))}function br(t){return w!==null&&!B&&w.f&L&&(I===null?Nr([t]):I.push(t)),t}function U(t,e){return w!==null&&!B&&Dt()&&w.f&(L|zt)&&(I===null||!I.includes(t))&&ur(),ke(t,e)}function ke(t,e){return t.equals(e)||(t.v,t.v=e,t.wv=Ve(),Te(t,G),Dt()&&b!==null&&b.f&O&&!(b.f&(q|et))&&(F===null?Lr([t]):F.push(t))),e}function Te(t,e){var r=t.reactions;if(r!==null)for(var n=Dt(),o=r.length,l=0;l<o;l++){var a=r[l],c=a.f;c&G||!n&&a===b||(P(a,e),c&(O|Z)&&(c&L?Te(a,rt):It(a)))}}let yr=!1;var ve,Ae,Se;function wr(){if(ve===void 0){ve=window;var t=Element.prototype,e=Node.prototype;Ae=Vt(e,"firstChild").get,Se=Vt(e,"nextSibling").get,t.__click=void 0,t.__className="",t.__attributes=null,t.__styles=null,t.__e=void 0,Text.prototype.__t=void 0}}function te(t=""){return document.createTextNode(t)}function Tt(t){return Ae.call(t)}function Lt(t){return Se.call(t)}function h(t,e){return Tt(t)}function _t(t,e){{var r=Tt(t);return r instanceof Comment&&r.data===""?Lt(r):r}}function p(t,e=1,r=!1){let n=t;for(;e--;)n=Lt(n);return n}function xr(t){t.textContent=""}function Pt(t){var e=L|G;b===null?e|=Z:b.f|=ye;var r=w!==null&&w.f&L?w:null;const n={children:null,ctx:x,deps:null,equals:we,f:e,fn:t,reactions:null,rv:0,v:null,wv:0,parent:r??b};return r!==null&&(r.children??(r.children=[])).push(n),n}function Oe(t){const e=Pt(t);return e.equals=xe,e}function Ce(t){var e=t.children;if(e!==null){t.children=null;for(var r=0;r<e.length;r+=1){var n=e[r];n.f&L?ee(n):H(n)}}}function Er(t){for(var e=t.parent;e!==null;){if(!(e.f&L))return e;e=e.parent}return null}function Me(t){var e,r=b;R(Er(t));try{Ce(t),e=We(t)}finally{R(r)}return e}function Ne(t){var e=Me(t),r=(X||t.f&Z)&&t.deps!==null?rt:O;P(t,r),t.equals(e)||(t.v=e,t.wv=Ve())}function ee(t){Ce(t),vt(t,0),P(t,nt),t.v=t.children=t.deps=t.ctx=t.reactions=null}function Le(t){b===null&&w===null&&lr(),w!==null&&w.f&Z&&nr(),oe&&rr()}function kr(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function ot(t,e,r,n=!0){var o=(t&et)!==0,l=b,a={ctx:x,deps:null,deriveds:null,nodes_start:null,nodes_end:null,f:t|G,first:null,fn:e,last:null,next:null,parent:o?null:l,prev:null,teardown:null,transitions:null,wv:0};if(r){var c=tt;try{de(!0),ae(a),a.f|=Ze}catch(v){throw H(a),v}finally{de(c)}}else e!==null&&It(a);var i=r&&a.deps===null&&a.first===null&&a.nodes_start===null&&a.teardown===null&&(a.f&(ye|wt))===0;if(!i&&!o&&n&&(l!==null&&kr(a,l),w!==null&&w.f&L)){var u=w;(u.children??(u.children=[])).push(a)}return a}function Tr(t){const e=ot(dt,null,!1);return P(e,O),e.teardown=t,e}function Wt(t){Le();var e=b!==null&&(b.f&q)!==0&&x!==null&&!x.m;if(e){var r=x;(r.e??(r.e=[])).push({fn:t,effect:b,reaction:w})}else{var n=re(t);return n}}function Ar(t){return Le(),Pe(t)}function Sr(t){const e=ot(et,t,!0);return(r={})=>new Promise(n=>{r.outro?At(e,()=>{H(e),n(void 0)}):(H(e),n(void 0))})}function re(t){return ot(be,t,!1)}function Pe(t){return ot(dt,t,!0)}function K(t,e=[],r=Pt){const n=e.map(r);return ne(()=>t(...n.map(m)))}function ne(t,e=0){return ot(dt|zt|e,t,!0)}function ct(t,e=!0){return ot(dt|q,t,!0,e)}function De(t){var e=t.teardown;if(e!==null){const r=oe,n=w;_e(!0),Y(null);try{e.call(null)}finally{_e(r),Y(n)}}}function $e(t){var e=t.deriveds;if(e!==null){t.deriveds=null;for(var r=0;r<e.length;r+=1)ee(e[r])}}function Ie(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){var n=r.next;H(r,e),r=n}}function Or(t){for(var e=t.first;e!==null;){var r=e.next;e.f&q||H(e),e=r}}function H(t,e=!0){var r=!1;if((e||t.f&Je)&&t.nodes_start!==null){for(var n=t.nodes_start,o=t.nodes_end;n!==null;){var l=n===o?null:Lt(n);n.remove(),n=l}r=!0}Ie(t,e&&!r),$e(t),vt(t,0),P(t,nt);var a=t.transitions;if(a!==null)for(const i of a)i.stop();De(t);var c=t.parent;c!==null&&c.first!==null&&Re(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Re(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function At(t,e){var r=[];le(t,r,!0),qe(r,()=>{H(t),e&&e()})}function qe(t,e){var r=t.length;if(r>0){var n=()=>--r||e();for(var o of t)o.out(n)}else e()}function le(t,e,r){if(!(t.f&$)){if(t.f^=$,t.transitions!==null)for(const a of t.transitions)(a.is_global||r)&&e.push(a);for(var n=t.first;n!==null;){var o=n.next,l=(n.f&Jt)!==0||(n.f&q)!==0;le(n,e,l?r:!1),n=o}}}function St(t){Fe(t,!0)}function Fe(t,e){if(t.f&$){t.f^=$,t.f&O||(t.f^=O),ht(t)&&(P(t,G),It(t));for(var r=t.first;r!==null;){var n=r.next,o=(r.f&Jt)!==0||(r.f&q)!==0;Fe(r,o?e:!1),r=n}if(t.transitions!==null)for(const l of t.transitions)(l.is_global||e)&&l.in()}}let Ht=!1,Yt=[];function Cr(){Ht=!1;const t=Yt.slice();Yt=[],Ut(t)}function Be(t){Ht||(Ht=!0,queueMicrotask(Cr)),Yt.push(t)}function Mr(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}let yt=!1,Ot=!1,Ct=null,tt=!1,oe=!1;function de(t){tt=t}function _e(t){oe=t}let jt=[],ft=0;let w=null,B=!1;function Y(t){w=t}let b=null;function R(t){b=t}let I=null;function Nr(t){I=t}let M=null,N=0,F=null;function Lr(t){F=t}let Ge=1,Mt=0,X=!1,x=null;function Ve(){return++Ge}function Dt(){return!lt||x!==null&&x.l===null}function ht(t){var u;var e=t.f;if(e&G)return!0;if(e&rt){var r=t.deps,n=(e&Z)!==0;if(r!==null){var o,l,a=(e&xt)!==0,c=n&&b!==null&&!X,i=r.length;if(a||c){for(o=0;o<i;o++)l=r[o],(a||!((u=l==null?void 0:l.reactions)!=null&&u.includes(t)))&&(l.reactions??(l.reactions=[])).push(t);a&&(t.f^=xt)}for(o=0;o<i;o++)if(l=r[o],ht(l)&&Ne(l),l.wv>t.wv)return!0}(!n||b!==null&&!X)&&P(t,O)}return!1}function Pr(t,e){for(var r=e;r!==null;){if(r.f&wt)try{r.fn(t);return}catch{r.f^=wt}r=r.parent}throw yt=!1,t}function Dr(t){return(t.f&nt)===0&&(t.parent===null||(t.parent.f&wt)===0)}function $t(t,e,r,n){if(yt){if(r===null&&(yt=!1),Dr(e))throw t;return}r!==null&&(yt=!0);{Pr(t,e);return}}function Ue(t,e,r=0){var n=t.reactions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o];l.f&L?Ue(l,e,r+1):e===l&&(r===0?P(l,G):l.f&O&&P(l,rt),It(l))}}function We(t){var d;var e=M,r=N,n=F,o=w,l=X,a=I,c=x,i=B,u=t.f;M=null,N=0,F=null,w=u&(q|et)?null:t,X=!tt&&(u&Z)!==0,I=null,x=t.ctx,B=!1,Mt++;try{var v=(0,t.fn)(),s=t.deps;if(M!==null){var f;if(vt(t,N),s!==null&&N>0)for(s.length=N+M.length,f=0;f<M.length;f++)s[N+f]=M[f];else t.deps=s=M;if(!X)for(f=N;f<s.length;f++)((d=s[f]).reactions??(d.reactions=[])).push(t)}else s!==null&&N<s.length&&(vt(t,N),s.length=N);if(Dt()&&F!==null&&!(t.f&(L|rt|G)))for(f=0;f<F.length;f++)Ue(F[f],t);return o!==null&&Mt++,v}finally{M=e,N=r,F=n,w=o,X=l,I=a,x=c,B=i}}function $r(t,e){let r=e.reactions;if(r!==null){var n=Ye.call(r,t);if(n!==-1){var o=r.length-1;o===0?r=e.reactions=null:(r[n]=r[o],r.pop())}}r===null&&e.f&L&&(M===null||!M.includes(e))&&(P(e,rt),e.f&(Z|xt)||(e.f^=xt),vt(e,0))}function vt(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)$r(t,r[n])}function ae(t){var e=t.f;if(!(e&nt)){P(t,O);var r=b,n=x;b=t;try{e&zt?Or(t):Ie(t),$e(t),De(t);var o=We(t);t.teardown=typeof o=="function"?o:null,t.wv=Ge;var l=t.deps,a;ce&&sr&&t.f&G}catch(c){$t(c,t,r,n||t.ctx)}finally{b=r}}}function Ir(){if(ft>1e3){ft=0;try{or()}catch(t){if(Ct!==null)$t(t,Ct,null);else throw t}}ft++}function Rr(t){var e=t.length;if(e!==0){Ir();var r=tt;tt=!0;try{for(var n=0;n<e;n++){var o=t[n];o.f&O||(o.f^=O);var l=[];He(o,l),qr(l)}}finally{tt=r}}}function qr(t){var e=t.length;if(e!==0)for(var r=0;r<e;r++){var n=t[r];if(!(n.f&(nt|$)))try{ht(n)&&(ae(n),n.deps===null&&n.first===null&&n.nodes_start===null&&(n.teardown===null?Re(n):n.fn=null))}catch(o){$t(o,n,null,n.ctx)}}}function Fr(){if(Ot=!1,ft>1001)return;const t=jt;jt=[],Rr(t),Ot||(ft=0,Ct=null)}function It(t){Ot||(Ot=!0,queueMicrotask(Fr)),Ct=t;for(var e=t;e.parent!==null;){e=e.parent;var r=e.f;if(r&(et|q)){if(!(r&O))return;e.f^=O}}jt.push(e)}function He(t,e){var r=t.first,n=[];t:for(;r!==null;){var o=r.f,l=(o&q)!==0,a=l&&(o&O)!==0,c=r.next;if(!a&&!(o&$))if(o&dt){if(l)r.f^=O;else try{ht(r)&&ae(r)}catch(s){$t(s,r,null,r.ctx)}var i=r.first;if(i!==null){r=i;continue}}else o&be&&n.push(r);if(c===null){let s=r.parent;for(;s!==null;){if(t===s)break t;var u=s.next;if(u!==null){r=u;continue t}s=s.parent}}r=c}for(var v=0;v<n.length;v++)i=n[v],e.push(i),He(i,e)}function m(t){var v;var e=t.f,r=(e&L)!==0;if(r&&e&nt){var n=Me(t);return ee(t),n}if(w!==null&&!B){I!==null&&I.includes(t)&&ir();var o=w.deps;t.rv<Mt&&(t.rv=Mt,M===null&&o!==null&&o[N]===t?N++:M===null?M=[t]:M.push(t))}else if(r&&t.deps===null)for(var l=t,a=l.parent,c=l;a!==null;)if(a.f&L){var i=a;c=i,a=i.parent}else{var u=a;(v=u.deriveds)!=null&&v.includes(c)||(u.deriveds??(u.deriveds=[])).push(c);break}return r&&(l=t,ht(l)&&Ne(l)),t.v}function ie(t){var e=B;try{return B=!0,t()}finally{B=e}}const Br=-7169;function P(t,e){t.f=t.f&Br|e}function at(t,e=!1,r){x={p:x,c:null,e:null,m:!1,s:t,x:null,l:null},lt&&!e&&(x.l={s:null,u:null,r1:[],r2:kt(!1)})}function it(t){const e=x;if(e!==null){const a=e.e;if(a!==null){var r=b,n=w;e.e=null;try{for(var o=0;o<a.length;o++){var l=a[o];R(l.effect),Y(l.reaction),re(l.fn)}}finally{R(r),Y(n)}}x=e.p,e.m=!0}return{}}function Gr(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(Et in t)Kt(t);else if(!Array.isArray(t))for(let e in t){const r=t[e];typeof r=="object"&&r&&Et in r&&Kt(r)}}}function Kt(t,e=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!e.has(t)){e.add(t),t instanceof Date&&t.getTime();for(let n in t)try{Kt(t[n],e)}catch{}const r=Qe(t);if(r!==Object.prototype&&r!==Array.prototype&&r!==Map.prototype&&r!==Set.prototype&&r!==Date.prototype){const n=Ke(r);for(let o in n){const l=n[o].get;if(l)try{l.call(t)}catch{}}}}}const Vr=["touchstart","touchmove"];function Ur(t){return Vr.includes(t)}function Wr(t){var e=w,r=b;Y(null),R(null);try{return t()}finally{Y(e),R(r)}}const Hr=new Set,he=new Set;function Yr(t,e,r,n){function o(l){if(n.capture||st.call(e,l),!l.cancelBubble)return Wr(()=>r.call(this,l))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?Be(()=>{e.addEventListener(t,o,n)}):e.addEventListener(t,o,n),o}function j(t,e,r,n,o){var l={capture:n,passive:o},a=Yr(t,e,r,l);(e===document.body||e===window||e===document)&&Tr(()=>{e.removeEventListener(t,a,l)})}function st(t){var E;var e=this,r=e.ownerDocument,n=t.type,o=((E=t.composedPath)==null?void 0:E.call(t))||[],l=o[0]||t.target,a=0,c=t.__root;if(c){var i=o.indexOf(c);if(i!==-1&&(e===document||e===window)){t.__root=e;return}var u=o.indexOf(e);if(u===-1)return;i<=u&&(a=i)}if(l=o[a]||t.target,l!==e){je(t,"currentTarget",{configurable:!0,get(){return l||r}});var v=w,s=b;Y(null),R(null);try{for(var f,d=[];l!==null;){var _=l.assignedSlot||l.parentNode||l.host||null;try{var g=l["__"+n];if(g!==void 0&&!l.disabled)if(Xt(g)){var[y,...C]=g;y.apply(l,[t,...C])}else g.call(l,t)}catch(A){f?d.push(A):f=A}if(t.cancelBubble||_===e||_===null)break;l=_}if(f){for(let A of d)queueMicrotask(()=>{throw A});throw f}}finally{t.__root=e,delete t.currentTarget,Y(v),R(s)}}}function jr(t){var e=document.createElement("template");return e.innerHTML=t,e.content}function Qt(t,e){var r=b;r.nodes_start===null&&(r.nodes_start=t,r.nodes_end=e)}function S(t,e){var r=(e&pr)!==0,n=(e&mr)!==0,o,l=!t.startsWith("<!>");return()=>{o===void 0&&(o=jr(l?t:"<!>"+t),r||(o=Tt(o)));var a=n?document.importNode(o,!0):o.cloneNode(!0);if(r){var c=Tt(a),i=a.lastChild;Qt(c,i)}else Qt(a,a);return a}}function ue(t=""){{var e=te(t+"");return Qt(e,e),e}}function k(t,e){t!==null&&t.before(e)}function T(t,e){var r=e==null?"":typeof e=="object"?e+"":e;r!==(t.__t??(t.__t=t.nodeValue))&&(t.__t=r,t.nodeValue=r==null?"":r+"")}function Kr(t,e){return Qr(t,e)}const J=new Map;function Qr(t,{target:e,anchor:r,props:n={},events:o,context:l,intro:a=!0}){wr();var c=new Set,i=s=>{for(var f=0;f<s.length;f++){var d=s[f];if(!c.has(d)){c.add(d);var _=Ur(d);e.addEventListener(d,st,{passive:_});var g=J.get(d);g===void 0?(document.addEventListener(d,st,{passive:_}),J.set(d,1)):J.set(d,g+1)}}};i(Zt(Hr)),he.add(i);var u=void 0,v=Sr(()=>{var s=r??e.appendChild(te());return ct(()=>{if(l){at({});var f=x;f.c=l}o&&(n.$$events=o),u=t(s,n)||{},l&&it()}),()=>{var _;for(var f of c){e.removeEventListener(f,st);var d=J.get(f);--d===0?(document.removeEventListener(f,st),J.delete(f)):J.set(f,d)}he.delete(i),s!==r&&((_=s.parentNode)==null||_.removeChild(s))}});return Xr.set(u,v),u}let Xr=new WeakMap;function se(t,e,r=!1){var n=t,o=null,l=null,a=gr,c=r?Jt:0,i=!1;const u=(s,f=!0)=>{i=!0,v(f,s)},v=(s,f)=>{a!==(a=s)&&(a?(o?St(o):f&&(o=ct(()=>f(n))),l&&At(l,()=>{l=null})):(l?St(l):f&&(l=ct(()=>f(n))),o&&At(o,()=>{o=null})))};ne(()=>{i=!1,e(u),i||v(null,null)},c)}function Rt(t,e){return e}function Zr(t,e,r,n){for(var o=[],l=e.length,a=0;a<l;a++)le(e[a].e,o,!0);var c=l>0&&o.length===0&&r!==null;if(c){var i=r.parentNode;xr(i),i.append(r),n.clear(),W(t,e[0].prev,e[l-1].next)}qe(o,()=>{for(var u=0;u<l;u++){var v=e[u];c||(n.delete(v.k),W(t,v.prev,v.next)),H(v.e,!c)}})}function qt(t,e,r,n,o,l=null){var a=t,c={flags:e,items:new Map,first:null};{var i=t;a=i.appendChild(te())}var u=null,v=!1,s=Oe(()=>{var f=r();return Xt(f)?f:f==null?[]:Zt(f)});ne(()=>{var f=m(s),d=f.length;if(!(v&&d===0)){v=d===0;{var _=w;zr(f,c,a,o,e,(_.f&$)!==0,n)}l!==null&&(d===0?u?St(u):u=ct(()=>l(a)):u!==null&&At(u,()=>{u=null})),m(s)}})}function zr(t,e,r,n,o,l,a,c){var i=t.length,u=e.items,v=e.first,s=v,f,d=null,_=[],g=[],y,C,E,A;for(A=0;A<i;A+=1){if(y=t[A],C=a(y,A),E=u.get(C),E===void 0){var Bt=s?s.e.nodes_start:r;d=tn(Bt,e,d,d===null?e.first:d.next,y,C,A,n,o),u.set(C,d),_=[],g=[],s=d.next;continue}if(Jr(E,y,A),E.e.f&$&&St(E.e),E!==s){if(f!==void 0&&f.has(E)){if(_.length<g.length){var z=g[0],D;d=z.prev;var gt=_[0],Q=_[_.length-1];for(D=0;D<_.length;D+=1)pe(_[D],z,r);for(D=0;D<g.length;D+=1)f.delete(g[D]);W(e,gt.prev,Q.next),W(e,d,gt),W(e,Q,z),s=z,d=Q,A-=1,_=[],g=[]}else f.delete(E),pe(E,s,r),W(e,E.prev,E.next),W(e,E,d===null?e.first:d.next),W(e,d,E),d=E;continue}for(_=[],g=[];s!==null&&s.k!==C;)(l||!(s.e.f&$))&&(f??(f=new Set)).add(s),g.push(s),s=s.next;if(s===null)continue;E=s}_.push(E),d=E,s=E.next}if(s!==null||f!==void 0){for(var ut=f===void 0?[]:Zt(f);s!==null;)(l||!(s.e.f&$))&&ut.push(s),s=s.next;var fe=ut.length;if(fe>0){var Gt=i===0?r:null;Zr(e,ut,Gt,u)}}b.first=e.first&&e.first.e,b.last=d&&d.e}function Jr(t,e,r,n){ke(t.v,e),t.i=r}function tn(t,e,r,n,o,l,a,c,i,u){var v=(i&cr)!==0,s=(i&dr)===0,f=v?s?Ee(o):kt(o):o,d=i&vr?kt(a):a,_={i:d,v:f,k:l,a:null,e:null,prev:r,next:n};try{return _.e=ct(()=>c(t,f,d),yr),_.e.prev=r&&r.e,_.e.next=n&&n.e,r===null?e.first=_:(r.next=_,r.e.next=_.e),n!==null&&(n.prev=_,n.e.prev=_.e),_}finally{}}function pe(t,e,r){for(var n=t.next?t.next.e.nodes_start:r,o=e?e.e.nodes_start:r,l=t.e.nodes_start;l!==n;){var a=Lt(l);o.before(l),l=a}}function W(t,e,r){e===null?t.first=r:(e.next=r,e.e.next=r&&r.e),r!==null&&(r.prev=e,r.e.prev=e&&e.e)}function en(t,e,r,n,o){var c;var l=(c=e.$$slots)==null?void 0:c[r],a=!1;l===!0&&(l=e.children,a=!0),l===void 0?o!==null&&o(t):l(t,a?()=>n:n)}function me(t,e){return t===e||(t==null?void 0:t[Et])===e}function Ft(t={},e,r,n){return re(()=>{var o,l;return Pe(()=>{o=l,l=[],ie(()=>{t!==r(...l)&&(e(t,...l),o&&me(r(...o),t)&&e(null,...o))})}),()=>{Be(()=>{l&&me(r(...l),t)&&e(null,...l)})}}),t}function pt(t=!1){const e=x,r=e.l.u;if(!r)return;let n=()=>Gr(e.s);if(t){let o=0,l={};const a=Pt(()=>{let c=!1;const i=e.s;for(const u in i)i[u]!==l[u]&&(l[u]=i[u],c=!0);return c&&o++,o});n=()=>m(a)}r.b.length&&Ar(()=>{ge(e,n),Ut(r.b)}),Wt(()=>{const o=ie(()=>r.m.map(Xe));return()=>{for(const l of o)typeof l=="function"&&l()}}),r.a.length&&Wt(()=>{ge(e,n),Ut(r.a)})}function ge(t,e){if(t.l.s)for(const r of t.l.s)m(r);e()}function rn(t,e){var l;var r=(l=t.$$events)==null?void 0:l[e.type],n=Xt(r)?r.slice():r==null?[]:[r];for(var o of n)o.call(this,e)}let bt=!1;function nn(t){var e=bt;try{return bt=!1,[t(),bt]}finally{bt=e}}function ln(t){for(var e=b,r=b;e!==null&&!(e.f&(q|et));)e=e.parent;try{return R(e),t()}finally{R(r)}}function Nt(t,e,r,n){var g;var o=(r&_r)!==0,l=!lt||(r&hr)!==0,a=!1,c;[c,a]=nn(()=>t[e]);var i=Et in t||tr in t,u=(((g=Vt(t,e))==null?void 0:g.set)??(i&&e in t&&(y=>t[e]=y)))||void 0,v=n,s=!0,f=()=>(s&&(s=!1,v=n),v);c===void 0&&n!==void 0&&(u&&l&&ar(),c=f(),u&&u(c));var d;if(l)d=()=>{var y=t[e];return y===void 0?f():(s=!0,y)};else{var _=ln(()=>(o?Pt:Oe)(()=>t[e]));_.f|=ze,d=()=>{var y=m(_);return y!==void 0&&(v=void 0),y===void 0?v:y}}return d}function mt(t){x===null&&Mr(),lt&&x.l!==null?on(x).m.push(t):Wt(()=>{const e=ie(t);if(typeof e=="function")return e})}function on(t){var e=t.l;return e.u??(e.u={a:[],b:[],m:[]})}const an="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(an);fr();var un=S('<button class="font-medium cursor-pointer">Sell stock</button> <dialog><div class="flex flex-col gap-4"><h3>Sell stock - <span class="font-mono"> </span></h3> <div class="flex flex-col w-max"><label>Quantity <br> <input step="1" type="number"></label></div> <form method="dialog" class="self-end"><button class="ghost">Cancel</button> <button>Place sell order</button></form></div></dialog>',1);function sn(t,e){let r=V();const n=()=>{m(r).showModal()},o=()=>{};let l=Nt(e,"stockName",8);var a=un(),c=_t(a),i=p(c,2),u=h(i),v=h(u),s=p(h(v)),f=h(s),d=p(v,4),_=p(h(d),2);Ft(i,g=>U(r,g),()=>m(r)),K(()=>T(f,l())),j("click",c,n),j("click",_,o),k(t,a)}var fn=S("<tr><td> </td><td> </td><td><!></td></tr>"),cn=S('<div class="flex flex-col w-full gap-4"><h3>Holdings</h3> <table><thead><tr><th>Stock</th><th>Quantity</th><th></th></tr></thead><tbody></tbody></table></div>');function vn(t,e){at(e,!1);let r=V();const n=()=>[{stock:"AAPL",quantity:5},{stock:"GOOGL",quantity:5}];mt(()=>{U(r,n())}),pt();var o=cn(),l=p(h(o),2),a=p(h(l));qt(a,5,()=>m(r),Rt,(c,i)=>{var u=fn(),v=h(u),s=h(v),f=p(v),d=h(f),_=p(f),g=h(_);sn(g,{get stockName(){return m(i).stock}}),K(()=>{T(s,m(i).stock),T(d,m(i).quantity)}),k(c,u)}),k(t,o),it()}var dn=S('<button class="font-medium cursor-pointer">Buy stock</button> <dialog><div class="flex flex-col gap-4"><h3>Buy stock - <span class="font-mono"> </span></h3> <div class="flex flex-col w-max"><label>Quantity <br> <input step="1" type="number"></label></div> <form method="dialog" class="self-end"><button class="ghost">Cancel</button> <button>Confirm purchase</button></form></div></dialog>',1);function _n(t,e){let r=V();const n=()=>{m(r).showModal()},o=()=>{};let l=Nt(e,"stockName",8);var a=dn(),c=_t(a),i=p(c,2),u=h(i),v=h(u),s=p(h(v)),f=h(s),d=p(v,4),_=p(h(d),2);Ft(i,g=>U(r,g),()=>m(r)),K(()=>T(f,l())),j("click",c,n),j("click",_,o),k(t,a)}var hn=S("<tr><td> </td><td> </td><td><!></td></tr>"),pn=S('<div class="flex flex-col w-full gap-4"><h3>Stocks</h3> <table><thead><tr><th>Stock</th><th>Price</th><th></th></tr></thead><tbody></tbody></table></div>');function mn(t,e){at(e,!1);let r=V();const n=()=>[{name:"AAPL",price:5},{name:"GOOGL",price:5}];mt(()=>{U(r,n())}),pt();var o=pn(),l=p(h(o),2),a=p(h(l));qt(a,5,()=>m(r),Rt,(c,i)=>{var u=hn(),v=h(u),s=h(v),f=p(v),d=h(f),_=p(f),g=h(_);_n(g,{get stockName(){return m(i).name}}),K(()=>{T(s,m(i).name),T(d,m(i).price)}),k(c,u)}),k(t,o),it()}var gn=S('<button class="ghost font-medium cursor-pointer">Add money</button> <dialog><div class="flex flex-col gap-4"><h3>Add money to wallet</h3> <div class="flex flex-col w-max"><label>Amount <br> <input type="number"></label></div> <form method="dialog" class="self-end"><button class="ghost">Cancel</button> <button>Add money</button></form></div></dialog>',1);function bn(t){let e=V();const r=()=>{m(e).showModal()},n=()=>{};var o=gn(),l=_t(o),a=p(l,2),c=h(a),i=p(h(c),4),u=p(h(i),2);Ft(a,v=>U(e,v),()=>m(e)),j("click",l,r),j("click",u,n),k(t,o)}var yn=S('<div class="flex items-center gap-10"><p class="text-2xl"> </p> <!></div>'),wn=S('<div class="flex flex-col w-full max-w-md gap-3"><h3>Wallet</h3> <!></div>');function xn(t,e){at(e,!1);let r=V();mt(()=>{U(r,n())});const n=()=>12345;pt();var o=wn(),l=p(h(o),2);{var a=i=>{var u=ue("Loading...");k(i,u)},c=i=>{var u=yn(),v=h(u),s=h(v),f=p(v,2);bn(f),K(()=>T(s,`Balance: $${m(r)??""}`)),k(i,u)};se(l,i=>{m(r)?i(c,!1):i(a)})}k(t,o),it()}var En=S('<button class="font-medium cursor-pointer"><!></button> <dialog><div class="flex flex-col gap-4"><h3> </h3> <p>This action cannot be undone.</p> <form method="dialog" class="self-end"><button class="ghost">Back</button> <button> </button></form></div></dialog>',1);function kn(t,e){let r=V();const n=()=>{m(r).showModal()};let o=Nt(e,"confirmLabel",8,"Confirm"),l=Nt(e,"message",8,"Are you sure?");var a=En(),c=_t(a),i=h(c);en(i,e,"default",{},y=>{var C=ue("Button");k(y,C)});var u=p(c,2),v=h(u),s=h(v),f=h(s),d=p(s,4),_=p(h(d),2),g=h(_);Ft(u,y=>U(r,y),()=>m(r)),K(()=>{T(f,l()),T(g,o())}),j("click",c,n),j("click",_,function(y){rn.call(this,e,y)}),k(t,a)}var Tn=S("<tr><td> </td><td> </td><td> </td><td> </td><td> </td><td><!></td></tr>"),An=S('<div class="flex flex-col w-full gap-4"><h3>Stock transactions</h3> <table><thead><tr><th>Stock</th><th>Order Type</th><th>Amount</th><th>Time</th><th>Status</th><th></th></tr></thead><tbody></tbody></table></div>');function Sn(t,e){at(e,!1);let r=V();const n=()=>[{stock:"AAPL",orderType:"Market buy",amount:1500,time:"2024-01-29 12:00",status:"Pending"},{stock:"GOOGL",orderType:"Limit sell",amount:1250,time:"2024-01-29 13:15",status:"Completed"},{stock:"MSFT",orderType:"Market buy",amount:1100,time:"2024-01-29 14:30",status:"Cancel"}];mt(()=>{U(r,n())});const o=()=>{};pt();var l=An(),a=p(h(l),2),c=p(h(a));qt(c,5,()=>m(r),Rt,(i,u)=>{var v=Tn(),s=h(v),f=h(s),d=p(s),_=h(d),g=p(d),y=h(g),C=p(g),E=h(C),A=p(C),Bt=h(A),z=p(A),D=h(z);{var gt=Q=>{kn(Q,{$$events:{click:o},children:(ut,fe)=>{var Gt=ue("Cancel");k(ut,Gt)},$$slots:{default:!0}})};se(D,Q=>{m(u).status!=="Completed"&&Q(gt)})}K(()=>{T(f,m(u).stock),T(_,m(u).orderType),T(y,`$${m(u).amount??""}`),T(E,m(u).time),T(Bt,m(u).status)}),k(i,v)}),k(t,l),it()}var On=S("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),Cn=S('<div class="flex flex-col w-full gap-4"><h3>Wallet transactions</h3> <table><thead><tr><th>Stock</th><th>Used Debit</th><th>Amount</th><th>Time</th></tr></thead><tbody></tbody></table></div>');function Mn(t,e){at(e,!1);let r=V();const n=()=>[{stock:"AAPL",usedDebit:!1,amount:1500,time:"2024-01-29 12:00"},{stock:"GOOGL",usedDebit:!0,amount:1250,time:"2024-01-29 13:15"},{stock:"MSFT",usedDebit:!1,amount:1100,time:"2024-01-29 14:30"}];mt(()=>{U(r,n())}),pt();var o=Cn(),l=p(h(o),2),a=p(h(l));qt(a,5,()=>m(r),Rt,(c,i)=>{var u=On(),v=h(u),s=h(v),f=p(v),d=h(f),_=p(f),g=h(_),y=p(_),C=h(y);K(()=>{T(s,m(i).stock),T(d,m(i).usedDebit),T(g,`$${m(i).amount??""}`),T(C,m(i).time)}),k(c,u)}),k(t,o),it()}var Nn=S("<!> <!> <!> <!> <!>",1),Ln=S('<main class="max-w-[1200px] flex flex-col my-[60px] mx-auto gap-12"><div class="pb-4 flex justify-between"><h1 class="font-bold text-3xl">TradeSimple</h1> <div class="text-right font-mono"><p>UVic SENG468</p> <p>Spring 2025</p></div></div> <!></main>');function Pn(t){var e=Ln(),r=p(h(e),2);{var n=o=>{var l=Nn(),a=_t(l);xn(a,{});var c=p(a,2);Mn(c,{});var i=p(c,2);vn(i,{});var u=p(i,2);Sn(u,{});var v=p(u,2);mn(v,{}),k(o,l)};se(r,o=>{o(n,!1)})}k(t,e)}Kr(Pn,{target:document.getElementById("app")});
