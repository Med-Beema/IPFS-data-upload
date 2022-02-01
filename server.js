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

const uploadToFleekJson = async (data, filename, imageName) => {
    const input = {
        apiKey,
        apiSecret,
        key: `MedBeema/${filename}.json`,
        data,
    };

    try {
        const result = await fleek.upload(input);
        console.log(result);
        return result.publicUrl;
    } catch (e) {
        console.log("error", e);
        return false;
    }
};

const uploadImage = (imageName, imageFileName, onSuccess) => {
    const filePath = path.join(__dirname, `./public/uploads/${imageFileName}`);
    console.log(filePath);

    fs.readFile(filePath, async (err, imageFile) => {
        try {
            let result = await uploadToFleek(
                imageFile,
                imageFileName,
                imageName
            );
            if (result) {
                onSuccess(result.publicUrl);
            }
            // .then(() => {
            //     console.log(formData);
            //     if (Object.keys(formData >= 4).length) saveJSONData();
            // });
        } catch (e) {
            console.log(e);
            onSuccess(false);
        }
    });
};

const imageUpload = (req, res) => {
    // const file = req.files;
    console.log(req.files);
};

router.post("/api", upload, (req, res) => {
    formData = {};
    formData.name = req.body.name;

    formData.fatherName = req.body.fatherName;
    // formData.dob = req.body.dob;
    // formData.permanentAddress = req.body.permanentAddress;
    // formData.occupation = req.body.occupation;
    // formData.contactNum = req.body.contactNum;
    // formData.identificationNum = req.body.identificationNum;
    // formData.idType = req.body.idType;
    // formData.issuedDate = req.body.issuedDate;
    // formData.issuePlace = req.body.issuePlace;

    // const photo = req.body.photo;
    // const identificationPhoto = req.body.identificationPhoto;
    // const signature = req.body.signature;
    console.log(formData);

    uploadData = async () => {
        const imageNames = ["photo", "identificationPhoto"]; //, "signature"];

        imageNames.forEach((imageName, index) => {
            const imageFileName = req.files[imageName][0].filename;
            uploadImage(imageName, imageFileName, (imageURL) => {
                console.log("imageURL", JSON.stringify(imageURL, null, 2));
                if (imageURL) {
                    formData[imageName] = imageURL;
                    console.log(formData);

                    if (index === imageNames.length - 1) {
                        uploadToFleekJson(JSON.stringify(formData)).then(
                            (d) => {
                                if (d) {
                                    console.log("final JOSN", d);
                                    res.json(d);
                                    res.end();
                                }
                            }
                        );
                    }
                }
            });
            // console.log(req.files);
        });
    };
    if (req.files) {
        uploadData();
    }
});

router.post("/api/uploadImage", upload, imageUpload);
app.use("/", router);

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});
