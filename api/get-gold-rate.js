export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  try {
    // BAJUS-এর সোর্স পেজ লোড করার চেষ্টা
    const response = await fetch("https://www.bajus.org/gold-price", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    const html = await response.text();
    
    //Regex প্যাটার্ন: কীওয়ার্ডের পর যত সংখ্যা আছে সব তুলে আনবে
    const getRate = (keyword) => {
      // Regex যা "22" বা "২২" এর পরে থাকা সংখ্যাগুলো খুঁজে বের করবে
      const regex = new RegExp(`${keyword}[^\\d]*?([\\d,]{4,})`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const data = {
      k22: { vori: getRate("22") || "1,38,000", gram: "" },
      k21: { vori: getRate("21") || "1,31,700", gram: "" },
      k18: { vori: getRate("18") || "1,12,900", gram: "" },
      sn:  { vori: getRate("সনাতন|sonaton") || "93,100", gram: "" }
    };

    res.status(200).json({ success: true, data: data });

  } catch (error) {
    // এরর হলে আগের রেটগুলোই পাঠাবে যাতে সাইট ক্রাশ না করে
    res.status(200).json({
      success: true,
      data: {
        k22: { vori: "1,38,000", gram: "11,831" },
        k21: { vori: "1,31,700", gram: "11,291" },
        k18: { vori: "1,12,900", gram: "9,679" },
        sn:  { vori: "93,100", gram: "7,982" }
      }
    });
  }
}
