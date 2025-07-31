import clientPromise from "./mongodb";

const client = await clientPromise;
export const db = client.db("MERLIN-db");
