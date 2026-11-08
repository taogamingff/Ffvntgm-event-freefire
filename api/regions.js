// Danh sách region được giao diện dùng để chọn máy chủ.
const regions = [
  {name:"Việt Nam",code:"VN"},{name:"Singapore",code:"SG"},{name:"Indonesia",code:"ID"},
  {name:"Thái Lan",code:"TH"},{name:"Đài Loan",code:"TW"},{name:"Brazil",code:"BR"},
  {name:"Hoa Kỳ",code:"US"},{name:"Nam Mỹ",code:"SAC"},{name:"Bắc Mỹ",code:"NA"},
  {name:"Châu Âu",code:"EU"},{name:"Trung Đông",code:"ME"},{name:"Ấn Độ",code:"IND"},
  {name:"Pakistan",code:"PK"},{name:"Bangladesh",code:"BD"},{name:"Nga",code:"RU"},
  {name:"CIS",code:"CIS"}
];
module.exports = (req,res) => {
  res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=86400");
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  res.status(200).json({status:"success",total:regions.length,regions});
};
