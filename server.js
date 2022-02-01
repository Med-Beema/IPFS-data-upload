const { urlencoded } = require("express");
const express = require("express");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv").config();
const upload = require("./FileUtils");
const fleek = require("@fleekhq/fleek-storage-js");
const fs = require("fs");

const app = express();
const router = express.Router();
app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

const port = 3000;
const apiKey = process.env.FLEEK_API_KEY;
const apiSecret = process.env.FLEEK_API_SECRET;

let formData = {};

const uploadToFleek = async (data, filename, imageName) => {
    const input = {
        apiKey,
        apiSecret,
        key: `MedBeema/${filename}`,
        data,
    };

    try {
        const result = await fleek.upload(input);
        console.log(result);
        return result;
    } catch (e) {
        console.log("error", e);
    }
};

const uploadIpfs = async (filePath, fileName) => {
    const file = fs.readFileSync(filePath);
    try {
        const uploadedFile = await uploadToFleek(file, fileName);
        if (uploadedFile) {
            return {
                hash: uploadedFile.hash,
                publicUrl: uploadedFile.publicUrl,
            };
        }
    } catch (e) {
        return false;
    }
};

const imageUpload = async (req, res) => {
    console.log(req.file);
    const file = req.file;
    const fileName = file.filename;
    const filePath = `${__dirname}\\${file.path}`;

    const fileHash = await uploadIpfs(filePath, fileName);

    if (fileHash) {
        fs.unlink(filePath, (err) => {
            if (err) console.log(err);
        });

        res.status(200).json({
            success: true,
            message: "Image Added",
            id: fileHash.hash,
            image: fileHash.publicUrl,
        });
    } else {
        res.status(400).json({
            success: false,
        });
    }
};

const jsonUpload = async (req, res) => {
    const formData = JSON.stringify(req.body);
    // console.log(formData);
    const fileName = `${req.body.name}-${Date.now()}.json`;

    const fileHash = await uploadToFleek(formData, fileName);
    if (fileHash) {
        res.status(200).json({
            success: true,
            message: "JSON Added",
            id: fileHash.hash,
            image: fileHash.publicUrl,
        });
    } else {
        res.status(400).json({
            success: false,
        });
    }
};

router.post("/api/uploadImage", upload, imageUpload);
router.post("/api/data", upload, jsonUpload);

app.use("/", router);
app.listen(port, () => {
    console.log(`server running at port ${port}`);
});
