require('dotenv').config();
const { initDatabase, query } = require('./config/database');

const createTables = async () => {
  const dbType = process.env.DB_TYPE || 'postgres';

  if (dbType === 'postgres') {
    // Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        issue_date DATE NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        tenure INTEGER NOT NULL,
        emi_due DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    // Create index on account_number for faster lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_customers_account_number ON customers(account_number)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date)
    `);
  } else if (dbType === 'mysql') {
    // Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        issue_date DATE NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        tenure INT NOT NULL,
        emi_due DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_customers_account_number ON customers(account_number)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date)
    `);
  }
};

const seedData = async () => {
  // Check if data already exists
  const existingCustomers = await query('SELECT COUNT(*) as count FROM customers');
  const count = existingCustomers.rows?.[0]?.count || existingCustomers.rows?.[0]?.['count'] || 0;

  if (parseInt(count) > 0) {
    console.log('Database already seeded. Skipping seed data insertion.');
    return;
  }

  // Sample customer data
  const customers = [
    {
      account_number: 'ACC001',
      issue_date: '2024-01-15',
      interest_rate: 12.5,
      tenure: 24,
      emi_due: 15000.00
    },
    {
      account_number: 'ACC002',
      issue_date: '2024-02-20',
      interest_rate: 11.75,
      tenure: 36,
      emi_due: 12000.00
    },
    {
      account_number: 'ACC003',
      issue_date: '2024-03-10',
      interest_rate: 13.25,
      tenure: 18,
      emi_due: 18000.00
    },
    {
      account_number: 'ACC004',
      issue_date: '2024-04-05',
      interest_rate: 10.5,
      tenure: 48,
      emi_due: 10000.00
    },
    {
      account_number: 'ACC005',
      issue_date: '2024-05-12',
      interest_rate: 12.0,
      tenure: 30,
      emi_due: 14000.00
    }
  ];

  const dbType = process.env.DB_TYPE || 'postgres';
  
  // Insert customers
  for (const customer of customers) {
    if (dbType === 'postgres') {
      await query(
        `INSERT INTO customers (account_number, issue_date, interest_rate, tenure, emi_due) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (account_number) DO NOTHING`,
        [customer.account_number, customer.issue_date, customer.interest_rate, customer.tenure, customer.emi_due]
      );
    } else {
      await query(
        `INSERT IGNORE INTO customers (account_number, issue_date, interest_rate, tenure, emi_due) 
         VALUES (?, ?, ?, ?, ?)`,
        [customer.account_number, customer.issue_date, customer.interest_rate, customer.tenure, customer.emi_due]
      );
    }
  }

  // Insert sample payments
  const customer1 = await query(
    dbType === 'postgres' 
      ? 'SELECT id FROM customers WHERE account_number = $1' 
      : 'SELECT id FROM customers WHERE account_number = ?',
    ['ACC001']
  );
  const customer1Id = customer1.rows?.[0]?.id || customer1[0]?.[0]?.id;

  if (customer1Id) {
    if (dbType === 'postgres') {
      await query(
        `INSERT INTO payments (customer_id, payment_amount, payment_date, status) 
         VALUES ($1, $2, $3, $4)`,
        [customer1Id, 15000.00, '2024-06-01', 'completed']
      );
      await query(
        `INSERT INTO payments (customer_id, payment_amount, payment_date, status) 
         VALUES ($1, $2, $3, $4)`,
        [customer1Id, 15000.00, '2024-07-01', 'completed']
      );
    } else {
      await query(
        `INSERT INTO payments (customer_id, payment_amount, payment_date, status) 
         VALUES (?, ?, ?, ?)`,
        [customer1Id, 15000.00, '2024-06-01', 'completed']
      );
      await query(
        `INSERT INTO payments (customer_id, payment_amount, payment_date, status) 
         VALUES (?, ?, ?, ?)`,
        [customer1Id, 15000.00, '2024-07-01', 'completed']
      );
    }
  }

  console.log('Sample data seeded successfully!');
};

const runSeed = async () => {
  try {
    console.log('Initializing database connection...');
    await initDatabase();
    
    console.log('Creating tables...');
    await createTables();
    console.log('Tables created successfully!');
    
    console.log('Seeding data...');
    await seedData();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();

