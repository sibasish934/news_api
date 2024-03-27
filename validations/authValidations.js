import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomsErrorReporter.js";

vine.errorReporter = ()=> new CustomErrorReporter();

export const schema = vine.object({
    name: vine.string().minLength(2).maxLength(191),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(100).confirmed()
});


export const loginScheme = vine.object({
    email: vine.string().email(),
    password: vine.string()
})