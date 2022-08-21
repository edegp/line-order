import * as functions from "firebase-functions";
import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";

export const ErrorHandler = {
  noParams: new functions.https.HttpsError(
    "invalid-argument",
    process.env.MSG_ERROR_NOPARAM as string
  ),
  invalidParams: (em: string) =>
    new functions.https.HttpsError("invalid-argument", em),
  notFound: (em: string) => new functions.https.HttpsError("not-found", em),
  internal: (em = "Error") => new functions.https.HttpsError("internal", em),
  permision: (em: string) =>
    new functions.https.HttpsError("permission-denied", em),
};
