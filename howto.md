# Run the project locally

This project has a Vite/React frontend, an Express backend, and a MongoDB
database. The backend reads its environment variables from the project-root
`.env` file.

## Prerequisites

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB connection URI

## 1. Configure the environment

From the project root, create a `.env` file. You can copy `example-env.env` as a
starting point, then replace the values with your own:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/huxnStore
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
USD_TO_NPR_RATE=replace-with-current-usd-to-npr-rate
KHALTI_SECRET_KEY=replace-with-your-khalti-sandbox-secret-key
```

`PORT`, `MONGO_URI`, and `JWT_SECRET` are needed by the backend. The payment
settings enable Khalti sandbox checkout; eSewa uses the QR flow below.
`USD_TO_NPR_RATE` must be a
positive, current USD-to-NPR rate. Catalog and order prices are stored
internally in USD and shown in NPR using this rate; admin product forms accept
NPR and convert it for storage. Payment gateways charge in NPR using the same
rate. Do not leave the example placeholder in `.env`; a numeric local test
value could look like `USD_TO_NPR_RATE=134`, but use the current rate for
accurate pricing. After changing it, restart the backend. Get a Khalti sandbox
secret from its [test merchant portal](https://test-admin.khalti.com/). Never
put live keys in source control. `ADMIN_EMAIL` is used only by the admin setup
command below. Keep real credentials in `.env`, not in source control. The root
`.gitignore` excludes `.env` and uploaded images from new Git changes. If `.env`
was already tracked or committed, ignoring it will not remove it from Git
history; do not commit local credentials.

For manual eSewa QR payments, add your QR image as
`frontend/public/esewa-qr.jpg`. Buyers scan it and submit a payment request;
admins review the request on the order page and confirm or reject it after
checking the eSewa account. The buyer's order page updates while it is open,
and their order list shows the latest payment status.

The example MongoDB URI expects MongoDB to be listening on this computer at
`127.0.0.1:27017`. To use MongoDB Atlas or another server, set `MONGO_URI` to
that database's connection string instead.

## 2. Install dependencies

Run these commands from the project root:

```sh
npm install
npm install --prefix frontend
```

The first command installs backend and root-level tools. The second installs
the frontend dependencies.

## 3. Load the sample household catalog

After MongoDB is running and the root `.env` is configured, run this once from
the project root:

```sh
npm run seed
```

This retrieves products from [Fake Store API](https://fakestoreapi.com/products)
and the first 30 products from [DummyJSON](https://dummyjson.com/products) into
MongoDB. The website reads these saved products through its own backend, so
product details and checkout continue using the same database. The command is
safe to rerun and removes only the exact household sample products from the
older seed; it leaves other products alone. Product images are served by the
source APIs. API prices are stored internally as USD; the storefront displays
them in NPR using `USD_TO_NPR_RATE`, and payment gateways charge in NPR.

## 4. Start the application

Start both frontend and backend together from the project root:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite
forwards `/api/` and `/uploads/` requests to the backend at
`http://localhost:5000`. The backend connects to MongoDB using `MONGO_URI`.
The shopper and admin pages use this same frontend and port; open the admin
dashboard at `http://localhost:5173/admin/dashboard`. Run the frontend only
once—if port `5173` is already occupied, Vite now reports the conflict instead
of silently starting a duplicate app on another port.

Stop both development servers with `Ctrl+C` in the terminal running
`npm run dev`.

## Create your admin account

1. Register an account in the app with the username `admin`, your email, and a
   strong password you choose. Do not use a shared default password.
2. Set `ADMIN_EMAIL` in the root `.env` to that account's email.
3. With MongoDB connected, run:

   ```sh
   npm run make-admin
   ```

4. Sign in at `/login` using the username or email and your chosen password.
   Admins are redirected to `/admin/dashboard`. Create a category in the Admin
   menu before adding products at `/admin/productlist`; each product needs an
   image, name, price, category, pack quantity, brand, description, and stock
   count. Product images can be JPG, PNG, or WebP. Newly created products are
   shown first in the shopper catalog.

### Start frontend and backend separately

If you prefer separate terminals, run one backend and one frontend command
from the project root. Do not start `npm run frontend` twice.

Terminal 1 — backend:

```sh
npm run backend
```

Terminal 2 — frontend:

```sh
npm run frontend
```

Then open [http://localhost:5173](http://localhost:5173). Stop each process
with `Ctrl+C` in its terminal.

## Useful checks

- The backend logs a successful MongoDB connection and reports its listening
  port in the terminal.
- The frontend is served by Vite, normally at `http://localhost:5173`.
- If the backend cannot connect to MongoDB, check that MongoDB is running and
  that `MONGO_URI` is correct.
- If the frontend cannot reach the API, make sure the backend is listening on
  port `5000`. The Vite proxy target is configured in `frontend/vite.config.js`;
  update it too if you change the backend port.
- If payment checkout cannot start, confirm `USD_TO_NPR_RATE` and the selected
  gateway's sandbox key are set in the root `.env`, then restart the backend.
- Payment callbacks use local URLs by default. For testing on a remote device
  or deployment, set `FRONTEND_URL` and `BACKEND_URL` to publicly reachable
  HTTPS URLs before starting the payment flow.
