// All site copy lives here. Edit this file to update the website —
// components read from it and don't need to change.

export const site = {
  name: "AOM Tech",
  url: "https://aom-tech.vercel.app", // update once the production domain is known
  email: "aomtech.ai@gmail.com",
  tagline: "AI solutions, built to ship.",
  description:
    "AOM Tech builds computer vision, forecasting and LLM systems, and the products around them — from peer-reviewed healthcare AI to apps people use every day.",
  socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/aom-tech-55b85443b" }],
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  headline: "We turn research-grade AI into products people use.",
  body: "Computer vision, forecasting and language models — trained, measured honestly, and shipped inside real apps.",
  primaryCta: { label: "See our work", href: "#work" },
  secondaryCta: { label: "Start a project", href: "#contact" },
};

export type ProjectArtKind = "diadose" | "bone" | "goose" | "osta" | "uai";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  sector: string;
  status: "Live" | "Published research" | "Research" | "In development";
  summary: string;
  /** Headline numbers. Leave empty for projects without measured results yet. */
  metrics: { value: string; label: string }[];
  /** Used instead of metrics for projects still in development. */
  highlights?: string[];
  stack: string[];
  link?: { label: string; href: string };
  note?: string;
  art: ProjectArtKind;
  /** Hidden projects stay out of the page until switched on. */
  hidden?: boolean;
};

export const projects: Project[] = [
  {
    slug: "diadose",
    name: "DiaDose",
    tagline: "From a photo of a meal to a safe insulin dose.",
    sector: "Healthcare AI",
    status: "Published research",
    summary:
      "An end-to-end diabetes platform. It recognises food from a photo, estimates its carbohydrates, forecasts glucose 24 hours ahead and recommends insulin following ADA guidelines, with an AI assistant for nutrition questions.",
    metrics: [
      { value: "86.6%", label: "food recognition accuracy across 101 dishes" },
      { value: "5.2 g", label: "average error estimating carbs from a photo" },
      { value: "0.986", label: "R² forecasting glucose with a CNN-LSTM" },
    ],
    stack: ["EfficientNetV2-S", "CNN-LSTM", "LLaMA 3.3 70B", "FastAPI"],
    link: { label: "Read the paper in Informatica", href: "https://doi.org/10.82044/CwTj6" },
    note: "Research platform — not a certified medical device.",
    art: "diadose",
  },
  {
    slug: "bone-guard",
    name: "Bone Guard",
    tagline: "Reading X-rays for osteosarcoma and nine other tumor types.",
    sector: "Medical imaging",
    status: "Research",
    summary:
      "A deep learning system trained on 3,746 bone X-rays. It detects osteosarcoma, classifies ten tumor types, combines the image with clinical data, outlines the tumor and writes a PDF report for review.",
    metrics: [
      { value: "0.99", label: "AUC detecting osteosarcoma" },
      { value: "92.8%", label: "accuracy across 10 tumor types" },
      { value: "97.2%", label: "correct type within the top 3 predictions" },
    ],
    stack: ["ConvNeXt-Tiny", "EfficientNet", "U-Net", "Grad-CAM"],
    note: "Research prototype — results support specialist review, not diagnosis.",
    art: "bone",
  },
  {
    slug: "saving-goose",
    name: "Saving Goose",
    tagline: "Your money, guarded.",
    sector: "Personal finance",
    status: "Live",
    summary:
      "A free money tracker with a goose in glasses that guards your budget and roasts you when you overspend. It installs from the browser, works offline, and keeps every number on the user's own phone.",
    metrics: [
      { value: "1 tap", label: "to log a payment" },
      { value: "2", label: "languages, with full right-to-left Egyptian Arabic" },
      { value: "0", label: "accounts, servers or ads" },
    ],
    stack: ["Progressive web app", "Offline-first", "Vercel"],
    link: { label: "Open the app", href: "https://saving-goose.vercel.app" },
    art: "goose",
  },
  {
    slug: "osta",
    name: "Osta",
    tagline: "Verified craftsmen, competing quotes.",
    sector: "Home services marketplace",
    status: "In development",
    summary:
      "A marketplace where Egyptian homeowners post a repair job and verified craftsmen bid on it. The craftsman app is Arabic-first and built for people who'd rather speak than type.",
    metrics: [],
    highlights: [
      "Open bidding instead of fixed prices",
      "Voice-note quotes and read-aloud job descriptions",
      "A one-time arrival passcode proves who is at the door",
      "Identity verification plus in-person vetting",
    ],
    stack: ["Next.js", "Supabase", "Progressive web app"],
    art: "osta",
  },
  {
    // Set hidden to true to take U.ai off the page.
    slug: "uai",
    name: "U.ai",
    tagline: "An AI that notices when something matters.",
    sector: "Consumer AI",
    status: "In development",
    summary:
      "A conversational AI that remembers you across conversations and checks in on its own after something big happens.",
    metrics: [],
    highlights: ["Memory you can see and edit", "Proactive check-ins", "Encryption by default"],
    stack: ["LLMs", "Memory graph"],
    art: "uai",
    hidden: false,
  },
];

export type Service = { title: string; summary: string; deliverables: string[] };

export const services: Service[] = [
  {
    title: "Computer vision",
    summary:
      "Recognition, detection and segmentation models — from identifying a meal in a photo to outlining a tumor on an X-ray.",
    deliverables: ["Image classification", "Segmentation", "Explainable heatmaps", "Transfer learning"],
  },
  {
    title: "Forecasting & time series",
    summary:
      "Models that learn from history to predict what happens next, with explanations of which signals drove each prediction.",
    deliverables: ["LSTM & Transformers", "Risk detection", "SHAP explainability", "Multi-source data"],
  },
  {
    title: "LLM assistants & RAG",
    summary:
      "Assistants grounded in your own documents and guidelines, in Arabic and English, with fallbacks when the model is unavailable.",
    deliverables: ["LLM integration", "Retrieval (RAG)", "Guardrails", "Bilingual NLP"],
  },
  {
    title: "Full-stack AI products",
    summary:
      "The model is only half the job. We build the APIs, dashboards and installable apps that put it in front of people.",
    deliverables: ["APIs", "Web & mobile apps", "Offline-first PWAs", "Deployment"],
  },
  {
    title: "Research & evaluation",
    summary:
      "Honest benchmarking before anything ships: held-out tests, leakage checks, confidence intervals and clear limitations.",
    deliverables: ["Model benchmarking", "Dataset preparation", "Technical reports", "Peer-reviewed publishing"],
  },
];

export const process = [
  {
    title: "Understand",
    body: "We learn the problem, look at the data you have, and agree on the number that will prove the work succeeded.",
  },
  {
    title: "Prototype",
    body: "A working model on real data, benchmarked against simple baselines, so you see results before committing further.",
  },
  {
    title: "Build",
    body: "We wrap the model in a product: an API, a dashboard or an app, with security and testing built in from the start.",
  },
  {
    title: "Launch & improve",
    body: "We deploy, measure how it performs with real users, and keep improving the model as new data arrives.",
  },
];

export const contact = {
  headline: "Have a problem AI should solve?",
  body: "Tell us about it. We'll reply with an honest view of whether AI is the right tool, and what it would take.",
};

export type TeamMember = {
  name: string;
  role: string;
  /** Portrait in /public/team: person cut out on a transparent background. */
  photo: string;
  linkedin?: string;
};

// Add new members here; the section lays itself out for any number.
export const team: TeamMember[] = [
  {
    name: "Abdelrahman Hossam",
    role: "Founder",
    photo: "/team/abdelrahman-hossam.png",
    linkedin: "https://www.linkedin.com/in/abdelrahman-hossam-elsofany-b2083534a/",
  },
  {
    name: "Mohamed El Daw",
    role: "Co-founder & Marketing Director",
    photo: "/team/mohamed.png",
    linkedin: "https://www.linkedin.com/in/mohamed-haitham-el-daw-8606202b4/",
  },
  {
    name: "Jana Mostafa",
    role: "Chief Technology Officer",
    photo: "/team/jana-mostafa-3.png",
    linkedin: "https://www.linkedin.com/in/jana-mostafa-535ab62a2",
  },
  {
    name: "Omar Abdelbary",
    role: "Chief Operating Officer",
    photo: "/team/omar-abdelbary-3.png",
    linkedin: "https://www.linkedin.com/in/omar-abdelbary-98b56021a",
  },
];
