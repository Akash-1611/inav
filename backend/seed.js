const { initDatabase, query } = require('./config/database');

const createTables = async () => {
  // Create customers table
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      account_number VARCHAR(50) UNIQUE NOT NULL,
      issue_date DATE NOT NULL,
      interest_rate DECIMAL(5, 2) NOT NULL,
      tenure INTEGER NOT NULL,
      emi_due DECIMAL(10, 2) NOT NULL,
      remaining_emi DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure remaining_emi exists
  await query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'remaining_emi'
      ) THEN
        ALTER TABLE customers ADD COLUMN remaining_emi DECIMAL(10, 2) DEFAULT 0;
        UPDATE customers SET remaining_emi = emi_due;
      END IF;
    END $$;
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
      CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
    )
  `);

  // Indexes
  await query(`
    CREATE INDEX IF NOT EXISTS idx_customers_account_number
    ON customers(account_number)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_payments_customer_id
    ON payments(customer_id)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_payments_payment_date
    ON payments(payment_date)
  `);
};

const seedData = async () => {
  const result = await query('SELECT COUNT(*) FROM customers');
  const count = parseInt(result.rows[0].count, 10);

  if (count > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const customers = [
    { acc: 'ACC001', date: '2024-01-15', rate: 12.5, tenure: 24, emi: 15000 },
    { acc: 'ACC002', date: '2024-02-20', rate: 11.75, tenure: 36, emi: 12000 },
    { acc: 'ACC003', date: '2024-03-10', rate: 13.25, tenure: 18, emi: 18000 },
    { acc: 'ACC004', date: '2024-04-05', rate: 10.5, tenure: 48, emi: 10000 },
    { acc: 'ACC005', date: '2024-05-12', rate: 12.0, tenure: 30, emi: 14000 }
  ];

  for (const c of customers) {
    await query(
      `
      INSERT INTO customers 
      (account_number, issue_date, interest_rate, tenure, emi_due, remaining_emi)
      VALUES ($1, $2, $3, $4, $5, $5)
      ON CONFLICT (account_number) DO NOTHING
      `,
      [c.acc, c.date, c.rate, c.tenure, c.emi]
    );
  }

  const { rows } = await query(
    'SELECT id FROM customers WHERE account_number = $1',
    ['ACC001']
  );

  if (rows.length > 0) {
    const customerId = rows[0].id;

    await query(
      `
      INSERT INTO payments (customer_id, payment_amount, payment_date, status)
      VALUES ($1, $2, $3, $4)
      `,
      [customerId, 15000, '2024-06-01', 'completed']
    );

    await query(
      `
      INSERT INTO payments (customer_id, payment_amount, payment_date, status)
      VALUES ($1, $2, $3, $4)
      `,
      [customerId, 15000, '2024-07-01', 'completed']
    );
  }

  console.log('Sample data seeded successfully!');
};

const runSeed = async () => {
  try {
    await initDatabase();
    await createTables();
    await seedData();
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
