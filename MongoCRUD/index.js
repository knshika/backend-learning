const {MongoClient} =require ('mongodb');

//step 2: list all the users of our database
async function listDatabase(client){
    const databaseLists = await client.db().admin().listDatabases();

    console.log("Databases :");
    databaseLists.databases.forEach(db=>{
        console.log(`-${db.name}`);
    })
}

//step 3: starting with CRUD operation 

//part1: single list create
async function createListing(client,newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing was created with the following id: ${result.insertedId}`)
} 

//part 2: multiple list create
async function createMultipleListing(client,newListings){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listings was created with the following id(s):`)
    // console.log(result); output:
    // {
    //     acknowledged: true,
    //     insertedCount: 3,
    //     insertedIds: {
    //       '0': new ObjectId("618561933bc5e337c014f7e7"),
    //       '1': new ObjectId("618561933bc5e337c014f7e8"),
    //       '2': new ObjectId("618561933bc5e337c014f7e9")
    //     }
    //   }
    console.log(result.insertedIds);
} 

// part 3: Reading data of given listing
async function findOneListingByName(client,nameofListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name:nameofListing});

    if(result){
        console.log(`Found a listing in the collection with name '${nameofListing}'`);
        console.log(result);
    }else{
        console.log(`No listing found with the name '${nameofListing}' `);
    }
    
} 

//part 4: Reading multiple data with some conditions and limit
async function findListingsWithMinBedroomsBathroomsAndMostRecentReviews(client,{
    minimumNoOfBedrooms = 0,
    minimumNoOfBathrooms = 0,
    maximumNoOfResults = Number.MAX_SAFE_INTEGER
}={}){
    const data = await client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms:{$gte :minimumNoOfBedrooms},
        bathrooms:{$gte: minimumNoOfBathrooms}
    }).sort({last_review:-1})
    .limit(maximumNoOfResults);

    const results = await data.toArray();

    if(results.length>0){
        console.log(`Found listing(s) with at least ${minimumNoOfBedrooms} bedrooms and ${minimumNoOfBathrooms} bathrooms:`);
        results.forEach((result,i)=>{
            const date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${date}`);
        })
    }else{
        console.log(`No listings found with at least ${minimumNoOfBedrooms} bedrooms and ${minimumNoOfBathrooms} bathrooms`);
    }

}

//part 5 : update a listing finds and update: $set, $unset , $inc
async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name:nameOfListing},{$set:updatedListing});

    console.log(result);
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//part 6 : upsert (creates the listing if does not find one to update) adv version of update
async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name:nameOfListing},{$set:updatedListing},{upsert:true});

    console.log(result);
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    if(result.upsertedCount >0){
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    }else{
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

//part 7: update many listings by passing some filter
async function updateAllListingsToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type:{$exists:false}},{$set:{property_type:"unknown"}});

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
   
}

// part 8 :  deleting a listing by given name , even if many name exist only one will be deleted 
async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name:nameOfListing});

    console.log(result);
    console.log(`${result.deletedCount} document(s) matched the query criteria.`);
    console.log(`${result.deletedCount} document was/were deleted.`);
}

//part 9: delete listings which are not created recently
async function deleteListingsScrapedBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({last_scraped:{$lt:date}});

    console.log(`${result.deletedCount} document(s) matched the query criteria.`);
    console.log(`${result.deletedCount} document was/were deleted.`);
}

//step 1: connected with your database
async function main(){

    const uri="mongodb+srv://demouser:demo12345@cluster0.curna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    try{
        await client.connect();
        //1
        // await listDatabase(client);
        
        //2
        // await createListing(client, {
        //     name:"Knshika",
        //     summary:"i dont really know",
        //     bedrooms:1,
        //     bathroom:1
        // })

        //3
        //     await createMultipleListing(client, [{
        //         name:"Knshika2",
        //         summary:"i dont really know",
        //         bedrooms:1,
        //         bathroom:1
        //     },{
        //         name:"Knshika4",
        //         summary:"i dont really know",
        //         property_type:"House", 
        //         bedrooms:2,
        //         bathroom:1
        //     },{
        //         name:"Knshika3",
        //         summary:"i dont really know",
        //         property_type:"Apartment", 
        //         bedrooms:10,
        //         bathroom:5,
        //         beds: 5
        //     }
        // ])

        //3
        // await findOneListingByName(client, "Knshika");

        //4
        //    await findListingsWithMinBedroomsBathroomsAndMostRecentReviews(client, {
        //         minimumNoOfBedrooms: 4,
        //         minimumNoOfBathrooms: 2,
        //         maximumNoOfResults: 5
        //     });

        //5
        //  await updateListingByName(client, "Knshika", { bedrooms: 6, beds: 8 });

        //6
        //    await upsertListingByName(client, "Cozy Cottage", { name: "Cozy Cottage", bedrooms: 2, bathrooms: 1 }); //try changing bathrooms now , will work as update one

        //7
        //  await updateAllListingsToHavePropertyType(client);

        //8
        // await deleteListingByName(client, "Knshi")

        //9
        await deleteListingsScrapedBeforeDate(client, new Date("2021-11-4"));


        }catch(e){
            console.log(e);
        }finally{
            await client.close();
        }
   
}

main().catch(console.error);



