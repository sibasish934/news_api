import { supportMimeTypes } from "../config/supportedMimeTypes.js";
import {v4 as uuidv4} from "uuid";
import fs from "fs";

export const imageValidator =  (size, mime)=>{
    if(bytesToMB(size) > 2){
        return "Image size should be less than 2 MB"
    }else if(!supportMimeTypes.includes(mime)){
        return "Image should be of the type as png,jpg,jpeg,gif,webp"
    }else{
        return null
    }
}

export const bytesToMB = (bytes)=>{
    return bytes / (1024 * 1024);
}

export const generateRandomNum = ()=>{
    return uuidv4();
}

export const generateUrl = (imgName)=>{
    const imageUrl = `${process.env.APP_URL}/newsImages/${imgName}`
    return imageUrl;
}

// remove the older image from the server:- 

export const removeImage = (imgName)=>{
    const path = process.cwd() + "/public/newsImages/" + imgName;
    console.log(path)
    if(fs.existsSync(path)){
        fs.unlinkSync(path)
    }
};

export const uploadImage = (image) => {
    const imgExt = image?.name.split(".");
    const imageName = generateRandomNum() + "." + imgExt[1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;
    image.mv(uploadPath, (err) => {
      if (err) throw err;
    });
  
    return imageName;
  };