const PORT = Number(process.env.PORT) || 3000;
const express = require('express');
const bodyParser = require ('body-parser');
var Datastore = require('@google-cloud/datastore');

const app = express();
app.enable('trust proxy');

app.use(express.json());
app.use(bodyParser.json());

const router = express.Router();
app.use(router);

const datastore = new Datastore();
const customerKey = datastore.key(['customer']);

app.get('/', async (req, res, next) => {
  try {
    res.json("Hello World");
  } catch (error) {
    res.status(400).json(error);
  }
});

/*
Get the Customer for given customerId
Http Get method is used to get data from Database
*/
router.get("/customer", async (req, res, next) => {
  try {
    console.log("Get a Customer with ID:",req.query.id);
       if(req.query.id==null){
      res.status(400).json({"resString":"Bad Request Please provide Customer ID"});
    }
    const query = datastore
  .createQuery('customer')
  .filter('customerId', '=', req.query.id);
  const [customers] = await datastore.runQuery(query);
  console.log('customers:');
  if (customers.length==0){
    res.status(200).json({"resString":"No Customer found for this ID"});
  }
  customers.forEach(customer => console.log(customer));
    res.status(200).json(customers[0]);
  } catch (error) {
    console.log("Error: ",error);
    res.status(400).json(error);
  }
});

/*
Get all the Customers
Http Get method is used to get data from Database
*/

router.get("/allCustomers", async (req, res, next) => {
  console.log("Fetching All the Customers");
  try {
    const query = datastore.createQuery(`customer`);
    const [customers] = await datastore.runQuery(query);
    /*if (customers.lenght==0){
      res.status(404).json({"resString":"There is no Customers to be found"});
    }
    */
    const allCustomers = customers.map((customer) => ({ id: customer[datastore.KEY].id, ...customer }));

    res.status(200).json(allCustomers);
  } catch (error) {
    console.log("Error: ",error);
    res.status(400).json(error);
  }
});


/*
Add New Customer
Http post method is used to create new entity in Database
According to REST framework suggests, that url should contain noun only
*/
app.post('/customer', async (req, res, next) => {
  console.log("New Customer: ", JSON.stringify(req.body));
  const newCustomer = {
    key: customerKey,
    data: req.body,
  };
  try {
    await datastore.save(newCustomer);
    res.status(201).json("Record created successfully");
  } catch (error) {
    console.log("Error: ",error);
    res.status(400).json(error);
  }
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
