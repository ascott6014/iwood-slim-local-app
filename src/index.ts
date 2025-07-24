import './config'; // Load environment variables
import { getCustomers} from './models/customerModel' 
import express, {Express} from 'express';
import { handleCustomerAndRepair, handleRepairForCustomer } from './controllers/repairController';
import { handleCreateCustomerOrder, handleCreateOrderForCustomer } from './controllers/orderController';
import { handleCreateCustomerInstall, handleCreateInstallForCustomer } from './controllers/installController';
import { handleGetCustomers, handleCustomerSearch, handleCreateNewCustomer } from './controllers/customerController';




const PORT = process.env.PORT;
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded( {extended: true}));
app.use(express.static('public', {extensions: ['html']}));
app.use(express.json());


// Endpoints
app.post('/createCustomer', handleCreateNewCustomer); 
app.post('/repairs/create-customer-repair', handleCustomerAndRepair);
app.post('/repairs/create-repair', handleRepairForCustomer ); 
app.post('/orders/create-customer-order', handleCreateCustomerOrder);
app.post('/orders/create-order', handleCreateOrderForCustomer);
app.post('/installs/create-customer-install', handleCreateCustomerInstall);
app.post('/create-install', handleCreateInstallForCustomer);

app.get('/api/customers', handleGetCustomers);
app.get('/api/customers/search', handleCustomerSearch);


const customers = await getCustomers();
app.listen(PORT, () => {
    console.log(`Server listening on  http://localhost:${PORT}`);
    
    console.log(customers);
});




