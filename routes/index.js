const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const IMAGE_FOLDER = "./public/images/";
const HOST_URL = process.env.HOST_URL || "http://localhost/"
const REDIRECT_URL = process.env.REDIRECT_URL || "https://example.com"

if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER, {recursive: true});
}

router.get("/", function (req, res) {
    res.redirect(REDIRECT_URL);
});

router.get("/:image", function (req, res) {
    const imageIn = req.params.image;
    const extension = imageIn.split(".").slice(-1)[0];
    const imageName = imageIn.split(".")[0];

    // clean inputs, just in case anything malicious is attempted
    const cleanImageName = imageName.replace(/[^A-Za-z0-9]/g, ""); // remove special chars
    const cleanExtension = extension.replace(/[^A-Za-z0-9]/g, "");
    const filename = cleanImageName + "." + cleanExtension;

    res.sendFile(filename,
        {root: path.join(path.dirname(__dirname), IMAGE_FOLDER)},
        (err) => {
            if (err) {
                if (err.code === "ENOENT") {  // not a valid file url
                    res.redirect(REDIRECT_URL);
                } else {
                    console.error(err);
                    res.send("Something went wrong, please try again later");
                }
            }
        });
});

router.post("/upload", function (req, res) {
    const extension = req.files.file.name.split(".").slice(-1)[0];
    const clean_name = req.body.name.replace(/[^A-Za-z0-9]/g, ""); // remove special chars
    const filename = clean_name + "." + extension;

    if (req.body.key !== process.env.KEY) {
        console.log("Upload failed: Bad key");
        res.send("Upload failed: Bad key");
    } else {
        fs.writeFile(IMAGE_FOLDER + filename, req.files.file.data, function (err) {
            if (err) {
                console.error(err);
                res.send("Image saving failed. Ask the administrator to check the server logs");
            } else {
                res.send(HOST_URL + filename);
            }
        });
    }
});

module.exports = router;
