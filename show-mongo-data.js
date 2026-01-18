const mongoose = require('./backend/node_modules/mongoose');

// Connect to MongoDB
async function showCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');
    console.log('✅ Connected to MongoDB\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections:');
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });
    console.log('');

    // Show data from each collection
    for (const col of collections) {
      console.log(`📊 Collection: ${col.name.toUpperCase()}`);
      console.log('─'.repeat(50));

      try {
        const Model = mongoose.model(col.name, new mongoose.Schema({}, { strict: false }), col.name);
        const documents = await Model.find({}).limit(10); // Show first 10 documents

        if (documents.length === 0) {
          console.log('   (No documents found)');
        } else {
          documents.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(doc.toObject(), null, 2)}`);
          });

          if (documents.length === 10) {
            const totalCount = await Model.countDocuments();
            console.log(`   ... and ${totalCount - 10} more documents`);
          }
        }
      } catch (error) {
        console.log(`   Error reading collection: ${error.message}`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Show specific collection data
async function showCollectionData(collectionName) {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');

    const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
    const documents = await Model.find({});

    console.log(`📊 ${collectionName.toUpperCase()} Collection Data:`);
    console.log('─'.repeat(50));

    if (documents.length === 0) {
      console.log('   (No documents found)');
    } else {
      documents.forEach((doc, index) => {
        console.log(`${index + 1}.`);
        console.log(JSON.stringify(doc.toObject(), null, 2));
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  // Show specific collection
  showCollectionData(args[0]);
} else {
  // Show all collections
  showCollections();
}