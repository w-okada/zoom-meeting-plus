const fs = require("fs");
const path = require("path");
const { format } = require("util");

const resourceRoute = path.join(".", "public", "motions");
const outputifle = path.join(".", "src", "motions.json");

const motionFiles = fs
    .readdirSync(resourceRoute, { withFileTypes: true })
    .filter((f) => f.isFile())
    .map((f) => {
        return f.name;
        // const motionName = f.name.split(".")[0];
        // const filename = path.join(resourceRoute, f.name);
        // const data = JSON.parse(fs.readFileSync(filename, "utf8"));
        // motionDatas[motionName] = data;
    });

try {
    fs.writeFileSync(outputifle, JSON.stringify(motionFiles));
} catch (e) {
    console.log(e);
}
