import App from '@/app';
import validateEnv from '@utils/validateEnv';

console.log('🛠 STEP 1: Starting server...');
validateEnv();
 
console.log('🛠 STEP 2: Initializing App...');
const app = new App();

console.log('🛠 STEP 3: Starting to listen...');
app.listen();
console.log('🛠 STEP 4: Server is running...');