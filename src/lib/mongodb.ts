import { MongoClient, Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://playoedappal99_db_user:playoedappal99@playo.do5qida.mongodb.net/playo?retryWrites=true&w=majority&appName=playo";

const options = {
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoDbInstance: Db | undefined;
  var _mongoIndexesInitialized: boolean | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

const defaultDbName = process.env.MONGODB_DB || "playo";

export async function getDatabase(dbName?: string): Promise<Db> {
  const target = dbName || defaultDbName;
  const connectedClient = await clientPromise;
  const db = connectedClient.db(target);

  // Initialize essential indexes asynchronously once in the background
  if (!global._mongoIndexesInitialized) {
    global._mongoIndexesInitialized = true;
    (async () => {
      try {
        await Promise.allSettled([
          db.collection("products").createIndex({ id: 1 }, { unique: true }),
          db.collection("products").createIndex({ categorySlug: 1 }),
          db.collection("products").createIndex({ createdAt: -1 }),
          db.collection("products").createIndex({ soldCount: -1 }),
          db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
          db.collection("orders").createIndex({ id: 1 }, { unique: true }),
          db.collection("orders").createIndex({ createdAt: -1 }),
          db.collection("carts").createIndex({ cartId: 1 }, { unique: true }),
        ]);
      } catch (e) {
        console.warn("Index initialization notice:", e);
      }
    })();
  }

  return db;
}
