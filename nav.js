// Barre de navigation commune
import { auth, onAuthStateChanged, signOut, getProfile } from "./app.js";
const here = location.pathname.split("/").pop() || "index.html";
const links = [
  ["Accueil","index.html"],["Live","index.html#live"],["Trades","trade.html"],
  ["Règlement","index.html#reglement"],["FAQ","index.html#faq"]
];
const bar = document.createElement("header");
bar.className = "topbar";
bar.innerHTML = `
  <a class="brand" href="index.html"><img src="logo.png" alt=""><span>Shadow</span></a>
  <button class="burger" aria-label="Menu">☰</button>
  <nav class="menu">${links.map(([t,h])=>`<a href="${h}" class="${h===here?"active":""}">${t}</a>`).join("")}</nav>
  <div class="right">
    <a class="pill discord" href="https://discord.gg/BXVpZacBfu" target="_blank" rel="noopener">Discord</a>
    <span id="authZone"><a class="pill" href="login.html">Connexion</a></span>
  </div>`;
document.querySelectorAll("body > nav").forEach(n => n.remove());
document.body.prepend(bar);
bar.querySelector(".burger").onclick = () => bar.classList.toggle("open");
onAuthStateChanged(auth, async u => {
  const z = document.getElementById("authZone");
  if (!u) return;
  const p = await getProfile(u.uid).catch(() => null);
  z.innerHTML = `${p && p.role === "admin" ? '<a class="pill" href="admin.html">Admin</a>' : ""}
    <a class="pill" href="user.html">${p ? p.pseudo : "Mon espace"}</a>
    <button class="pill ghost" id="navOut">Déconnexion</button>`;
  document.getElementById("navOut").onclick = async () => { await signOut(auth); location.href = "index.html"; };
});
