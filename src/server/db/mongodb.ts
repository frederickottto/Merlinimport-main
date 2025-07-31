import { MongoClient } from "mongodb";

declare global {
	// Ensuring the global object has a specific type for _mongoClientPromise
	// This prevents the use of 'any' and adheres to TypeScript's type safety
	// eslint-disable-next-line no-var
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.DATABASE_URL;
const options = {};

if (!uri) {
	console.error("[MongoDB] DATABASE_URL is not set. Current value:", process.env.DATABASE_URL);
	throw new Error("Please add your Mongo URI to .env.local");
}

if (!/^mongodb\+srv:\/\//.test(uri)) {
	console.warn("[MongoDB] DATABASE_URL does not look like a valid MongoDB Atlas URI:", uri);
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
	// In development, use a global variable to preserve the value across module reloads
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production, it's best to not use a global variable
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

export default clientPromise;
