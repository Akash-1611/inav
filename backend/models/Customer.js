const db = require('../config/database');

class Customer {
  static async findAll() {
    const result = await db.query(
      'SELECT * FROM customers ORDER BY account_number'
    );
    return result.rows || result[0];
  }

  static async findByAccountNumber(accountNumber) {
    const result = await db.query(
      'SELECT * FROM customers WHERE account_number = $1',
      [accountNumber]
    );
    return result.rows?.[0] || result[0]?.[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    return result.rows?.[0] || result[0]?.[0];
  }

  static async updateRemainingEmiAndTenure(customerId, remainingEmi, tenure) {
    const dbType = require('../config/database').getDbType();
    
    if (dbType === 'postgres') {
      const result = await db.query(
        `UPDATE customers 
         SET remaining_emi = $1, tenure = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [remainingEmi, tenure, customerId]
      );
      return result.rows?.[0] || result[0]?.[0];
    } else {
      await db.query(
        `UPDATE customers 
         SET remaining_emi = ?, tenure = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [remainingEmi, tenure, customerId]
      );
      const result = await db.query(
        'SELECT * FROM customers WHERE id = ?',
        [customerId]
      );
      return result.rows?.[0] || result[0]?.[0];
    }
  }
}

module.exports = Customer;

