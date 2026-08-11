export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // একাধিক সোর্স থেকে ডাটা আনার চেষ্টা করা হবে যেন ব্লক না খায়
  const urlsToTry = [
    "https://www.bajus.org/gold-price",
    "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.bajus.org/gold-price"),
    "https://corsproxy.io/?" + encodeURIComponent("https://www.bajus.org/gold-price")
  ];

  let html = "";

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.includes("22") && (text.includes("gram") || text.includes("গ্রাম") || text.includes("vori") || text.includes("ভরি"))) {
          html = text;
          break; // ডাটা সফলভাবে পেলে লুপ বন্ধ হবে
        }
      }
    } catch (e) {
      console.error("Fetch failed for URL:", url, e);
    }
  }

  if (!html) {
    return res.status(500).json({ success: false, error: "Unable to fetch BAJUS data" });
  }

  try {
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
        const cleanRow = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
        
        // নাম্বার এবং কমা এক্সট্র্যাক্ট করা
        const numbers = cleanRow.match(/[\d,]+/g) || [];
        
        if (numbers.length >= 2) {
          const vori = numbers[0];
          const gram = numbers[1];

          if (cleanRow.includes("22")) {
            rates.k22 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if (cleanRow.includes("21")) {
            rates.k21 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if (cleanRow.includes("18")) {
            rates.k18 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if (cleanRow.includes("sonaton") || cleanRow.includes("সনাতন")) {
            rates.sn = { vori: "৳ " + vori, gram: "৳ " + gram };
          }
        }
      }
    });

    res.status(200).json({ success: true, data: rates });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
