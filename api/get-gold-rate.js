export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ৩ সেকেন্ডের মধ্যে রেট না পেলে সাথে সাথে রেসপন্স করার ব্যবস্থা
  const fetchWithTimeout = async (url, ms = 3500) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (response.ok) return await response.text();
    } catch (e) {
      clearTimeout(id);
    }
    return null;
  };

  try {
    let text = await fetchWithTimeout("https://r.jina.ai/https://www.bajus.org/gold-price", 3500);
    
    if (!text) {
      text = await fetchWithTimeout("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.bajus.org/gold-price"), 2500);
    }

    const rates = {
      k22: { vori: "", gram: "" },
      k21: { vori: "", gram: "" },
      k18: { vori: "", gram: "" },
      sn:  { vori: "", gram: "" }
    };

    if (text) {
      const lines = text.split('\n');
      lines.forEach(line => {
        const cleanLine = line.trim();
        const lower = cleanLine.toLowerCase();
        const numbers = cleanLine.match(/[\d,]{4,}/g);

        if (numbers && numbers.length >= 1) {
          let vori = numbers[0];
          let numVori = parseInt(vori.replace(/,/g, ''));
          let gram = numbers.length >= 2 ? numbers[1] : Math.round(numVori / 11.664).toLocaleString('en-IN');

          if ((lower.includes("22") || lower.includes("২২")) && !rates.k22.vori) {
            rates.k22 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if ((lower.includes("21") || lower.includes("২১")) && !rates.k21.vori) {
            rates.k21 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if ((lower.includes("18") || lower.includes("১৮")) && !rates.k18.vori) {
            rates.k18 = { vori: "৳ " + vori, gram: "৳ " + gram };
          } else if ((lower.includes("sonaton") || lower.includes("সনাতন") || lower.includes("traditional")) && !rates.sn.vori) {
            rates.sn = { vori: "৳ " + vori, gram: "৳ " + gram };
          }
        }
      });
    }

    // স্ক্র্যাপ না হলে ইনস্ট্যান্ট ফলব্যাক রেট ব্যাকআপ হিসেবে কাজ করবে
    if (!rates.k22.vori) {
      rates.k22 = { vori: "৳ 1,38,000", gram: "৳ 11,831" };
      rates.k21 = { vori: "৳ 1,31,700", gram: "৳ 11,291" };
      rates.k18 = { vori: "৳ 1,12,900", gram: "৳ 9,679" };
      rates.sn  = { vori: "৳ 93,100",  gram: "৳ 7,982" };
    }

    res.status(200).json({ success: true, data: rates });

  } catch (error) {
    // কোনো ত্রুটি হলেও তৎক্ষণাৎ রেট শো করাবে
    res.status(200).json({
      success: true,
      data: {
        k22: { vori: "৳ 1,38,000", gram: "৳ 11,831" },
        k21: { vori: "৳ 1,31,700", gram: "৳ 11,291" },
        k18: { vori: "৳ 1,12,900", gram: "৳ 9,679" },
        sn:  { vori: "৳ 93,100",  gram: "৳ 7,982" }
      }
    });
  }
}
