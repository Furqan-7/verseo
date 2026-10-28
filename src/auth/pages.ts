// The sign-up and sign-in pages, served by app/auth/*/route.ts.
//
// These are not Framer pages: they are plain HTML written to match the
// CreatorOS landing page (the sky gradient, grid, pixel clusters and clouds),
// so they need no Framer runtime. Styles are inline because the site caches
// every .css and .js file for a year (see _headers and vercel.json).
//
// The forms are not connected to an auth provider yet. Submitting shows a
// notice; replace the script at the bottom when auth is wired up.

export type AuthKind = "signup" | "signin";

const LOGO = `<svg viewBox="0 0 26.722 26.733" fill="#181818" aria-hidden="true"><path d="M9.454 0L3.214 6.357C3.928 7.371 6.778 8.149 8.865 8.559 9.715 8.732 10.586 8.775 11.449 8.688 17.454 8.045 20.051 4.778 20.609 3.12 14.368 6.449 10.572 2.426 9.455 0Z"/><path d="M17.581 26.733L23.823 20.376C23.108 19.36 20.258 18.584 18.172 18.172 17.322 18 16.451 17.957 15.588 18.044 9.584 18.688 6.987 21.955 6.429 23.612 12.669 20.284 16.464 24.307 17.581 26.733Z"/><path d="M0 17.609L6.411 23.793C7.42 23.071 8.172 20.214 8.564 18.123 8.729 17.272 8.765 16.401 8.671 15.539 7.974 9.54 4.684 6.972 3.021 6.429 6.405 12.64 2.417 16.47 0 17.609Z"/><path d="M26.722 9.399L20.312 3.214C19.302 3.937 18.55 6.794 18.158 8.884 17.993 9.735 17.957 10.607 18.051 11.469 18.748 17.468 22.038 20.035 23.701 20.579 20.317 14.368 24.305 10.538 26.722 9.399Z"/></svg>`;

const GOOGLE = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.2 5.6c4.2-3.9 7.1-9.6 7.1-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.7 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>`;

// A 4x4 pixel cluster like the landing page's; "1" cells are filled.
function pixels(color: string, pattern: string, position: string): string {
  const cells = [...pattern].map((c) => (c === "1" ? `<i style="background:${color}"></i>` : "<i></i>")).join("");
  return `<div class="px" style="${position}" aria-hidden="true">${cells}</div>`;
}

const DECOR =
  pixels("#a2e198", "1010011011010010", "left:12%;top:170px") +
  pixels("#aeabff", "1001011001101001", "right:12%;top:150px") +
  pixels("#ffcc40", "1000011101000100", "left:30%;top:96px");

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#181818;--muted:#686868;--faint:#8b8b8b;--line:#ededed}
body{font-family:Inter,system-ui,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;letter-spacing:-.01em;
  background:linear-gradient(#f9f9f9 0%,#eef2f6 28%,#cfdcea 58%,#a9c2dd 100%);min-height:100vh;position:relative;overflow-x:hidden}
.grid{position:absolute;inset:0;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='101' height='86'%3E%3Cpath d='M0 43.5H101M50.5 0V86' stroke='%23e2e5e9' fill='none'/%3E%3Cpath d='M50.5 39V48M46 43.5H55' stroke='%23c4c8ce' fill='none'/%3E%3C/svg%3E");
  background-size:101px 86px;background-position:center -10px;
  mask-image:linear-gradient(#000 0%,#000 55%,transparent 85%);-webkit-mask-image:linear-gradient(#000 0%,#000 55%,transparent 85%)}
body::before,body::after{content:"";position:absolute;top:0;bottom:0;width:1px;background:var(--line);z-index:1}
body::before{left:12px}body::after{right:12px}
.clouds{position:absolute;left:0;right:0;bottom:0;height:300px;pointer-events:none;
  background:url(/assets/img/creatoros-clouds.webp) center bottom/100% 100% no-repeat;
  mask-image:linear-gradient(transparent 0%,#000 35%);-webkit-mask-image:linear-gradient(transparent 0%,#000 35%)}
.px{position:absolute;display:grid;grid-template-columns:repeat(4,8px);gap:2px}.px i{width:8px;height:8px}
nav{position:relative;z-index:3;height:75px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 40px;background:rgba(249,249,249,.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.logo{display:flex;align-items:center;gap:8px;font-weight:700;font-size:16px;letter-spacing:-.04em;color:var(--ink);text-decoration:none}
.logo svg{width:26px;height:26px}
.navlink{font-size:15px;color:var(--ink);text-decoration:none}
.navlink b{font-weight:500;text-decoration:underline;text-underline-offset:3px}
main{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:72px;min-height:calc(100vh - 75px);padding:48px 16px 140px}
.card{width:440px;max-width:100%;background:#fff;border:1px solid var(--line);border-radius:12px;padding:36px;box-shadow:0 18px 40px -18px rgba(24,24,24,.18),0 2px 6px rgba(0,0,0,.03)}
.eyebrow{display:inline-flex;gap:8px;font-size:14px;color:var(--muted);margin-bottom:14px}
h1{font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:1.15}
.sub{font-size:15px;color:var(--muted);line-height:1.4;margin-top:8px}
button{cursor:pointer}
.google{margin-top:26px;width:100%;height:48px;border:1px solid #dcdcdc;border-radius:4px;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font:500 15px Inter,sans-serif;color:var(--ink);transition:background .2s}
.google:hover{background:#f6f6f6}
.or{display:flex;align-items:center;gap:12px;margin:22px 0;font-size:13px;color:var(--faint)}
.or::before,.or::after{content:"";flex:1;height:1px;background:var(--line)}
label{display:flex;justify-content:space-between;font-size:13px;font-weight:500;margin:14px 0 6px}
label .hint{font-weight:400;color:var(--muted)}
input{width:100%;height:46px;border:1px solid #e3e3e3;border-radius:4px;padding:0 14px;font:15px Inter,sans-serif;color:var(--ink);background:#fff}
input::placeholder{color:#a8a8a8}
input:focus{outline:2px solid var(--ink);outline-offset:-1px;border-color:var(--ink)}
.primary{margin-top:22px;width:100%;height:48px;border:0;border-radius:4px;background:var(--ink);color:#fff;font:500 15px Inter,sans-serif;transition:background .2s}
.primary:hover{background:#000}
.notice{display:none;margin-top:14px;padding:10px 12px;border-radius:4px;background:#f3f6fa;border:1px solid #dfe6ee;font-size:13px;line-height:1.4;color:#3f5670}
.notice.show{display:block}
.foot{margin-top:18px;text-align:center;font-size:14px;color:var(--muted)}
.foot a{color:var(--ink);font-weight:500}
.legal{margin-top:14px;text-align:center;font-size:12px;color:var(--faint);line-height:1.5}
.legal a{color:var(--muted)}
.pitch{width:420px}
.pitch h2{font-size:44px;font-weight:600;letter-spacing:-.03em;line-height:1.08}
.pitch p{font-size:17px;line-height:1.45;margin-top:16px}
.pitch ul{list-style:none;margin-top:28px;display:flex;flex-direction:column;gap:14px}
.pitch li{display:flex;gap:12px;font-size:16px;line-height:1.35}
.pitch li span{color:var(--muted)}
.pitch li::before{content:"+";font-weight:300;font-size:20px;line-height:20px}
.saved{display:inline-flex;align-items:center;gap:8px;margin-top:28px;height:34px;padding:0 12px;border-radius:17px;background:#e3f4df;color:#3d7a35;font:14px "JetBrains Mono",monospace}
@media (max-width:900px){.pitch{display:none}}
@media (max-width:640px){
  nav{padding:0 16px}
  .navlink .long{display:none}
  main{padding:28px 16px 120px}
  .card{padding:26px 22px}
  h1{font-size:26px}
  .clouds{height:220px;background-size:cover}
  .px{display:none}
}`;

// Prefills the email from ?email= (the footer newsletter sends visitors here)
// and shows a notice instead of submitting, until auth is connected.
const SCRIPT = `
(function () {
  var email = new URLSearchParams(location.search).get("email");
  var field = document.getElementById("email");
  if (email && field) field.value = email;
  var notice = document.getElementById("notice");
  function hold(e) { e.preventDefault(); notice.classList.add("show"); }
  document.getElementById("auth-form").addEventListener("submit", hold);
  document.getElementById("google").addEventListener("click", hold);
})();`;

const SIGNUP_PITCH = `
  <section class="pitch">
    <div class="eyebrow"><span>[</span>start free<span>]</span></div>
    <h2>Your first briefing<br>is one sign-up away</h2>
    <p>Connect your inbox and channels, and tomorrow morning CreatorOS tells you what needs you.</p>
    <ul>
      <li><div>Daily briefing <span>– to-dos, deals and ideas at 7am</span></div></li>
      <li><div>Unified inbox <span>– messages sorted, replies drafted</span></div></li>
      <li><div>Publish everywhere <span>– one video, every platform</span></div></li>
    </ul>
    <div class="saved">◷ Creators save hours every week</div>
  </section>`;

const SIGNUP_FORM = `
  <form class="card" id="auth-form" novalidate>
    <div class="eyebrow"><span>[</span>sign up<span>]</span></div>
    <h1>Create your account</h1>
    <p class="sub">Free to start. No credit card needed.</p>
    <button class="google" id="google" type="button">${GOOGLE} Continue with Google</button>
    <div class="or">or sign up with email</div>
    <label for="name">Name</label><input id="name" name="name" placeholder="Maya Lopez" autocomplete="name">
    <label for="email">Email</label><input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email">
    <label for="password">Password <span class="hint">8+ characters</span></label><input id="password" name="password" type="password" placeholder="••••••••" autocomplete="new-password" minlength="8">
    <button class="primary" type="submit">Create account</button>
    <p class="notice" id="notice" role="status">Sign-up isn't connected yet. Accounts open soon.</p>
    <p class="legal">By creating an account you agree to our <a href="/terms-of-service">Terms</a> and <a href="/privacy-policy">Privacy Policy</a>.</p>
  </form>`;

const SIGNIN_FORM = `
  <form class="card" id="auth-form" novalidate>
    <div class="eyebrow"><span>[</span>welcome back<span>]</span></div>
    <h1>Sign in to CreatorOS</h1>
    <p class="sub">Your briefing is waiting.</p>
    <button class="google" id="google" type="button">${GOOGLE} Continue with Google</button>
    <div class="or">or sign in with email</div>
    <label for="email">Email</label><input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email">
    <label for="password">Password <a class="hint" href="#">Forgot password?</a></label><input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password">
    <button class="primary" type="submit">Sign in</button>
    <p class="notice" id="notice" role="status">Sign-in isn't connected yet. Accounts open soon.</p>
    <p class="foot">Don't have an account? <a href="/auth/signup">Sign up free</a></p>
  </form>`;

const PAGES: Record<AuthKind, { title: string; description: string; nav: string; body: string }> = {
  signup: {
    title: "Sign up — CreatorOS",
    description: "Create your CreatorOS account and get your first daily briefing.",
    nav: `<a class="navlink" href="/auth/signin"><span class="long">Already have an account? </span><b>Sign in</b></a>`,
    body: SIGNUP_PITCH + SIGNUP_FORM,
  },
  signin: {
    title: "Sign in — CreatorOS",
    description: "Sign in to CreatorOS.",
    nav: `<a class="navlink" href="/auth/signup"><span class="long">New here? </span><b>Sign up free</b></a>`,
    body: SIGNIN_FORM,
  },
};

export function authPage(kind: AuthKind): string {
  const page = PAGES[kind];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="grid" aria-hidden="true"></div>${DECOR}<div class="clouds" aria-hidden="true"></div>
<nav><a class="logo" href="/" aria-label="CreatorOS home">${LOGO} CREATOROS</a>${page.nav}</nav>
<main>${page.body}
</main>
<script>${SCRIPT}</script>
</body>
</html>`;
}
