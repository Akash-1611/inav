require('dotenv').config();
const { initDatabase, query, getDbType } = require('../config/database');

const addRemainingEmiColumn = async () => {
  try {
    console.log('Initializing database connection...');
    await initDatabase();
    
    const dbType = getDbType();
    console.log(`Database type: ${dbType}`);
    
    if (dbType === 'postgres') {
      // Check if column exists
      const checkColumn = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'remaining_emi'
      `);
      
      if (checkColumn.rows && checkColumn.rows.length === 0) {
        console.log('Adding remaining_emi column to customers table...');
        await query(`
          ALTER TABLE customers 
          ADD COLUMN remaining_emi DECIMAL(10, 2) DEFAULT 0
        `);
        
        // Update existing records
        console.log('Updating existing records...');
        await query(`
          UPDATE customers 
          SET remaining_emi = emi_due 
          WHERE remaining_emi = 0 OR remaining_emi IS NULL
        `);
        
        console.log('✅ Migration completed successfully!');
      } else {
        console.log('Column remaining_emi already exists. Skipping migration.');
      }
    } else if (dbType === 'mysql') {
      // Check if column exists
      const checkColumn = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND table_schema = DATABASE() 
        AND column_name = 'remaining_emi'
      `);
      
      if (checkColumn.rows && checkColumn.rows.length === 0) {
        console.log('Adding remaining_emi column to customers table...');
        await query(`
          ALTER TABLE customers 
          ADD COLUMN remaining_emi DECIMAL(10, 2) DEFAULT 0
        `);
        
        // Update existing records
        console.log('Updating existing records...');
        await query(`
          UPDATE customers 
          SET remaining_emi = emi_due 
          WHERE remaining_emi = 0 OR remaining_emi IS NULL
        `);
        
        console.log('✅ Migration completed successfully!');
      } else {
        console.log('Column remaining_emi already exists. Skipping migration.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addRemainingEmiColumn();

