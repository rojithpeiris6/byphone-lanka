import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very basic .env parser for Node without dotenv
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.replace(/\\n/gm, '\n');
      }
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials for RSS generation.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateRss() {
  const baseUrl = "https://buyphone.lk";
  
  const { data: products } = await supabase
    .from("products")
    .select("name, slug, description, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>buyphone.lk - Latest Products</title>
    <link>${baseUrl}</link>
    <description>The latest 100% genuine smartphones and tech accessories from buyphone.lk.</description>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

  if (products) {
    for (const product of products) {
      const pubDate = new Date(product.created_at || Date.now()).toUTCString();
      const safeDesc = (product.description || product.name);
      
      xml += `    <item>
      <title><![CDATA[${product.name}]]></title>
      <link>${baseUrl}/product/${product.slug}</link>
      <guid>${baseUrl}/product/${product.slug}</guid>
      <description><![CDATA[${safeDesc}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>\n`;
    }
  }

  xml += `  </channel>\n</rss>`;

  const publicDir = path.resolve(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, "rss.xml"), xml);
  console.log("RSS generated successfully at public/rss.xml");
}

generateRss().catch(console.error);
