const sdk = require('node-appwrite');

// Configuration
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const Permission = sdk.Permission;
const Role = sdk.Role;

// REPLACE THESE WITH YOUR VALUES
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '693a9ab8003b744ba19c'; // Your Project ID
const API_KEY = 'standard_1fdaaaec785fa70d1b1185944adeaf3d038ecc60a41c4048c82d1fbf299aca3a6701b0734d13a84e75fcc9808a34ad045c6155558840d6df4b76bb35653bfa96d48f59409dfb079d5b804bc06209b1adf1a5ce8311984f63efa3fd6769b4ba93c4fa313902c290dc85d9664bcbd0618702ca3f1c714c7d975bee2d5fa67d8283'; // Create an API Key in Console with 'databases.write' scope

const DATABASE_ID = 'habit-goals-db';
const ENTRIES_COLLECTION_ID = 'entries';
const SETTINGS_COLLECTION_ID = 'settings';
const USERS_COLLECTION_ID = 'users';

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

async function init() {
    try {
        console.log('Checking Database...');
        let dbId = DATABASE_ID;
        try {
            await databases.get(DATABASE_ID);
            console.log('Database already exists.');
        } catch (e) {
            console.log('Database not found with ID ' + DATABASE_ID);
            console.log('Checking for existing databases...');
            const dbs = await databases.list();
            if (dbs.total > 0) {
                dbId = dbs.databases[0].$id;
                console.log(`Using existing database: ${dbs.databases[0].name} (${dbId})`);
                console.log('IMPORTANT: Please update src/app/core/config/appwrite.config.ts with this DATABASE_ID: ' + dbId);
            } else {
                console.log('Creating Database...');
                await databases.create(DATABASE_ID, 'Habit Goals DB');
                console.log('Database created.');
            }
        }

        // --- ENTRIES COLLECTION ---
        console.log('Checking Entries Collection...');
        try {
            await databases.getCollection(dbId, ENTRIES_COLLECTION_ID);
            console.log('Entries Collection already exists.');
        } catch (e) {
            console.log('Creating Entries Collection...');
            await databases.createCollection(dbId, ENTRIES_COLLECTION_ID, 'Entries');
            console.log('Entries Collection created.');
        }

        console.log('Creating Attributes for Entries...');
        // goals (JSON string)
        try {
            await databases.createStringAttribute(dbId, ENTRIES_COLLECTION_ID, 'goals', 10000, false);
            console.log('Created attribute: goals');
        } catch (e) { console.log('Attribute goals likely exists.'); }

        // reflection
        try {
            await databases.createStringAttribute(dbId, ENTRIES_COLLECTION_ID, 'reflection', 5000, false);
            console.log('Created attribute: reflection');
        } catch (e) { console.log('Attribute reflection likely exists.'); }

        // mood
        try {
            await databases.createStringAttribute(dbId, ENTRIES_COLLECTION_ID, 'mood', 50, false);
            console.log('Created attribute: mood');
        } catch (e) { console.log('Attribute mood likely exists.'); }

        // image
        try {
            await databases.createStringAttribute(dbId, ENTRIES_COLLECTION_ID, 'image', 5000, false);
            console.log('Created attribute: image');
        } catch (e) { console.log('Attribute image likely exists.'); }


        // --- SETTINGS COLLECTION ---
        console.log('Checking Settings Collection...');
        try {
            await databases.getCollection(dbId, SETTINGS_COLLECTION_ID);
            console.log('Settings Collection already exists.');
        } catch (e) {
            console.log('Creating Settings Collection...');
            await databases.createCollection(dbId, SETTINGS_COLLECTION_ID, 'Settings');
            console.log('Settings Collection created.');
        }

        console.log('Creating Attributes for Settings...');
        // username
        try {
            await databases.createStringAttribute(dbId, SETTINGS_COLLECTION_ID, 'username', 100, false);
            console.log('Created attribute: username');
        } catch (e) { console.log('Attribute username likely exists.'); }

        // darkMode
        try {
            await databases.createBooleanAttribute(dbId, SETTINGS_COLLECTION_ID, 'darkMode', false);
            console.log('Created attribute: darkMode');
        } catch (e) { console.log('Attribute darkMode likely exists.'); }

        // focusDuration (minutes)
        try {
            await databases.createIntegerAttribute(dbId, SETTINGS_COLLECTION_ID, 'focusDuration', false, 0, 60, 5);
            console.log('Created attribute: focusDuration');
        } catch (e) { console.log('Attribute focusDuration likely exists.'); }

        // dailyGoalTarget
        try {
            await databases.createIntegerAttribute(dbId, SETTINGS_COLLECTION_ID, 'dailyGoalTarget', false, 1, 20, 3);
            console.log('Created attribute: dailyGoalTarget');
        } catch (e) { console.log('Attribute dailyGoalTarget likely exists.'); }


        // --- USERS COLLECTION ---
        console.log('Checking Users Collection...');
        try {
            await databases.getCollection(dbId, USERS_COLLECTION_ID);
            console.log('Users Collection already exists.');
        } catch (e) {
            console.log('Creating Users Collection...');
            await databases.createCollection(dbId, USERS_COLLECTION_ID, 'Users');
            console.log('Users Collection created.');
        }

        console.log('Creating Attributes for Users...');
        // email
        try {
            await databases.createStringAttribute(dbId, USERS_COLLECTION_ID, 'email', 255, true);
            console.log('Created attribute: email');
        } catch (e) { console.log('Attribute email likely exists.'); }

        // name
        try {
            await databases.createStringAttribute(dbId, USERS_COLLECTION_ID, 'name', 128, false);
            console.log('Created attribute: name');
        } catch (e) { console.log('Attribute name likely exists.'); }


        console.log('Updating Collection Permissions...');
        try {
            // Enable Document Security and allow users to create documents
            await databases.updateCollection(
                dbId, 
                ENTRIES_COLLECTION_ID, 
                'Entries', 
                [Permission.create(Role.users())], 
                true // Document Security
            );
            console.log('Updated Entries permissions: Document Security ON, Users can Create.');

            await databases.updateCollection(
                dbId, 
                SETTINGS_COLLECTION_ID, 
                'Settings', 
                [Permission.create(Role.users())], 
                true // Document Security
            );
            console.log('Updated Settings permissions: Document Security ON, Users can Create.');

            await databases.updateCollection(
                dbId, 
                USERS_COLLECTION_ID, 
                'Users', 
                [Permission.create(Role.users())], 
                true // Document Security
            );
            console.log('Updated Users permissions: Document Security ON, Users can Create.');
        } catch (e) {
            console.log('Error updating permissions: ' + e.message);
        }

        console.log('------------------------------------------------');
        console.log('Initialization Complete!');
        console.log('Please wait a few minutes for attributes to be indexed by Appwrite.');

    } catch (error) {
        console.error('Error initializing Appwrite:', error);
    }
}

init();
