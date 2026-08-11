export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch("https://www.bajus.org/gold-price", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from BAJUS");
    }

    const html = await response.text();

    const rates = {
      k22: { vori: "", gram: "" },
      k21: { vori: "", gram: "" },
      k18: { vori: "", gram: "" },
      sn:  { vori: "", gram: "" }
    };

    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];

    rowMatches.forEach(row => {
      const cols = row.match(/<td[\s\S]*?<\/td>/gi) || [];
      if (cols.length >= 2) {
        const cleanText = row.replace(/<[^>]+>/g, '').toLowerCase();
        const vori = cols[1].replace(/<[^>]+>/g, '').trim();
        const gram = cols.length >= 3 ? cols[2].replace(/<[^>]+>/g, '').trim() : "";

        if (cleanText.includes("22")) {
          rates.k22 = { vori, gram };
        } else if (cleanText.includes("21")) {
          rates.k21 = { vori, gram };
        } else if (cleanText.includes("18")) {
          rates.k18 = { vori, gram };
        } else if (cleanText.includes("sonaton") || cleanText.includes("সনাতন")) {
          rates.sn = { vori, gram };
        }
      }
    });

    res.status(200).json({ success: true, data: rates });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
