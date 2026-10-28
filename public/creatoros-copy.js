// Keeps the CreatorOS copy on the page after Framer's runtime takes over.
//
// The section components already render CreatorOS text, but Framer's own
// runtime (loaded from framerusercontent.com) re-renders parts of the page a
// few seconds after load from its copy of the original Verseo template, which
// puts the old words back. This script watches the DOM and swaps each old
// string for its CreatorOS version as soon as it appears. MutationObserver
// callbacks run before the browser paints, so the old text never shows.
//
// Swaps are scoped to the section named by the nearest data-framer-name
// ancestor, because the same template string can need different copy in
// different sections. Anything outside those sections uses the global map.
(function () {
  var COPY = {
 "sections": {
  "Hero": {
   "AI writing tool": "AI OS for creators",
   "Write better content.": "Run your creator business.",
   "Faster. With AI": "Smarter. With AI",
   "Verseo helps teams, founders, and marketers generate high-quality content in seconds — without overthinking every word": "Your inbox, brand deals, content and schedule in one place, with a daily briefing that tells you what to do and does the busywork for you.",
   "What do you want to write today?": "What needs me today?",
   "AI Writer": "Briefing",
   "Brand Voice": "Inbox",
   "Rewrite": "Publish",
   "Summarize": "Deals",
   "Get Started": "Get started free",
   "Try Demo": "See how it works"
  },
  "Client Logos": {
   "Trusted by modern teams": "Works with the platforms you already use"
  },
  "Problem And Difference": {
   "Where content friction ": "Where creator chaos ",
   "Where content friction ends, clarity begins": "Where creator chaos ends, clarity begins",
   "See how AI replaces slow, manual writing with fast, structured content creation.": "See how AI replaces scattered tools and busywork with one workspace that acts for you.",
   "Fragmented writing": "Scattered tools",
   "Ideas don’t translate into clear content": "Messages spread across five apps",
   "Constantly starting from a blank page": "Deadlines kept in your head",
   "No clear structure or direction": "No single view of what needs you today",
   "Manual workflows": "Endless busywork",
   "Writing takes too much time": "Captions rewritten for every platform",
   "Endless editing and rewriting": "Chasing brands for late payments",
   "Inconsistent tone across channels": "More time managing than creating",
   "AI-powered content flow": "One creator OS",
   "Generate structured content in seconds": "A daily briefing of what needs you",
   "Keep your voice consistent everywhere": "Every message sorted, replies drafted",
   "Refine, edit, and scale effortlessly": "Post once, publish everywhere"
  },
  "Features": {
   "Everything you need ": "Everything your creator ",
   "to create better content": "business needs",
   "Everything you need to create better content": "Everything your creator business needs",
   "Create, refine, and scale content - faster and without starting from scratch.": "Inbox, content, deals and schedule - handled in one place, with AI doing the busywork.",
   "AI Writing": "Unified Inbox",
   "Start from a simple idea and turn it into structured, high-quality content in seconds.": "Emails, comments and DMs in one feed, sorted into deals, collabs, fans and spam.",
   "No more blank pages.": "Replies drafted. You approve.",
   "Smart Rewrite": "Daily Briefing",
   "Improve clarity, structure, and tone instantly without rewriting from scratch.": "Every morning: your to-do list, messages that need you, deal updates and today's content ideas.",
   "Fix and refine in one click.": "Know your day at a glance.",
   "Tone Control": "Publish Everywhere",
   "Keep your voice consistent across every channel — from emails to social posts.": "Upload one video and get clips, captions and hashtags for every platform, scheduled.",
   "Write like your brand, every time.": "Create once, post everywhere.",
   "Ready Templates": "Deal Pipeline",
   "Use proven formats for real-world use cases — from ads to product descriptions.": "From offer to payment: rate suggestions, contract checks, deliverables and invoices.",
   "Start faster with the right structure.": "Get paid on time, every time."
  },
  "Use Cases": {
   "use cases ": "built for ",
   "Built for how you actually": "Built for how creators actually",
   "create content": "run their business",
   "Built for how you actually create content": "Built for how creators actually run their business",
   "Whether you’re creating content daily or scaling it across a team,": "Whether you post daily or manage a roster of creators,",
   "Verseo adapts to your workflow.": "CreatorOS adapts to your workflow.",
   "Whether you’re creating content daily or scaling it across a team, Verseo adapts to your workflow.": "Whether you post daily or manage a roster of creators, CreatorOS adapts to your workflow.",
   "For marketers": "For solo creators",
   "For founders": "For talent managers",
   "For teams": "For creator teams",
   "Create ads, emails, landing pages, and social content - without starting from scratch. Quickly generate multiple variations, test different angles, and adapt your message for every platform in seconds.": "Wake up to one briefing: messages sorted, replies drafted, deal deadlines flagged and today's content ideas picked from what your audience asks - so your morning goes to creating, not admin."
  },
  "How It Works": {
   "Turn any idea into ready-to-use ": "Turn one upload into ready-to-post ",
   "content in seconds": "content everywhere",
   "Turn any idea into ready-to-use content in seconds": "Turn one upload into ready-to-post content everywhere",
   "No complex tools or long workflows - just describe what you need,": "No juggling apps or rewriting captions - just upload your video,",
   "and Verseo does the rest.": "and CreatorOS does the rest.",
   "No complex tools or long workflows - just describe what you need, and Verseo does the rest.": "No juggling apps or rewriting captions - just upload your video, and CreatorOS does the rest.",
   "Enter your idea": "Upload your video",
   "Describe what you want to create in a simple prompt - even a rough idea works.": "Drop in a long video or paste a YouTube link - CreatorOS reads the transcript.",
   "Generate content": "Get clips and captions",
   "Verseo turns your input into structured, high-quality content in seconds.": "AI picks the best moments and writes titles, captions and hashtags per platform.",
   "Refine and publish": "Approve and schedule",
   "Adjust tone, edit, and use your content anywhere - ready when you are.": "Review everything on one board and schedule it for the best times to post.",
   "The simpler the input, the faster you get results": "One upload in, a week of posts out"
  },
  "Results": {
   "See the impact instantly": "Get your time back",
   "Create content faster, stay consistent across every channel,": "Spend less time on admin, never miss a deadline or payment,",
   "and achieve better results with less effort.": "and put the hours back into creating.",
   "Create content faster, stay consistent across every channel, and achieve better results with less effort.": "Spend less time on admin, never miss a deadline or payment, and put the hours back into creating.",
   "Verseo": "CreatorOS",
   "Stay in the flow": "Stay in creator mode",
   "Keep momentum while writing. Generate, improve, and expand ideas without breaking your creative process.": "CreatorOS handles the inbox, captions, deadlines and invoices in the background, so you stay focused on making things.",
   "Start Writing": "Start Creating",
   "Ready to Publish": "Your day, planned",
   "Review, edit, regenerate, and export your content wherever you need it.": "To-dos, replies, deals and content ideas, ready every morning.",
   "Less time spent editing": "Less time on admin",
   "Refine and finalize content faster with AI-powered suggestions and rewrites.": "Sorting, replies, captions and invoices are prepared for you to approve.",
   "Brand Voice": "Deadlines met",
   "Keep messaging aligned across emails, social media, landing pages, and campaigns.": "Deliverables, posts and payments tracked on one calendar, with reminders.",
   "Content that fits anywhere": "Content that fits every platform",
   "From social posts to long-form content.": "From Shorts and Reels to long-form video."
  },
  "Examples": {
   "See what you can create ": "See what CreatorOS ",
   "with Verseo": "does for you",
   "See what you can create with Verseo": "See what CreatorOS does for you",
   "From social media posts and email campaigns to product descriptions and ": "From your morning briefing and inbox replies to captions for every platform and ",
   "ad copy — generate content tailored to any channel in seconds.": "brand deal follow-ups — prepared in seconds, approved by you.",
   "From social media posts and email campaigns to product descriptions and ad copy — generate content tailored to any channel in seconds.": "From your morning briefing and inbox replies to captions for every platform and brand deal follow-ups — prepared in seconds, approved by you.",
   "5 Ways AI Saves Time": "Your Morning Briefing",
   "Learn how modern teams use AI to streamline content creation, improve consistency, and free up time for more meaningful work.": "Today's to-do list, sorted messages, deal deadlines and three content ideas picked from what your audience asks.",
   "Productivity | AI | Teams": "Daily | Inbox | Ideas",
   "Ready to publish": "Ready at 7am",
   "Generate engaging emails with clear messaging, strong structure, and a tone that matches your brand in just a few seconds.": "Replies to brands, collaborators and fans, drafted in your tone and saved as drafts until you approve them.",
   "Campaign | Marketing | Outreach": "Brands | Collabs | Fans",
   "Generated in 3 sec": "Drafted in 3 sec",
   "Built For Growth": "Posted Everywhere",
   "Create polished product descriptions that communicate benefits clearly, build trust, and support better conversion rates.": "One video becomes clips, titles, captions and hashtags for Shorts, Reels and TikTok, scheduled at the best times.",
   "SaaS | Product | Copywriting": "Shorts | Reels | TikTok",
   "Optimized for conversion": "Optimized for reach"
  },
  "Integrations": {
   "Works with your favorite tools": "Connects to the tools you already use"
  },
  "Testimonials": {
   "testimonials": "creator voices",
   "Loved by teams that ": "Made for creators who ",
   "create content every day": "would rather be creating",
   "Loved by teams that create content every day": "Made for creators who would rather be creating",
   "From marketers and founders to agencies and growing teams — Verseo helps": "From solo YouTubers to managers and creator teams — CreatorOS helps",
   " people create better content faster, without sacrificing quality or consistency.": " people spend less time managing and more time creating.",
   "\"We tested several AI writing tools, but Verseo felt the most practical. It's fast, intuitive, and fits naturally into our workflow.\"": "\"My brand emails, DMs and comments live in five apps. I lose deals just because I see them too late.\"",
   "\"Verseo cut our content creation time in half. What used to take hours now takes minutes, and the quality is consistently high.\"": "\"I spend about three hours a day on admin: replies, captions for every platform, invoices. That is time I am not filming.\"",
   "\"The biggest win for us is consistency. Every email, post, and product update sounds like it comes from the same brand voice.\"": "\"Brands pay late and I forget to follow up. I need something that remembers who owes me what.\"",
   "Emma Rodriguez": "Maya (persona)",
   "Content Strategist": "YouTuber, 180k",
   "Sarah Chen": "Leo (persona)",
   "Marketing Manager": "Multi-platform creator",
   "David Miller": "Sana (persona)",
   "Startup Founder": "Creator, 60k",
   "4,9": "5 apps",
   "5,0": "3h/day"
  },
  "Pricing": {
   "Whether you’re creating content solo or collaborating with a team,": "Start free with your first deals and videos,",
   "there’s a plan designed for your workflow.": "and upgrade when your business grows.",
   "Whether you’re creating content solo or collaborating with a team, there’s a plan designed for your workflow.": "Start free with your first deals and videos, and upgrade when your business grows.",
   "For individuals and freelancers": "For creators landing first deals",
   "$12": "$0",
   "$29": "$19",
   "$79": "$49",
   "AI writing assistant": "Daily briefing",
   "Essential content templates": "Unified inbox for 1 platform",
   "Rewrite and improve text": "3 videos repurposed a month",
   "Standard support": "Manual deal tracking",
   "Pro": "Creator",
   "For creators and professionals": "For full-time creators",
   "Advanced AI generation": "All platforms connected",
   "Brand voice controls": "Unlimited repurposing",
   "Full template library": "Brand deal pipeline",
   "Priority content tools": "Invoices and payment chasing",
   "For agencies and growing teams": "For managers and creator teams",
   "Shared workspace": "Multiple creator workspaces",
   "Team collaboration tools": "Shared deal board",
   "Unlimited team projects": "Roles and approvals"
  },
  "FAQ": {
   "Whether you’re creating content solo or collaborating with a team,": "Questions about how CreatorOS reads your inbox,",
   "there’s a plan designed for your workflow.": "plans your day and acts for you.",
   "Whether you’re creating content solo or collaborating with a team, there’s a plan designed for your workflow.": "Questions about how CreatorOS reads your inbox, plans your day and acts for you.",
   "What is Verseo?": "What is CreatorOS?",
   "Verseo is an AI-powered writing assistant that helps you generate, rewrite, and improve content in seconds. From emails and social posts to product descriptions and marketing copy, it helps you create content faster with less effort.": "CreatorOS is an AI operating system for creators. It brings your inbox, brand deals, content, calendar and analytics into one place, gives you a daily briefing, and does the busywork - sorting messages, drafting replies, writing captions and chasing payments - so you spend more time creating.",
   "Who is Verseo designed for?": "Who is CreatorOS designed for?",
   "Do I need any writing experience?": "Will it post or send anything on its own?",
   "Can I customize the generated content?": "Which platforms does it work with?",
   "What types of content can I create?": "Where do the content ideas come from?",
   "How fast can I generate content?": "How much time will it save me?"
  }
 },
 "global": {
  "Verseo": "CreatorOS",
  "Get Template Free": "Sign up free",
  "better content today": "more, manage less",
  "Turn ideas into polished content in seconds. Generate, refine, and publish faster": "Your inbox, deals, content and schedule in one place. Wake up to a plan,",
  "with AI-powered workflows designed for modern teams.": "with the busywork already done.",
  "Turn ideas into polished content in seconds. Generate, refine, and publish faster with AI-powered workflows designed for modern teams.": "Your inbox, deals, content and schedule in one place. Wake up to a plan, with the busywork already done.",
  "Verseo helps teams create, refine, and publish high-quality content faster — without complicated workflows or endless revisions.": "CreatorOS brings a creator's inbox, content, brand deals and schedule into one place, and does the busywork so they can create.",
  "verseo@gmail.com": "hello@creatoros.ai",
  "© 2026 Verseo | All Rights Reserved": "© 2026 CreatorOS | All Rights Reserved",
  "> Create a high-converting landing page ": "> Plan my day as a creator ",
  "→ analyzing audience ": "→ sorting 23 new messages ",
  "→ structuring content ": "→ checking brand deadlines ",
  "→ optimizing messaging ": "→ picking today's content ideas ",
  "+ compelling headline ": "+ 4 replies drafted ",
  "+ clear value proposition ": "+ Nike deliverable due Friday ",
  "+ conversion-focused copy ": "+ 3 content ideas for today ",
  "status: ready to publish ✓": "status: briefing ready ✓",
  "content_request: ": "request: "
 }
};

  var TITLE = "CreatorOS — The AI Operating System for Creators";
  var norm = function (s) { return s.replace(/\u00a0/g, " "); };
  // Keys and values are trimmed: the page text is compared trimmed, and some
  // template lines end in a space (the first half of a two-line heading).
  function trimmed(src) {
    var m = {};
    Object.keys(src).forEach(function (k) { m[norm(k).trim()] = src[k].trim(); });
    return m;
  }
  var globalMap = trimmed(COPY.global);
  var sectionMaps = {};
  Object.keys(COPY.sections).forEach(function (name) {
    var m = trimmed(COPY.sections[name]);
    Object.keys(globalMap).forEach(function (k) { if (!(k in m)) m[k] = globalMap[k]; });
    sectionMaps[name] = m;
  });

  function mapFor(node) {
    var el = node.parentElement;
    while (el) {
      var name = el.getAttribute && el.getAttribute("data-framer-name");
      if (name && sectionMaps[name]) return sectionMaps[name];
      el = el.parentElement;
    }
    return globalMap;
  }

  function fixText(node) {
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    if (node.parentElement && node.parentElement.tagName === "TITLE") {
      if (raw.indexOf("Verseo") !== -1) node.nodeValue = TITLE;
      return;
    }
    var key = norm(raw).trim();
    var map = mapFor(node);
    var next = map[key];
    if (next === undefined && key.indexOf("Verseo") !== -1) next = key.replace(/Verseo/g, "CreatorOS");
    if (next === undefined || next === key) return;
    var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    node.nodeValue = lead + next + trail;
  }

  // Images are matched by the width and height attributes Framer gives them,
  // which stay the same when its runtime re-renders the page with its own URLs.
  var HERO_SRCSET = "/assets/img/creatoros-hero-512.webp 512w, /assets/img/creatoros-hero-1024.webp 1024w, /assets/img/creatoros-hero-2048.webp 2048w, /assets/img/creatoros-hero-2151.webp 2151w";
  var IMAGES = {
    "Hero": { "2151x720": { src: "/assets/img/creatoros-hero-2151.webp", srcset: HERO_SRCSET } },
    "Client Logos": {
      "294x81": { src: "/assets/img/creatoros-logo-youtube.png" },
      "268x83": { src: "/assets/img/creatoros-logo-instagram.png" },
      "224x88": { src: "/assets/img/creatoros-logo-tiktok.png" },
      "286x81": { src: "/assets/img/creatoros-logo-gmail.png" },
      "252x83": { src: "/assets/img/creatoros-logo-calendar.png" }
    }
  };

  function sectionOf(el) {
    while (el) {
      var name = el.getAttribute && el.getAttribute("data-framer-name");
      if (name && IMAGES[name]) return name;
      el = el.parentElement;
    }
    return null;
  }

  function fixImg(img) {
    var section = sectionOf(img);
    if (!section) return;
    var want = IMAGES[section][img.getAttribute("width") + "x" + img.getAttribute("height")];
    if (!want) return;
    if (want.srcset && img.getAttribute("srcset") !== want.srcset) img.setAttribute("srcset", want.srcset);
    if (!want.srcset && img.hasAttribute("srcset")) img.removeAttribute("srcset");
    if (img.getAttribute("src") !== want.src) img.setAttribute("src", want.src);
  }

  // Button links, which Framer's runtime would reset to the template's own.
  var SIGNUP = "/auth/signup";
  function fixLink(a) {
    var href = a.getAttribute("href") || "", want = null;
    if (href.indexOf("framer.link/") !== -1) want = SIGNUP;
    else if (a.closest('[data-framer-name="Hero"]')) {
      var role = a.getAttribute("data-framer-name");
      if (role === "Primary") want = SIGNUP;
      else if (role === "Secondary") want = "./#how-it-works";
    }
    if (want && href !== want) a.setAttribute("href", want);
    if (want === SIGNUP && a.getAttribute("target") === "_blank") a.removeAttribute("target");
  }

  function fixAnchors() {
    var how = document.querySelector('[data-framer-name="How It Works"]');
    if (how && !document.getElementById("how-it-works")) how.id = "how-it-works";
  }

  function fixTree(root) {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1) return;
    if (root.tagName === "IMG") return fixImg(root);
    if (root.tagName === "A") fixLink(root);
    var links = root.getElementsByTagName("a");
    for (var j = 0; j < links.length; j++) fixLink(links[j]);
    var imgs = root.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) fixImg(imgs[i]);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) fixText(n);
  }

  function fixTitle() {
    if (document.title && document.title.indexOf("Verseo") !== -1) document.title = TITLE;
  }

  new MutationObserver(function (records) {
    records.forEach(function (r) {
      if (r.type === "characterData") fixText(r.target);
      else if (r.type === "attributes") r.target.tagName === "A" ? fixLink(r.target) : fixImg(r.target);
      else r.addedNodes.forEach(fixTree);
    });
    fixTitle();
    fixAnchors();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["src", "srcset", "href"] });

  document.addEventListener("DOMContentLoaded", function () { fixTree(document.body); fixTitle(); fixAnchors(); });
})();
