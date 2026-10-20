import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Prevent 'querySrv ECONNREFUSED' errors caused by local ISP/Windows DNS blocking SRV lookups
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const DEFAULT_DIRECT_URI =
  "mongodb://playoedappal99_db_user:playoedappal99@ac-sbk8u0i-shard-00-00.do5qida.mongodb.net:27017,ac-sbk8u0i-shard-00-01.do5qida.mongodb.net:27017,ac-sbk8u0i-shard-00-02.do5qida.mongodb.net:27017/playo?ssl=true&replicaSet=atlas-t986gu-shard-0&authSource=admin&retryWrites=true&w=majority";

const uri = process.env.MONGODB_URI || DEFAULT_DIRECT_URI;

const options = {
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 8000,
  serverSelectionTimeoutMS: 8000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoDbInstance: Db | undefined;
  var _mongoIndexesInitialized: boolean | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  return client.connect().catch((err) => {
    // Clear cache on error so subsequent requests can retry
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined;
    }
    throw err;
  });
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;

const defaultDbName = process.env.MONGODB_DB || "playo";

export async function getDatabase(dbName?: string): Promise<Db> {
  const target = dbName || defaultDbName;
  // If global promise was cleared after an error, re-create it
  if (process.env.NODE_ENV === "development" && !global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  const connectedClient = await (global._mongoClientPromise || clientPromise);
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
