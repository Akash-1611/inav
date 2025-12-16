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
}

module.exports = Customer;

