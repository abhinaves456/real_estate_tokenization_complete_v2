
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "../metadata/indian_properties.json");
  // fallback to project metadata if exists in public
  const fallback = path.join(process.cwd(), "../../metadata/indian_properties.json");
  let fp = filePath;
  if (!fs.existsSync(fp)) fp = fallback;
  if (!fs.existsSync(fp)) {
    return res.status(404).json([]);
  }
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  res.status(200).json(data);
}
