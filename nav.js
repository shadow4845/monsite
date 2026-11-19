// Barre de navigation commune
import { auth, onAuthStateChanged, signOut, getProfile } from "./app.js";
const here = location.pathname.split("/").pop() || "index.html";
const links = [
  ["Accueil","index.html"],["Streameurs","streamers.html"],["Trades","trade.html"],
  ["Règlement","reglement.html"],["FAQ","index.html#faq"]
];
const bar = document.createElement("header");
bar.className = "topbar";
bar.innerHTML = `
  <div class="left">
    <a class="brand" href="index.html"><img src="logo.png" alt=""><span>Shadow</span></a>
    <nav class="menu">${links.map(([t,h])=>`<a href="${h}" class="${h===here?"active":""}"${h.startsWith("http")?' target="_blank" rel="noopener"':""}>${t}</a>`).join("")}</nav>
  </div>
  <button class="burger" aria-label="Menu">☰</button>
  <div class="right" id="authZone">
    <a class="pill discord" href="https://discord.gg/BXVpZacBfu" target="_blank" rel="noopener">Discord</a>
    <a class="pill ghost" href="settings.html" title="Paramètres">⚙️ Paramètres</a>
    <a class="pill" href="login.html">Connexion</a>
  </div>`;
document.querySelectorAll("body > nav").forEach(n => n.remove());
document.body.prepend(bar);
bar.querySelector(".burger").onclick = () => bar.classList.toggle("open");
onAuthStateChanged(auth, async u => {
  if (!u) return;
  const p = await getProfile(u.uid).catch(() => null);
  document.getElementById("authZone").innerHTML = `
    <a class="pill discord" href="https://discord.gg/BXVpZacBfu" target="_blank" rel="noopener">Discord</a>
    <a class="pill profile" href="user.html"><img src="${p && p.photo ? p.photo.replace(/"/g,"") : "logo.png"}" alt="" onerror="this.src='logo.png'">${p ? p.pseudo : "Mon profil"}</a>
    ${p && p.role === "admin" ? '<a class="pill admin" href="admin.html">⚙️ Admin</a>' : ""}
    <a class="pill ghost" href="settings.html" title="Paramètres">⚙️ Paramètres</a>
    <button class="pill ghost" id="navOut">Déconnexion</button>`;
  document.getElementById("navOut").onclick = async () => { await signOut(auth); location.href = "index.html"; };
});
