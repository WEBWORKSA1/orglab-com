/* =========================================================
   OrgLab.com — GLOBAL MONETIZATION & INTEGRATION CONFIG
   Edit these values only. No other code changes needed.
   ========================================================= */
window.ORGLAB_CONFIG = {
  siteName: "OrgLab",
  siteUrl: "https://orglab.com",

  /* Google AdSense — e.g. "ca-pub-1234567890123456".
     Leave empty to keep ads off (placeholders stay hidden in production). */
  adsenseClient: "",
  /* Optional: map slot names to your AdSense ad-unit IDs */
  adSlots: { header: "", incontent: "", sidebar: "", footer: "" },

  /* Google Analytics 4 — e.g. "G-XXXXXXXXXX" */
  ga4Id: "",

  /* Form backend (any service that accepts POST JSON/FormData):
     Formspree  -> "https://formspree.io/f/xxxxxxx"
     Web3Forms  -> "https://api.web3forms.com/submit" (+ set web3formsKey)
     Google Apps Script web app URL -> writes rows to a Google Sheet
     Leave empty = DEMO MODE: submissions are saved in the visitor's browser only. */
  formEndpoint: "",
  web3formsKey: "",

  /* Donations & memberships (paste your hosted payment links) */
  donate: {
    stripeOneTime: "",      // Stripe Payment Link (customer chooses amount)
    stripeMonthly: {        // Stripe subscription Payment Links per tier
      seedling: "",
      grower: "",
      labpartner: ""
    },
    paypal: "",             // e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX
    buyMeACoffee: "",       // e.g. https://www.buymeacoffee.com/orglab
    githubSponsors: "",
    patreon: ""
  },
  fundingGoal: { raised: 0, goal: 5000, label: "2026 Independent Lab Testing Fund" },

  /* YouTube */
  youtubeChannelUrl: "",
  youtubeChannelId: "",

  /* Social */
  social: {
    youtube: "",
    instagram: "",
    x: "",
    facebook: "",
    linkedin: "",
    pinterest: ""
  },

  contactEmail: "hello@orglab.com",

  /* Calendly/Cal.com link shown after a certification lead converts */
  bookingUrl: ""
};
