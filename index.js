const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
app.use(cors({
    origin:['https://jazzy-meringue-09a5cf.netlify.app','http://localhost:5173'],
    credentials:true
  }));
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sykxlbw.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const taskCollection = client.db('task-management').collection('tasks')
        
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })
      
        app.patch('/tasks/:id',async(req,res)=>{
        const id=req.params.id
        const filter={_id: new ObjectId(id)}
        const updatedInfo = req.body
        const updatedDoc={
            $set:{
                title:updatedInfo.title,
                description:updatedInfo.description,
                deadline:updatedInfo.deadline,
                priority:updatedInfo.priority,
                status:updatedInfo.status
            }
        }
        const result=await taskCollection.updateOne(filter,updatedDoc)
        res.send(result)
       })
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/tasks', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/tasks', async (req, res) => {
            const taskInfo = req.body
            const result = await taskCollection.insertOne(taskInfo)
            res.send(result)
        })
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})