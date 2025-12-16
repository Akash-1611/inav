const db = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { customerId, paymentAmount, status = 'completed' } = paymentData;
    const dbType = require('../config/database').getDbType();
    
    if (dbType === 'postgres') {
      const result = await db.query(
        `INSERT INTO payments (customer_id, payment_date, payment_amount, status) 
         VALUES ($1, NOW(), $2, $3) 
         RETURNING *`,
        [customerId, paymentAmount, status]
      );
      return result.rows?.[0] || result[0]?.[0];
    } else {
      // MySQL doesn't support RETURNING, so we insert and then select
      await db.query(
        `INSERT INTO payments (customer_id, payment_date, payment_amount, status) 
         VALUES (?, NOW(), ?, ?)`,
        [customerId, paymentAmount, status]
      );
      const result = await db.query(
        `SELECT * FROM payments WHERE customer_id = ? ORDER BY id DESC LIMIT 1`,
        [customerId]
      );
      return result.rows?.[0] || result[0]?.[0];
    }
  }

  static async findByAccountNumber(accountNumber) {
    const result = await db.query(
      `SELECT p.*, c.account_number 
       FROM payments p 
       INNER JOIN customers c ON p.customer_id = c.id 
       WHERE c.account_number = $1 
       ORDER BY p.payment_date DESC`,
      [accountNumber]
    );
    return result.rows || result[0];
  }

  static async findAll() {
    const result = await db.query(
      `SELECT p.*, c.account_number 
       FROM payments p 
       INNER JOIN customers c ON p.customer_id = c.id 
       ORDER BY p.payment_date DESC`
    );
    return result.rows || result[0];
  }
}

module.exports = Payment;

