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

//After async code executes
const uploadJSONData = async () => {
    console.log("inside upload json ", formData);
    // fs.writeFile(
    //     `./public/uploads/${formData.name + "-" + Date.now()}.json`,
    //     JSON.stringify(formData),
    //     (error) => {
    //         if (error) throw error;
    //     }
    // );

    const filePath = path.join(
        __dirname,
        `./public/uploads/${formData.name}.json`
    );
    // fs.readFile(filePath, async (err, data) => {
    //if (!err) {
    //console.log(data);

    // let result = await uploadToFleek(formData, `${formData.name}.json`);
    // console.log(result);
    // return result.publicUrl;

    //}
    // });
    // res.send(JSON.stringify(formData));
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
        // console.log(req.files["photo"][0].filename);

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

    // res.send(data);
    // console.log(JSON.stringify(data));

    //res.send(formData);
});

app.use("/", router);

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});

// const data = {
//     name: name,
//     fatherName: fatherName,
//     dob: dob,
//     permanentAddress: permanentAddress,
//     occupation: occupation,
//     contactNum: contactNum,
//     photo: photo,
//     identificationNum: identificationNum,
//     idType: idType,
//     issuedDate: issuedDate,
//     issuePlace: issuePlace,
//     identificationPhoto: identificationPhoto,
//     signature: signature,
// };
