module.exports = (req, res) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=3600"
  );

  res.status(200).json({
    success: true,
    regions: [
      {code:"VN",name:"Việt Nam",flag:"🇻🇳"},
      {code:"SG",name:"Singapore",flag:"🇸🇬"},
      {code:"ID",name:"Indonesia",flag:"🇮🇩"},
      {code:"TH",name:"Thái Lan",flag:"🇹🇭"},
      {code:"TW",name:"Đài Loan",flag:"🇹🇼"},
      {code:"BR",name:"Brazil",flag:"🇧🇷"},
      {code:"US",name:"Hoa Kỳ",flag:"🇺🇸"},
      {code:"SAC",name:"Nam Mỹ",flag:"🌎"},
      {code:"NA",name:"Bắc Mỹ",flag:"🌎"},
      {code:"EU",name:"Châu Âu",flag:"🇪🇺"},
      {code:"ME",name:"Trung Đông",flag:"🌍"},
      {code:"IND",name:"Ấn Độ",flag:"🇮🇳"},
      {code:"PK",name:"Pakistan",flag:"🇵🇰"},
      {code:"BD",name:"Bangladesh",flag:"🇧🇩"},
      {code:"RU",name:"Nga",flag:"🇷🇺"},
      {code:"CIS",name:"CIS",flag:"🌐"}
    ]
  });
};
