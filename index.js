import admin from "firebase-admin";
import sdk from "node-appwrite";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new sdk.Users(client);

export default async ({ req, res }) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.json({ error: "Missing token" }, 401);
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email || `${uid}@firebase.local`;

    try {
      // Try get user
      await users.get(uid);
    } catch {
      // Create user in Appwrite if not exist
      await users.create(uid, email, null, uid);
    }

    return res.json({ success: true, uid });
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }
};
